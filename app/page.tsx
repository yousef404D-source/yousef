"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Send, 
  X,
  Mic,
  Image,
  Sparkles,
  Code,
  Laptop,
  Smartphone as PhoneIcon
} from "lucide-react";

type Message = { 
  role: "user" | "assistant"; 
  content: string; 
  previewUrl?: string; 
};
type Mode = "builder" | "chat";
type AuthStep = "SYSTEM_PASSWORD" | "LOADING_TRANSITION" | "AUTHORIZED";
type RobotMood = "idle" | "thinking" | "happy" | "sad" | "typing";
type ActiveTab = "fullstack" | "mobile";

export default function NovaAI() {
  /* ---------------- STATES ---------------- */
  const [authStep, setAuthStep] = useState<AuthStep>("SYSTEM_PASSWORD");
  const [password, setPassword] = useState("");
  const [wrongPass, setWrongPass] = useState(false);
  const [aiMode, setAiMode] = useState<Mode>("builder");
  
  // التبويب الافتراضي هو Full Stack App بناءً على طلبك
  const [activeTab, setActiveTab] = useState<ActiveTab>("fullstack");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [robotMood, setRobotMood] = useState<RobotMood>("idle");

  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  /* ---------------- AUTH LOGIC WITH YOUR STATIC PASSWORD ---------------- */
  async function unlock() {
    setWrongPass(false);
    
    // الباسورد الثابت المطلوب
    const securePassword = "112233445566778899100000011223344556677889910";

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

  /* ---------------- SIMULATORS ---------------- */
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

  /* ---------------- SEND MESSAGES ---------------- */
  async function sendMessage() {
    if (!input.trim() && !selectedImage) return;

    const text = input;
    setMessages((prev) => [...prev, { role: "user", content: text + (selectedImage ? " [مرفق صورة سكتش]" : "") }]);
    setInput("");
    setSelectedImage(null);
    setLoading(true);
    setRobotMood("thinking");

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, tab: activeTab, mode: aiMode }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "فشل توليد الاستجابة.");

      setRobotMood("happy");
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          content: aiMode === "builder" ? `🚀 تم بناء المنصة بنجاح طبقاً لنمط العرض الحالي!` : data.code || "تمت معالجة البيانات بنجاح.",
          previewUrl: data.url
        }
      ]);
    } catch (err: any) {
      setRobotMood("sad");
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: `❌ خطأ في المعالجة: ${err.message}` }
      ]);
    }

    setLoading(false);
    setTimeout(() => setRobotMood("idle"), 2000);
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
    "⏳ جاري تحليل العبارات وصياغة الهيكل المبدئي...",
    "🎨 جاري هندسة وتوزيع عناصر الواجهة السيبرانية...",
    "⚡ جاري كتابة أكواد الـ JSX وحقن التجاوب الذكي...",
    "🚀 وضع اللمسات الأخيرة ومزامنة الملفات الحية مع السيرفر..."
  ];

  /* ---------------- 1. FIRST SCREEN: SYSTEM PASSWORD ---------------- */
  if (authStep === "SYSTEM_PASSWORD") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030512] text-white p-4 font-sans" dir="rtl">
        <style>{`
          @keyframes shake { 0%, 100% {transform: translateX(0);} 20%, 60% {transform: translateX(-8px);} 40%, 80% {transform: translateX(8px);} }
          @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-8px)} }
        `}</style>
        
        <div className={`w-full max-w-md bg-[#090d22]/80 backdrop-blur-2xl rounded-3xl p-8 text-center border transition-all duration-300 ${wrongPass ? 'border-red-500 shadow-2xl shadow-red-500/10 animate-[shake_0.4s_ease-in-out]' : 'border-slate-800 shadow-2xl'}`}>
          <div className="flex justify-center mb-6"><RealisticRobot size={110} /></div>
          <h1 className="text-xl font-black mb-2 tracking-tight bg-gradient-to-l from-white to-slate-400 text-transparent bg-clip-text">بوابة النظام العليا</h1>
          <p className="text-xs text-slate-500 mb-6 font-medium">الرجاء إدخال رمز الأمان المصادق للمنظومة</p>
          
          <div className="relative">
            <input
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              className="w-full py-4 px-5 rounded-2xl bg-[#050716] border border-slate-800 text-white text-center outline-none text-sm font-mono tracking-wider transition focus:border-indigo-500"
            />
          </div>

          {wrongPass && (
            <p className="text-red-400 text-xs mt-3 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
              رمز التشفير غير صالح.
            </p>
          )}

          <button onClick={unlock} className="w-full mt-5 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/20 active:scale-[0.99] transition-all">
            تأكيد الاتصال بالمنصة
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
            <RealisticRobot size={90} />
          </div>
          <h2 className="text-sm font-bold text-indigo-400">مفتاح آمن صحيح - جاري تحميل تهيئة بيئة العمل...</h2>
          <div className="w-56 h-1 bg-slate-900 rounded-full mx-auto mt-6 overflow-hidden relative">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-full animate-[slideLoading_2.5s_forwards]"></div>
          </div>
        </div>
        <style>{`
          @keyframes slideLoading { from { transform: translateX(100%); } to { transform: translateX(0%); } }
        `}</style>
      </div>
    );
  }

  /* ---------------- 3. THIRD SCREEN: AUTHORIZED WORKSPACE ---------------- */
  return (
    <div className="min-h-screen bg-[#030511] text-white flex flex-col font-sans relative" dir="rtl">
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cyberScan { from { transform: translateX(-25%); } to { transform: translateX(25%); } }
        @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-5px)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>

      {/* HEADER BAR */}
      <header className="px-6 py-4 border-b border-slate-900/60 flex justify-between items-center bg-[#040715]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <RealisticRobot size={44} />
          <div>
            <h1 className="text-sm font-black bg-gradient-to-l from-white to-slate-400 text-transparent bg-clip-text">NOVA LIVE WORKSPACE</h1>
            <span className="text-[10px] text-slate-500 font-mono">HYBRID INTERACTIVE LINK ACTIVE</span>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
          <button onClick={() => setAiMode("builder")} className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${aiMode === "builder" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" : "text-slate-400"}`}>🛠️ محرك البناء</button>
          <button onClick={() => setAiMode("chat")} className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${aiMode === "chat" ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" : "text-slate-400"}`}>💬 محادثة فائقة</button>
        </div>
      </header>

      {/* WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* LEFT COLUMN: CHAT PANEL */}
        <div className="w-full md:w-[450px] flex flex-col bg-[#030511] relative border-l border-slate-900/40">
          
          {/* CHAT MESSAGES STREAM */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-40">
            {messages.length === 0 && (
              <div className="text-center pt-16 animate-[slideUpFade_0.5s_ease-out]">
                <div className="flex justify-center mb-4"><RealisticRobot size={80} /></div>
                <h3 className="text-sm font-black text-slate-200">مرحباً بك في نواة الابتكار</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-2 leading-relaxed">
                  اكتب فكرتك البرمجية وسأقوم بمعالجتها وبنائها وتحديث شاشة العرض الحية المجاورة فوراً وبأقصى سرعة استجابة.
                </p>
              </div>
            )}

            {messages.map((m, i) => {
              const isAss = m.role === "assistant";
              return (
                <div key={i} className={`flex flex-col ${isAss ? "items-start" : "items-end"} animate-[slideUpFade_0.25s_ease-out]`}>
                  <div className={`flex items-center gap-2 mb-1 ${isAss ? "flex-row" : "flex-row-reverse"}`}>
                    {isAss ? <RealisticRobot size={28} /> : <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[9px] font-black">UR</div>}
                    <span className="text-[9px] font-bold text-slate-500">{isAss ? "NOVA AGENT" : "USER"}</span>
                  </div>
                  <div className={`max-w-[90%] p-3.5 text-xs leading-relaxed text-right font-medium shadow-md ${isAss ? "bg-slate-900/60 text-slate-200 rounded-2xl rounded-tr-sm border border-slate-800" : "bg-indigo-600 text-white rounded-2xl rounded-tl-sm"}`}>
                    {m.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="flex items-center gap-2 mb-1">
                  <RealisticRobot size={28} />
                  <span className="text-[9px] font-bold text-slate-500">PROCESSING SYSTEM</span>
                </div>
                <div className="max-w-[90%] p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-[11px] text-indigo-400 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    <span>{loadingTexts[loadingStep]}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT CONTAINER WITH THE UPDATED ONLY TWO TABS */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#030511] via-[#030511] to-transparent pt-12 z-20">
            
            {/* THE REQUESTED RE-ORDERED TABS FOR VIEW STYLING */}
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <button 
                onClick={() => setActiveTab("fullstack")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-[11px] font-bold border-t border-x transition-all duration-200 ${activeTab === "fullstack" ? "bg-slate-950 text-white border-slate-800/80 shadow-inner" : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"}`}
              >
                <Laptop className="w-3.5 h-3.5" /> Full Stack App
              </button>
              <button 
                onClick={() => setActiveTab("mobile")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-[11px] font-bold border-t border-x transition-all duration-200 ${activeTab === "mobile" ? "bg-slate-950 text-white border-slate-800/80 shadow-inner" : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"}`}
              >
                <PhoneIcon className="w-3.5 h-3.5" /> Mobile App
              </button>
            </div>

            {selectedImage && (
              <div className="mb-2 p-2 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={selectedImage} alt="Preview" className="w-8 h-8 rounded object-cover" />
                  <span className="text-[10px] text-slate-400">تم إرفاق الملف بنجاح</span>
                </div>
                <button onClick={() => setSelectedImage(null)} className="p-1 text-slate-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}

            {/* CLEANED UP MAIN CHAT INPUT BOX */}
            <div className="bg-slate-950 border border-slate-900/90 rounded-2xl p-1.5 flex items-center shadow-2xl focus-within:border-indigo-500/40 transition">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                onFocus={() => !loading && setRobotMood("typing")}
                onBlur={() => !loading && setRobotMood("idle")}
                disabled={loading}
                placeholder="Build me an e-commerce platform with..."
                className="flex-1 bg-transparent border-none outline-none text-white text-xs px-3 text-left font-sans placeholder-slate-600"
              />
              
              <div className="flex items-center gap-0.5 px-1">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-slate-300 transition"><Image className="w-3.5 h-3.5" /></button>
                <button onClick={handleVoiceClick} className={`p-2 rounded-xl transition ${isRecording ? "text-red-400 animate-pulse" : "text-slate-500 hover:text-slate-300"}`}><Mic className="w-3.5 h-3.5" /></button>
              </div>

              <button 
                onClick={sendMessage} 
                disabled={loading || (!input.trim() && !selectedImage)} 
                className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-700 text-black font-black text-xs transition flex items-center gap-1"
              >
                <Send className="w-3 h-3 transform rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SANDBOX PREVIEW ENGINE (CONTROLLED BY THE TABS ABOVE) */}
        <div className="flex-1 flex flex-col bg-[#010207] relative">
          <div className="px-4 py-2.5 bg-[#050817] border-b border-slate-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> نافذة المعاينة الحية والاختبار التفاعلي للمنصة
            </div>
            <div className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-950/30 px-2 py-0.5 rounded border border-indigo-900/30">
              {activeTab === "fullstack" ? "Desktop Sandbox Mode" : "Mobile View Responsive"}
            </div>
          </div>

          <div className="flex-1 p-4 flex justify-center items-center overflow-auto bg-[#020309]">
            {messages.filter(m => m.previewUrl).length === 0 ? (
              <div className="text-center text-slate-600 font-medium space-y-1 animate-pulse">
                <Code className="w-10 h-10 mx-auto text-slate-800" />
                <div className="text-[11px]">شاشة العرض فارغة حالياً.</div>
                <div className="text-[9px] opacity-60">أرسل فكرة لبناء المنصة لمشاهدة الهيكل هنا فورا.</div>
              </div>
            ) : (
              <div 
                className="bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 max-h-full"
                style={{
                  // إذا اختار المستخدّم تَب الجوال يتحول العرض فوراً لأبعاد شاشة الهاتف 375px لتصبح متناسقة، وإلا يعرض كشاشة كمبيوتر كاملة
                  width: activeTab === "mobile" ? "375px" : "100%",
                  height: "100%"
                }}
              >
                <div className="bg-slate-950 px-4 py-1.5 flex items-center justify-between border-b border-slate-900">
                  <span className="text-[9px] font-mono text-slate-500">nova_deployment_sandbox.output</span>
                  {messages.filter(m => m.previewUrl).map((m, idx, arr) => idx === arr.length - 1 && (
                    <a key={idx} href={m.previewUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-indigo-400 flex items-center gap-1 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                      فتح برابط مستقل
                    </a>
                  ))}
                </div>
                {messages.filter(m => m.previewUrl).map((m, idx, arr) => idx === arr.length - 1 && (
                  <iframe key={idx} src={m.previewUrl} className="w-full h-full bg-white border-none" title="Sandbox Live Output" />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}