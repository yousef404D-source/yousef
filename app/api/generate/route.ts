import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      prompt,
      projectType,
      language,
      history,
    } = body;

    if (!prompt) {
      return Response.json(
        {
          success: false,
          error: "Prompt is required",
        },
        {
          status: 400,
        }
      );
    }

    const response =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",

        temperature: 1,

        messages: [
          {
            role: "system",

            content: `
You are Crystal AI Builder.

You build futuristic premium websites and apps.

Always:
- Improve UI/UX
- Add modern animations
- Add advanced features
- Think like a senior engineer
- Optimize performance
- Suggest premium ideas
- Create scalable architecture
            `,
          },

          {
            role: "user",

            content: `
Prompt:
${prompt}

Project Type:
${projectType || "website"}

Language:
${language || "english"}

History:
${JSON.stringify(history || [])}
            `,
          },
        ],
      });

    const result =
      response.choices[0].message.content;

    return Response.json({
      success: true,

      result,

      metadata: {
        model: "gpt-4.1-mini",
        projectType,
        language,
      },
    });
  } catch (err: any) {
    console.error(err);

    return Response.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}