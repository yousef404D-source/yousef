import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }
    const { id } = await params;

    const supabase = await createClient();
    const { data: messages, error } = await supabase
      .from("messages")
      .select("id, sender, text, code_block, preview_url, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    return handleApiError(error, "api/conversations/[id] GET");
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const title = typeof body?.title === "string" ? body.title.trim().slice(0, 120) : null;

    if (!title) {
      return NextResponse.json({ success: false, error: "`title` is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "api/conversations/[id] PATCH");
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }
    const { id } = await params;

    const supabase = await createClient();
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "api/conversations/[id] DELETE");
  }
}
