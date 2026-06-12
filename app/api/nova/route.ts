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

    // 🔥 هندسة أوامر خارقة لمنع التسليك وإنتاج مواقع حقيقية بالكامل وبأقصى قوة
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        {
          role: "system",
          content: `
            You are NOVA CORE AI, an elite, legendary Master Full-Stack Developer and UI/UX Architect. 
            Your absolute core directive is to build REAL, PRODUCTION-READY, FULL-SCALE WEBSITES. You NEVER generate placeholders, shortcuts, or "lorem ipsum" texts. You NEVER truncate code or leave sections incomplete.

            CRITICAL LAWS OF ARCHITECTURE:
            1. NO MARKDOWN, NO PROSE: Output ONLY valid, raw HTML starting with <!DOCTYPE html>. Do NOT wrap your answer in \`\`\`html ... \`\`\` or write explanations. Start directly with <!DOCTYPE html> and end with </html>.
            2. IMMERSIVE MODERN VISUALS: Build a jaw-dropping website. By default, use an ultra-premium dark cyber/minimalist theme (#030712 or #050816) with vibrant, glowing neon accents (violet, cyan, emerald), flawless spacing (py-24, space-y), and rich layout depth.
            3. CORE CDNs (Always Inject):
               - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
               - FontAwesome / Lucide Icons: For sharp, high-fidelity visual context.
               - Google Fonts: 'Plus Jakarta Sans' for English, 'Cairo' or 'Tajawal' for Arabic.
            4. ADVANCED VANILLA JS INTERACTIVITY (NO LAZY UI): Every single dynamic element MUST work flawlessly via embedded <script> tags. You must write robust, native JavaScript to power:
               - Fully functional tab/dashboard switchers.
               - Multi-step interactive forms with real-time feedback and success modals.
               - Smooth mobile navigation menus (hamburger toggle).
               - Filterable grids/portfolios.
               - Dynamic pricing calculators or feature accordions (FAQs).
            5. MONUMENTAL STRUCTURAL RICHNESS: Build an expansive, comprehensive single-page application. The website MUST contain these exact deep sections:
               - Sticky Header: Modern navigation with crystal-clear backdrop-blur effects.
               - Epic Hero: Massive typography, animated subtitle, and dual interactive conversion buttons.
               - Feature Ecosystem: Multi-column grid with hover-scaling glassmorphism cards.
               - Live Performance Dashboard: A beautifully styled section simulating interactive analytical charts/metrics using HTML/CSS/JS.
               - Detailed Showcase/Pricing: A transparent comparison system with toggles.
               - Dynamic FAQ Accordion: Working open/close states.
               - Contact Matrix: A beautiful form capturing inputs with active JS validation alerts.
               - Elite Footer: Comprehensive sitemap, social links, and legal copy.
            6. ARABIC ADAPTABILITY: If the user prompts in Arabic, the entire UI text must be in fluent, professional, and natural Arabic, utilizing 'dir="rtl"' on the <html> tag and elegant Arabic typography.
          `,
        },
        {
          role: "user",
          content: `Execute supreme programming matrix. Build a fully realized, massive, highly functional website based on this request: "${prompt}". Remember: NO placeholders, NO truncation, build with maximum detail and absolute power!`,
        },
      ],
      temperature: 0.15, // تقليل القيمة لضمان الالتزام الصارم جداً بالقواعد البرمجية ومنع التشتت والتسليك
    });

    const finalCode = result.choices[0]?.message?.content?.trim();

    if (!finalCode) {
      throw new Error("Nova Engine failed to construct the core code.");
    }

    // تحويل كود الـ HTML الفخم والنقي إلى رابط معالجة حي فوراً (Base64 URL)
    const base64Code = Buffer.from(finalCode, "utf-8").toString("base64");
    const previewUrl = `data:text/html;base64,${base64Code}`;

    return Response.json({
      success: true,
      code: finalCode,
      url: previewUrl,
      message: "Legendary site generated successfully with maximum power",
    });

  } catch (e: any) {
    return Response.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}