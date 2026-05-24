import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {

  try {

    const { idea } =
      await req.json();

    const completion =
      await openai.chat.completions.create({

        model: "gpt-4.1-mini",

        messages: [

          {
            role: "system",

            content: `
You are NOVA CLIP AI.

You build full modern websites.

Return ONLY raw HTML.

The websites must:
- be beautiful
- futuristic
- responsive
- animated
- modern UI
- gradients
- glassmorphism
- professional

Do NOT explain anything.

ONLY RETURN HTML.
            `,
          },

          {
            role: "user",
            content: idea,
          },
        ],

        temperature: 1,
      });

    const html =
      completion.choices[0]
        .message.content || "";

    return NextResponse.json({
      html,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      error: "AI ERROR",
    });
  }
}