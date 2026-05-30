// المسار: app/api/deploy/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import OpenAI from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    console.log("🚀 NOVA AI STARTED");

    /* ---------------- 🔒 SUPABASE ADMIN CHECK ---------------- */
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 1. التحقق من وجود جلسة مستخدم نشطة
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return Response.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 2. فحص رتبة المسؤول الفردية لحماية الموارد المادية والسيرفر
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return Response.json(
        { success: false, error: "Access denied. Admins only." },
        { status: 403 }
      );
    }

    /* -------------------------------------------------------- */

    const { prompt } = await req.json();
    if (!prompt) {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    /* ---------------- AI WEBSITE GENERATION ---------------- */
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 1,
      max_tokens: 2500,
      messages: [
        {
          role: "system",
          content: `
You are Nova AI. You are the BEST AI website builder.
Your job: Generate a COMPLETE premium website based EXACTLY on the user's request.

IMPORTANT RULES:
- Return ONLY JSX (No markdown, no explanations, no comments, no imports, no export default, no html/body/head tags)
- Always include: navbar, hero section, features, cards, buttons, footer, animations, gradients, shadows, responsive layout.
- STYLE: futuristic, premium, advanced UI. Use ONLY inline styles.
- IMPORTANT: The JSX MUST work directly inside <div>{HERE}</div> without breaking syntax.
`,
        },
        { role: "user", content: prompt },
      ],
    });

    const jsx = completion.choices[0].message.content || "";

    /* ---------------- STRUCTURING FILES FOR VERCEL ---------------- */
    const projectName = "nova-ai-" + crypto.randomUUID().slice(0, 8);
    
    const pageCode = `export default function Page() { return ( <div style={{ background:"#050816", minHeight:"100vh", color:"white", overflowX:"hidden", fontFamily:"Arial" }}> ${jsx} </div> ); }`;
    const layoutCode = `export const metadata = { title: "Nova AI Generated" }; export default function RootLayout({ children }: { children: React.ReactNode }) { return ( <html lang="en"><body style={{ margin:0, padding:0, background:"#050816" }}>{children}</body></html> ); }`;

    const files = [
      { file: "app/page.tsx", data: pageCode },
      { file: "app/layout.tsx", data: layoutCode },
      {
        file: "package.json",
        data: JSON.stringify({
          name: projectName,
          private: true,
          scripts: { dev: "next dev", build: "next build", start: "next start" },
          dependencies: { next: "15.3.5", react: "^19.0.0", "react-dom": "^19.0.0" },
        }),
      },
      {
        file: "tsconfig.json",
        data: JSON.stringify({
          compilerOptions: { target: "ES6", lib: ["dom", "dom.iterable", "esnext"], allowJs: true, skipLibCheck: true, strict: false, noEmit: true, esModuleInterop: true, module: "esnext", moduleResolution: "bundler", resolveJsonModule: true, isolatedModules: true, jsx: "preserve" },
          include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        }),
      },
      { file: "next.config.mjs", data: "const nextConfig = {}; export default nextConfig;" },
      { file: "next-env.d.ts", data: "/// <reference types=\"next\" />" },
    ];

    /* ---------------- VERCEL API DEPLOYMENT ---------------- */
    const response = await axios.post(
      "https://api.vercel.com/v13/deployments",
      { name: projectName, files, projectSettings: { framework: "nextjs" } },
      { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } }
    );

    return Response.json({ success: true, url: "https://" + response.data.url });

  } catch (error: any) {
    return Response.json(
      { success: false, error: error?.response?.data || error.message || "Server Error" },
      { status: 500 }
    );
  }
}