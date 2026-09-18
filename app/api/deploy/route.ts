import { NextResponse } from "next/server";
import axios from "axios";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { validateDeployRequest } from "@/lib/validators/api";
import { handleApiError } from "@/lib/utils/errors";

// See app/api/nova/route.ts for why this is needed on Vercel Hobby.
export const maxDuration = 60;


/**
 * Publishes the exact HTML document the user already previewed in chat.
 *
 * IMPORTANT: this intentionally does NOT call OpenAI again. The previous
 * version of this route re-generated a brand new site from a short prompt
 * using a different, weaker system prompt — so what got deployed rarely
 * matched what the user actually reviewed in the preview pane. Deploying
 * the reviewed HTML verbatim, as a static site, is what makes "preview
 * before it goes live" a real guarantee instead of a false promise.
 */
export async function POST(req: Request) {
  try {
    const user = await getVerifiedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Session not ready yet. Please wait a moment and try again." },
        { status: 401 }
      );
    }

    const supabase = await createClient();

    const { allowed } = await checkRateLimit(supabase, user.id, {
      route: "deploy",
      limit: 8,
      windowSeconds: 300,
    });
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Deploy limit reached. Please wait a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { code, conversationId } = validateDeployRequest(body);

    const projectName = "nova-" + crypto.randomUUID().slice(0, 8);

    let deployUrl: string | undefined;
    let deployError: string | undefined;

    try {
      // Static deployment: a single index.html, no framework, no build step.
      // This is far more reliable than shipping AI-generated JSX through a
      // Next.js build, which can fail on the smallest syntax slip.
      const response = await axios.post(
        "https://api.vercel.com/v13/deployments",
        {
          name: projectName,
          files: [{ file: "index.html", data: code }],
          projectSettings: { framework: null },
          target: "production",
        },
        { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } }
      );
      deployUrl = "https://" + response.data.url;
    } catch (err) {
      deployError = err instanceof Error ? err.message : "Vercel deployment failed";
    }

    // Persist the deployment attempt regardless of outcome so the user has
    // a history to look back on.
    await supabase.from("deployments").insert({
      user_id: user.id,
      conversation_id: conversationId ?? null,
      prompt: code.slice(0, 2000), // stored for reference/debugging only
      deploy_url: deployUrl ?? null,
      status: deployUrl ? "success" : "failed",
      error_message: deployError ?? null,
    });

    if (!deployUrl) {
      return NextResponse.json(
        { success: false, error: "Deployment failed. Please try again shortly." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, url: deployUrl });
  } catch (error) {
    return handleApiError(error, "api/deploy");
  }
}
