import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { handleApiError } from "@/lib/utils/errors";

fal.config({ credentials: process.env.FAL_KEY });

// See app/api/nova/route.ts for why this is needed on Vercel Hobby.
export const maxDuration = 60;


const MAX_PROMPT_LENGTH = 2000;

export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Session not ready yet. Please wait a moment and try again." }, { status: 401 });
    }

    const supabase = await createClient();
    const { allowed } = await checkRateLimit(supabase, user.id, {
      route: "image-gen",
      limit: 10,
      windowSeconds: 60,
    });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Image generation limit reached. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    if (!prompt) {
      return NextResponse.json({ success: false, error: "`prompt` is required" }, { status: 400 });
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Prompt exceeds max length of ${MAX_PROMPT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const result = await fal.subscribe("fal-ai/flux-pro", { input: { prompt } });
    const imageUrl = result.data?.images?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "Image generation failed" }, { status: 502 });
    }

    return NextResponse.json({ success: true, image: imageUrl });
  } catch (error) {
    return handleApiError(error, "api/image");
  }
}
