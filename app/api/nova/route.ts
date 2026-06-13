import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // استقبال مصفوفة الرسائل كاملة للحفاظ على سياق النقاش وجمع المعلومات
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "No conversational messages provided" }, { status: 400 });
    }

    // تكييف الـ System Prompt ليصبح وكيلاً استشارياً ومطوّراً في آن واحد
    const systemInstruction = `
      You are NOVA CORE AI, an elite, legendary Master Full-Stack Developer, UI/UX Architect, and Product Consultent.
      
      CRITICAL OPERATIONAL LAWS:
      1. INTENT DETECTION & DISCUSSION PHASE:
         - If the user asks a general question (e.g., "What is SEO?", "Explain flexbox"), JUST reply professionally with text. Do NOT generate any website or code.
         - If the user wants to start a new website/landing page project, DO NOT BUILD IT YET. You must first pause and ask elegant, professional questions to gather requirements: "Are there any specific details, color schemes, or core features you want in your website before we begin?".
         - Engage in discussion and only proceed to build when the user provides the final details or explicitly tells you to start generation.

      2. CODE GENERATION PHASE (Only when explicitly triggered after consultation):
         - Generate a REAL, PRODUCTION-READY, FULL-SCALE WEBSITE. No placeholders, no truncation, no "lorem ipsum".
         - Output format: Your response must be parsed carefully. To deliver both the chat description and code safely, wrap the entire HTML code inside a standard markdown block starting with \`\`\`html and ending with \`\`\`. Any conversation or explanation must be placed outside this code block.

      3. ARCHITECTURAL REQUIREMENTS (When building):
         - Default theme: Ultra-premium dark cyber/minimalist (#030712 or #050816) with neon accents, unless the user requested otherwise during consultation.
         - CDNs: Inject Tailwind CSS, FontAwesome/Lucide Icons, and premium Google Fonts ('Plus Jakarta Sans' / 'Cairo').
         - Interactivity: Write robust native JavaScript for multi-step forms, tab switchers, hamburger menus, and analytical dashboards.
         - Multi-language: If the user communicates in Arabic, your text response and the generated website UI must be in flawless, natural Arabic with 'dir="rtl"'.
    `;

    // تحويل الرسائل الممررة من الواجهة إلى الهيكل المطلوب لـ OpenAI
    const apiMessages = [
      { role: "system", content: systemInstruction },
      ...messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
    ];

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: apiMessages as any,
      temperature: 0.2, // نسبة وزنية منخفضة لمنع التشتت والالتزام بالمنطق الاستشاري
    });

    const responseText = result.choices[0]?.message?.content || "";

    // فحص ما إذا كان الرد يحتوي على كود بناء أم أنه مجرد نقاش عادي/سؤال وجواب
    let finalCode = "";
    let cleanText = responseText;

    const match = responseText.match(/```html([\s\S]*?)```/);
    if (match && match[1]) {
      finalCode = match[1].trim();
      // تنظيف النص المعروض للمستخدم من كود الـ HTML الضخم ليبقى النقاش مرتباً
      cleanText = responseText.replace(/```html([\s\S]*?)```/, "").trim();
      if (!cleanText) {
        cleanText = "⚡ NOVA Core Engine: Production layout compiled successfully.";
      }
    }

    // إذا تم توليد كود، نقوم بإنشاء الـ Base64 URL للمعاينة التطورية الفورية
    let previewUrl = null;
    if (finalCode) {
      const base64Code = Buffer.from(finalCode, "utf-8").toString("base64");
      previewUrl = `data:text/html;base64,${base64Code}`;
    }

    return Response.json({
      success: true,
      text: cleanText,
      codeBlock: finalCode || undefined,
      url: previewUrl || undefined,
    });

  } catch (e: any) {
    console.error("Core AI Route Error:", e);
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}