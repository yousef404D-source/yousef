import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { idea } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are NOVA CLIP AI — an elite professional website builder.

RULES:
- If the user's idea is vague or incomplete:
  • Ask 2–3 clear, important questions only (about purpose, target audience, and main features).
  • Keep questions short and structured.
- If the idea is clear:
  • Generate a FULL professional website (HTML + CSS + JS).
  • Must be responsive, modern SaaS style, clean UI, gradients, animations.
  • Include navigation, hero section, features, and footer.
- Output ONLY the code (no explanations, no markdown).
          `,
        },
        {
          role: "user",
          content: idea,
        },
      ],
      temperature: 0.8,
    });

    let result = completion.choices[0].message.content;

    // تنظيف المخرجات من أي Markdown
    result = result
      .replace(/```html/g, "")
      .replace(/```javascript/g, "")
      .replace(/```css/g, "")
      .replace(/```/g, "")
      .trim();

    return Response.json({ result });

  } catch (err) {
    console.error("❌ Error in chat:", err);
    return Response.json({ result: "ERROR" }, { status: 500 });
  }
}
