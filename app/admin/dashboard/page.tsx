// المسار: app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"; 
// إذا استمر الخطأ بعد الاستبدال، السطر الأحدث في Next.js App Router هو:
// import { createClientComponentClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Bot, Terminal, Globe, LogOut, Layers, Cpu, CheckCircle, Loader2, ExternalLink, Sparkles, User } from "lucide-react";

interface UserData { name: string; email: string; avatar: string; }
interface Project { id: string; name: string; url: string; prompt: string; created_at: string; }

export default function AdminDashboard() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).single();
      if (!userRole || userRole.role !== "admin") {
        setError("عذراً، هذه اللوحة مخصصة للمسؤولين فقط.");
        setLoading(false);
        return;
      }

      setUser({
        name: session.user.user_metadata.full_name || "Admin",
        email: session.user.email || "",
        avatar: session.user.user_metadata.avatar_url || "",
      });
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  const handleGenerateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
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
      setProjects([{ id: Math.random().toString(), name: `Nova Site ${projects.length + 1}`, url: data.url, prompt, created_at: new Date().toLocaleDateString("ar-SA") }, ...projects]);
      setPrompt("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">جاري فحص صلاحيات المسؤول...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0f24] border-l border-slate-800/60 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg"><Cpu className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold text-white">NOVA AI</h1>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest block">ADMIN v2</span>
            </div>
          </div>
          <nav><div className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl"><Layers className="w-5 h-5" /> <span className="text-sm font-medium">لوحة التحكم والتوليد</span></div></nav>
        </div>
        {user && (
          <div className="bg-[#0e1533] border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-indigo-500/30" />
              <div className="overflow-hidden"><p className="text-xs font-bold text-white truncate">{user.name}</p><p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p></div>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="w-full py-2 bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 rounded-xl text-xs font-medium text-red-400 flex items-center justify-center gap-2 transition"><LogOut className="w-4 h-4" /> تسجيل الخروج</button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <div className="mb-8 relative overflow-hidden bg-gradient-to-l from-indigo-950/40 via-[#0a0f24] to-[#050816] border border-slate-800/60 rounded-3xl p-6 md:p-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3"><Sparkles className="w-3.5 h-3.5 animate-pulse" /> PRODUCTION LIVE</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">محرك توليد المواقع الذكي V2</h2>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">اكتب وصف فكرتك، وسيقوم نظام هوية الذكاء الاصطناعي بصياغة كود متكامل ورفعه الحقيقي لـ Vercel.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0a0f24] border border-slate-800/80 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl transition-all ${isGenerating ? 'bg-amber-500/10 border border-amber-500/30' : isBotTyping ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-slate-800'}`}><Bot className={`w-5 h-5 ${isGenerating ? 'text-amber-400 animate-bounce' : isBotTyping ? 'text-indigo-400 animate-pulse' : 'text-slate-400'}`} /></div>
                  <div><h3 className="text-sm font-bold text-white">مساعد الإنشاء الذكي</h3><p className="text-[11px] text-slate-400">{isGenerating ? "جاري الإنشاء والرفع الفعلي لـ Vercel..." : isBotTyping ? "الروبوت يستمع لمتطلباتك..." : "جاهز لاستلام فكرتك الجديدة"}</p></div>
                </div>
              </div>

              {error && <div className="mb-4 p-4 bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl text-xs flex gap-2"><Terminal className="w-4 h-4" /><span>{error}</span></div>}

              <form onSubmit={handleGenerateWebsite} className="space-y-4">
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onFocus={() => setIsBotTyping(true)} onBlur={() => setIsBotTyping(false)} placeholder="مثال: موقع لمطعم برجر فاخر، يحتوي هيدر داكن، كروت للوجبات مع السعر، وقسم لآراء العملاء..." disabled={isGenerating} rows={5} className="w-full bg-[#050816] border border-slate-800 focus:border-indigo-500/60 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none transition disabled:opacity-50 resize-none" />
                <button type="submit" disabled={isGenerating || !prompt.trim()} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-2xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> <span>جاري البناء الفعلي والـ Deploy...</span></> : <><Sparkles className="w-4 h-4" /> <span>أطلق العنان وابنِ الموقع الآن</span></>}
                </button>
              </form>
            </div>

            {generatedUrl && (
              <div className="bg-[#0a0f24] border border-emerald-500/20 rounded-3xl p-6 bg-gradient-to-br from-emerald-950/10 to-[#0a0f24]">
                <div className="flex items-center gap-3 mb-4 text-emerald-400"><CheckCircle className="w-5 h-5" /><h4 className="text-sm font-bold">تم الانتهاء والرفع بنجاح الحقيقي!</h4></div>
                <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-[#050816] border border-slate-800 rounded-2xl text-xs font-mono text-indigo-400"><span className="truncate pl-4">{generatedUrl}</span><ExternalLink className="w-4 h-4" /></a>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0a0f24] border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white mb-6 pb-2 border-b border-slate-800/60 flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400" /> المواقع الحية المنتجة ({projects.length})</h3>
              {projects.length === 0 ? (
                <div className="text-center py-12 bg-[#050816] rounded-2xl border border-dashed border-slate-800/80"><Globe className="w-8 h-8 text-slate-700 mx-auto mb-2" /><p className="text-xs text-slate-500">لم يتم إنشاء أي مواقع حية بعد.</p></div>
              ) : (
                <div className="space-y-3 max-h-[410px] overflow-y-auto">
                  {projects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-[#050816] border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between"><span className="text-xs font-bold text-white truncate max-w-[150px] font-mono">{proj.name}</span><span className="text-[10px] text-slate-500">{proj.created_at}</span></div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 italic">"{proj.prompt}"</p>
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11px] text-indigo-400">معاينة الموقع <ExternalLink className="w-3 h-3" /></a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}