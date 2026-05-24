import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const bannedIPs = [
  "1.1.1.1",
];

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    "Unknown";

  const userAgent =
    req.headers.get("user-agent") || "";

  console.log("━━━━━━━━━━━━━━━━━━");
  console.log("🌍 Visitor Joined");
  console.log("IP:", ip);
  console.log("Device:", userAgent);
  console.log("━━━━━━━━━━━━━━━━━━");

  if (bannedIPs.includes(ip)) {
    return new NextResponse(
      "🚫 Banned",
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};