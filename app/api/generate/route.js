import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { idea } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are NOVA AI Builder.

Rules:
- Generate full HTML pages.
- Modern clean design.
- Responsive layout.
- Output ONLY raw HTML code.
            `,
          },
          {
            role: "user",
            content: idea,
          },
        ],
        temperature: 0.8,
      });

    let result =
      completion.choices[0].message.content;

    result = result
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    return Response.json({
      result,
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        result: "Error generating project",
      },
      {
        status: 500,
      }
    );
  }
}