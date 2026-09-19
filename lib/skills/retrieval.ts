import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentName, SkillRecord } from "./parser";

const MAX_SKILLS_PER_REQUEST = 3;
const MAX_CONTENT_CHARS = 1500;

/**
 * Loads only the skills relevant to the given agent + request text — never
 * "every installed skill". A skill matches when it's enabled, assigned to
 * this agent, and its name/description shares a keyword with the request.
 * Falls back to the agent's most recently added skills if nothing matches
 * by keyword, capped at MAX_SKILLS_PER_REQUEST, and each skill's content is
 * truncated so a handful of skills can never balloon the prompt.
 */
interface SkillRow {
  id: string;
  name: string;
  description: string;
  content: string;
  agents: string[];
  enabled: boolean;
  created_at: string;
}

export async function retrieveRelevantSkills(
  supabase: SupabaseClient,
  userId: string,
  agent: AgentName,
  requestText: string
): Promise<SkillRecord[]> {
  const { data, error } = await supabase
    .from("skills")
    .select("id, name, description, content, agents, enabled, created_at")
    .eq("user_id", userId)
    .eq("enabled", true)
    .contains("agents", [agent])
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [];

  const rows = data as SkillRow[];
  const words = requestText.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const scored = rows
    .map((s: SkillRow) => {
      const haystack = (s.name + " " + s.description).toLowerCase();
      const score = words.reduce((acc, w) => (haystack.includes(w) ? acc + 1 : acc), 0);
      return { skill: s, score };
    })
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

  const chosen = scored.slice(0, MAX_SKILLS_PER_REQUEST).map((s: { skill: SkillRow }) => s.skill);

  return chosen.map((s: SkillRow) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    content: s.content.slice(0, MAX_CONTENT_CHARS),
    agents: s.agents as AgentName[],
    enabled: s.enabled,
    createdAt: s.created_at,
  }));
}

export function skillsToPromptBlock(skills: SkillRecord[]): string {
  if (skills.length === 0) return "";
  return (
    "\n\nRELEVANT INSTALLED SKILLS (use their guidance where applicable):\n" +
    skills.map((s) => `### Skill: ${s.name}\n${s.content}`).join("\n\n")
  );
}
