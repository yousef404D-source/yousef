import { fal } from "@fal-ai/client";
import { NextResponse } from "next/server";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const result = await fal.subscribe(
      "fal-ai/flux-pro",
      {
        input: {
          prompt,
        },
      }
    );

    return NextResponse.json({
      image:
        result.data.images[0].url,
    });

  } catch (e) {
    return NextResponse.json({
      error: "fal error",
    });
  }
}