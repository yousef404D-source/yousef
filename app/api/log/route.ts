import { NextResponse } from "next/server";

/* ---------------- MEMORY LOG STORE ---------------- */
/* ملاحظة: هذا داخل السيرفر (يشتغل طالما السيرفر شغال) */

let logs: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const logEntry = {
      id: Date.now(),
      email: body.email || "unknown",
      username: body.username || "guest",
      prompt: body.prompt || "",
      ip: body.ip || "unknown",
      device: body.device || "unknown",
      created_at: new Date().toISOString(),
    };

    logs.push(logEntry);

    return NextResponse.json({
      success: true,
      message: "Log saved",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save log",
      },
      { status: 500 }
    );
  }
}

/* ---------------- GET LOGS (ADMIN USE) ---------------- */

export async function GET() {
  return NextResponse.json({
    success: true,
    logs: logs.reverse(),
  });
}