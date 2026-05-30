// المسار: app/login/page.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Cpu, Sparkles } from "lucide-react";

export default function LoginPage() {
  const supabase = createClientComponentClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // سيتم توجيه المستخدم تلقائياً للوحة التحكم بعد نجاح تسجيل الدخول
        redirectTo: `${window.location.origin}/admin/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#0a0f24] border border-slate-800/80 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
          <Cpu className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-wide">بوابة دخول Nova AI</h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">سجل دخولك آلياً للوصول إلى لوحة التحكم ومحرك بناء المواقع الذكي.</p>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group text-sm"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.7 3.4-4.46 6.64-4.46z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.56l3.76 2.92c2.2-2.03 3.49-5.02 3.49-8.72z"/>
            <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.82 0 11 0 13.2s.54 4.38 1.5 6.3l3.86-3z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.92c-1.04.7-2.38 1.11-4.2 1.11-3.24 0-5.74-1.76-6.64-4.46L1.5 16.8C3.4 20.65 7.35 23 12 23z"/>
          </svg>
          <span>تسجيل الدخول بواسطة Google</span>
        </button>

        <div className="mt-8 pt-6 border-t border-slate-800/60 inline-flex items-center gap-2 text-[11px] text-indigo-400 font-mono">
          <Sparkles className="w-3.5 h-3.5" /> SECURE OAUTH 2.0 PROTOCOL
        </div>
      </div>
    </div>
  );
}