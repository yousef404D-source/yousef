import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(
  req: Request
) {
  try {
    const { message } =
      await req.json();

    const response =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        temperature: 0.7,

        max_tokens: 120,

        messages: [
          {
            role: "system",

            content: `
You are Nova AI.

Your ONLY job is building websites.

VERY IMPORTANT RULES:

- NEVER explain too much
- NEVER write long paragraphs
- NEVER write tutorials
- NEVER write HTML examples
- NEVER say "here is the code"
- NEVER create long lists
- NEVER ask many questions

You MUST act like a REAL AI website builder.

When user sends idea:
- immediately start building
- respond shortly
- maximum 6 short sentences
- sound fast and futuristic

GOOD RESPONSE EXAMPLE:

"Nova AI started building your website.
Design system initialized.
Creating responsive layout.
Adding animations and UI.
Optimizing mobile version.
Final touches in progress."

BAD RESPONSE:
- long explanations
- huge text
- code blocks
- tutorials

Keep responses short.
Act like real AI builder.
`,
          },

          {
            role: "user",
            content: message,
          },
        ],
      });

    const reply =
      response.choices[0]
        .message.content;

    return Response.json({
      reply,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        reply:
          "Nova AI system error.",
      },
      {
        status: 500,
      }
    );
  }
}