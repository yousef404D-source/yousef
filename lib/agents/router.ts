import { generateText, FAST_MODEL } from "@/lib/ai/provider";

export type RouteDecision = {
  mode: "CHAT" | "BUILD";
  scope: "FULL" | "TARGETED";
  needsVisual: boolean;
  visualPrompt: string;
  note: string;
};

/**
 * One cheap call that decides how much machinery this turn actually needs.
 * CHAT -> Conversation Agent only, no builder/reviewer.
 * BUILD + TARGETED -> small, focused edit to the existing site.
 * BUILD + FULL -> new site or a broad rebuild.
 * needsVisual -> Design Agent should request a fal.ai image (hero/background
 * photo) before the Builder runs; false for anything an icon/gradient/CSS
 * pattern already covers, so fal.ai is never called by default.
 * This is what stops "What is Next.js?" or "thanks" from ever reaching the
 * expensive build pipeline.
 */
export async function routeRequest(
  latestUserText: string,
  hasExistingSite: boolean
): Promise<RouteDecision> {
  const raw = await generateText(FAST_MODEL, {
    system:
      'Classify the latest user message for a website-building AI. Respond ONLY with compact JSON: {"mode":"CHAT"|"BUILD","scope":"FULL"|"TARGETED","needsVisual":true|false,"visualPrompt":"<image prompt or empty>","note":"<5 words>"}. CHAT = question, conversation, explanation, thanks, anything not asking to build/change a site. BUILD = asking to create or modify a website/app. scope TARGETED = a small specific change to something that already exists (e.g. "make the button blue"). scope FULL = building from scratch or a broad redesign. If no site exists yet, BUILD is always FULL. needsVisual = true ONLY when a real photographic/illustrated hero or background image would clearly elevate this specific site (e.g. a travel/restaurant/product hero shot) — false for anything a gradient, icon set, or CSS pattern already covers, and always false for TARGETED edits. When true, visualPrompt is a short descriptive image-generation prompt matching the site\'s subject and tone.',
    messages: [
      {
        role: "user",
        content: `Existing site: ${hasExistingSite ? "yes" : "no"}\nMessage: ${latestUserText}`,
      },
    ],
    temperature: 0,
    maxTokens: 120,
    json: true,
  });

  try {
    const parsed = JSON.parse(raw);
    if (parsed.mode === "CHAT" || parsed.mode === "BUILD") {
      return {
        mode: parsed.mode,
        scope: parsed.scope === "TARGETED" ? "TARGETED" : "FULL",
        needsVisual: parsed.scope !== "TARGETED" && Boolean(parsed.needsVisual),
        visualPrompt: typeof parsed.visualPrompt === "string" ? parsed.visualPrompt.slice(0, 300) : "",
        note: String(parsed.note || ""),
      };
    }
  } catch {
    // fall through to heuristic below
  }

  // Fail-safe heuristic if the router call errors or returns garbage —
  // never block the user, just default to the safer (build) path.
  return {
    mode: "BUILD",
    scope: hasExistingSite ? "TARGETED" : "FULL",
    needsVisual: false,
    visualPrompt: "",
    note: "fallback",
  };
}
