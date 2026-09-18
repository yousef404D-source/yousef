import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client").
 * Uses @supabase/ssr so the session cookie is written in a format
 * the server client (lib/supabase/server.ts) can read back.
 *
 * IMPORTANT: never import "@supabase/supabase-js" createClient() directly
 * anywhere in this app — it does not sync cookies with the server, which
 * causes API routes to see the visitor as logged out even right after a
 * successful sign-in in the browser.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return createBrowserClient(url, key);
}
