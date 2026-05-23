import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(req) {
  try {
    const { styles = [], size = "1024x1024", quality = "high" } = await req.json();

    // بناء الـ prompt بشكل ديناميكي
    const prompt = `
Modern UI website background design.
${styles.map((s) => `Style: ${s}.`).join("\n")}
High quality futuristic design, gradients, clean UI.
    `;

    console.log("🚀 Prompt Sent:", prompt);

    const result = await fal.subscribe("fal-ai/flux/dev", {
      input: {
        prompt,
        size,
        quality,
      },
    });

    if (!result?.data?.images?.length) {
      throw new Error("No images returned from FAL API");
    }

    // إرجاع كل الصور بدل صورة واحدة
    const images = result.data.images.map((img) => img.url);

    return Response.json({ images });

  } catch (err) {
    console.error("❌ Error in FAL API:", err.message);
    return Response.json(
      { error: "FAILED", details: err.message },
      { status: 500 }
    );
  }
}
