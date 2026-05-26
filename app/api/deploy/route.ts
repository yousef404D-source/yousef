import OpenAI from "openai";

import axios from "axios";

import { v4 as uuid } from "uuid";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY!,
});

export async function POST(
  req: Request
) {
  try {
    console.log(
      "🚀 NOVA AI STARTED"
    );

    const { prompt } =
      await req.json();

    console.log(
      "📤 USER PROMPT:",
      prompt
    );

    /* ---------------- AI WEBSITE GENERATION ---------------- */

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o",

        temperature: 1,

        max_tokens: 4000,

        messages: [
          {
            role: "system",

            content: `
You are Nova AI.

You are the BEST AI website builder.

Your job:
Generate a COMPLETE premium website based EXACTLY on the user's request.

IMPORTANT RULES:

- Return ONLY JSX
- No markdown
- No explanations
- No comments
- No imports
- No export default
- No code block
- No \`\`\`
- No html/body/head tags

VERY IMPORTANT:
The website MUST match the user's idea.

Examples:

Restaurant:
- food sections
- menu cards
- chef section
- delivery UI

Gym:
- workout sections
- trainers
- dark powerful style

AI startup:
- futuristic
- glowing UI
- gradients
- animated cards

Clothing store:
- product cards
- fashion hero
- shopping UI

Always include:
- navbar
- hero section
- features
- cards
- buttons
- footer
- animations
- gradients
- shadows
- responsive layout
- premium modern design

STYLE:
- futuristic
- premium
- extremely beautiful
- modern
- realistic
- advanced UI

Use ONLY inline styles.

IMPORTANT:
The JSX MUST work directly inside:

<div>{HERE}</div>

NEVER break JSX syntax.
`,
          },

          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const jsx =
      completion.choices[0]
        .message.content || "";

    console.log(
      "🧠 AI JSX GENERATED"
    );

    console.log(jsx);

    /* ---------------- PROJECT NAME ---------------- */

    const projectName =
      "nova-ai-" +
      uuid().slice(0, 8);

    console.log(
      "📁 PROJECT:",
      projectName
    );

    /* ---------------- PAGE ---------------- */

    const pageCode = `
export default function Page() {
  return (
    <div
      style={{
        background:"#050816",
        minHeight:"100vh",
        color:"white",
        overflowX:"hidden",
        fontFamily:"Arial"
      }}
    >
      ${jsx}
    </div>
  );
}
`;

    /* ---------------- LAYOUT ---------------- */

    const layoutCode = `
export const metadata = {
  title: "Nova AI",
};

export default function RootLayout({
  children,
}:{
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin:0,
          padding:0,
          background:"#050816"
        }}
      >
        {children}
      </body>
    </html>
  );
}
`;

    /* ---------------- PACKAGE.JSON ---------------- */

    const packageJson = {
      name: projectName,

      private: true,

      scripts: {
        dev: "next dev",

        build: "next build",

        start: "next start",
      },

      dependencies: {
        next: "15.3.5",

        react: "^19.0.0",

        "react-dom": "^19.0.0",
      },
    };

    /* ---------------- FILES ---------------- */

    const files = [
      {
        file: "app/page.tsx",

        data: pageCode,
      },

      {
        file: "app/layout.tsx",

        data: layoutCode,
      },

      {
        file: "package.json",

        data: JSON.stringify(
          packageJson,
          null,
          2
        ),
      },

      {
        file: "tsconfig.json",

        data: JSON.stringify(
          {
            compilerOptions: {
              target: "ES6",

              lib: [
                "dom",
                "dom.iterable",
                "esnext",
              ],

              allowJs: true,

              skipLibCheck: true,

              strict: false,

              noEmit: true,

              esModuleInterop: true,

              module: "esnext",

              moduleResolution:
                "bundler",

              resolveJsonModule: true,

              isolatedModules: true,

              jsx: "preserve",

              incremental: true,
            },

            include: [
              "next-env.d.ts",
              "**/*.ts",
              "**/*.tsx",
            ],

            exclude: [
              "node_modules",
            ],
          },
          null,
          2
        ),
      },

      {
        file: "next.config.mjs",

        data: `
const nextConfig = {};

export default nextConfig;
`,
      },
    ];

    console.log(
      "📦 FILES READY"
    );

    /* ---------------- DEPLOY TO VERCEL ---------------- */

    const response =
      await axios.post(
        "https://api.vercel.com/v13/deployments",

        {
          name: projectName,

          files,

          projectSettings: {
            framework:
              "nextjs",
          },
        },

        {
          headers: {
            Authorization: \`Bearer \${process.env.VERCEL_TOKEN}\`,
          },
        }
      );

    console.log(
      "✅ DEPLOY SUCCESS"
    );

    const url =
      "https://" +
      response.data.url;

    console.log(
      "🌍 URL:",
      url
    );

    return Response.json({
      success: true,

      url,
    });
  } catch (error: any) {
    console.log(
      "❌ DEPLOY ERROR:"
    );

    console.log(
      error?.response?.data ||
        error.message
    );

    return Response.json(
      {
        success: false,

        error:
          error?.response?.data ||
          error.message ||
          "Unknown Error",
      },

      {
        status: 500,
      }
    );
  }
}