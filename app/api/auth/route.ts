import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (
      password === process.env.SITE_PASSWORD
    ) {
      return NextResponse.json({
        success: true,
      });
    }

    return NextResponse.json({
      success: false,
    });
  } catch {
    return NextResponse.json({
      success: false,
    });
  }
}