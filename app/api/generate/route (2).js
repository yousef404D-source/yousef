import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req) {
  try {
    const { style } = await req.json();

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt: `
Modern UI website background design.
Style: ${style}.
High quality futuristic design, gradients, clean UI.
        `,
      },
    });

    return Response.json({
      image: result.data.images[0].url,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ error: "FAILED" }, { status: 500 });
  }
}