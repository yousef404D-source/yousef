export async function POST(req: Request) {
  try {
    const {
      prompt,
      size = "1024x1024",
      quality = "high",
    } = await req.json();

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

    const response = await fetch(
      "https://fal.run/fal-ai/flux/dev",
      {
        method: "POST",

        headers: {
          Authorization: `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          prompt,
          image_size: size,
          num_inference_steps:
            quality === "high" ? 40 : 20,
        }),
      }
    );

    const data = await response.json();

    return Response.json({
      success: true,
      image: data.images?.[0]?.url || null,
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