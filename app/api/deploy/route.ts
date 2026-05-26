import OpenAI from "openai";

import axios from "axios";

import { v4 as uuid } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(
  req: Request
) {
  try {
    const { prompt } =
      await req.json();

    /* ---------------- AI GENERATES WEBSITE ---------------- */

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",

            content: `
You are Nova AI.

Generate ONLY ONE FULL HTML WEBSITE.

RULES:
- return ONLY HTML
- no explanations
- no markdown
- no code blocks
- modern design
- beautiful UI
- responsive
- animations
- futuristic
- dark mode
- colorful gradients
`,
          },

          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.8,
      });

    const html =
      completion.choices[0]
        .message.content || "";

    /* ---------------- CREATE FILES ---------------- */

    const projectName =
      "nova-ai-" +
      uuid().slice(0, 8);

    /* ---------------- PACKAGE JSON ---------------- */

    const packageJson = {
      name: projectName,

      version: "1.0.0",

      private: true,

      scripts: {
        dev: "next dev",

        build: "next build",

        start: "next start",
      },

      dependencies: {
        next: "15.3.2",

        react: "^19.0.0",

        "react-dom": "^19.0.0",
      },
    };

    /* ---------------- FILES ---------------- */

    const files = [
      {
        file: "app/page.tsx",

        data: `
export default function Page() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: \`${html
          .replace(/`/g, "\\`")
          .replace(/\$/g, "\\$")}\`
      }}
    />
  );
}
`,
      },

      {
        file: "app/layout.tsx",

        data: `
export const metadata = {
  title: "Nova AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
      },

      {
        file: "package.json",

        data: JSON.stringify(
          packageJson,
          null,
          2
        ),
      },
    ];

    /* ---------------- DEPLOY TO VERCEL ---------------- */

    const response =
      await axios.post(
        "https://api.vercel.com/v13/deployments",

        {
          name: projectName,

          files,

          projectSettings: {
            framework: "nextjs",
          },
        },

        {
          headers: {
            Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          },
        }
      );

    const url =
      "https://" +
      response.data.url;

    return Response.json({
      success: true,
      url,
    });
  } catch (error: any) {
    console.log(
      "DEPLOY ERROR:",
      error?.response?.data ||
        error.message
    );

    return Response.json(
      {
        success: false,

        error:
          error?.response?.data ||
          error.message,
      },

      {
        status: 500,
      }
    );
  }
}