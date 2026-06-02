"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Bot, Terminal, Globe, LogOut, Layers, Cpu, CheckCircle, Loader2, ExternalLink, Sparkles, Mic, MicOff, Eye, MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

interface UserData { name: string; email: string; avatar: string; }
interface Project { id: string; name: string; url: string; prompt: string; created_at: string; }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  // أنظمة التحكم في وضع العرض المطور (تبديل الشاشات)
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  // أنظمة التحكم في الصوت وتحويله إلى نص
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setError("إعدادات الاتصال بـ Supabase غير مكتملة.");
      setLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // التحقق الصارم من تسجيل الدخول قبل عرض الشات وحماية الجلسة
        if (!session) { 
          router.push("/login"); 
          return; 
        }

        const { data: userRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (!userRole || userRole.role !== "admin") {
          setError("عذراً، هذه اللوحة مخصصة للمسؤولين فقط.");
          setLoading(false);
          return;
        }

        setUser({
          name: session.user.user_metadata.full_name || "Admin",
          email: session.user.email || "",
          avatar: session.user.user_metadata.avatar_url || "https://avatar.iran.liara.run/public/1",
        });
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();

    // تهيئة ميزة التعرف على الصوت المدمجة في المتصفحات
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.lang = "ar-SA"; // يدعم الإدخال باللغة العربية الفصحى واللهجات المحلية
        rec.interimResults = false;

        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setPrompt((prev) => (prev ? prev + " " + transcript : transcript));
        };
        rec.onerror = (e: any) => {
          console.error("Speech error", e);
          setIsListening(false);
        };
        recognitionRef.current = rec;
      }
    }
  }, [router]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("التعرف على الصوت غير مدعوم في متصفحك الحالي، يرجى استخدام Chrome أو Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleGenerateWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || "فشل توليد الموقع الحقيقي");

      setGeneratedUrl(data.url);
      setProjects([
        { 
          id: Math.random().toString(), 
          name: `Nova Site ${projects.length + 1}`, 
          url: data.url, 
          prompt, 
          created_at: new Date().toLocaleDateString("ar-SA") 
        }, 
        ...projects
      ]);
      setPrompt("");
      // الانتقال التلقائي السلس إلى شاشة المعاينة بعد اكتمال التوليد
      setActiveTab("preview");
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
        <p className="text-sm font-medium text-slate-400">جاري فحص صلاحيات المسؤول السيبراني وتأمين الحساب...</p>
      </div>
    );
  }

  const activeSupabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex overflow-hidden h-screen" dir="rtl">
      
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0f24] border-l border-slate-800/60 p-6 flex flex-col justify-between hidden md:flex h-full shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">NOVA AI</h1>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest block">ADMIN v2.5</span>
            </div>
          </div>
          <nav>
            <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <Layers className="w-5 h-5" /> 
              <span className="text-sm font-medium">لوحة التحكم والتوليد</span>
            </div>
          </nav>
        </div>
        
        {user && (
          <div className="bg-[#0e1533] border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-indigo-500/30" />
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={async () => { if(activeSupabase) { await activeSupabase.auth.signOut(); } router.push("/login"); }} 
              className="w-full py-2 bg-red-950/30 hover:bg-red-900/40 border border-red-500/20 rounded-xl text-xs font-medium text-red-400 flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top bar with Smart Toggle Switch - أزرار العرض المزدوجة المتطورة في أعلى اليمين */}
        <div className="p-4 bg-[#0a0f24]/60 border-b border-slate-800/50 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-2 bg-[#050816] border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === "chat" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              <MessageSquare className="w-4 h-4" /> التحكم والشات
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === "preview" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Eye className="w-4 h-4" /> معاينة الموقع الحية (Preview)
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-500">
            STATUS: <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ONLINE</span>
          </div>
        </div>

        {/* Dynamic Workspace Container */}
        <div className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6 relative h-full w-full">
          
          {/* Left/Main Column: Chat & Engine 控制 */}
          <div className={`transition-all duration-500 ease-in-out flex flex-col gap-6 h-full ${activeTab === "preview" ? "w-0 opacity-0 pointer-events-none md:w-1/4 md:opacity-100 md:pointer-events-auto" : "w-full md:w-70% lg:w-7/12"}`}>
            
            <div className="overflow-hidden bg-gradient-to-l from-indigo-950/20 via-[#0a0f24] to-[#050816] border border-slate-800/60 rounded-2xl p-5 shrink-0">
              <h2 className="text-xl font-black text-white flex items-center gap-2">محرك NOVA AI الذكي</h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">اكتب متطلباتك أو تكلم مباشرة لبناء نظامك البرمجي السحابي المطور.</p>
            </div>

            {/* مجمع الإدخال المحسن والمحاذى بشكل مثالي بدون نتوءات أو بروز */}
            <div className="bg-[#0a0f24] border border-slate-800/80 rounded-2xl p-5 flex flex-col flex-1 overflow-hidden min-h-[300px]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isGenerating ? 'bg-amber-500/10 text-amber-400 animate-bounce' : 'bg-slate-800 text-slate-400'}`}>
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">مساعد التصميم والهوية</h3>
                    <p className="text-[10px] text-slate-500">مستعد لمعالجة وبناء الفكرة الحقيقية</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/20 border border-red-500/30 text-red-400 rounded-xl text-xs flex gap-2 shrink-0">
                  <Terminal className="w-4 h-4" /> <span>{error}</span>
                </div>
              )}

              {/* حقل الإدخال المصحح مع الميكروفون المدمج التفاعلي */}
              <form onSubmit={handleGenerateWebsite} className="flex-1 flex flex-col gap-4 overflow-hidden relative">
                <div className="relative flex-1 bg-[#050816] border border-slate-800 focus-within:border-indigo-500/60 rounded-xl p-1 flex flex-col overflow-hidden">
                  <textarea 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    onFocus={() => setIsBotTyping(true)} 
                    onBlur={() => setIsBotTyping(false)} 
                    placeholder="اكتب فكرتك بالتفصيل، أو اضغط على الميكروفون الجانبي للتحدث مباشرة..." 
                    disabled={isGenerating} 
                    className="w-full h-full bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none transition p-3 disabled:opacity-50 resize-none overflow-y-auto" 
                  />
                  
                  {/* زر التحدث الصوتي الذكي داخل صندوق النص والمحاذاة الفائقة */}
                  <div className="absolute left-3 bottom-3 z-10 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg ${isListening ? 'bg-red-600 text-white animate-pulse scale-110' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      title={isListening ? "جاري الاستماع... اضغط للإيقاف" : "تحدث لإدخال النص صوتياً"}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isGenerating || !prompt.trim()} 
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                >
                  {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> <span>جاري البناء السحابي المطور...</span></> : <><Sparkles className="w-4 h-4" /> <span>توليد وتدشين الموقع الفوري</span></>}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Full Interactive Dynamic Live Preview Section */}
          {/* قسم المعاينة الذي يتمدد بشكل كامل ليأخذ الشاشة عند تفعيل زر Preview ويتقلص بسلاسة */}
          <div className={`transition-all duration-500 ease-in-out h-full flex flex-col ${activeTab === "preview" ? "w-full md:w-full" : "w-0 opacity-0 pointer-events-none md:w-5/12 lg:w-5/12 md:opacity-100 md:pointer-events-auto"}`}>
            
            <div className="bg-[#0a0f24] border border-slate-800/80 rounded-2xl p-4 flex flex-col h-full overflow-hidden w-full">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-white">المعاينة الفورية المباشرة</h3>
                </div>
                {generatedUrl && (
                  <a href={generatedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-indigo-400 hover:underline">
                    رابط خارجي <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {!generatedUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-[#050816] p-6 text-center">
                  <Globe className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
                  <p className="text-xs text-slate-400 font-medium">لا يوجد رابط نشط حالياً للمعالجة</p>
                  <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">قم بكتابة وصفك البرمجي والضغط على زر التوليد لتشاهد النتيجة الحية هنا مباشرة.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full w-full">
                  <div className="flex-1 rounded-xl overflow-hidden border border-slate-800 bg-white relative shadow-inner h-full w-full">
                    <iframe src={generatedUrl} className="w-full h-full border-none" title="Nova Dynamic Live Preview" />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}