import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json(
        { reply: "No message provided" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: `
You are Nova AI.
You are a powerful AI that:
- Builds websites
- Writes full code projects
- Explains clearly
- Helps developers

Always respond in a helpful, structured way.
If user asks for a website, give full working code.
          `.trim(),
        },
        {
          role: "user",
          content: message,
        },
      ],

      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    return Response.json({
      reply,
    });

  } catch (error) {
    console.error("❌ OPENAI ERROR:", error);

    return Response.json(
      {
        reply: "Server error. Please try again later.",
      },
      { status: 500 }
    );
  }
}