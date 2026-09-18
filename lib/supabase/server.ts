import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Route Handlers (app/api/**), and
 * Server Actions. Reads/writes the auth cookie set by lib/supabase/client.ts,
 * so a session started in the browser is also visible on the server.
 *
 * Use `getVerifiedUser()` below instead of `supabase.auth.getSession()` for
 * anything security-sensitive — getSession() trusts the cookie's client-side
 * claims, while getUser() re-validates the token against Supabase's auth
 * server. Route handlers must always use the verified version.
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component render — middleware.ts
          // refreshes the session instead, so this is safe to ignore.
        }
      },
    },
  });
}

/**
 * Returns the authenticated user, verified against Supabase's auth server,
 * or null if there isn't one. ALWAYS use this in API routes before trusting
 * "who is making this request" — never supabase.auth.getSession().
 */
export async function getVerifiedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}
