import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    console.log("📩 Incoming message:", message);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message.content;

    console.log("🤖 Reply:", reply);

    return Response.json({
      reply,
    });

  } catch (error) {
    console.error("❌ API Error:", error);

    return Response.json(
      { reply: "Server error" },
      { status: 500 }
    );
  }
}