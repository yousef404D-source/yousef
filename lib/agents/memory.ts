import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Structured, bounded facts about a project — framework, design system,
 * known decisions — kept separate from raw conversation history. Only a
 * small fixed set of keys is ever stored, so memory can never balloon into
 * "resend everything" the way full conversation history does.
 */
const ALLOWED_KEYS = ["framework", "design_system", "language", "key_decision", "known_issue"] as const;
type MemoryKey = (typeof ALLOWED_KEYS)[number];

export async function getProjectMemory(
  supabase: SupabaseClient,
  conversationId: string
): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("project_memory")
    .select("key, value")
    .eq("conversation_id", conversationId);

  if (error || !data) return {};
  const rows = data as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function upsertProjectMemory(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
  key: MemoryKey,
  value: string
): Promise<void> {
  if (!ALLOWED_KEYS.includes(key)) return;
  await supabase
    .from("project_memory")
    .upsert(
      { conversation_id: conversationId, user_id: userId, key, value: value.slice(0, 500), updated_at: new Date().toISOString() },
      { onConflict: "conversation_id,key" }
    );
}

export function memoryToPromptBlock(memory: Record<string, string>): string {
  const entries = Object.entries(memory).filter(([, v]) => v);
  if (entries.length === 0) return "";
  return "\n\nPROJECT MEMORY (established facts — stay consistent with these):\n" + entries.map(([k, v]) => `- ${k}: ${v}`).join("\n");
}
