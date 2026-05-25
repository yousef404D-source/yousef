import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { message } = await req.json();

  const systemPrompt = `
أنت Nova AI Builder.

مهمتك:
تحويل أي طلب من المستخدم إلى مشروع رقمي كامل (موقع / تطبيق / منصة / لعبة ويب).

قواعد:
- افهم أي فكرة مهما كانت طويلة أو معقدة
- لا تسأل أسئلة
- لا ترفض أي طلب
- إذا كان مشروع → ارجع JSON فقط
- إذا سؤال عادي → رد نصي طبيعي

JSON format:
{
  "type": "project",
  "title": "",
  "style": "dark|light|modern",
  "description": "",
  "features": ["auth","dashboard","chat","gallery","contact","payments"]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
  });

  const text = completion.choices[0].message.content || "";

  // محاولة قراءة JSON
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

  return NextResponse.json({
    type: "chat",
    reply: text,
  });
}

/* ---------------- PROJECT GENERATOR ---------------- */

function generateProject(spec: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>${spec.title}</title>
  <style>
    body {
      margin:0;
      font-family:Arial;
      background:${spec.style === "dark" ? "#0a0a0a" : "#ffffff"};
      color:${spec.style === "dark" ? "white" : "black"};
      text-align:center;
      padding:40px;
    }
    .card {
      margin:10px;
      padding:20px;
      border-radius:12px;
      background:rgba(0,0,0,0.05);
    }
  </style>
</head>
<body>

  <h1>🚀 ${spec.title}</h1>
  <p>${spec.description}</p>

  <div class="card">✨ AI Generated Project</div>

  ${spec.features.includes("auth") ? `<div class="card">🔐 Auth System</div>` : ""}
  ${spec.features.includes("dashboard") ? `<div class="card">📊 Dashboard</div>` : ""}
  ${spec.features.includes("chat") ? `<div class="card">💬 Chat System</div>` : ""}
  ${spec.features.includes("gallery") ? `<div class="card">📸 Gallery</div>` : ""}
  ${spec.features.includes("contact") ? `<div class="card">📞 Contact</div>` : ""}
  ${spec.features.includes("payments") ? `<div class="card">💳 Payments</div>` : ""}

</body>
</html>
  `;
}