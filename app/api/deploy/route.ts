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
      //
      // If VERCEL_TOKEN belongs to a personal account but the project lives
      // under a team/org, Vercel's API needs the team ID explicitly via
      // ?teamId=... — a token can be valid and still get "Not authorized:
      // Trying to access resource under scope '<team>'" without it, because
      // the token's default scope doesn't automatically include every team
      // it has access to.
      const teamId = process.env.VERCEL_TEAM_ID;
      const url = teamId
        ? `https://api.vercel.com/v13/deployments?teamId=${encodeURIComponent(teamId)}`
        : "https://api.vercel.com/v13/deployments";

      const response = await axios.post(
        url,
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
      // The previous version swallowed axios's actual response body, so
      // every failure surfaced as a generic 502 with no real cause visible
      // anywhere — this is why it kept failing silently. Log Vercel's real
      // rejection reason (bad/missing token, wrong scope, invalid project
      // name, etc.) so it's actually diagnosable.
      const response = (err as { response?: { data?: any; status?: number } })?.response;
      if (response) {
        const rawMessage = response.data?.error?.message || `Vercel API error (${response.status ?? "unknown"})`;
        deployError = /not authorized.*scope/i.test(rawMessage)
          ? `Vercel rejected this token for your team/project scope. Set VERCEL_TEAM_ID to your team's ID in the environment variables, or use a token created specifically for this project's scope. (${rawMessage})`
          : rawMessage;
        console.error("[api/deploy] Vercel rejected the deployment:", response.data ?? err);
      } else {
        deployError = err instanceof Error ? err.message : "Vercel deployment failed";
        console.error("[api/deploy]", err);
      }
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
        { success: false, error: deployError || "Deployment failed. Please try again shortly." },
        { status: 502 }
      );
    }

    // Verify the deployment actually resolves before telling the client to
    // show "Published" — Vercel accepting the request doesn't guarantee the
    // URL is live yet. Retry briefly since propagation can take a moment.
    let verified = false;
    for (let attempt = 0; attempt < 4 && !verified; attempt++) {
      try {
        const check = await axios.get(deployUrl, { timeout: 3000, validateStatus: () => true });
        if (check.status < 500) verified = true;
      } catch {
        // network hiccup during propagation — retry
      }
      if (!verified) await new Promise((r) => setTimeout(r, 1200));
    }

    if (!verified) {
      await supabase
        .from("deployments")
        .update({ status: "failed", error_message: "Deployed but the URL did not become reachable in time." })
        .eq("user_id", user.id)
        .eq("deploy_url", deployUrl);

      return NextResponse.json(
        {
          success: false,
          error: "Deployment was created but the site isn't reachable yet. It may still be propagating — try opening the link in a minute.",
          url: deployUrl,
        },
        { status: 202 }
      );
    }

    return NextResponse.json({ success: true, url: deployUrl, verified: true });
  } catch (error) {
    return handleApiError(error, "api/deploy");
  }
}
