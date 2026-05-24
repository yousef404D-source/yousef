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
          error: "Prompt is required",
        },
        {
          status: 400,
        }
      );
    }

    const systemPrompt = `
You are Crystal AI Builder.

Your job:
- Build premium production-ready projects
- Generate modern UI/UX ideas
- Create scalable architecture
- Add advanced features automatically
- Improve performance/security
- Think like a senior software engineer

Always generate:
1. Project overview
2. Folder structure
3. Technologies
4. Features
5. UI ideas
6. Advanced improvements
7. Future upgrades

Project Type:
${projectType}

Language:
${language}

Previous User History:
${JSON.stringify(history)}

Make everything premium and futuristic.
`;

    const response =
      await client.chat.completions.create({
        model: "gpt-4.1-mini",

        temperature: 1,

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },

          {
            role: "user",
            content: prompt,
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
  } catch (error: any) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}