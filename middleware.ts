import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    "Unknown";

  // IPs المحظورة
  const bannedIPs = [
    "45.84.107.174",
  ];

  // منع الدخول
  if (bannedIPs.includes(ip)) {
    return new Response("Access Denied", {
      status: 403,
    });
  }

  console.log(`
🚀 New Visitor
IP: ${ip}
`);

  return NextResponse.next();
}