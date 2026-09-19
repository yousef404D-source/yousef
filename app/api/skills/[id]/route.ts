import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";

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
    if (typeof body?.enabled !== "boolean") {
      return NextResponse.json({ success: false, error: "`enabled` must be boolean" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("skills")
      .update({ enabled: body.enabled })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "api/skills/[id] PATCH");
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
    const { error } = await supabase.from("skills").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "api/skills/[id] DELETE");
  }
}
