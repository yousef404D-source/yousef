"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js"; // استدعاء آمن ومتوافق يمنع أخطاء الـ Build
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Terminal, 
  Globe, 
  LogOut, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  XCircle,
  Loader2, 
  ExternalLink, 
  Sparkles, 
  Send,
  ShieldCheck
} from "lucide-react";

interface UserData { name: string; email: string; avatar: string; }
interface Project { id: string; name: string; url: string; prompt: string; created_at: string; }

export default function AdminDashboard() {
  // إنشاء عميل سوبابيز محلي يتجنب مشاكل استيراد auth-helpers في إصدارات Next الحالية
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
  const router = useRouter();

  // States
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true); 
  const [pageReady, setPageReady] = useState(false); 
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // 1. نظام التحقق الرقمي والأمان
  useEffect(() => {
    const checkAuthAndAnimate = async () => {
      const startTime = Date.now();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data: userRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      const duration = Date.now() - startTime;
      const delay = Math.max(1800 - duration, 0); 

      setTimeout(() => {
        if (!userRole || userRole.role !== "admin") {
          setAuthError("عذراً، هذا الحساب لا يملك صلاحيات المسؤول (Admin).");
          setIsAuthenticating(false);
          return;
        }

        setUser({
          name: session.user.user_metadata.full_name || "Admin",
          email: session.user.email || "",
          avatar: session.user.user_metadata.avatar_url || "",
        });
        
        setIsAuthenticating(false);
        setTimeout(() => setPageReady(true), 100);
      }, delay);
    };

    checkAuthAndAnimate();
  }, [router, supabase.auth]);

  // 2. معالجة طلب توليد الموقع والـ Deploy
  const handleGenerateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setServerError(null);
    setGeneratedUrl(null);

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || "فشل توليد الموقع");

      setGeneratedUrl(data.url);
      setProjects([
        { 
          id: Math.random().toString(), 
          name: `Nova Site #${projects.length + 1}`, 
          url: data.url, 
          prompt, 
          created_at: new Date().toLocaleTimeString("ar-SA", { hour: '2-digit', minute: '2-digit' }) 
        }, 
        ...projects
      ]);
      setPrompt("");
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. شاشة التحقق البدئية المتمركزة بدقة في المنتصف
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#030612] flex flex-col items-center justify-center text-white px-4 relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        
        <div className="text-center z-10 space-y-6 animate-bounce duration-1000">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30 relative group">
            <Bot className="w-12 h-12 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-3xl border border-white/20 animate-ping opacity-25"></div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">NOVA ENGINE SECURITY</h2>
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-400 font-mono">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>VERIFYING ADMIN TOKENS...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. واجهة الخطأ في الصلاحيات
  if (authError) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full bg-[#160b11] border-2 border-red-500 rounded-3xl p-8 text-center shadow-2xl shadow-red-500/10">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-red-400 mb-2">خطأ في الصلاحية</h3>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">{authError}</p>
          <button onClick={() => router.push("/login")} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition text-sm">
            العودة لصفحة الدخول
          </button>
        </div>
      </div>
    );
  }

  // 5. الواجهة الأساسية المصححة هندسياً ومتوافقة مع الـ RTL بالكامل
  return (
    <div className={`min-h-screen bg-[#050816] text-slate-100 flex transition-opacity duration-700 ${pageReady ? "opacity-100" : "opacity-0"}`} dir="rtl">
      
      {/* Sidebar - تم إصلاح الحواف والانحناءات لتطابق جهة اليمين البرمجية في الـ RTL */}
      <aside className="w-72 bg-[#070b21] border-r border-slate-800/80 p-6 flex flex-col justify-between hidden lg:flex shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-wide">NOVA AI PRO</h1>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest block uppercase">Workspace v2.5</span>
            </div>
          </div>
          <nav>
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-l from-indigo-950/50 to-transparent text-indigo-400 border-r-2 border-indigo-500 rounded-l-none rounded-r-xl">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-semibold">استوديو توليد المواقع</span>
            </div>
          </nav>
        </div>

        {user && (
          <div className="bg-[#0b112c] border border-indigo-950 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full border border-indigo-500/30 object-cover" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                  {user.name} <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 inline" />
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
              className="w-full py-2 bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 rounded-xl text-xs font-medium text-red-400 flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
            </button>
          </div>
        )}
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/60 bg-[#050816]/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Cpu className="w-4 h-4 text-white" /></div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              لوحة التحكم الرئيسية 
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded-full font-mono">LIVE_DEPLOY</span>
            </h2>
          </div>
          <div className="lg:hidden">
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Content Area - مصفوف بشكل مرن يمنع رمي العناصر لليسار */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 md:p-6 gap-6">
          
          {/* Chat Hub (صندوق المحادثة الموزون والمستقر أفدح) */}
          <div className="flex-1 flex flex-col bg-[#070b21] border border-slate-800/80 rounded-3xl overflow-hidden relative shadow-2xl">
            
            {/* روبوت الحالة العلوي */}
            <div className={`p-4 border-b transition-colors duration-300 flex items-center justify-between ${isGenerating ? 'bg-amber-950/20 border-amber-500/40' : isBotTyping ? 'bg-indigo-950/30 border-indigo-500/40' : 'bg-slate-900/40 border-slate-800/80'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all duration-300 ${isGenerating ? 'bg-amber-500/20 border border-amber-400' : isBotTyping ? 'bg-indigo-500/20 border border-indigo-400' : 'bg-slate-800 border border-slate-700'}`}>
                  <Bot className={`w-5 h-5 ${isGenerating ? 'text-amber-400 animate-bounce' : isBotTyping ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Nova AI Assistant</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isGenerating ? "جاري صياغة الكود ورفعه خلوياً لـ Vercel..." : isBotTyping ? "جاري قراءة وتحليل متطلبات التصميم..." : "أنا مستعد، أرسل لي فكرة الموقع البرمجية التي تدور في ذهنك."}
                  </p>
                </div>
              </div>
            </div>

            {/* منطقة الرسائل */}
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {serverError && (
                <div className="p-4 bg-[#1a090d] border-2 border-red-500 rounded-2xl text-red-400 text-xs font-medium flex items-start gap-2.5 shadow-lg shadow-red-500/5 animate-headShake">
                  <Terminal className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                  <div className="space-y-1">
                    <p className="font-bold">فشل في معالجة الطلب (Error):</p>
                    <p className="text-slate-300 text-[11px] font-mono">{serverError}</p>
                  </div>
                </div>
              )}

              {generatedUrl && (
                <div className="p-4 bg-[#0a1c13] border-2 border-emerald-500 rounded-2xl text-emerald-400 text-xs font-medium flex flex-col gap-3 shadow-lg shadow-emerald-500/5 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">تم الإنشاء بنجاح كامل (Production Ready)</p>
                      <p className="text-slate-300 text-[11px] mt-0.5">تم الانتهاء من الـ Deploy على سيرفرات Vercel العالمية بنجاح وبدون أي أخطاء.</p>
                    </div>
                  </div>
                  <a 
                    href={generatedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-[#030612] border border-emerald-500/30 hover:border-emerald-400 rounded-xl text-xs font-mono text-indigo-400 transition group"
                  >
                    <span className="truncate pr-4">{generatedUrl}</span>
                    <ExternalLink className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-indigo-400 transition" />
                  </a>
                </div>
              )}

              {!serverError && !generatedUrl && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                  <Sparkles className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
                  <p className="text-xs">المحادثة فارغة. اكتب متطلبات موقعك بالأسفل لتبدأ المعالجة الحية.</p>
                </div>
              )}
            </div>

            {/* نموذج حقل الإدخال - مصلح هندسياً ليتناسب الزر مع اتجاه النص العربي (RTL) */}
            <form onSubmit={handleGenerateWebsite} className="p-4 bg-[#050816]/60 border-t border-slate-800/80">
              <div className="relative flex items-center">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsBotTyping(true)}
                  onBlur={() => setIsBotTyping(false)}
                  placeholder="مثال: موقع شركة تقنية ناشئة، ثيم دارك مستقبلي، يحتوي كروت متحركة، تدرجات نيوني، وقسم تواصل..."
                  disabled={isGenerating}
                  rows={2}
                  className="w-full bg-[#030612] border border-slate-800 focus:border-indigo-500 rounded-2xl pr-4 pl-14 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition disabled:opacity-50 resize-none leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="absolute left-3 p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 transition shadow-lg disabled:shadow-none"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 transform -rotate-90" />}
                </button>
              </div>
            </form>
          </div>

          {/* أرشيف وسجلات الـ Deploys الجانبي */}
          <div className="w-full lg:w-80 bg-[#070b21] border border-slate-800/80 rounded-3xl p-4 flex flex-col overflow-hidden shadow-xl shrink-0">
            <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-slate-800/60">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>المواقع المرفوعة حياً ({projects.length})</span>
            </h3>

            {projects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-25 p-6 border border-dashed border-slate-800 rounded-2xl">
                <Globe className="w-6 h-6 mb-2" />
                <p className="text-[11px]">لا توجد سجلات رفع سابقة في هذه الجلسة.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1 pl-0.5">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 bg-[#030612] border border-slate-800/80 rounded-xl hover:border-slate-700 transition space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-white truncate max-w-[130px] font-mono">{proj.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{proj.created_at}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{proj.prompt}"</p>
                    <a 
                      href={proj.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-[10px] text-indigo-400 hover:underline"
                    >
                      زيارة الرابط <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}