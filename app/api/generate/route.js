import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { idea, history } = await req.json();

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const messages = [
      {
        role: "system",
        content: `
You are Groq AI Builder.

If unclear: ask questions only.
If clear: generate full HTML website only.

Rules:
- Only HTML or only questions
- No explanation
- Modern UI
        `
      },
      ...(history || []),
      {
        role: "user",
        content: idea,
      }
    ];

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
    });

    let result = completion.choices[0].message.content;

    result = result
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    return Response.json({ result });

  } catch (error) {
    console.error("GROQ ERROR:", error);

    return Response.json({
      result: "ERROR"
    });
  }
}