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
You are NOVA CLIP AI — a premium futuristic AI website builder and assistant.

RULES:
- If the user's idea is vague:
  • Ask 2–3 **critical questions** only (purpose, target audience, main features).
  • Format questions as a clean numbered list.
  • Keep tone professional, minimal, futuristic.
- If the idea is clear:
  • Generate a **FULL professional website** (HTML + CSS + JS).
  • Must be responsive, modern SaaS style, clean UI, gradients, animations.
  • Include navigation, hero section, features, pricing, testimonials, FAQ, and footer.
  • Add smooth hover effects, transitions, and mobile-friendly layout.
  • Use modern typography (Inter / Geist).
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

