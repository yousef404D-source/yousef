import OpenAI from "openai";

import axios from "axios";

import fs from "fs-extra";

import path from "path";

import { v4 as uuid } from "uuid";

const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY!,
});

export async function POST(
  req: Request
) {
  try {
    const { prompt } =
      await req.json();

    /* ---------------- PROJECT NAME ---------------- */

    const clean =
      prompt
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 20);

    const projectName =
      `nova-ai-${clean}-${Date.now()}`;

    /* ---------------- AI GENERATION ---------------- */

    const completion =
      await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",

          messages: [
            {
              role: "system",

              content: `
You are Nova AI.

Generate ONLY ONE complete modern HTML website.

DO NOT explain anything.

DO NOT write markdown.

DO NOT write code blocks.

Return ONLY raw HTML.

Make the design futuristic and beautiful.
`,
            },

            {
              role: "user",

              content: prompt,
            },
          ],
        }
      );

    const html =
      completion.choices[0]
        .message.content || "";

    /* ---------------- CREATE FOLDER ---------------- */

    const id = uuid();

    const projectPath =
      path.join(
        process.cwd(),
        "generated",
        id
      );

    await fs.ensureDir(
      projectPath
    );

    /* ---------------- WRITE FILES ---------------- */

    await fs.writeFile(
      path.join(
        projectPath,
        "index.html"
      ),
      html
    );

    await fs.writeFile(
      path.join(
        projectPath,
        "package.json"
      ),
      JSON.stringify({
        name: projectName,
        version: "1.0.0",
      })
    );

    /* ---------------- DEPLOY TO VERCEL ---------------- */

    const files = [
      {
        file: "index.html",

        data: html,
      },
    ];

    const deploy =
      await axios.post(
        "https://api.vercel.com/v13/deployments",

        {
          name: projectName,

          files,

          projectSettings: {
            framework: null,
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
      deploy.data.url;

    console.log(
      "✅ DEPLOYED:",
      url
    );

    return Response.json({
      success: true,
      url,
    });
  } catch (error) {
    console.log(
      "❌ DEPLOY ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Deployment failed",
      },
      {
        status: 500,
      }
    );
  }
}