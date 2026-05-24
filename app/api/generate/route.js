import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return Response.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { idea, answers, step } = body;

    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { success: false, error: "Missing API Key" },
        { status: 500 }
      );
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const systemPrompt = `
You are NOVA CLIP AI — an advanced website builder AI.

MODES:
1) QUESTIONS MODE:
- Ask 5 structured questions
- Each question has 3 options (A, B, C)
- No code output

2) BUILD MODE:
- Generate full website (HTML + CSS + JS)
- Modern SaaS design
- Responsive layout
- Clean production code

RULES:
- Output ONLY code or questions
- No explanations
- No markdown
- No backticks
`;

    const userContent = `
STEP: ${step || "questions"}

IDEA:
${idea || "none"}

ANSWERS:
${answers ? JSON.stringify(answers) : "none"}
`;

    // 🔥 Retry system (يحمي من فشل Groq)
    let completion;

    for (let i = 0; i < 2; i++) {
      try {
        completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        });

        if (completion?.choices?.length) break;
      } catch (err) {
        console.warn(`⚠️ Retry ${i + 1} failed`);
        if (i === 1) throw err;
      }
    }

    if (!completion?.choices?.[0]?.message?.content) {
      return Response.json(
        { success: false, error: "Empty AI response" },
        { status: 500 }
      );
    }

    let result = completion.choices[0].message.content;

    // 🧼 تنظيف قوي
    result = result
      .replace(/```html/g, "")
      .replace(/```css/g, "")
      .replace(/```js/g, "")
      .replace(/```javascript/g, "")
      .replace(/```/g, "")
      .trim();

    return Response.json({
      success: true,
      step: step || "questions",
      result,
    });

  } catch (err) {
    console.error("❌ API ERROR:", err);

    return Response.json(
      {
        success: false,
        error: err?.message || "Server error",
        hint: "Check API key, model, or quota",
      },
      { status: 500 }
    );
  }
}