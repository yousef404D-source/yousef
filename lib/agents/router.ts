import { generateText, FAST_MODEL } from "@/lib/ai/provider";

export type RouteDecision = { mode: "CHAT" | "BUILD"; scope: "FULL" | "TARGETED"; note: string };

/**
 * One cheap call that decides how much machinery this turn actually needs.
 * CHAT -> Conversation Agent only, no builder/reviewer.
 * BUILD + TARGETED -> small, focused edit to the existing site.
 * BUILD + FULL -> new site or a broad rebuild.
 * This is what stops "What is Next.js?" or "thanks" from ever reaching the
 * expensive build pipeline.
 */
export async function routeRequest(
  latestUserText: string,
  hasExistingSite: boolean
): Promise<RouteDecision> {
  const raw = await generateText(FAST_MODEL, {
    system:
      'Classify the latest user message for a website-building AI. Respond ONLY with compact JSON: {"mode":"CHAT"|"BUILD","scope":"FULL"|"TARGETED","note":"<5 words>"}. CHAT = question, conversation, explanation, thanks, anything not asking to build/change a site. BUILD = asking to create or modify a website/app. scope TARGETED = a small specific change to something that already exists (e.g. "make the button blue"). scope FULL = building from scratch or a broad redesign. If no site exists yet, BUILD is always FULL.',
    messages: [
      {
        role: "user",
        content: `Existing site: ${hasExistingSite ? "yes" : "no"}\nMessage: ${latestUserText}`,
      },
    ],
    temperature: 0,
    maxTokens: 60,
    json: true,
  });

  try {
    const parsed = JSON.parse(raw);
    if (parsed.mode === "CHAT" || parsed.mode === "BUILD") {
      return {
        mode: parsed.mode,
        scope: parsed.scope === "TARGETED" ? "TARGETED" : "FULL",
        note: String(parsed.note || ""),
      };
    }
  } catch {
    // fall through to heuristic below
  }

  // Fail-safe heuristic if the router call errors or returns garbage —
  // never block the user, just default to the safer (build) path.
  return { mode: "BUILD", scope: hasExistingSite ? "TARGETED" : "FULL", note: "fallback" };
}
