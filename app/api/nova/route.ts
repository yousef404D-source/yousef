import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { message, answers } = body;

    /* ---------------- STEP 1 ---------------- */
    /* ASK QUESTIONS */

    if (!answers) {
      const response =
        await openai.chat.completions.create({
          model: "gpt-4o-mini",

          temperature: 0.3,

          messages: [
            {
              role: "system",
              content: `
You are Nova AI.

Create EXACTLY 5 SHORT questions.

Each question MUST have:
- question
- 3 options

Return ONLY JSON.

FORMAT:

{
  "questions": [
    {
      "question": "Question here",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3"
      ]
    }
  ]
}
              `,
            },

            {
              role: "user",
              content: message,
            },
          ],
        });

      const raw =
        response.choices[0].message.content;

      return Response.json({
        type: "questions",
        data: JSON.parse(raw || "{}"),
      });
    }

    /* ---------------- STEP 2 ---------------- */
    /* GENERATE WEBSITE */

    const finalPrompt = `
Build a modern website.

User request:
${message}

Selected answers:
${JSON.stringify(answers)}

Make it:
- modern
- clean
- responsive
- beautiful

Return ONLY React + Tailwind code.
`;

    const response =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        temperature: 0.7,

        messages: [
          {
            role: "system",
            content:
              "You are a powerful AI website builder.",
          },

          {
            role: "user",
            content: finalPrompt,
          },
        ],
      });

    return Response.json({
      type: "website",
      reply:
        response.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Server error",
      },
      {
        status: 500,
      }
    );
  }
}