import { NextResponse } from "next/server";
import { ValidationError } from "@/lib/validators/api";

/**
 * Converts any thrown error into a safe JSON response. Never forwards raw
 * error messages/stack traces from third-party SDKs (OpenAI, Vercel, etc.)
 * to the client — those can leak internal details. Full errors are still
 * logged server-side for debugging.
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  console.error(`[${context}]`, error);

  if (error instanceof ValidationError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { success: false, error: "Something went wrong. Please try again." },
    { status: 500 }
  );
}
