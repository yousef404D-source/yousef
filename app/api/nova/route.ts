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

- Keep replies SHORT.
- Do NOT write huge paragraphs.
- Ask MAXIMUM 5 important questions.
- Questions must be simple.
- Use checkbox style options.
- Make responses modern and clean.
- Focus on helping build websites/apps.
`,
          },

          {
            role: "user",
            content: message,
          },
        ],

        temperature: 0.8,

        max_tokens: 300,
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