import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: "No prompt" }, { status: 400 });
    }

    // 🧠 AI يولد موقع كامل (HTML + React فكرة)
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
أنت AI محترف لبناء المواقع.
ارجع كود موقع كامل (React/Next.js page فقط).
بدون شرح، فقط كود جاهز.
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const code = result.choices[0]?.message?.content;

    return Response.json({
      success: true,
      code,
      message: "Site generated successfully",
    });
  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}