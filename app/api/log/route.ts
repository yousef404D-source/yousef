import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ip =
      req.headers.get("x-forwarded-for") || "unknown";

    const userAgent =
      req.headers.get("user-agent") || "unknown";

    await supabase.from("logs").insert([
      {
        email: body.email,
        username: body.username,
        prompt: body.prompt,
        ip,
        browser: userAgent,
        device: userAgent,
      },
    ]);

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: true });
  }
}