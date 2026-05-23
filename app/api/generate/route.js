import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { idea, answers } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are NOVA CLIP AI — a premium futuristic AI website builder.

RULES:
- Always show "Thinking..." animation before answering.
- If user has not answered project questions yet:
  • Ask 5 important questions about the project.
  • Each question must have 3 multiple-choice options.
  • If none fits, user can type their own idea.
- After user answers all 5 questions:
  • Generate a FULL professional website (HTML + CSS + JS).
  • Must be responsive, modern SaaS style, clean UI, gradients, animations.
  • Include navigation, hero section, features, pricing, testimonials, FAQ, and footer.
  • Add smooth hover effects, transitions, and mobile-friendly layout.
- Output ONLY the code (no explanations, no markdown).
          `,
        },
        {
          role: "user",
          content: idea || "Start project",
        },
        ...(answers ? [{ role: "user", content: JSON.stringify(answers) }] : []),
      ],
      temperature: 0.85,
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
