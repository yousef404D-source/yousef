import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

export async function GET() {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Session not ready yet. Please wait a moment and try again." }, { status: 401 });
    }

    const supabase = await createClient();
    // RLS scopes this to the caller's own rows automatically.
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, conversations: data });
  } catch (error) {
    return handleApiError(error, "api/conversations GET");
  }
}

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Session not ready yet. Please wait a moment and try again." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title =
      typeof body?.title === "string" && body.title.trim().length > 0
        ? body.title.trim().slice(0, 120)
        : "New Chat";

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title })
      .select("id, title, created_at, updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, conversation: data });
  } catch (error) {
    return handleApiError(error, "api/conversations POST");
  }
}
