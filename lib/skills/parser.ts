export interface SkillRecord {
  id: string;
  name: string;
  description: string;
  content: string;
  agents: AgentName[];
  enabled: boolean;
  createdAt: string;
}

export type AgentName = "design" | "coding" | "reviewer" | "conversation";

const AGENT_KEYWORDS: Record<AgentName, string[]> = {
  design: ["design", "ui", "ux", "layout", "figma", "visual", "css", "tailwind", "typography", "accessibility"],
  coding: ["react", "next.js", "nextjs", "typescript", "javascript", "api", "backend", "database", "code", "component"],
  reviewer: ["review", "test", "playwright", "qa", "lint", "debug", "security", "audit"],
  conversation: ["explain", "chat", "conversation", "tone", "writing"],
};

/**
 * Parses a SKILL.md-style file: YAML-ish frontmatter (--- name / description
 * ---) followed by markdown instructions. Falls back gracefully if there's
 * no frontmatter — the whole file becomes the content and the name/agents
 * are inferred instead.
 */
export function parseSkillFile(raw: string, fallbackName: string): {
  name: string;
  description: string;
  content: string;
  agents: AgentName[];
} {
  let name = fallbackName;
  let description = "";
  let body = raw;

  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (fmMatch) {
    const frontmatter = fmMatch[1];
    body = fmMatch[2];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    if (nameMatch) name = nameMatch[1].trim().replace(/^["']|["']$/g, "");
    if (descMatch) description = descMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  if (!description) {
    const firstLine = body.split("\n").find((l) => l.trim().length > 0) || "";
    description = firstLine.replace(/^#+\s*/, "").slice(0, 150);
  }

  const haystack = (name + " " + description + " " + body.slice(0, 2000)).toLowerCase();
  const agents = (Object.keys(AGENT_KEYWORDS) as AgentName[]).filter((agent) =>
    AGENT_KEYWORDS[agent].some((kw) => haystack.includes(kw))
  );

  return {
    name,
    description: description || "No description provided.",
    content: body.trim(),
    agents: agents.length > 0 ? agents : ["coding"],
  };
}
