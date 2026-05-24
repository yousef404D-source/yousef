import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const bannedIPs = [
  "1.1.1.1",
  "8.8.8.8",
];

export function middleware(req: NextRequest) {
  const ip =
    req.ip ||
    req.headers.get("x-forwarded-for") ||
    "Unknown";

  const userAgent =
    req.headers.get("user-agent") || "";

  const country =
    req.geo?.country || "Unknown";

  console.log("━━━━━━━━━━━━━━━━━━");
  console.log("🌍 Visitor Joined");
  console.log("IP:", ip);
  console.log("Country:", country);
  console.log("Device:", userAgent);
  console.log("━━━━━━━━━━━━━━━━━━");

  // Ban IPs
  if (bannedIPs.includes(ip.toString())) {
    return new NextResponse(
      "🚫 You are banned",
      {
        status: 403,
      }
    );
  }

  // Block bots
  if (
    userAgent.includes("bot") ||
    userAgent.includes("crawler") ||
    userAgent.includes("spider")
  ) {
    return new NextResponse(
      "🤖 Bots blocked",
      {
        status: 403,
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};