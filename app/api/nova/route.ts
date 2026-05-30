// المسار الحقيقي: C:\Users\asus\ai-site\app\api\nova\route.ts
import OpenAI from "openai";

// تهيئة اتصال OpenAI بالمفتاح السري
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

    // 🧠 هندسة برمجية أسطورية: جعل الـ AI يفهم كبار المطورين وينتج تصاميم عالمية تفاعلية
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini", // يمكنك ترقيته لاحقاً إلى gpt-4o لنتائج أكثر خيالية وفخامة
      messages: [
        {
          role: "system",
          content: `
            You are NOVA CORE AI, an elite, legendary full-stack web developer and UI/UX designer.
            Your intelligence is limitless. You interpret user requests deeply, expanding simple prompts into masterfully crafted, hyper-futuristic, and fully responsive websites.
            
            CRITICAL CODE GENERATION RULES:
            1. STRICT OUTPUT: Return ONLY the raw, valid HTML code starting with <!DOCTYPE html>. Do NOT wrap your output in markdown code blocks (\`\`\`html ... \`\`\`). Absolutely no chat prose, markdown headers, or explanations. Start directly with the code.
            2. DESIGN SYSTEM: Use premium modern layout standards. By default, employ a stunning, luxurious dark cyber-theme (#030712 or #050816) with radiant gradient highlights (e.g., violet to cyan neon glows, emerald accents). 
            3. STYLING & ICONS: Injected via official CDNs in the <head>:
               - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
               - FontAwesome or Lucide Icons for high-fidelity visual aesthetics.
               - Google Fonts: Use highly elegant fonts suitable for the language requested (e.g., 'Plus Jakarta Sans' for English, 'Cairo' or 'Tajawal' for Arabic).
            4. HYPER-INTERACTIVITY & ANIMATIONS: 
               - Include fully functional vanilla JavaScript within <script> tags to make components alive (e.g., multi-tab switchers, responsive mobile menus, filtering systems, dynamic stat counters, working interactive contact forms with stylized success alerts).
               - Implement modern visual animations using smooth Tailwind transitions, hover scales (hover:scale-105 duration-300), floating keyframes, and neon glassmorphism box-shadows.
            5. CONTENT RICHNESS: Build full-scale single-page applications. Do NOT use lazy placeholders or temporary texts. Include multiple deep sections:
               - Advanced Navigation Bar (sticky with backdrop-blur effects)
               - Hero Section with powerful typography and dual call-to-actions
               - Core Features grid with interactive glowing glassmorphism cards
               - Interactive Performance/Analytics Dashboard section with simulated charts
               - Testimonials/Pricing table with clean structural details
               - Beautiful Contact Section & Interactive FAQ Accordions
               - Complete Premium Footer.
            6. LANGUAGE ADAPTABILITY: If the user provides the prompt in Arabic, build the entire UI in professional Arabic text and apply 'dir="rtl"'. If in English, build it in English.
          `,
        },
        {
          role: "user",
          content: `Execute absolute core instructions. Generate a jaw-dropping premium website based on this request: "${prompt}"`,
        },
      ],
      temperature: 0.25, // موازنة مثالية بين العبقرية البرمجية والالتزام المطلق بالقواعد لمنع الأخطاء ونصوص الماركداون الزائدة
    });

    const finalCode = result.choices[0]?.message?.content?.trim();

    if (!finalCode) {
      throw new Error("Nova Engine failed to construct the core code.");
    }

    // 🚀 السحر البرمجي: تحويل كود الـ HTML الفخم والنقي إلى رابط معالجة حي فوراً (Base64 URL)
    // هذا الرابط بمجرد تمريره للواجهة الأمامية سيفتح كموقع حقيقي قابل للتفاعل والضغط بلمح البصر!
    const base64Code = Buffer.from(finalCode, "utf-8").toString("base64");
    const previewUrl = `data:text/html;base64,${base64Code}`;

    return Response.json({
      success: true,
      code: finalCode,    // الكود البرمجي النقي متاح لديك إن أردت عرضه في محرر نصوص
      url: previewUrl,    // رابط العرض الفوري والحي المشفر بالكامل الذي سيرسل للشات
      message: "Legendary site generated successfully",
    });

  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}