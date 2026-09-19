import { fal } from "@fal-ai/client";

let configured = false;
function ensureConfigured() {
  if (!configured) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

/**
 * Visual generation provider. Kept isolated from the AI provider (provider.ts)
 * so a Design Agent can request an asset without every request depending on
 * fal.ai — only called when the Design Agent decides an image is actually
 * needed (e.g. a hero photo, an abstract background), never automatically.
 */
export async function generateImage(prompt: string): Promise<string | null> {
  ensureConfigured();
  try {
    const result = await fal.subscribe("fal-ai/flux-pro", { input: { prompt } });
    return result.data?.images?.[0]?.url || null;
  } catch (err) {
    console.error("[fal image generation]", err);
    return null;
  }
}
