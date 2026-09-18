import type { SupabaseClient } from "@supabase/supabase-js";

interface RateLimitOptions {
  /** Route name, used only to namespace the counter (e.g. "ai-generate"). */
  route: string;
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window size in seconds. */
  windowSeconds: number;
}

/**
 * Checks + records a request against a sliding window, per user, stored in
 * the `request_logs` table. Returns { allowed: false } once the user has hit
 * `limit` requests to this route within `windowSeconds`.
 *
 * This runs as the authenticated user (RLS-scoped), so it only ever counts
 * and inserts that user's own rows — no service-role key needed.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  { route, limit, windowSeconds }: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

  const { count, error } = await supabase
    .from("request_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("route", route)
    .gte("created_at", windowStart);

  if (error) {
    // Fail open on infra errors so a DB hiccup doesn't take down the app,
    // but this is logged so it can be monitored.
    console.error("Rate limit check failed:", error.message);
    return { allowed: true, remaining: limit };
  }

  const used = count ?? 0;
  if (used >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // Record this request. Best-effort — if this insert fails we still let
  // the request through rather than blocking the user on a logging error.
  await supabase.from("request_logs").insert({ user_id: userId, route });

  return { allowed: true, remaining: limit - used - 1 };
}
