import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { handleApiError } from "@/lib/utils/errors";
import { parseSkillFile } from "@/lib/skills/parser";

export async function GET() {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("skills")
      .select("id, name, description, agents, enabled, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, skills: data });
  } catch (error) {
    return handleApiError(error, "api/skills GET");
  }
}

const MAX_SKILL_SIZE = 200_000;

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
    const { filename, content } = body as { filename?: string; content?: string };

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Skill file is empty." }, { status: 400 });
    }
    if (content.length > MAX_SKILL_SIZE) {
      return NextResponse.json({ success: false, error: "Skill file is too large." }, { status: 400 });
    }

    const fallbackName = (filename || "custom-skill").replace(/\.md$/i, "").slice(0, 80);
    const parsed = parseSkillFile(content, fallbackName);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("skills")
      .insert({
        user_id: user.id,
        name: parsed.name,
        description: parsed.description,
        content: parsed.content,
        agents: parsed.agents,
        enabled: true,
      })
      .select("id, name, description, agents, enabled, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, skill: data });
  } catch (error) {
    return handleApiError(error, "api/skills POST");
  }
}
