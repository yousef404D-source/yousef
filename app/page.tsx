"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Send, 
  Lock, 
  ShieldAlert, 
  Users, 
  Activity, 
  X,
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
  Sliders,
  Palette,
  Bot,
  MessageSquare,
  Wand2,
  RefreshCw
} from "lucide-react";

/* ---------------- TYPE DEFINITIONS ---------------- */
type Message = { 
  id: string;
  role: "user" | "assistant"; 
  content: string; 
  previewUrl?: string; 
};
type Mode = "builder" | "chat";
type AuthStep = "SYSTEM_PASSWORD" | "LOADING_TRANSITION" | "AUTHORIZED";
type RobotMood = "idle" | "thinking" | "happy" | "sad" | "typing";
type ScreenSize = "desktop" | "tablet" | "mobile";

export default function NovaAI() {
  /* ---------------- STATE MANAGEMENT ---------------- */
  const [authStep, setAuthStep] = useState<AuthStep>("SYSTEM_PASSWORD");
  const [password, setPassword] = useState("");
  const [wrongPass, setWrongPass] = useState(false);
  const [aiMode, setAiMode] = useState<Mode>("builder");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [robotMood, setRobotMood] = useState<RobotMood>("idle");
  const [chatLanguage, setChatLanguage] = useState<"ar" | "en">("en");

  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop");

  // Dynamic AI Questionnaire States
  const [showQuestions, setShowQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [somethingElseText, setSomethingElseText] = useState("");
  const [showSomethingElseChat, setShowSomethingElseChat] = useState(false);

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [engineConfig, setEngineConfig] = useState({ 
    framework: "Next.js 14+", 
    animations: "Framer Motion Premium",
    layoutStyle: "Dynamic Layout" 
  });

  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- ADMIN DRAG & DROP LOGIC ---------------- */
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPos, setAdminPos] = useState({ x: 40, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = { startX: e.clientX - adminPos.x, startY: e.clientY - adminPos.y };
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % 4);
      }, 2300);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [loading]);

  // Global mouse tracker for smooth admin dashboard dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setAdminPos({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Clean up image object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  /* ---------------- DYNAMIC LANGUAGE DETECTION & INTENT PARSER ---------------- */
  function detectLanguageAndIntent(text: string) {
    const arabicPattern = /[\u0600-\u06FF]/;
    const isArabic = arabicPattern.test(text);
    setChatLanguage(isArabic ? "ar" : "en");

    const buildingKeywords = ["build", "create", "make", "design", "website", "platform", "سوي", "ابني", "صمم", "موقع", "منصة"];
    const isCommand = buildingKeywords.some(keyword => text.toLowerCase().includes(keyword));

    return { isArabic, isCommand };
  }

  /* ---------------- AUTH VIA SYSTEM ENCRYPTION ---------------- */
  async function unlock() {
    setWrongPass(false);
    try {
      const res = await fetch("/api/auth/verify-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRobotMood("happy");
        setTimeout(() => {
          setAuthStep("LOADING_TRANSITION");
          setTimeout(() => {
            setAuthStep("AUTHORIZED");
            setRobotMood("idle");
          }, 2400);
        }, 600);
      } else {
        throw new Error();
      }
    } catch {
      setRobotMood("sad");
      setWrongPass(true);
      setTimeout(() => setWrongPass(false), 500);
    }
  }

  async function handleAdminAuth() {
    try {
      const res = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: adminPassInput })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAdminAuth(true);
        setShowAdminLogin(false);
        setAdminPassInput("");
        showToast("Admin Console Authenticated Successfully.", "success");
      } else {
        throw new Error();
      }
    } catch {
      showToast("SECURITY BREACH: Access Denied.", "error");
      setShowAdminLogin(false);
      setAdminPassInput("");
    }
  }

  /* ---------------- AUDIO & VISION STREAM INJECTORS ---------------- */
  const handleVoiceClick = () => {
    if (loading) return;
    setIsRecording(!isRecording);
    if (!isRecording) {
      setRobotMood("typing");
      setTimeout(() => {
        const simulatedVoiceText = "Build a futuristic high-end AI photo and video upscaling platform";
        setInput(simulatedVoiceText);
        setIsRecording(false);
        setRobotMood("idle");
        showToast("Voice command processed smoothly.", "success");
      }, 3200);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedImage) URL.revokeObjectURL(selectedImage);
      setSelectedImage(URL.createObjectURL(file));
      setRobotMood("happy");
      showToast("Design layout sketch attached.", "info");
    }
  };

  /* ---------------- MAIN SMART ACTION DISPATCHER ---------------- */
  async function handleMainAction(overridePrompt?: string) {
    const promptToSend = overridePrompt || input;
    if (!promptToSend.trim() && !selectedImage) return;

    if (promptToSend.trim() === "/ad") {
      setShowAdminLogin(true);
      setInput("");
      return;
    }

    const { isArabic, isCommand } = detectLanguageAndIntent(promptToSend);

    if (!isCommand) {
      setAiMode("chat");
      executeChatQuery(promptToSend, isArabic);
      return;
    }

    setAiMode("builder");
    triggerDynamicQuestionnaire(promptToSend);
  }

  /* ---------------- DYNAMIC QUESTIONNAIRE GENERATOR ---------------- */
  function triggerDynamicQuestionnaire(prompt: string) {
    setRobotMood("thinking");
    showToast("Generating custom architectural questions...", "info");

    let dynamicSet = [
      `What core technical architecture or model should power the backend of this platform?`,
      `How do you want users to process files or interact with data layouts?`,
      `What aesthetic structure and branding orientation do you prefer?`,
      `What monetization models or workspace limitations should be integrated?`
    ];

    if (prompt.toLowerCase().includes("food") || prompt.toLowerCase().includes("اكل") || prompt.toLowerCase().includes("مطعم")) {
      dynamicSet = [
        "Should the layout present a circular interactive menu grid or a standard catalog layout?",
        "Do you need an active live table reservation system and delivery tracking integration?",
        "What color identity fits your brand? (e.g., Cyberpunk Neon Amber / Luxury Dark Matte)",
        "Should users be able to construct customized meals via an interactive drag-and-drop builder?"
      ];
    } else if (prompt.toLowerCase().includes("upscale") || prompt.toLowerCase().includes("جوده") || prompt.toLowerCase().includes("فيديو")) {
      dynamicSet = [
        "What specific artificial intelligence models do you want to feature? (e.g., Real-ESRGAN / Stable Diffusion Upscaler)",
        "How should file queues be handled? (Instant processing canvas / cloud-based processing queue)",
        "What layout arrangement matches your vision? (Horizontal split before/after viewer / full-screen dashboard)",
        "Do you want an embedded high-performance conversion engine for video codecs?"
      ];
    }

    setGeneratedQuestions(dynamicSet);
    setQuestionAnswers({});
    setActiveQuestionIdx(0);
    setSomethingElseText("");
    setShowSomethingElseChat(false);
    setShowQuestions(true);
  }

  function handleAnswerSelect(answer: string) {
    const currentQ = generatedQuestions[activeQuestionIdx];
    setQuestionAnswers(prev => ({ ...prev, [currentQ]: answer }));

    if (activeQuestionIdx < generatedQuestions.length - 1) {
      setActiveQuestionIdx(prev => prev + 1);
    } else {
      setShowSomethingElseChat(true);
    }
  }

  function submitFinalQuestionnaire() {
    setShowQuestions(false);
    
    let answersSummary = Object.entries(questionAnswers)
      .map(([q, a]) => `\n- Q: ${q} | Answer: ${a}`)
      .join("");
    
    if (somethingElseText.trim()) {
      answersSummary += `\n- Additional Custom Specifications: ${somethingElseText}`;
    }

    const compiledUltimatePrompt = `Command: Build a completely custom tailored website for: "${input}". 
    Architectural requirements gathered dynamically:${answersSummary}
    Framework configuration: ${engineConfig.framework}, Motion Engine: ${engineConfig.animations}, Structuring Strategy: ${engineConfig.layoutStyle}.
    Ensure the generated layout is completely random, novel, highly distinct, and perfectly optimized with zero template repetition.`;

    executeWebsiteDeployment(compiledUltimatePrompt);
  }

  /* ---------------- CHAT ENGINE ROUTER ---------------- */
  async function executeChatQuery(prompt: string, isArabic: boolean) {
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setMessages((prev) => [...prev, { id: uniqueId, role: "user", content: prompt }]);
    setInput("");
    setLoading(true);
    setRobotMood("thinking");

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Answer brilliantly and professionally in ${isArabic ? 'Arabic' : 'English'}: ${prompt}` }),
      });
      const data = await res.json();
      setRobotMood("happy");
      
      const assistantId = "ass-" + Date.now().toString();
      setMessages((prev) => [
        ...prev, 
        { 
          id: assistantId, 
          role: "assistant", 
          content: data.code || (isArabic ? "أنا هنا لمعالجة أحدث طلباتك ومساعدتك هندسياً." : "I am fully operational to assist you with elite engineering architecture.") 
        }
      ]);
    } catch {
      setRobotMood("sad");
      setMessages((prev) => [...prev, { id: "err-" + Date.now(), role: "assistant", content: "Connection to core engine failed." }]);
    }
    setLoading(false);
    setTimeout(() => setRobotMood("idle"), 2000);
  }

  /* ---------------- DEPLOYMENT & LIVE PREVIEW ENGINE ---------------- */
  async function executeWebsiteDeployment(finalPrompt: string) {
    const userMsgText = input + (selectedImage ? " [Attached Design Diagram Sketch]" : "");
    const uniqueId = "dep-" + Date.now().toString();
    setMessages((prev) => [...prev, { id: uniqueId, role: "user", content: userMsgText }]);
    setInput("");
    
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
    
    setLoading(true);
    setRobotMood("thinking");

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      
      let data;
      try { data = await res.json(); } catch { throw new Error("Invalid operational server return structure."); }

      if (!res.ok || !data.success) throw new Error(data.error || "Failed to compile live server infrastructure.");

      setRobotMood("happy");
      
      const successNotification = chatLanguage === "ar" 
        ? `🚀 تم نشر موقعك الفريد والمخصص تماماً على السيرفر بنجاح عالي!\n\nتم تجنب النمطية لبناء تصميم مبتكر بالكامل. يمكنك معاينته الآن في نافذة العرض واختبار التجاوب الذكي.`
        : `🚀 Your entirely dynamic and customized website layout has been compiled and deployed onto live cloud servers successfully!\n\nLayout randomization triggered. View it immediately on the right interactive sandbox engine.`;

      const assistantDepId = "ass-dep-" + Date.now().toString();
      setMessages((prev) => [
        ...prev, 
        { 
          id: assistantDepId,
          role: "assistant", 
          content: successNotification,
          previewUrl: data.url
        }
      ]);
      showToast("Deployment finalized perfectly.", "success");
    } catch (err: unknown) {
      setRobotMood("sad");
      const errorMsg = err instanceof Error ? err.message : "Internal pipeline failure.";
      setMessages((prev) => [
        ...prev, 
        { id: "err-dep-" + Date.now(), role: "assistant", content: `❌ Compilation Exception: ${errorMsg}` }
      ]);
    }
    setLoading(false);
    setTimeout(() => setRobotMood("idle"), 2000);
  }

  /* ---------------- CYBER INTERACTIVE ROBOT GRAPHIC ---------------- */
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
              <div key={i} className={`w-[3px] rounded-sm bg-blue-500/60 ${robotMood === "typing" ? "animate-pulse h-3" : "h-1.5"}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const loadingTexts = chatLanguage === "ar" ? [
    "⏳ جاري تحليل مواصفاتك الديناميكية وهندسة التوزيع العشوائي الفريد...",
    "🎨 صياغة عناصر واجهة المستخدم السيبرانية ومنع التكرار النمطي...",
    "⚡ توليد أكواد الإنتاج وحقن أعلى درجات التجاوب البرمجي...",
    "🚀 وضع اللمسات الأخيرة ومزامنة ملفات خادم النشر الحي المستقل..."
  ] : [
    "⏳ Analyzing your architectural blueprint and formulating dynamic asset variations...",
    "🎨 Custom-tailoring UI sections and overriding hardcoded templates...",
    "⚡ Assembling high-performance production codebases with clean responsiveness...",
    "🚀 Synchronizing sandbox compilation assets with secure operational live instances..."
  ];

  /* ---------------- SCREEN 1: GATEWAY ---------------- */
  if (authStep === "SYSTEM_PASSWORD") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040d] text-white p-4 font-sans" dir="ltr">
        <style>{`
          @keyframes shake { 0%, 100% {transform: translateX(0);} 20%, 60% {transform: translateX(-8px);} 40%, 80% {transform: translateX(8px);} }
          @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-6px)} }
          @keyframes pulseGlow { 0%, 100% {transform: scale(1); opacity: 0.9;} 50% {transform: scale(1.02); opacity: 1;} }
        `}</style>
        
        <div className={`w-full max-w-md bg-[#070b1e]/90 backdrop-blur-3xl rounded-3xl p-8 text-center border transition-all duration-300 ${wrongPass ? 'border-red-500 shadow-2xl shadow-red-500/20 animate-[shake_0.4s_ease-in-out]' : 'border-slate-800/80 shadow-2xl shadow-blue-950/20'}`}>
          <div className="flex justify-center mb-6"><RealisticRobot size={115} /></div>
          
          <h1 className="text-2xl font-black mb-1 tracking-tight bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">SYSTEM CORE GATEWAY</h1>
          <p className="text-xs text-slate-500 mb-6 font-medium">Verify credentials to unlock secure Nova AI operational channels</p>
          
          <div className="relative">
            <input
              type="password" 
              placeholder="Enter Access Key Encryption" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              className={`w-full py-3.5 px-5 rounded-xl bg-[#040612] border text-white text-center outline-none text-xs font-mono tracking-widest transition focus:border-blue-500 ${wrongPass ? 'border-red-500/40' : 'border-slate-800'}`}
            />
            <Lock className="absolute left-4 top-4 w-4 h-4 text-slate-600" />
          </div>

          {wrongPass && (
            <p className="text-red-400 text-xs mt-3 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-4 h-4" /> INVALID SECURE DECRYPTION KEY
            </p>
          )}

          <button onClick={unlock} className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-indigo-600/10 active:scale-[0.99] transition-all">
            INITIALIZE CONNECTION
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- SCREEN 2: LOADING BAR ---------------- */
  if (authStep === "LOADING_TRANSITION") {
    return (
      <div className="min-h-screen bg-[#02030b] flex flex-col items-center justify-center text-white font-sans" dir="ltr">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-dashed border-indigo-500/30 animate-[spin_10s_linear_infinite]"></div>
            <RealisticRobot size={85} />
          </div>

          <h2 className="text-sm font-bold text-indigo-400 tracking-wider flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> AUTHORIZATION PROTOCOLS PASSED
          </h2>
          <p className="text-[10px] font-mono text-slate-600 mt-1.5 tracking-widest">SYNCHRONIZING DYNAMIC ENVIRONMENT...</p>

          <div className="w-48 h-1 bg-slate-950 rounded-full mx-auto mt-5 overflow-hidden relative">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-full animate-[slideLoading_2.4s_forwards]"></div>
          </div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideLoading { from { transform: translateX(-100%); } to { transform: translateX(0%); } }
        `}</style>
      </div>
    );
  }

  /* ---------------- SCREEN 3: HYBRID WORKSPACE ---------------- */
  return (
    <div className="min-h-screen bg-[#02040c] text-white flex flex-col font-sans relative" dir="ltr">
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cyberScan { from { transform: translateX(-20%); } to { transform: translateX(20%); } }
        @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-6px)} }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(59,130,246,0.15); } 50% { box-shadow: 0 0 25px rgba(139,92,246,0.4); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 10px; }
      `}</style>

      {/* SECURE INTERNAL TOAST NOTIFICATIONS */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-3 rounded-xl border bg-slate-950/95 backdrop-blur-md shadow-2xl flex items-center gap-2.5 animate-[slideUpFade_0.15s_ease-out] text-xs font-bold transition-all border-slate-800">
          <span className={`w-2 h-2 rounded-full ${toastMessage.type === "success" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : toastMessage.type === "error" ? "bg-red-500 shadow-[0_0_8px_#ef4444]" : "bg-indigo-500"}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* CORE CONTROL TOP HEADER BAR */}
      <header className="px-6 py-4 border-b border-slate-900 bg-[#040614]/90 backdrop-blur-xl sticky top-0 z-40 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <RealisticRobot size={46} />
          <div>
            <h1 className="text-sm font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-500 text-transparent bg-clip-text">NOVA DYNAMIC MULTIVERSE</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              <span className="text-[9px] text-slate-500 font-bold tracking-widest font-mono">STABLE FLEXIBLE WORKSPACE ACTIVE</span>
            </div>
          </div>
        </div>

        {/* STATUS BAR SHOWING ACTIVE DETECTION INFORMATION */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-[#06091b] border border-slate-900 rounded-xl px-3 py-1.5 text-[10px] font-mono text-slate-400">
            <span>Intent Detection:</span>
            <span className={`font-bold ${aiMode === "builder" ? "text-indigo-400" : "text-amber-400"}`}>
              {aiMode === "builder" ? "🛠️ COMPILER_DEPLOY" : "💬 QUESTION_CHAT"}
            </span>
            <span className="text-slate-700">|</span>
            <span>Input Language:</span>
            <span className="text-emerald-400 font-bold uppercase">{chatLanguage}</span>
          </div>

          <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
            <button 
              onClick={() => setAiMode("builder")} 
              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${aiMode === "builder" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Wand2 className="w-3 h-3" /> Builder Engine
            </button>
            <button 
              onClick={() => setAiMode("chat")} 
              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${aiMode === "chat" ? "bg-amber-600/10 text-amber-400 border border-amber-500/20" : "text-slate-500 hover:text-slate-300"}`}
            >
              <MessageSquare className="w-3 h-3" /> Smart Advice
            </button>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE: UPDATED COL-SPAN FROM 4 TO 5 FOR BETTER WIDTH AND CLARITY */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden relative">
        
        {/* LEFT COMPONENT: UPDATED TO xl:col-span-5 FOR EXTRA BREATHING ROOM */}
        <div className="xl:col-span-5 border-r border-slate-900 bg-[#02040a] flex flex-col overflow-hidden relative min-h-[450px] xl:min-h-0">
          <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-40">
            
            {messages.length === 0 && (
              <div className="text-center pt-16 px-6 animate-[slideUpFade_0.4s_ease-out] flex flex-col items-center justify-center max-w-md mx-auto">
                <div className="flex justify-center mb-6 min-h-[100px] relative z-10">
                  <RealisticRobot size={90} />
                </div>
                <h3 className="text-base font-extrabold text-slate-200 tracking-wide block mb-3">
                  INTELLIGENT PIPELINE DISPATCHER
                </h3>
                <p className="text-xs text-slate-400 font-normal leading-relaxed text-center">
                  Type your project commands or ask engineering questions. The core AI auto-classifies requests, asks targeted questions without repetition, and compiles dynamic layouts.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const isAss = m.role === "assistant";
              const isAr = /[\u0600-\u06FF]/.test(m.content);
              return (
                <div key={m.id} className={`flex flex-col ${isAss ? "items-start" : "items-end"} animate-[slideUpFade_0.2s_ease-out]`}>
                  <div className={`flex items-center gap-2 mb-1.5 ${isAss ? "flex-row" : "flex-row-reverse"}`}>
                    {isAss ? <RealisticRobot size={32} /> : <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[11px] font-black tracking-tighter">UR</div>}
                    <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">{isAss ? "NOVA AGENT" : "USER MASTER"}</span>
                  </div>
                  
                  <div 
                    dir={isAr ? "rtl" : "ltr"}
                    className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-xl border rounded-2xl ${
                      isAss 
                        ? "bg-slate-900/60 text-slate-200 border-slate-800/80 text-left" 
                        : "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-indigo-500/20 text-right"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="flex items-center gap-1.5 mb-1">
                  <RealisticRobot size={30} />
                  <span className="text-[10px] font-mono font-bold text-slate-500">NOVA EXECUTING PIPELINE...</span>
                </div>
                <div className="max-w-[90%] p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs font-mono text-indigo-400 space-y-2.5 w-full">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <span>{loadingTexts[loadingStep]}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${(loadingStep + 1) * 25}%` }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* LOWER FIXED BOX: USER INPUT PANEL INTERFACES */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#02040c] via-[#02040c] to-transparent pt-8 z-20">
            {selectedImage && (
              <div className="mb-2 p-2 bg-slate-950 border border-slate-900 rounded-xl flex items-center justify-between animate-[slideUpFade_0.15s_ease-out]">
                <div className="flex items-center gap-2">
                  <img src={selectedImage} alt="Diagram Attachment" className="w-8 h-8 rounded object-cover border border-slate-800" />
                  <span className="text-[10px] text-slate-400 font-medium">Layout Blueprint sketch successfully attached</span>
                </div>
                <button onClick={() => { if (selectedImage) URL.revokeObjectURL(selectedImage); setSelectedImage(null); }} className="p-1 text-slate-500 hover:text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* PRE-INPUT INTERACTIVE SETTINGS LAUNCHER */}
            <div className="mb-2 flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
              <button 
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="py-1 px-2.5 rounded-lg text-[10px] bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-white transition flex items-center gap-1 font-mono"
              >
                <Sliders className="w-3 h-3 text-indigo-400" /> Settings
              </button>
            </div>

            {/* ADVANCED SETTINGS PANEL */}
            {showAdvancedSettings && (
              <div className="mb-3 p-3 bg-[#040716] border border-slate-900 rounded-xl space-y-2 animate-[slideUpFade_0.15s_ease-out]">
                <p className="text-[10px] font-mono font-bold text-slate-500 tracking-wider">ENGINE ARCHITECTURE CONFIGURATION</p>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="block text-slate-500 mb-1">Framework</span>
                    <select 
                      value={engineConfig.framework} 
                      onChange={(e) => setEngineConfig(prev => ({ ...prev, framework: e.target.value }))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                    >
                      <option>Next.js 14+</option>
                      <option>React Vite</option>
                      <option>Vue Nuxt 3</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Animations</span>
                    <select 
                      value={engineConfig.animations} 
                      onChange={(e) => setEngineConfig(prev => ({ ...prev, animations: e.target.value }))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                    >
                      <option>Framer Motion Premium</option>
                      <option>GSAP Core</option>
                      <option>CSS Native Speed</option>
                    </select>
                  </div>
                  <div>
                    <span className="block text-slate-500 mb-1">Layout Style</span>
                    <select 
                      value={engineConfig.layoutStyle} 
                      onChange={(e) => setEngineConfig(prev => ({ ...prev, layoutStyle: e.target.value }))}
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                    >
                      <option>Dynamic Layout</option>
                      <option>Bento Grid Minimalist</option>
                      <option>Clean SaaS Corporate</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT INPUT FIELD CONTAINER */}
            <div className="relative flex items-center bg-[#05081a] border border-slate-900 rounded-2xl p-2 shadow-2xl focus-within:border-indigo-500/50 transition">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 hover:text-slate-300 transition"
                title="Attach Layout Sketch"
              >
                <Image className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              <button 
                onClick={handleVoiceClick}
                className={`p-2 transition ${isRecording ? "text-red-500 animate-pulse" : "text-slate-500 hover:text-slate-300"}`}
                title="Voice Command"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input 
                type="text"
                placeholder={aiMode === "builder" ? "Describe the elite website setup you want to launch..." : "Ask anything about tech stacks, design tokens or APIs..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMainAction()}
                disabled={loading}
                className="flex-1 bg-transparent border-none outline-none text-xs px-2 text-white placeholder-slate-600 disabled:opacity-50"
              />

              <button 
                onClick={() => handleMainAction()}
                disabled={loading || (!input.trim() && !selectedImage)}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition shadow-lg shadow-indigo-600/20"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: LIVE SANDBOX ENGINE PREVIEW (COL-SPAN UPDATED TO 7) */}
        <div className="xl:col-span-7 bg-[#010207] flex flex-col overflow-hidden border-t xl:border-t-0 border-slate-900">
          <div className="px-4 py-2 border-b border-slate-900 bg-[#030511] flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Interactive Live Preview Sandbox</span>
            </div>
            
            {/* SCREEN RESPONSIVENESS CONTROLS */}
            <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-lg gap-1">
              <button 
                onClick={() => setScreenSize("desktop")}
                className={`p-1.5 rounded text-slate-500 transition ${screenSize === "desktop" ? "bg-slate-900 text-indigo-400" : "hover:text-slate-300"}`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setScreenSize("tablet")}
                className={`p-1.5 rounded text-slate-500 transition ${screenSize === "tablet" ? "bg-slate-900 text-indigo-400" : "hover:text-slate-300"}`}
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setScreenSize("mobile")}
                className={`p-1.5 rounded text-slate-500 transition ${screenSize === "mobile" ? "bg-slate-900 text-indigo-400" : "hover:text-slate-300"}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SANDBOX SCREEN VIEWER */}
          <div className="flex-1 bg-[#010103] p-6 flex items-center justify-center overflow-auto">
            <div 
              className="bg-slate-950 rounded-2xl border border-slate-900 shadow-2xl transition-all duration-300 overflow-hidden relative flex flex-col"
              style={{
                width: screenSize === "desktop" ? "100%" : screenSize === "tablet" ? "768px" : "375px",
                height: "100%",
                maxWidth: "100%"
              }}
            >
              {/* IF A WEBSITE PREVIEW URL EXISTS IN MESSAGES */}
              {messages.filter(m => m.previewUrl).length > 0 ? (
                <iframe 
                  src={messages.filter(m => m.previewUrl).slice(-1)[0].previewUrl} 
                  className="w-full h-full border-none bg-slate-950"
                  title="Nova Live Generation"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-600 font-mono text-[11px]">
                  <Layout className="w-8 h-8 text-slate-800 mb-2 stroke-[1.5]" />
                  <span>Awaiting Core Deployment Blueprint Execution...</span>
                  <p className="text-[9px] text-slate-700 max-w-xs mt-1">Once you complete the AI questionnaire, the fully operational interface will render instantly inside this container.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUESTIONNAIRE MODAL OVERLAY */}
      {showQuestions && generatedQuestions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-[#010206]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#060a1f] border border-slate-800 rounded-2xl p-6 shadow-2xl animate-[slideUpFade_0.2s_ease-out]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold font-mono text-slate-400">CONTEXT MATCHING STEP {activeQuestionIdx + 1}/{generatedQuestions.length}</span>
              </div>
              <button onClick={() => setShowQuestions(false)} className="text-slate-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!showSomethingElseChat ? (
              <div>
                <h3 className="text-xs font-bold text-white mb-4">{generatedQuestions[activeQuestionIdx]}</h3>
                <div className="space-y-2">
                  <button onClick={() => handleAnswerSelect("Incorporate minimalist dark layout with modern grid grids")} className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-900 hover:border-indigo-500 text-[11px] text-slate-300 transition">
                    ✨ Heavy Futuristic Dark Mode Matrix
                  </button>
                  <button onClick={() => handleAnswerSelect("Clean bright corporate aesthetic with maximum empty white spaces")} className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-900 hover:border-indigo-500 text-[11px] text-slate-300 transition">
                    💼 Premium Corporate Professional Light
                  </button>
                  <button onClick={() => handleAnswerSelect("Highly vibrant neon gradients filled with custom animation frames")} className="w-full text-left p-3 rounded-xl bg-slate-950 border border-slate-900 hover:border-indigo-500 text-[11px] text-slate-300 transition">
                    🎨 Cyberpunk Neon Vibrant Structure
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white">Anything else specific you want Nova Engine to enforce?</h3>
                <textarea 
                  value={somethingElseText}
                  onChange={(e) => setSomethingElseText(e.target.value)}
                  placeholder="e.g., Add a custom currency switcher, integrate Stripe checkout buttons, make text float from right side..."
                  className="w-full h-24 p-3 bg-slate-950 border border-slate-900 rounded-xl outline-none text-xs text-white resize-none focus:border-indigo-500"
                />
                <button 
                  onClick={submitFinalQuestionnaire}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 hover:from-indigo-500"
                >
                  COMPILE & INJECT BLUEPRINT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN LOGIN DIALOG */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#070917] border border-red-950 rounded-2xl p-5 text-center">
            <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-xs font-black text-red-400 tracking-wider">ADMIN CONSOLE BYPASS</h3>
            <p className="text-[10px] text-slate-500 mt-1 mb-4">Enter master encrypted keys to override default pipeline behaviors</p>
            <input 
              type="password"
              placeholder="Admin Master Key"
              value={adminPassInput}
              onChange={(e) => setAdminPassInput(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-900 text-xs text-center font-mono outline-none text-white focus:border-red-500/50 mb-3"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAdminLogin(false)} className="flex-1 py-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-[11px] font-bold">Cancel</button>
              <button onClick={handleAdminAuth} className="flex-1 py-2 rounded-lg bg-red-950/40 text-red-400 border border-red-900/30 text-[11px] font-bold hover:bg-red-900/20">Authenticate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}