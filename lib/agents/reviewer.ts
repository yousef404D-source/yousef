import { generateText, FAST_MODEL } from "@/lib/ai/provider";

const REVIEWER_SYSTEM =
  'You are a strict QA reviewer for AI-generated websites. You will be given a complete HTML document. Check for: leftover placeholder text ("lorem ipsum", "[Your Company]", "Company Name"), broken/empty href="#" nav links used as real navigation, obviously incomplete sections, broken layout/overflow issues, missing alt text, poor color contrast. If it looks solid, respond with EXACTLY the single word: OK. Otherwise, respond with ONLY the complete corrected HTML document (no markdown fences, no commentary) with those issues fixed — preserve everything else unchanged.';

/**
 * Single bounded review/fix pass (not a loop) — deliberately capped at one
 * cycle to avoid runaway model calls, matching the token-efficiency and
 * infinite-loop-prevention requirements.
 */
export async function runReviewerAgent(html: string): Promise<{ fixed: boolean; html: string }> {
  const out = await generateText(FAST_MODEL, {
    system: REVIEWER_SYSTEM,
    messages: [{ role: "user", content: html }],
    temperature: 0,
    maxTokens: 12000,
  });

  const cleaned = out.trim();
  if (!cleaned || cleaned.toUpperCase() === "OK" || cleaned.length < 200) {
    return { fixed: false, html };
  }

  return { fixed: true, html: cleaned.replace(/^```html/i, "").replace(/```$/, "").trim() };
}
