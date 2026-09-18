import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components ("use client").
 * Uses @supabase/ssr so the session cookie is written in a format
 * the server client (lib/supabase/server.ts) can read back.
 *
 * IMPORTANT: never import "@supabase/supabase-js" createClient() directly
 * in the app anymore — it does not sync cookies with the server and was
 * the root cause of "login works but API routes think I'm logged out".
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
