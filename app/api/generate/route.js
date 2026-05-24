import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
أنت AI قوي جدًا لبناء المشاريع.

المهام:
- تحليل فكرة المستخدم
- تحويلها إلى مشروع كامل
- إعطاء:
  1) فكرة المشروع
  2) الهيكل (folders)
  3) الكود الأساسي
  4) ميزات إضافية ذكية
  5) تحسينات UX/UI
  6) أفكار تطوير مستقبلية

لا تكتب كلام فارغ.
اكتب كود عملي قابل للاستخدام.
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return Response.json({
      result: response.choices[0].message.content,
    });
  } catch (error) {
    return Response.json(
      { error: "Server Error", details: error.message },
      { status: 500 }
    );
  }
}