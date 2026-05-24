import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");

  const ip = forwarded
    ? forwarded.split(",")[0]
    : "Unknown";

  const userAgent =
    req.headers.get("user-agent") || "Unknown";

  const referer =
    req.headers.get("referer") || "Direct";

  const host =
    req.headers.get("host") || "Unknown";

  const country =
    req.headers.get("x-vercel-ip-country") || "Unknown";

  const city =
    req.headers.get("x-vercel-ip-city") || "Unknown";

  const region =
    req.headers.get("x-vercel-ip-country-region") ||
    "Unknown";

  const timezone =
    req.headers.get("x-vercel-ip-timezone") ||
    "Unknown";

  const protocol =
    req.headers.get("x-forwarded-proto") || "Unknown";

  const language =
    req.headers.get("accept-language") || "Unknown";

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 NEW VISITOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 IP: ${ip}
🌎 Country: ${country}
🏙️ City: ${city}
📍 Region: ${region}
🕓 Timezone: ${timezone}
🖥️ Device: ${userAgent}
🌐 Host: ${host}
🔗 Referer: ${referer}
📡 Protocol: ${protocol}
🗣️ Language: ${language}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};