"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Send, 
  Lock, 
  ShieldAlert, 
  Users, 
  Activity, 
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Mic,
  Image,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Layout,
  Sparkles,
  HelpCircle,
  Code,
  Settings,
  Sliders,
  Palette
} from "lucide-react";

type Message = { 
  role: "user" | "assistant"; 
  content: string; 
  previewUrl?: string; 
};
type Mode = "builder" | "chat";
type AuthStep = "SYSTEM_PASSWORD" | "LOADING_TRANSITION" | "AUTHORIZED";
type RobotMood = "idle" | "thinking" | "happy" | "sad" | "typing";
type ViewLayout = "split" | "preview_only";
type ScreenSize = "desktop" | "tablet" | "mobile";

export default function NovaAI() {
  /* ---------------- STATES ---------------- */
  const [authStep, setAuthStep] = useState<AuthStep>("SYSTEM_PASSWORD");
  const [password, setPassword] = useState("");
  const [wrongPass, setWrongPass] = useState(false);
  const [aiMode, setAiMode] = useState<Mode>("builder");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [robotMood, setRobotMood] = useState<RobotMood>("idle");

  // ميزات العرض والتجاوب الجديدة
  const [viewLayout, setViewLayout] = useState<ViewLayout>("split");
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");

  // ميزات المحاورة الذكية والتحكم الإضافي (Lovable Style Extended)
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [coPilotAnswers, setCoPilotAnswers] = useState({ 
    type: "", 
    theme: "", 
    pages: "", 
    framework: "Next.js", 
    animations: "Framer Motion" 
  });
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // ميزات أدوات الشات الإضافية
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- ADMIN PANEL STATES ---------------- */
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPos, setAdminPos] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 2500);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [loading]);

  /* ---------------- ADMIN DRAG LOGIC ---------------- */
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX - adminPos.x, startY: e.clientY - adminPos.y };
  };
  
  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setAdminPos({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
  };
  
  const handleDragEnd = () => setIsDragging(false);

  /* ---------------- AUTH LOGIC (.env.local CONNECTION) ---------------- */
  async function unlock() {
    setWrongPass(false);
    const securePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD;

    if (password === securePassword) {
      setRobotMood("happy");
      setTimeout(() => {
        setAuthStep("LOADING_TRANSITION");
        setTimeout(() => {
          setAuthStep("AUTHORIZED");
          setRobotMood("idle");
        }, 2500);
      }, 600);
    } else {
      setRobotMood("sad");
      setWrongPass(true);
      setTimeout(() => setWrongPass(false), 500);
      setTimeout(() => setRobotMood("idle"), 2500);
    }
  }

  /* ---------------- VOICE & VISION SIMULATORS ---------------- */
  const handleVoiceClick = () => {
    if (loading) return;
    setIsRecording(!isRecording);
    if (!isRecording) {
      setRobotMood("typing");
      setTimeout(() => {
        setInput("توليد واجهة مستخدم متطورة مبنية على هندسة التصاميم السيبرانية");
        setIsRecording(false);
        setRobotMood("idle");
      }, 3000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setRobotMood("happy");
      };
      reader.readAsDataURL(file);
    }
  };

  /* ---------------- SEND MESSAGES WITH CO-PILOT CHECK ---------------- */
  async function sendMessage(overridePrompt?: string) {
    const finalInput = overridePrompt || input;
    if (!finalInput.trim() && !selectedImage) return;

    if (finalInput.trim() === "/ad") {
      setShowAdminLogin(true);
      setInput("");
      return;
    }

    if (aiMode === "builder" && finalInput.trim().split(" ").length <= 2 && !overridePrompt && !selectedImage) {
      setShowCoPilot(true);
      setRobotMood("thinking");
      return;
    }

    const text = finalInput;
    setMessages((prev) => [...prev, { role: "user", content: text + (selectedImage ? " [مرفق صورة سكتش]" : "") }]);
    setInput("");
    setSelectedImage(null);
    setLoading(true);
    setRobotMood("thinking");

    if (aiMode === "builder") {
      try {
        const res = await fetch("/api/nova", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            prompt: text,
            customization: coPilotAnswers
          }),
        });
        
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "فشل توليد الموقع الحقيقي.");

        setRobotMood("happy");
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: `🚀 تم معالجة البيانات وبناء الموقع الفعلي وحقنه في الخادم بنجاح!\n\nيمكنك الآن معاينة الهيكل البرمجي الحي من شاشة المعاينة التفاعلية المجاورة في اليمين واختبار التجاوب.`,
            previewUrl: data.url
          }
        ]);
      } catch (err: any) {
        setRobotMood("sad");
        setMessages((prev) => [
          ...prev, 
          { role: "assistant", content: `❌ خطأ غير متوقع في المحرك: ${err.message}` }
        ]);
      }
    } else {
      try {
        const res = await fetch("/api/nova", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `أجب بشكل فخم ومختصر: ${text}` }),
        });
        const data = await res.json();
        setRobotMood("happy");
        setMessages((prev) => [
          ...prev, 
          { role: "assistant", content: data.code || "أنا هنا لمعالجة البيانات وحل المشكلات البرمجية العميقة." }
        ]);
      } catch (e) {
        setRobotMood("sad");
        setMessages((prev) => [...prev, { role: "assistant", content: "فشل الاتصال بالمحرك الفائق." }]);
      }
    }

    setLoading(false);
    setTimeout(() => setRobotMood("idle"), 2000);
  }

  function handleCoPilotSubmit() {
    setShowCoPilot(false);
    const expandedPrompt = `ابني موقع ${input}، من النوع: ${coPilotAnswers.type || "عام"}، بثيم وألوان: ${coPilotAnswers.theme || "مودرن متناسق"}، ويحتوي على الأقسام التالية: ${coPilotAnswers.pages || "الرئيسية والخدمات"}، باستخدام إطار عمل: ${coPilotAnswers.framework} والأنيميشن: ${coPilotAnswers.animations}`;
    sendMessage(expandedPrompt);
  }

  function handleAdminAuth() {
    if (adminPassInput === "yousefyousefyousef505") {
      setIsAdminAuth(true);
      setShowAdminLogin(false);
      setAdminPassInput("");
    } else {
      alert("⚠️ CRITICAL SECURITY EXCEPTION: Access Denied.");
      setShowAdminLogin(false);
      setAdminPassInput("");
    }
  }

  /* ---------------- CYBER ROBOT DESIGN ---------------- */
  function RealisticRobot({ size = 50 }: { size?: number }) {
    const getThemeColor = () => {
      if (robotMood === "sad") return "#ef4444";
      if (robotMood === "happy") return "#10b981";
      if (robotMood === "thinking") return "#a855f7";
      if (robotMood === "typing") return "#f59e0b";
      return "#3b82f6";
    };

    return (
      <div 
        style={{ 
          width: size, 
          height: size, 
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: robotMood === "thinking" ? "pulseGlow 1s infinite ease-in-out" : "float 4s ease-in-out infinite"
        }}
      >
        <div style={{
          width: "90%",
          height: "85%",
          background: "linear-gradient(145deg, #1e293b, #0f172a)",
          borderRadius: "24px 24px 40px 40px",
          border: `2px solid ${getThemeColor()}`,
          boxShadow: `0 0 25px ${getThemeColor()}30, inset 0 0 15px rgba(0,0,0,0.6)`,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "4px"
        }}>
          <div style={{
            position: "absolute",
            top: "-6px",
            width: "30%",
            height: "4px",
            background: getThemeColor(),
            borderRadius: "10px",
            boxShadow: `0 0 10px ${getThemeColor()}`
          }} />

          <div style={{
            width: "85%",
            height: "35%",
            background: "#020617",
            borderRadius: "8px",
            border: `1px solid ${getThemeColor()}50`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative"
          }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.1, background: `repeating-linear-gradient(0deg, ${getThemeColor()}, ${getThemeColor()} 2px, transparent 2px, transparent 4px)` }} />
            
            <div style={{
              width: robotMood === "happy" ? "75%" : robotMood === "sad" ? "60%" : "80%",
              height: robotMood === "sad" ? "3px" : "8px",
              background: getThemeColor(),
              borderRadius: robotMood === "happy" ? "50% 50% 0 0" : "4px",
              boxShadow: `0 0 15px ${getThemeColor()}, 0 0 30px ${getThemeColor()}`,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: robotMood === "thinking" ? "translateX(-10%)" : "none",
              animation: robotMood === "thinking" ? "cyberScan 1.5s infinite alternate ease-in-out" : "none"
            }} />
          </div>

          <div style={{ display: "flex", gap: "3px", marginTop: "8px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                width: "3px",
                height: robotMood === "typing" ? `${Math.random() * 12 + 4}px` : "6px",
                background: `${getThemeColor()}60`,
                borderRadius: "2px",
                transition: "all 0.2s ease"
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const loadingTexts = [
    "⏳ جاري تحليل العبارات وصياغة الهيكل السلكي المبدئي...",
    "🎨 جاري هندسة وتوزيع عناصر الواجهة ونظام النيون المظلم...",
    "⚡ جاري كتابة أكواد الـ JSX وحقن التجاوب الذكي للشاشات...",
    "🚀 وضع اللمسات الأخيرة ومزامنة الملفات الحية مع السيرفر الرئيسي..."
  ];

  /* ---------------- 1. FIRST SCREEN: SYSTEM PASSWORD ---------------- */
  if (authStep === "SYSTEM_PASSWORD") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030512] text-white p-4 font-sans" dir="rtl">
        <style>{`
          @keyframes shake { 0%, 100% {transform: translateX(0);} 20%, 60% {transform: translateX(-8px);} 40%, 80% {transform: translateX(8px);} }
          @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-8px)} }
          @keyframes pulseGlow { 0%, 100% {transform: scale(1); opacity: 0.9;} 50% {transform: scale(1.02); opacity: 1;} }
        `}</style>
        
        <div className={`w-full max-w-md bg-[#090d22]/80 backdrop-blur-2xl rounded-3xl p-8 text-center border transition-all duration-300 ${wrongPass ? 'border-red-500 shadow-2xl shadow-red-500/10 animate-[shake_0.4s_ease-in-out]' : 'border-slate-800 shadow-2xl'}`}>
          <div className="flex justify-center mb-6"><RealisticRobot size={110} /></div>
          
          <h1 className="text-2xl font-black mb-2 tracking-tight bg-gradient-to-l from-white to-slate-400 text-transparent bg-clip-text">بوابة النظام العليا</h1>
          <p className="text-xs text-slate-500 mb-6 font-medium">قم بمصادقة هويتك الرقمية لفتح قناة اتصال مع Nova AI</p>
          
          <div className="relative">
            <input
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              className={`w-full py-4 px-5 rounded-2xl bg-[#050716] border text-white text-center outline-none text-sm font-mono tracking-wider transition focus:border-indigo-500 ${wrongPass ? 'border-red-500/50' : 'border-slate-800'}`}
            />
            <Lock className="absolute right-4 top-4.5 w-5 h-5 text-slate-600" />
          </div>

          {wrongPass && (
            <p className="text-red-400 text-xs mt-3 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> رمز التشفير غير صالح للمنظومة الكونية.
            </p>
          )}

          <button onClick={unlock} className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 active:scale-[0.99] transition-all">
            تأكيد الاتصال بالمحرك
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- 2. SECOND SCREEN: INTERMEDIATE LOADING ---------------- */
  if (authStep === "LOADING_TRANSITION") {
    return (
      <div className="min-h-screen bg-[#030510] flex flex-col items-center justify-center text-white font-sans" dir="rtl">
        <div className="text-center">
          <div className="relative w-36 h-36 mx-auto mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500 animate-[spin_12s_linear_infinite] opacity-40"></div>
            <div className="absolute inset-2 rounded-full border border-blue-500/20 animate-[spin_6s_linear_infinite_reverse]"></div>
            <RealisticRobot size={90} />
          </div>

          <h2 className="text-lg font-bold text-indigo-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" /> مصادقة ناجحة للمفتاح الآمن
          </h2>
          <p className="text-[11px] font-mono text-slate-500 mt-2 tracking-widest">INITIALIZING GLOBAL WORKSPACE...</p>

          <div className="w-56 h-1 bg-slate-900 rounded-full mx-auto mt-6 overflow-hidden relative">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-full animate-[slideLoading_2.5s_forwards]"></div>
          </div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideLoading { from { transform: translateX(100%); } to { transform: translateX(0%); } }
        `}</style>
      </div>
    );
  }

  /* ---------------- 3. THIRD SCREEN: AUTHORIZED WORKSPACE ---------------- */
  return (
    <div 
      onMouseMove={handleDragMove} 
      onMouseUp={handleDragEnd} 
      className="min-h-screen bg-[#030511] text-white flex flex-col font-sans relative"
      dir="rtl"
    >
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cyberScan { from { transform: translateX(-25%); } to { transform: translateX(25%); } }
        @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-5px)} }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(59,130,246,0.2); } 50% { box-shadow: 0 0 30px rgba(139,92,246,0.5); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
      `}</style>

      {/* HEADER BAR */}
      <header className="px-6 py-4 border-b border-slate-900/60 flex flex-wrap gap-4 justify-between items-center bg-[#040715]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <RealisticRobot size={48} />
          <div>
            <h1 className="text-base font-black tracking-tight bg-gradient-to-l from-white to-slate-400 text-transparent bg-clip-text">NOVA LIVE WORKSPACE</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
              <span className="text-[10px] text-slate-500 font-bold tracking-wider font-mono">HYBRID INTERACTIVE LINK ACTIVE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
            <button 
              onClick={() => setViewLayout("split")}
              className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition ${viewLayout === "split" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Layout className="w-3.5 h-3.5" /> العرض المتناسق
            </button>
            <button 
              onClick={() => setViewLayout("preview_only")}
              className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition ${viewLayout === "preview_only" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Eye className="w-3.5 h-3.5" /> المعاينة الكاملة
            </button>
          </div>

          <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
            <button onClick={() => setAiMode("builder")} className={`py-2 px-4 rounded-lg text-xs font-bold transition ${aiMode === "builder" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"}`}>
              🛠️ محرك البناء
            </button>
            <button onClick={() => setAiMode("chat")} className={`py-2 px-4 rounded-lg text-xs font-bold transition ${aiMode === "chat" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-slate-200"}`}>
              💬 محادثة فائقة
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className={`flex flex-col border-l border-slate-900/50 bg-[#030511] transition-all duration-500 ease-in-out relative ${viewLayout === "preview_only" ? "w-full md:w-[70px] opacity-40 hover:w-[360px] hover:opacity-100 z-30" : "w-full md:w-[420px]"}`}>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-36">
            {messages.length === 0 && (
              <div className="text-center pt-16 animate-[slideUpFade_0.5s_ease-out]">
                <div className="flex justify-center mb-4"><RealisticRobot size={90} /></div>
                <h3 className="text-lg font-black text-slate-200">مرحباً بك في نواة الابتكار</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                  {aiMode === "builder" ? "اكتب فكرتك باختصار أو بالتفصيل وسأقوم بإنشائها، رفعها، وتوفير رابط حي فوري لها." : "اسألني عن أي منطق برمي أو هيكلة بيانات تريد تبسيطها."}
                </p>
              </div>
            )}

            {messages.map((m, i) => {
              const isAss = m.role === "assistant";
              return (
                <div key={i} className={`flex flex-col ${isAss ? "items-start" : "items-end"} animate-[slideUpFade_0.25s_ease-out]`}>
                  <div className={`flex items-center gap-2 mb-1.5 ${isAss ? "flex-row" : "flex-row-reverse"}`}>
                    {isAss ? <RealisticRobot size={32} /> : <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-[10px] font-black">UR</div>}
                    <span className="text-[10px] font-bold text-slate-500 tracking-wide">{isAss ? "NOVA AGENT" : "USER"}</span>
                  </div>
                  
                  <div className={`max-w-[90%] p-4 text-sm leading-relaxed text-right font-medium shadow-lg transition-all ${isAss ? "bg-slate-900/60 text-slate-200 rounded-2xl rounded-tr-sm border border-slate-800" : "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tl-sm"}`}>
                    {m.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="flex items-center gap-2 mb-1.5">
                  <RealisticRobot size={32} />
                  <span className="text-[10px] font-bold text-slate-500">NOVA CORE THINKING</span>
                </div>
                <div className="max-w-[90%] p-4 bg-slate-900/80 border border-slate-800 rounded-2xl rounded-tr-sm text-xs font-mono text-indigo-400 space-y-3 w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>{loadingTexts[loadingStep]}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${(loadingStep + 1) * 25}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT CHAT BOX */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#030511] via-[#030511] to-transparent pt-10 z-20">
            {selectedImage && (
              <div className="mb-2 p-2 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between animate-[slideUpFade_0.2s_ease-out]">
                <div className="flex items-center gap-2">
                  <img src={selectedImage} alt="Preview" className="w-10 h-10 rounded-lg object-cover border border-slate-800" />
                  <span className="text-xs text-slate-400 font-medium">تم إرفاق صورة السكتش بنجاح</span>
                </div>
                <button onClick={() => setSelectedImage(null)} className="p-1 text-slate-500 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            )}

            {/* الخيارات السريعة المتقدمة (Custom Customization Panel) فوق حقل الإدخال */}
            {aiMode === "builder" && (
              <div className="mb-2 flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                <button 
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  className={`py-1 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shrink-0 ${showAdvancedSettings ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-900 hover:text-slate-200'}`}
                >
                  <Sliders className="w-3 h-3" /> تخصيص فوري ومتقدم
                </button>
                {coPilotAnswers.type && (
                  <span className="bg-slate-900 border border-slate-800 text-indigo-400 text-[10px] px-2 py-1 rounded-lg shrink-0 flex items-center gap-1">
                    <Palette className="w-3 h-3" /> {coPilotAnswers.type}
                  </span>
                )}
                {coPilotAnswers.theme && (
                  <span className="bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] px-2 py-1 rounded-lg shrink-0 flex items-center gap-1">
                    ✨ {coPilotAnswers.theme}
                  </span>
                )}
              </div>
            )}

            {/* القائمة الفرعية المنسدلة للتخصيص الفوري */}
            {showAdvancedSettings && aiMode === "builder" && (
              <div className="mb-2 p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2 animate-[slideUpFade_0.15s_ease-out]">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-300 font-bold">إعدادات المحرك الحالية:</span>
                  <button onClick={() => setShowAdvancedSettings(false)} className="text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">إطار العمل الرئيسي:</label>
                    <select 
                      value={coPilotAnswers.framework}
                      onChange={(e) => setCoPilotAnswers(p => ({...p, framework: e.target.value}))}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded-lg p-1 text-[10px] outline-none"
                    >
                      <option value="Next.js">Next.js (App Router)</option>
                      <option value="React.js">React.js Vite</option>
                      <option value="HTML/Tailwind">HTML / Tailwind Static</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">المحرك الحركي البصري:</label>
                    <select 
                      value={coPilotAnswers.animations}
                      onChange={(e) => setCoPilotAnswers(p => ({...p, animations: e.target.value}))}
                      className="w-full bg-slate-900 text-white border border-slate-800 rounded-lg p-1 text-[10px] outline-none"
                    >
                      <option value="Framer Motion">Framer Motion Premium</option>
                      <option value="GSAP Animations">GSAP Core Ecosystem</option>
                      <option value="Vanilla CSS">CSS Transitions Only</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-1.5 flex items-center shadow-2xl focus-within:border-indigo-500/50 transition">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                onFocus={() => !loading && setRobotMood("typing")}
                onBlur={() => !loading && setRobotMood("idle")}
                disabled={loading}
                placeholder={aiMode === "builder" ? "ابني لي موقع متجر إلكتروني فخم..." : "اسألني عن أي كود أو سكريبت برمجي..."}
                className="flex-1 bg-transparent border-none outline-none text-white text-xs px-3 text-right"
              />
              
              <div className="flex items-center gap-1 px-1">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-500 hover:text-indigo-400 rounded-xl hover:bg-slate-900 transition" 
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleVoiceClick}
                  className={`p-2 rounded-xl transition ${isRecording ? "bg-red-500/20 text-red-400 animate-pulse" : "text-slate-500 hover:text-indigo-400 hover:bg-slate-900"}`} 
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => sendMessage()} 
                disabled={loading || (!input.trim() && !selectedImage)} 
                className="py-2 px-4 rounded-xl bg-white hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-600 text-black font-extrabold text-xs transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 transform rotate-180" /> إرسال
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW CONTAINER */}
        <div className="flex-1 flex flex-col bg-[#010207] relative">
          <div className="px-4 py-3 bg-[#050817] border-b border-slate-900 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-400" /> نافذة المعاينة التفاعلية والتجاوب الذكي
            </div>

            <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
              <button 
                onClick={() => setScreenSize("desktop")}
                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition ${screenSize === "desktop" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/15" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Monitor className="w-3.5 h-3.5" /> كمبيوتر
              </button>
              <button 
                onClick={() => setScreenSize("tablet")}
                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition ${screenSize === "tablet" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/15" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Tablet className="w-3.5 h-3.5" /> تابلت
              </button>
              <button 
                onClick={() => setScreenSize("mobile")}
                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-bold transition ${screenSize === "mobile" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/15" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Smartphone className="w-3.5 h-3.5" /> جوال
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 flex justify-center items-center overflow-auto bg-[#020309] relative">
            {messages.filter(m => m.previewUrl).length === 0 ? (
              <div className="text-center text-slate-600 font-medium space-y-2 animate-pulse">
                <Code className="w-12 h-12 mx-auto text-slate-800" />
                <div className="text-xs">شاشة العرض الحية فارغة حالياً.</div>
                <div className="text-[10px] opacity-60">قم بإرسال طلب بناء في الشات لتشاهد الهيكل هنا فوراً.</div>
              </div>
            ) : (
              <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-800/20 overflow-hidden transition-all duration-300"
                style={{
                  width: screenSize === "mobile" ? "375px" : screenSize === "tablet" ? "768px" : "100%",
                  height: screenSize === "desktop" ? "100%" : "680px",
                  maxHeight: "100%"
                }}
              >
                <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                    <span className="text-[10px] font-mono text-slate-500 mr-2">nova_deployment_sandbox.output</span>
                  </div>
                  {messages.filter(m => m.previewUrl).map((m, idx, arr) => {
                    if (idx === arr.length - 1) {
                      return (
                        <a key={idx} href={m.previewUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 bg-indigo-950/40 px-2 py-1 rounded border border-indigo-900/40 hover:bg-indigo-900/60 transition">
                          فتح كصفحة مستقلة <ExternalLink className="w-3 h-3" />
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
                {messages.filter(m => m.previewUrl).map((m, idx, arr) => {
                  if (idx === arr.length - 1) {
                    return (
                      <iframe 
                        key={idx}
                        src={m.previewUrl} 
                        className="w-full h-full bg-white border-none"
                        title="Nova Engine Sandbox Preview"
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CO-PILOT DIALOG MODAL */}
      {showCoPilot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="w-full max-w-lg bg-[#0a0f26] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl animate-[slideUpFade_0.2s_ease-out]">
            <div className="flex items-center gap-2.5 text-indigo-400 mb-3">
              <HelpCircle className="w-5 h-5 animate-bounce" />
              <h3 className="text-base font-black">مساعد التوجيه وتعميق التفاصيل الذكي</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">لقد كتبت طلباً مختصراً جداً. لنقوم بصياغة النتيجة بدقة ملهمة، يرجى تزويدنا بالخيارات المفضلة التالية بضغطة زر:</p>
            
            <div className="space-y-4 text-right">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">1. تصنيف ونوع المنصة المطلوبة:</label>
                <div className="flex flex-wrap gap-2">
                  {["متجر تجارة إلكترونية", "معرض أعمال شخصي", "منصة هبوط تسويقية", "منصة مدونة تقنية"].map((v) => (
                    <button key={v} onClick={() => setCoPilotAnswers(p => ({...p, type: v}))} className={`py-1.5 px-3 rounded-xl text-xs font-bold transition border ${coPilotAnswers.type === v ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-900 hover:text-slate-200'}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">2. النمط اللوني والهوية الإبداعية:</label>
                <div className="flex flex-wrap gap-2">
                  {["سيبراني داكن نيون", "لوك فاخر ذهبي وأسود", "أبيض مينيمال هادئ", "مرح بألوان الباستيل"].map((v) => (
                    <button key={v} onClick={() => setCoPilotAnswers(p => ({...p, theme: v}))} className={`py-1.5 px-3 rounded-xl text-xs font-bold transition border ${coPilotAnswers.theme === v ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-900 hover:text-slate-200'}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">3. عدد الصفحات والهيكل المتوقع:</label>
                <div className="flex flex-wrap gap-2">
                  {["صفحة هبوط واحدة Landing Page", "3 صفحات أساسية متكاملة", "منظومة برمجية من 5 أقسام"].map((v) => (
                    <button key={v} onClick={() => setCoPilotAnswers(p => ({...p, pages: v}))} className={`py-1.5 px-3 rounded-xl text-xs font-bold transition border ${coPilotAnswers.pages === v ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-900 hover:text-slate-200'}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900/60">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">4. إطار العمل (Framework):</label>
                  <select 
                    value={coPilotAnswers.framework}
                    onChange={(e) => setCoPilotAnswers(p => ({...p, framework: e.target.value}))}
                    className="w-full bg-slate-950 text-slate-300 border border-slate-900 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="Next.js">Next.js 14+</option>
                    <option value="React.js (Vite)">React.js + Vite</option>
                    <option value="Vue.js">Vue.js Ecosystem</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">5. الحركات والتأثيرات:</label>
                  <select 
                    value={coPilotAnswers.animations}
                    onChange={(e) => setCoPilotAnswers(p => ({...p, animations: e.target.value}))}
                    className="w-full bg-slate-950 text-slate-300 border border-slate-900 rounded-xl p-2 text-xs outline-none focus:border-indigo-500"
                  >
                    <option value="Framer Motion">Framer Motion (Smooth)</option>
                    <option value="GSAP">GSAP (High Performance)</option>
                    <option value="Tailwind CSS">Tailwind Pure CSS</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6 border-t border-slate-900/60 pt-4">
              <button onClick={handleCoPilotSubmit} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black transition-all active:scale-95 shadow-lg shadow-indigo-600/15">
                تأكيد الخيارات وضخ البيانات بالمحرك 🚀
              </button>
              <button onClick={() => setShowCoPilot(false)} className="py-3 px-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-xs font-bold text-slate-400 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CONSOLE WATERMARK FLOATING PANEL */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-red-500/20 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-black text-white">إدخال رمز التحكم لـ (Yousef)</h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-4">أدخل رمز الأمان الفائق لتشغيل خادم الحماية الراديكالي</p>
            <input 
              type="password" 
              value={adminPassInput} 
              onChange={(e) => setAdminPassInput(e.target.value)} 
              placeholder="••••••••" 
              className="w-full py-2.5 px-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-white outline-none focus:border-red-500/50 mb-4 font-mono" 
            />
            <div className="flex gap-2">
              <button onClick={handleAdminAuth} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition">مصادقة المسؤول</button>
              <button onClick={() => setShowAdminLogin(false)} className="py-2 px-3 rounded-xl bg-slate-800 text-xs font-bold text-slate-400 transition">تراجع</button>
            </div>
          </div>
        </div>
      )}

      {isAdminAuth && (
        <div 
          style={{ left: `${adminPos.x}px`, top: `${adminPos.y}px` }}
          className="fixed z-50 w-64 bg-[#050714]/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden select-none"
        >
          <div 
            onMouseDown={handleDragStart}
            className="bg-slate-950/80 px-3 py-2 border-b border-slate-900 flex items-center justify-between cursor-move"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> لوحة التحكم الفائقة (يوسف)
            </div>
            <button onClick={() => setIsAdminAuth(false)} className="text-slate-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="p-3.5 space-y-2.5 text-right text-[11px]">
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5">
              <span className="text-slate-400 font-medium">حالة السيرفر الأساسي:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> المستقر</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900/60 pb-1.5">
              <span className="text-slate-400 font-medium">معدل استهلاك الذاكرة:</span>
              <span className="text-indigo-400 font-mono font-bold">34.2 MB / 512 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-medium">مستوى الصلاحيات الحالية:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1"><Users className="w-3 h-3" /> ROOT_OWNER</span>
            </div>
            <div className="pt-1.5">
              <button onClick={() => { setMessages([]); alert("🧹 تم تنظيف ذاكرة التخزين المؤقت وقنوات الاتصال الحية."); }} className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 hover:text-red-400 border border-slate-800 text-[10px] font-bold text-slate-300 transition text-center">
                تفريغ سجل المحادثات بالكامل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}