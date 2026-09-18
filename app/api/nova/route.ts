import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { validateChatRequest } from "@/lib/validators/api";
import { handleApiError } from "@/lib/utils/errors";
import { toPreviewUrl } from "@/lib/utils/preview";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// See note in the original version of this file: Vercel Hobby caps
// functions at 10s by default. This pipeline runs up to three sequential
// model calls (planner → builder → reviewer), so it needs real headroom —
// requires "Fluid Compute" enabled on the Vercel project, which raises the
// Hobby ceiling as high as 300s.
export const maxDuration = 120;

// Status markers woven into the byte stream so the frontend can show which
// phase Nova is in (Planning / Building / Reviewing) without a second
// connection. They're stripped from the text before it's ever shown.
const STATUS = {
  PLANNING: "<<<NOVA_STATUS:PLANNING>>>",
  BUILDING: "<<<NOVA_STATUS:BUILDING>>>",
  REVIEWING: "<<<NOVA_STATUS:REVIEWING>>>",
};

const BUILDER_SYSTEM = `
You are NOVA, a senior full-stack product engineer and brand designer. You
are not a toy or a novelty chatbot — you are a serious professional tool.
People use you to get real answers and real, launch-ready websites. Treat
every request with the seriousness a paying client's project deserves.

GENERAL BEHAVIOR:
- Answer any question directly and substantively, the way a knowledgeable
  senior engineer/designer would. Never deflect with jokes, filler, or "as
  an AI" disclaimers.
- Be concise but complete. No fluff, no false enthusiasm, no emoji spam.
- Read the user's ENTIRE message before responding, not just the last
  sentence. Treat every instruction in a long message as a real requirement.

CONTINUING AN EXISTING PROJECT:
- If a "CURRENT SITE HTML" block is present, a site already exists and the
  user is almost always asking you to MODIFY it, not start a new one. Apply
  exactly the requested change(s) while leaving everything else untouched.
  Return the COMPLETE updated HTML document, not a diff or a fragment.
- If a "USER IS POINTING AT THIS ELEMENT" block is present, the requested
  change applies specifically to that element (identified by its CSS path
  and current markup) — make the change there, not somewhere else that
  looks similar.
- Only build a brand new site from scratch when there is no CURRENT SITE
  HTML yet, or the user explicitly says to start over.

WHEN BUILDING A WEBSITE (first time, no existing site):
1. Discovery first for vague requests: briefly ask what the business does,
   who it's for, the tone, brand colors, and must-have sections. Skip this
   if the user already gave enough detail or says to just build it.
2. Generate a COMPLETE, production-grade website — a real deliverable, not
   a sketch. No lorem ipsum, no "[Your Company Here]", no unfinished
   sections. Write real, specific, persuasive copy tailored to the stated
   business.
3. Infer the right structure for the industry rather than forcing the same
   template on everything (restaurant → menu/hours/reservations; SaaS →
   value prop/features/pricing/FAQ; portfolio → real case studies).

DESIGN STANDARDS (non-negotiable):
- Strong visual hierarchy, deliberate type scale, generous consistent
  spacing.
- A cohesive, intentional color palette fitting the requested tone. Default
  to a refined premium dark theme only when no direction was given.
- Real Google Font pairing — never default to Arial.
- Visible hover/focus states and tasteful transitions on every interactive
  element.
- Fully responsive with a working mobile hamburger menu.
- Accessible: contrast, semantic landmarks, alt text, labeled inputs.
- Any form has real client-side validation and a visible success/error
  state via vanilla JS.

TECHNICAL OUTPUT FORMAT:
- ONE self-contained HTML document: <!DOCTYPE html> through </html>, with a
  real <title>, meta description, and viewport tag in <head>.
- Tailwind CSS via CDN, Google Fonts, and an icon set (Lucide/Font Awesome
  CDN) as needed.
- Any interactivity as vanilla JS in one <script> before </body>. No build
  step, no imports — must run standalone.
- Wrap the ENTIRE document in a single \`\`\`html ... \`\`\` code block. Any
  conversational reply goes OUTSIDE that block, kept short.
- Reply in the user's language. If the site itself should be in Arabic, set
  dir="rtl" lang="ar" on <html> with a matching Arabic web font.

Never ship anything you wouldn't put in front of the actual business owner.
`;

