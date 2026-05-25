import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message;

    console.log("📩 USER:", message);

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",

            content: `
You are Nova AI.

Rules:

- Start building the website IMMEDIATELY.
- Do NOT ask many questions.
- Only ask if something is absolutely necessary.
- Keep replies short and modern.
- Focus on design, sections, colors, features, and code.
- Act like a premium AI website builder.
- No long paragraphs.
- Be smart and fast.
- Give direct website ideas instantly.
- Behave like Lovable AI + Framer AI.
- Make responses clean and premium.
- Always think like a powerful startup AI.
`,
          },

          {
            role: "user",
            content: message,
          },
        ],

        temperature: 0.9,

        max_tokens: 400,
      });

    const reply =
      completion.choices[0].message.content;

    console.log("🤖 AI:", reply);

    return Response.json({
      reply,
    });
  } catch (error) {
    console.error(
      "❌ API ERROR:",
      error
    );

    return Response.json(
      {
        reply:
          "Nova AI server error.",
      },
      {
        status: 500,
      }
    );
  }
}