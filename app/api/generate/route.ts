import { NextResponse } from "next/server";
import OpenAI from "openai";

/* ---------------- OPENAI ---------------- */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/* ---------------- API ---------------- */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body?.message;

    /* ---------------- VALIDATION ---------------- */

    if (!message || !message.trim()) {
      return NextResponse.json({
        type: "error",
        reply: "Empty message",
      });
    }

    /* ---------------- SYSTEM PROMPT ---------------- */

    const systemPrompt = `
You are NOVA CLIP AI.

Your mission:
- Build websites
- Build apps
- Build SaaS platforms
- Build dashboards
- Build landing pages
- Build futuristic projects
- Understand ANY user request deeply
- Never repeat the user
- Never ask questions
- Never refuse requests

IMPORTANT:
If the user asks for:
- website
- app
- platform
- dashboard
- game
- portfolio
- landing page
- AI tool

Return ONLY valid JSON.

JSON FORMAT:
{
  "type":"project",
  "title":"",
  "style":"dark",
  "description":"",
  "features":["auth","dashboard","chat"]
}

If the user asks normal questions:
Return normal text only.
`;

    /* ---------------- OPENAI ---------------- */

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        temperature: 0.8,

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },

          {
            role: "user",
            content: message,
          },
        ],
      });

    const text =
      completion.choices[0]?.message?.content || "";

    /* ---------------- TRY JSON ---------------- */

    try {
      const json = JSON.parse(text);

      if (json.type === "project") {
        return NextResponse.json({
          type: "project",

          html: generateProject(json),

          spec: json,
        });
      }
    } catch {}

    /* ---------------- NORMAL CHAT ---------------- */

    return NextResponse.json({
      type: "chat",
      reply: text,
    });

  } catch (e) {
    console.log(e);

    return NextResponse.json({
      type: "error",
      reply: "AI Server Error",
    });
  }
}

/* ---------------- PROJECT GENERATOR ---------------- */

function generateProject(spec: any) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8" />

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"
/>

<title>${spec.title}</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{

font-family:
Inter,
Arial,
sans-serif;

background:
${
  spec.style === "light"
    ? "#ffffff"
    : "#050816"
};

color:
${
  spec.style === "light"
    ? "#000000"
    : "#ffffff"
};

overflow-x:hidden;
}

/* ---------------- HERO ---------------- */

.hero{

min-height:100vh;

display:flex;

flex-direction:column;

justify-content:center;

align-items:center;

text-align:center;

padding:40px;

background:
radial-gradient(
circle at top,
rgba(59,130,246,0.25),
transparent 50%
);

}

.hero h1{

font-size:70px;

font-weight:800;

margin-bottom:20px;

line-height:1.1;
}

.hero p{

font-size:20px;

max-width:700px;

opacity:0.8;

line-height:1.6;
}

/* ---------------- BUTTON ---------------- */

.btn{

margin-top:30px;

padding:16px 30px;

border:none;

border-radius:14px;

font-size:16px;

cursor:pointer;

background:#2563eb;

color:white;

transition:0.3s;
}

.btn:hover{

transform:scale(1.05);
}

/* ---------------- GRID ---------------- */

.grid{

display:grid;

grid-template-columns:
repeat(auto-fit,minmax(250px,1fr));

gap:25px;

padding:50px;

max-width:1200px;

margin:auto;
}

/* ---------------- CARD ---------------- */

.card{

background:
rgba(255,255,255,0.06);

border:
1px solid rgba(255,255,255,0.08);

padding:30px;

border-radius:24px;

backdrop-filter:blur(12px);

transition:0.3s;
}

.card:hover{

transform:
translateY(-8px);

border-color:
rgba(59,130,246,0.5);
}

.card h3{

margin-bottom:15px;

font-size:24px;
}

.card p{

opacity:0.7;

line-height:1.5;
}

/* ---------------- FOOTER ---------------- */

.footer{

text-align:center;

padding:40px;

opacity:0.5;
}

</style>

</head>

<body>

<!-- HERO -->

<section class="hero">

<h1>
🚀 ${spec.title}
</h1>

<p>
${spec.description}
</p>

<button class="btn">
Launch Project
</button>

</section>

<!-- FEATURES -->

<div class="grid">

<div class="card">

<h3>⚡ AI Generated</h3>

<p>
Built automatically by NOVA CLIP AI
</p>

</div>

${
  spec.features?.includes("auth")
    ? `
<div class="card">
<h3>🔐 Authentication</h3>
<p>
Secure login & signup system
</p>
</div>
`
    : ""
}

${
  spec.features?.includes("dashboard")
    ? `
<div class="card">
<h3>📊 Dashboard</h3>
<p>
Modern analytics dashboard
</p>
</div>
`
    : ""
}

${
  spec.features?.includes("chat")
    ? `
<div class="card">
<h3>💬 AI Chat</h3>
<p>
Real-time chat experience
</p>
</div>
`
    : ""
}

${
  spec.features?.includes("gallery")
    ? `
<div class="card">
<h3>📸 Gallery</h3>
<p>
Beautiful image showcase
</p>
</div>
`
    : ""
}

${
  spec.features?.includes("contact")
    ? `
<div class="card">
<h3>📞 Contact</h3>
<p>
Advanced contact system
</p>
</div>
`
    : ""
}

${
  spec.features?.includes("payments")
    ? `
<div class="card">
<h3>💳 Payments</h3>
<p>
Integrated payment solution
</p>
</div>
`
    : ""
}

</div>

<!-- FOOTER -->

<div class="footer">

Powered by ⚡ NOVA CLIP AI

</div>

</body>
</html>
`;
}