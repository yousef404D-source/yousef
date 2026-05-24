import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { idea, answers, step } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    // 🧠 SYSTEM PROMPT (محسن بالكامل)
    const systemPrompt = `
You are NOVA CLIP AI — an ultra-advanced AI website builder.

YOU OPERATE IN 2 MODES:

MODE 1: QUESTION MODE
- If "step = questions" OR user has no answers:
  • Ask EXACTLY 5 questions.
  • Each question must have 3 options (A, B, C).
  • Questions must help define a full website:
    1. Website type
    2. Design style
    3. Main purpose
    4. Target audience
    5. Features
  • Keep it short, clear, and interactive.
  • No code in this mode.

MODE 2: BUILD MODE
- If ALL answers exist OR step = build:
  • Generate a COMPLETE professional website.
  • Must include:
    - HTML + CSS + JS
    - Modern SaaS UI design
    - Responsive layout (mobile + desktop)
    - Hero section with CTA
    - Features section
    - Pricing section
    - Testimonials
    - FAQ
    - Footer
  • Add:
    - Smooth animations
    - Hover effects
    - Gradient design
    - Clean spacing
    - Modern typography

OUTPUT RULES:
- Output ONLY raw code
- NO markdown
- NO explanations
- NO comments outside code
- NO triple backticks
- Must be production-level quality
`;

    // 🧠 dynamic messages builder
    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `
IDEA:
${idea || "No idea provided"}

ANSWERS:
${answers ? JSON.stringify(answers, null, 2) : "No answers yet"}

STEP:
${step || "questions"}
        `,
      },
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    });

    let result = completion.choices?.[0]?.message?.content || "";

    // 🧼 تنظيف قوي جدًا لأي markdown أو بقايا
    result = result
      .replace(/```html/g, "")
      .replace(/```css/g, "")
      .replace(/```js/g, "")
      .replace(/```javascript/g, "")
      .replace(/```/g, "")
      .replace(/^\s+|\s+$/g, "");

    return Response.json({
      success: true,
      step: step || "questions",
      result,
    });

  } catch (err) {
    console.error("❌ NOVA CLIP ERROR:", err);

    return Response.json(
      {
        success: false,
        error: "AI request failed",
        result: null,
      },
      { status: 500 }
    );
  }
}