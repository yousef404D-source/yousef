import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { handleApiError } from "@/lib/utils/errors";

const MAX_ATTACHMENT_CHARS = 300_000;

export async function GET(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ success: false, error: "conversationId is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attachments")
      .select("id, filename, file_type, size_bytes, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, attachments: data });
  } catch (error) {
    return handleApiError(error, "api/attachments GET");
  }
}

/**
 * Text-based attachments only (code, config, logs, markdown, SKILL.md,
 * pasted files). Content is stored + indexed for later retrieval — never
 * blindly re-injected into every AI request (see lib/skills/retrieval.ts
 * for the same pattern applied to Skills).
 */
export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { conversationId, filename, fileType, content } = body as {
      conversationId?: string;
      filename?: string;
      fileType?: string;
      content?: string;
    };

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json({ success: false, error: "conversationId is required" }, { status: 400 });
    }
    if (typeof content !== "string" || content.length === 0) {
      return NextResponse.json({ success: false, error: "File content is empty" }, { status: 400 });
    }
    if (content.length > MAX_ATTACHMENT_CHARS) {
      return NextResponse.json({ success: false, error: "File is too large" }, { status: 400 });
    }

    const supabase = await createClient();

    const { allowed } = await checkRateLimit(supabase, user.id, {
      route: "attachments-upload",
      limit: 30,
      windowSeconds: 3600,
    });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many files uploaded recently. Please wait a while." },
        { status: 429 }
      );
    }

    const { data, error } = await supabase
      .from("attachments")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        filename: (filename || "file.txt").slice(0, 200),
        file_type: fileType || "text/plain",
        size_bytes: content.length,
        content,
      })
      .select("id, filename, file_type, size_bytes, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, attachment: data });
  } catch (error) {
    return handleApiError(error, "api/attachments POST");
  }
}
