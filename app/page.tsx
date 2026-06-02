"use client";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr"; 
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Cpu, 
  Lock,
  Eye,
  EyeOff,
  Code2,
  Rocket,
  Layers,
  FileText,
  CreditCard,
  Check,
  Database,
  RefreshCw,
  Coins,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface UserData { id: string; name: string; email: string; avatar: string; plan: "Free" | "Pro" | "Enterprise"; credits: number; }
interface Project { id: string; name: string; url: string; prompt: string; type: string; created_at: string; }
interface Message { id: string; role: "user" | "assistant"; text: string; type: "chat" | "code_preview"; previewUrl?: string; pages?: string[]; }

export default function UltimateSaaSDashboard() {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true); 
  const [pageReady, setPageReady] = useState(false); 
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // نظام الرمز السري الحصري
  const [gatePassword, setGatePassword] = useState("");
  const [isPassedGate, setIsPassedGate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [gateStatus, setGateStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");

  const [messages, setMessages] = useState<Message[]>([]);
  const [activePreviewPage, setActivePreviewPage] = useState("الرئيسية (Home)");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [dbSyncStatus, setDbSyncStatus] = useState<"synced" | "syncing" | "error">("synced");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const initSaaSPlatform = async () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setUser({
          id: "demo-id",
          name: "يوسف بيكر",
          email: "yousef@nova.com",
          avatar: "https://api.dicebear.com/7.x/bottts/svg",
          plan: "Free",
          credits: 3
        });
        setIsAuthenticating(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setDbSyncStatus("syncing");
        
        let { data: profile } = await supabase
          .from("user_subscriptions")
          .select("plan, credits")
          .eq("user_id", session?.user.id || "")
          .single();

        setUser({
          id: session?.user.id || "id",
          name: session?.user.user_metadata.full_name || "عضو نوڤا الخارق",
          email: session?.user.email || "",
          avatar: session?.user.user_metadata.avatar_url || "https://api.dicebear.com/7.x/bottts/svg",
          plan: profile?.plan || "Free",
          credits: profile?.credits ?? 3
        });

        const { data: userProjects } = await supabase
          .from("generated_websites")
          .select("*")
          .eq("user_id", session?.user.id || "")
          .order("created_at", { ascending: false });

        if (userProjects) setProjects(userProjects);
        setDbSyncStatus("synced");
        setIsAuthenticating(false);
      } catch (error) {
        setIsAuthenticating(false);
      }
    };
    initSaaSPlatform();
  }, [router, supabase]);

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatePassword.trim()) return;
    setGateStatus("verifying");

    setTimeout(() => {
      if (gatePassword === "yousefyousefbaker505") { 
        setGateStatus("success");
        setTimeout(() => {
          setIsPassedGate(true);
          setTimeout(() => setPageReady(true), 100);
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              text: "🔥 تم تفعيل نظام NOVA AI بنجاح! المنصة الآن جاهزة ومفتوحة بالكامل لتوليد المواقع متعددة الصفحات لأي تخصص تطلبه.",
              type: "chat"
            }
          ]);
        }, 500);
      } else {
        setGateStatus("error");
        setTimeout(() => setGateStatus("idle"), 1200);
      }
    }, 1000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const userPrompt = prompt.trim();
    setPrompt("");
    setIsGenerating(true);
    setMessages(prev => [...prev, { id: Math.random().toString(), role: "user", text: userPrompt, type: "chat" }]);

    setTimeout(() => {
      const structuralPages = ["الرئيسية (Home)", "من نحن (About)", "خدماتنا (Services)", "اتصل بنا (Contact)"];
      setActivePreviewPage(structuralPages[0]);
      
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: "assistant",
        text: `🚀 تم بنجاح بناء هيكل الموقع المتكامل وتوزيعه بالكامل في المنتصف! عاين صفحات النظام الحية من هنا:`,
        type: "code_preview",
        previewUrl: "https://stackblitz.com",
        pages: structuralPages
      }]);
      setIsGenerating(false);
    }, 2000);
  };

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#030612] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
        <span className="text-xs font-mono tracking-widest text-slate-500">BOOTING NOVA SYSTEM...</span>
      </div>
    );
  }

  // التمركز المطلق في السنتر (نفس مكان إشارة صبعك بالظبط)
  if (!isPassedGate) {
    return (
      <div className="min-h-screen w-full bg-[#030612] flex items-center justify-center text-white p-4 relative" dir="rtl">
        {/* توهج خلفي فخم لضبط السنتر */}
        <div className="absolute w-[350px] h-[350px] rounded-full blur-[120px] bg-indigo-600/20 z-0"></div>
        
        {/* الكارت ممركز 100% في شاشة الكمبيوتر */}
        <div className="max-w-md w-full bg-[#070b21]/90 border border-slate-800/80 backdrop-blur-xl p-8 rounded-[28px] shadow-2xl text-center space-y-6 z-10 mx-auto my-auto">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
            <Lock className="w-6 h-6 text-white" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white tracking-wide">System Login</h2>
            <p className="text-xs text-slate-400">Authenticate to access Nova AI</p>
          </div>

          <form onSubmit={handleGateSubmit} className="space-y-4 text-right">
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"><Lock className="w-4 h-4" /></span>
              <input
                type={showPassword ? "text" : "password"}
                value={gatePassword}
                onChange={(e) => setGatePassword(e.target.value)}
                placeholder="System Password"
                className="w-full bg-[#030612] border border-slate-800 focus:border-indigo-500 rounded-2xl pr-11 pl-12 py-3.5 text-xs font-mono text-center text-white focus:outline-none transition-all placeholder-slate-600"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {gateStatus === "error" && (
              <p className="text-[11px] text-red-400 text-center font-medium animate-pulse">❌ الرمز السري غير صحيح!</p>
            )}

            <button type="submit" disabled={gateStatus === "verifying"} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2">
              {gateStatus === "verifying" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enter System"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // واجهة لوحة التحكم بعد الدفع والدخول الناجح
  return (
    <div className={`min-h-screen bg-[#050816] text-slate-100 flex flex-col transition-opacity duration-700 ${pageReady ? "opacity-100" : "opacity-0"}`} dir="rtl">
      <header className="border-b border-slate-800/60 bg-[#050816]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center"><Cpu className="w-5 h-5 text-white" /></div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">NOVA OMNI-SAAS</h1>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="bg-[#0c1333] border border-slate-800 px-3 py-1.5 rounded-xl text-[11px]">
                <span className="text-amber-400 font-bold">الرصيد: لانهائي ∞</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6 justify-center">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full justify-center">
          
          <div className="flex-1 flex flex-col bg-[#070b21] border border-slate-800/80 rounded-3xl h-[580px] shadow-2xl relative overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 text-xs font-bold text-white">محرك الإنتاج الشامل متعدد الصفحات</div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#040718]/40">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-start" : "items-end"} w-full`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-[#0b122c] border border-slate-800 text-slate-200"}`}>{msg.text}</div>

                  {msg.type === "code_preview" && msg.previewUrl && (
                    <div className="w-full mt-3 bg-[#030612] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                      <div className="bg-[#090e26] p-2.5 border-b border-slate-800/80 flex flex-wrap gap-1.5">
                        {msg.pages?.map((p) => (
                          <button key={p} onClick={() => setActivePreviewPage(p)} className={`px-2.5 py-1 text-[10px] rounded-md border transition ${activePreviewPage === p ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>{p}</button>
                        ))}
                      </div>
                      <div className="w-full h-60 bg-slate-950">
                        <iframe src={msg.previewUrl} className="w-full h-full border-none" title="Preview" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-[#050816]/80 border-t border-slate-800/80">
              <div className="relative flex items-center">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="اكتب طلبك وتخصص الموقع هنا..."
                  rows={2}
                  className="w-full bg-[#030612] border border-slate-800 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-2.5 text-xs text-white focus:outline-none resize-none"
                />
                <button type="submit" disabled={isGenerating || !prompt.trim()} className="absolute left-3 p-2 bg-indigo-600 text-white rounded-lg transition">
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 transform -rotate-90" />}
                </button>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-64 bg-[#070b21] border border-slate-800/80 rounded-3xl p-4 flex flex-col shadow-xl shrink-0">
            <h3 className="text-xs font-bold text-white mb-3 pb-2 border-b border-slate-800/60">المشاريع المحفوظة ({projects.length})</h3>
            <div className="space-y-2 overflow-y-auto flex-1 text-[11px] text-slate-400">
              {projects.length === 0 ? <p className="opacity-40 text-center py-6">لا توجد مشاريع.</p> : projects.map(p => <div key={p.id} className="p-2 bg-[#030612] border border-slate-800 rounded-lg">{p.name}</div>)}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}