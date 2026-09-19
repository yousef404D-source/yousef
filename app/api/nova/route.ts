import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { validateChatRequest } from "@/lib/validators/api";
import { handleApiError } from "@/lib/utils/errors";
import { toPreviewUrl } from "@/lib/utils/preview";
import { streamText, STRONG_MODEL } from "@/lib/ai/provider";
import { generateImage } from "@/lib/ai/visual-provider";
import { routeRequest } from "@/lib/agents/router";
import { runConversationAgent } from "@/lib/agents/conversation";
import { buildBuilderSystemPrompt } from "@/lib/agents/builder";
import { runReviewerAgent } from "@/lib/agents/reviewer";
import { retrieveRelevantSkills, skillsToPromptBlock } from "@/lib/skills/retrieval";

// See maxDuration note: sequential model calls (router -> builder -> reviewer)
// need headroom beyond Vercel Hobby's 10s default — requires Fluid Compute.
export const maxDuration = 120;

// Status markers woven into the byte stream so the frontend can show which
// phase Nova is in without a second connection. Stripped before display.
const STATUS = {
  ROUTING: "<<<NOVA_STATUS:PLANNING>>>",
  BUILDING: "<<<NOVA_STATUS:BUILDING>>>",
  REVIEWING: "<<<NOVA_STATUS:REVIEWING>>>",
};

interface ApiChatMsg { role: "system" | "user" | "assistant"; content: string }

