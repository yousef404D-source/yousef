"use client";

import { useState, useEffect } from "react";
// 🛠️ استخدام المكتبة المستقرة
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Cpu, Sparkles, Loader2, Lock, Mail } from "lucide-react";

// 🚀 السطر السحري: إجبار Next.js على عدم عمل Prerender لصفحة الدخول أثناء الـ Build
export const dynamic = "force-dynamic";

// جلب المتغيرات مع حماية نصية
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // تعريف متغير حالة لعميل Supabase لضمان تهيئته داخل المتصفح فقط
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  useEffect(() => {
    // نقوم بإنشاء العميل فقط إذا كانت المتغيرات موجودة وداخل المتصفح
    if (supabaseUrl && supabaseAnonKey) {
      setSupabaseClient(createClient(supabaseUrl, supabaseAnonKey));
    }
  }, []);

  // 1. منطق تسجيل الدخول عبر Google
  const handleGoogleLogin = async () => {
    setError(null);
    if (!supabaseClient) {
      setError("إعدادات Supabase غير مكتملة بعد.");
      return;
    }
    
    try {
      await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/admin/dashboard`,
        },
      });
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بـ Google");
    }
  };

  // 2. منطق تسجيل الدخول عبر البريد وكلمة المرور
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!supabaseClient) {
      setError("إعدادات Supabase غير مكتملة بعد.");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول، يرجى التحقق من البيانات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#0a0f24] border border-slate-800/80 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
          <Cpu className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-wide">بوابة دخول Nova AI</h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">سجل دخولك للوصول إلى لوحة التحكم ومحرك بناء المواقع الذكي.</p>

        {error && (
          <div className="mb-4 p-4 bg-red-950/20 border border-red-500/30 text-red-400 rounded-2xl text-xs text-right font-medium">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group text-sm mb-6"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3c.9-2.7 3.4-4.46 6.64-4.46z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.46c-.29 1.48-1.14 2.73-2.42 3.56l3.76 2.92c2.2-2.03 3.49-5.02 3.49-8.72z"/>
            <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.5 6.9C.54 8.82 0 11 0 13.2s.54 4.38 1.5 6.3l3.86-3z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.92c-1.04.7-2.38 1.11-4.2 1.11-3.24 0-5.74-1.76-6.64-4.46L1.5 16.8C3.4 20.65 7.35 23 12 23z"/>
          </svg>
          <span>تسجيل الدخول بواسطة Google</span>
        </button>

        <div className="flex items-center my-4 before:flex-1 before:border-t before:border-slate-800/60 after:flex-1 after:border-t after:border-slate-800/60">
          <span className="px-3 text-xs text-slate-500 font-medium">أو عبر البيانات</span>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4 text-right">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 opacity-60" /> البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nova.ai"
              required
              disabled={loading}
              className="w-full bg-[#050816] border border-slate-800 focus:border-indigo-500/60 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none transition disabled:opacity-50 text-left"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 opacity-60" /> كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className="w-full bg-[#050816] border border-slate-800 focus:border-indigo-500/60 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none transition disabled:opacity-50 text-left"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2 text-sm"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> <span>جاري المصادقة...</span></>
            ) : (
              <span>تسجيل الدخول بالبريد</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 inline-flex items-center gap-2 text-[11px] text-indigo-400 font-mono justify-center w-full">
          <Sparkles className="w-3.5 h-3.5" /> SECURE OAUTH & HYBRID PROTOCOL
        </div>
      </div>
    </div>
  );
}