interface ApiChatMsg { role: "system" | "user" | "assistant"; content: string; }

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
      return NextResponse.json({ success: false, error: "Session not ready yet. Please wait a moment and try again." }, { status: 401 });
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

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        const emit = (s: string) => controller.enqueue(encoder.encode(s));

        // ---------- Agent 1: Planner ----------
        // Fast, cheap call whose only job is to decide whether this turn
        // needs a build/edit at all, and if so sketch the shape of it. This
        // keeps the expensive builder call focused instead of re-deriving
        // intent from scratch, and is what makes this a genuine multi-agent
        // pipeline rather than one prompt doing everything.
        emit(STATUS.PLANNING);
        let plan = "";
        try {
          const lastUserText = [...messages].reverse().find((m) => m.sender === "user")?.text || "";
          const planResp = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.3,
            max_tokens: 400,
            messages: [
              {
                role: "system",
                content:
                  "You plan work for a website-building AI. Given the latest user message (and whether a site already exists), decide MODE: BUILD if they want a site built/edited, or CHAT if it's just a question/conversation. If BUILD, list the concrete sections/changes and visual direction in a few short bullets. Respond in EXACTLY this format and nothing else:\nMODE: BUILD or CHAT\nPLAN: <bullets, or N/A if CHAT>",
              },
              {
                role: "user",
                content: `Existing site already present: ${hasExistingSite ? "yes" : "no"}.\nLatest user message: ${lastUserText}`,
              },
            ],
          });
          plan = planResp.choices[0]?.message?.content?.trim() || "";
        } catch (err) {
          console.error("[api/nova planner]", err);
          // Fall through with no plan — the builder's own system prompt
          // still handles intent detection fine on its own.
        }

        // ---------- Agent 2: Builder ----------
        emit(STATUS.BUILDING);
        const builderMessages: ApiChatMsg[] = [
          { role: "system", content: BUILDER_SYSTEM },
          ...(plan ? [{ role: "system" as const, content: `INTERNAL PLAN FROM YOUR PLANNING PASS:\n${plan}` }] : []),
          ...conversationContext,
        ];

        let fullText = "";
        try {
          const stream = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: builderMessages,
            temperature: 0.6,
            max_tokens: 12000,
            stream: true,
          });
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || "";
            if (delta) {
              fullText += delta;
              emit(delta);
            }
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

        // ---------- Agent 3: Reviewer / self-healer ----------
        // Only worth running when a site was actually produced. Catches
        // leftover placeholder content and obvious breakage before the
        // user ever sees it — a second opinion from a fresh pass.
        if (finalCode) {
          emit(STATUS.REVIEWING);
          try {
            const reviewResp = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              temperature: 0,
              max_tokens: 12000,
              messages: [
                {
                  role: "system",
                  content:
                    'You are a strict QA reviewer for AI-generated websites. You will be given a complete HTML document. Check for: leftover placeholder text ("lorem ipsum", "[Your Company]", "Company Name", broken/empty href="#" nav links used as real navigation, obviously incomplete sections). If it looks solid, respond with EXACTLY the single word: OK. Otherwise, respond with ONLY the complete corrected HTML document (no markdown fences, no commentary) with those issues fixed — preserve everything else unchanged.',
                },
                { role: "user", content: finalCode },
              ],
            });
            const reviewOut = reviewResp.choices[0]?.message?.content?.trim() || "OK";
            if (reviewOut && reviewOut.toUpperCase() !== "OK" && reviewOut.length > 200) {
              finalCode = reviewOut.replace(/^```html/i, "").replace(/```$/, "").trim();
              if (!cleanText) cleanText = "Done — Nova reviewed and refined a couple of details automatically.";
            }
          } catch (err) {
            console.error("[api/nova reviewer]", err);
            // Keep the builder's output as-is if the review pass fails.
          }
        }

        if (!cleanText) cleanText = finalCode ? "Your site is ready — check the preview." : fullText;

        // Send the AUTHORITATIVE final code back through the stream itself
        // (including anything the reviewer just corrected) so the live
        // preview the user is looking at matches what actually gets saved —
        // without this, a reviewer fix would only exist in the database,
        // never on screen.
        if (finalCode) {
          emit(`\n<<<NOVA_FINAL_CODE_START>>>\n${finalCode}\n<<<NOVA_FINAL_CODE_END>>>\n`);
        }

        controller.close();

        // ---------- Persist ----------
        if (conversationId) {
          try {
            const previewUrl = finalCode ? toPreviewUrl(finalCode) : null;
            const lastUserMessage = messages[messages.length - 1];
            await supabase.from("messages").insert([
              { conversation_id: conversationId, user_id: user.id, sender: "user", text: lastUserMessage.text },
              {
                conversation_id: conversationId,
                user_id: user.id,
                sender: "assistant",
                text: cleanText,
                code_block: finalCode || null,
                preview_url: previewUrl,
              },
            ]);
          } catch (persistErr) {
            console.error("[api/nova persist]", persistErr);
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