function buildConversationContext(
  messages: { sender: "user" | "assistant"; text: string; codeBlock?: string }[]
): ApiChatMsg[] {
  let lastCodeIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === "assistant" && messages[i].codeBlock) {
      lastCodeIndex = i;
      break;
    }
  }
  return messages.map((m, i) => {
    const role = m.sender === "user" ? ("user" as const) : ("assistant" as const);
    if (i === lastCodeIndex) {
      return {
        role,
        content: `${m.text}\n\n--- CURRENT SITE HTML (the live site right now; edit it in place and return the complete updated document) ---\n\`\`\`html\n${m.codeBlock}\n\`\`\``,
      };
    }
    return { role, content: m.text };
  });
}

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { allowed } = await checkRateLimit(supabase, user.id, {
      route: "nova-chat",
      limit: 15,
      windowSeconds: 60,
    });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "You're sending messages too fast. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, conversationId } = validateChatRequest(body);
    const conversationContext = buildConversationContext(messages);
    const hasExistingSite = conversationContext.some((m) => m.content.includes("CURRENT SITE HTML"));
    const lastUserText = [...messages].reverse().find((m) => m.sender === "user")?.text || "";

    // Targeted attachment retrieval: only pull in attachments whose filename
    // is actually mentioned in the latest message, never the whole set —
    // same principle as skill retrieval, to avoid ballooning the prompt.
    let attachmentBlock = "";
    if (conversationId) {
      try {
        const { data: attachments } = await supabase
          .from("attachments")
          .select("filename, file_type, content")
          .eq("conversation_id", conversationId);
        const rows = (attachments || []) as { filename: string; file_type: string; content: string | null }[];
        const mentioned = rows.filter((a) =>
          lastUserText.toLowerCase().includes(a.filename.toLowerCase())
        );
        if (mentioned.length > 0) {
          attachmentBlock =
            "\n\nATTACHED FILES REFERENCED IN THIS MESSAGE:\n" +
            mentioned.map((a) => `### ${a.filename} (${a.file_type})\n${a.content?.slice(0, 8000)}`).join("\n\n");
        }
      } catch (err) {
        console.error("[api/nova attachment retrieval]", err);
      }
    }

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        const emit = (s: string) => controller.enqueue(encoder.encode(s));

        // ---------- Orchestrator: route the request ----------
        emit(STATUS.ROUTING);
        let decision;
        try {
          decision = await routeRequest(lastUserText, hasExistingSite);
        } catch (err) {
          console.error("[api/nova router]", err);
          decision = { mode: "BUILD" as const, scope: hasExistingSite ? ("TARGETED" as const) : ("FULL" as const), note: "router-error-fallback" };
        }

        // ---------- CHAT path: Conversation Agent only, no build pipeline ----------
        if (decision.mode === "CHAT") {
          const chatHistory = conversationContext.map((m) => ({
            role: m.role === "system" ? ("user" as const) : m.role,
            content: m.content,
          }));
          let reply = "";
          try {
            reply = await runConversationAgent(chatHistory);
          } catch (err) {
            console.error("[api/nova conversation]", err);
            reply = "Something went wrong while generating a response. Please try again.";
          }
          emit(reply);
          controller.close();

          if (conversationId) {
            try {
              await supabase.from("messages").insert([
                { conversation_id: conversationId, user_id: user.id, sender: "user", text: lastUserText },
                { conversation_id: conversationId, user_id: user.id, sender: "assistant", text: reply },
              ]);
            } catch (err) {
              console.error("[api/nova persist:chat]", err);
            }
          }
          return;
        }

        // ---------- BUILD path ----------
        emit(STATUS.BUILDING);

        let skillsBlock = "";
        try {
          const skills = await retrieveRelevantSkills(supabase, user.id, "coding", lastUserText);
          skillsBlock = skillsToPromptBlock(skills);
        } catch (err) {
          console.error("[api/nova skills retrieval]", err);
        }

        // Design Agent: only calls fal.ai when the router decided a real
        // photographic/illustrated visual would elevate this specific site.
        // Never called for chat, targeted edits, or by default.
        let visualBlock = "";
        if (decision.needsVisual && decision.visualPrompt) {
          try {
            const imageUrl = await generateImage(decision.visualPrompt);
            if (imageUrl) {
              visualBlock = `\n\nDESIGN AGENT — GENERATED HERO/BACKGROUND IMAGE (use this exact URL in an <img> or CSS background, do not invent a different one): ${imageUrl}`;
            }
          } catch (err) {
            console.error("[api/nova visual generation]", err);
          }
        }

        const builderMessages: ApiChatMsg[] = [
          { role: "system", content: buildBuilderSystemPrompt(decision.scope, skillsBlock + visualBlock) },
          ...conversationContext,
        ];
        if (attachmentBlock) {
          builderMessages.push({ role: "system", content: attachmentBlock });
        }

        let fullText = "";
        try {
          for await (const chunk of streamText(STRONG_MODEL, {
            messages: builderMessages,
            temperature: 0.6,
            maxTokens: 12000,
          })) {
            fullText += chunk.delta;
            emit(chunk.delta);
          }
        } catch (err) {
          console.error("[api/nova builder]", err);
          emit("\n\nSomething went wrong while generating a response. Please try again.");
        }

        let finalCode = "";
        let cleanText = fullText;
        const match = fullText.match(/```html([\s\S]*?)```/);
        if (match && match[1]) {
          finalCode = match[1].trim();
          cleanText = fullText.replace(/```html([\s\S]*?)```/, "").trim();
        }

        // ---------- Reviewer/Fixer: single bounded pass ----------
        if (finalCode) {
          emit(STATUS.REVIEWING);
          try {
            const { fixed, html } = await runReviewerAgent(finalCode);
            if (fixed) {
              finalCode = html;
              if (!cleanText) cleanText = "Done — Nova reviewed and refined a couple of details automatically.";
            }
          } catch (err) {
            console.error("[api/nova reviewer]", err);
          }
        }

        if (!cleanText) cleanText = finalCode ? "Your site is ready — check the preview." : fullText;

        // Send the authoritative final code (including any reviewer fix)
        // back through the stream so the live preview matches what's saved.
        if (finalCode) {
          emit(`\n<<<NOVA_FINAL_CODE_START>>>\n${finalCode}\n<<<NOVA_FINAL_CODE_END>>>\n`);
        }

        controller.close();

        if (conversationId) {
          try {
            const previewUrl = finalCode ? toPreviewUrl(finalCode) : null;
            await supabase.from("messages").insert([
              { conversation_id: conversationId, user_id: user.id, sender: "user", text: lastUserText },
              {
                conversation_id: conversationId,
                user_id: user.id,
                sender: "assistant",
                text: cleanText,
                code_block: finalCode || null,
                preview_url: previewUrl,
              },
            ]);
          } catch (err) {
            console.error("[api/nova persist:build]", err);
          }
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    return handleApiError(error, "api/nova");
  }
}
