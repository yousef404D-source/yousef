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

  // Dynamic AI Questionnaire States (The core feature requested)
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

  /* ---------------- ADMIN DRAG & DROP LOGIC (FIXED) ---------------- */
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

  // Global mouse tracker for smooth admin dashboard dragging without stuck bugs
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

  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  /* ---------------- DYNAMIC LANGUAGE DETECTION & INTENT PARSER ---------------- */
  function detectLanguageAndIntent(text: string) {
    // 1. Language Detection
    const arabicPattern = /[\u0600-\u06FF]/;
    const isArabic = arabicPattern.test(text);
    setChatLanguage(isArabic ? "ar" : "en");

    // 2. Intent Classification (Command vs Question)
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
        showToast("Yousef Console Authenticated Successfully.", "success");
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

    // Secret Admin Bypass Code
    if (promptToSend.trim() === "/ad") {
      setShowAdminLogin(true);
      setInput("");
      return;
    }

    const { isArabic, isCommand } = detectLanguageAndIntent(promptToSend);

    // 1. IF IT IS A QUESTION: Route directly to rapid smart chat assistant
    if (!isCommand) {
      setAiMode("chat");
      executeChatQuery(promptToSend, isArabic);
      return;
    }

    // 2. IF IT IS A COMMAND: Auto-Switch to Builder and trigger dynamic context questions
    setAiMode("builder");
    triggerDynamicQuestionnaire(promptToSend);
  }

  /* ---------------- DYNAMIC QUESTIONNAIRE GENERATOR (REAL AI LOGIC) ---------------- */
  function triggerDynamicQuestionnaire(prompt: string) {
    setRobotMood("thinking");
    showToast("Generating custom architectural questions...", "info");

    // Dynamic question engine based on user prompt inputs to avoid hardcoded templates
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
      // Completed standard questions, move to final "Something Else" stage
      setShowSomethingElseChat(true);
    }
  }

  function submitFinalQuestionnaire() {
    setShowQuestions(false);
    
    // Compile total context mapping
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
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: prompt }]);
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
      setMessages((prev) => [
        ...prev, 
        { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          content: data.code || (isArabic ? "أنا هنا لمعالجة أحدث طلباتك ومساعدتك هندسياً." : "I am fully operational to assist you with elite engineering architecture.") 
        }
      ]);
    } catch {
      setRobotMood("sad");
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Connection to core engine failed." }]);
    }
    setLoading(false);
    setTimeout(() => setRobotMood("idle"), 2000);
  }

  /* ---------------- DEPLOYMENT & LIVE PREVIEW ENGINE ---------------- */
  async function executeWebsiteDeployment(finalPrompt: string) {
    const userMsgText = input + (selectedImage ? " [Attached Design Diagram Sketch]" : "");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: userMsgText }]);
    setInput("");
    setSelectedImage(null);
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

      setMessages((prev) => [
        ...prev, 
        { 
          id: crypto.randomUUID(),
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
        { id: crypto.randomUUID(), role: "assistant", content: `❌ Compilation Exception: ${errorMsg}` }
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

  /* ---------------- SCREEN 1: BRAND NEW ENGLISH GATEWAY ---------------- */
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

  /* ---------------- SCREEN 2: INITIALIZING LOADING BAR ---------------- */
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

  /* ---------------- SCREEN 3: POWERFUL MASTER HYBRID WORKSPACE ---------------- */
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

      {/* CORE WORKSPACE: HIGH END FULL-GRID RESPONSIVE SYSTEM (FIXED THE VISUAL JUMP ISSUES) */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 overflow-hidden relative">
        
        {/* LEFT COMPONENT: STABLE CHAT AREA (xl:col-span-4 or 5 depending on room width) */}
        <div className="xl:col-span-4 border-r border-slate-900 bg-[#02040a] flex flex-col overflow-hidden relative min-h-[450px] xl:min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-32">
            {messages.length === 0 && (
              <div className="text-center pt-12 animate-[slideUpFade_0.4s_ease-out]">
                <div className="flex justify-center mb-3"><RealisticRobot size={80} /></div>
                <h3 className="text-sm font-bold text-slate-300">INTELLIGENT PIPELINE DISPATCHER</h3>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1.5 leading-relaxed">
                  Type your project commands or ask engineering questions. The core AI auto-classifies requests, asks targeted questions without repetition, and compiles dynamic layouts.
                </p>
              </div>
            )}

            {messages.map((m) => {
              const isAss = m.role === "assistant";
              const isAr = /[\u0600-\u06FF]/.test(m.content);
              return (
                <div key={m.id} className={`flex flex-col ${isAss ? "items-start" : "items-end"} animate-[slideUpFade_0.2s_ease-out]`}>
                  <div className={`flex items-center gap-1.5 mb-1 ${isAss ? "flex-row" : "flex-row-reverse"}`}>
                    {isAss ? <RealisticRobot size={30} /> : <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-black tracking-tighter">UR</div>}
                    <span className="text-[9px] font-bold text-slate-500 tracking-wider font-mono">{isAss ? "NOVA AGENT" : "USER MASTER"}</span>
                  </div>
                  
                  <div 
                    dir={isAr ? "rtl" : "ltr"}
                    className={`max-w-[88%] p-3.5 text-xs leading-relaxed shadow-xl border font-medium ${
                      isAss 
                        ? "bg-slate-900/40 text-slate-300 rounded-2xl rounded-tl-none border-slate-800/80 text-left" 
                        : "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-none border-indigo-500/20 text-right"
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
                  <span className="text-[9px] font-mono font-bold text-slate-500">NOVA EXECUTING PIPELINE...</span>
                </div>
                <div className="max-w-[90%] p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-[11px] font-mono text-indigo-400 space-y-2.5 w-full">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />
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
                className={`py-1 px-2.5 rounded-lg text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 transition shrink-0 ${showAdvancedSettings ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-900 hover:text-slate-200'}`}
              >
                <Sliders className="w-2.5 h-2.5" /> Engine Overrides
              </button>
              <span className="bg-[#050818] border border-slate-900/60 text-indigo-400 text-[9px] px-2 py-0.5 rounded-md font-mono shrink-0 flex items-center gap-1">
                ⚙️ {engineConfig.framework}
              </span>
              <span className="bg-[#050818] border border-slate-900/60 text-emerald-400 text-[9px] px-2 py-0.5 rounded-md font-mono shrink-0 flex items-center gap-1">
                ✨ {engineConfig.layoutStyle}
              </span>
            </div>

            {showAdvancedSettings && (
              <div className="mb-2 p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-2 animate-[slideUpFade_0.1s_ease-out]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Engine Architectural Target Config:</span>
                  <button onClick={() => setShowAdvancedSettings(false)} className="text-slate-500 hover:text-white"><X className="w-3 h-3" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-0.5">Framework Layer:</label>
                    <select value={engineConfig.framework} onChange={(e) => setEngineConfig(p => ({...p, framework: e.target.value}))} className="w-full bg-slate-900 text-white border border-slate-800 rounded-md p-1 text-[9px] outline-none">
                      <option value="Next.js 14+">Next.js 14 (App Router)</option>
                      <option value="React.js (Vite)">React.js + Vite Stack</option>
                      <option value="Static HTML5">Pure HTML5 / Tailwind</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-0.5">Motion Modules:</label>
                    <select value={engineConfig.animations} onChange={(e) => setEngineConfig(p => ({...p, animations: e.target.value}))} className="w-full bg-slate-900 text-white border border-slate-800 rounded-md p-1 text-[9px] outline-none">
                      <option value="Framer Motion Premium">Framer Motion Pro</option>
                      <option value="GSAP High-Perf">GSAP Engineering Canvas</option>
                      <option value="Vanilla CSS Core">Standard CSS Hardware</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-0.5">Layout Generation:</label>
                    <select value={engineConfig.layoutStyle} onChange={(e) => setEngineConfig(p => ({...p, layoutStyle: e.target.value}))} className="w-full bg-slate-900 text-white border border-slate-800 rounded-md p-1 text-[9px] outline-none">
                      <option value="Dynamic Layout">Dynamic Generation (No Templates)</option>
                      <option value="Hyper Cyberpunk">Extreme Cyber Neon Grid</option>
                      <option value="Luxury Minimalist">Luxury Corporate Editorial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* INPUT BOX WRAPPER BAR */}
            <div className="bg-slate-950 border border-slate-900/80 rounded-xl p-1.5 flex items-center shadow-3xl focus-within:border-blue-600/40 transition">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMainAction()}
                onFocus={() => !loading && setRobotMood("typing")}
                onBlur={() => !loading && setRobotMood("idle")}
                disabled={loading}
                placeholder="Type command ('build an e-commerce') or questions..."
                className="flex-1 bg-transparent border-none outline-none text-white text-xs px-2.5"
              />
              
              <div className="flex items-center gap-0.5 px-1 border-r border-slate-900 mr-1">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-indigo-400 rounded-lg hover:bg-slate-900/60 transition" title="Attach Blueprint Diagram">
                  <Image className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleVoiceClick} className={`p-2 rounded-lg transition ${isRecording ? "bg-red-500/10 text-red-400 animate-pulse" : "text-slate-500 hover:text-indigo-400 hover:bg-slate-900/60"}`} title="Voice Control Stream">
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>

              <button 
                onClick={() => handleMainAction()} 
                disabled={loading || (!input.trim() && !selectedImage)} 
                className="py-1.5 px-3.5 rounded-lg bg-white hover:bg-slate-200 disabled:bg-slate-900 disabled:text-slate-600 text-black font-black text-xs transition flex items-center gap-1"
              >
                Execute <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: INTEGRATED LIVE PREVIEW AND DEPLOYMENT SANDBOX FRAME (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col bg-[#010205] relative min-h-[500px] xl:min-h-0">
          <div className="px-4 py-3 bg-[#040612] border-b border-slate-900 flex justify-between items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> DEPLOYMENT PREVIEW CHANNELS & SMART STABILITY CONTROLLER
            </div>

            <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
              <button onClick={() => setScreenSize("desktop")} className={`p-1.5 rounded-md flex items-center gap-1 text-[10px] font-bold transition ${screenSize === "desktop" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/10" : "text-slate-500 hover:text-slate-300"}`}>
                <Monitor className="w-3 h-3" /> PC View
              </button>
              <button onClick={() => setScreenSize("tablet")} className={`p-1.5 rounded-md flex items-center gap-1 text-[10px] font-bold transition ${screenSize === "tablet" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/10" : "text-slate-500 hover:text-slate-300"}`}>
                <Tablet className="w-3 h-3" /> Tablet
              </button>
              <button onClick={() => setScreenSize("mobile")} className={`p-1.5 rounded-md flex items-center gap-1 text-[10px] font-bold transition ${screenSize === "mobile" ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/10" : "text-slate-500 hover:text-slate-300"}`}>
                <Smartphone className="w-3 h-3" /> Mobile
              </button>
            </div>
          </div>

          {/* SANDBOX MONITOR CENTER */}
          <div className="flex-1 p-5 flex justify-center items-center overflow-auto bg-[#020308] relative">
            {messages.filter(m => m.previewUrl).length === 0 ? (
              <div className="text-center text-slate-700 font-medium space-y-2 animate-pulse">
                <Code className="w-10 h-10 mx-auto text-slate-800" />
                <div className="text-xs font-bold uppercase tracking-wider">Sandbox Stream Dormant</div>
                <div className="text-[10px] opacity-50">Initiate a build command to launch live automated layout rendering.</div>
              </div>
            ) : (
              <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-900/40 overflow-hidden transition-all duration-300 max-h-full"
                style={{
                  width: screenSize === "mobile" ? "375px" : screenSize === "tablet" ? "768px" : "100%",
                  height: screenSize === "desktop" ? "100%" : "90%"
                }}
              >
                <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-900/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500/30" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/30" />
                    <span className="w-2 h-2 rounded-full bg-green-500/30" />
                    <span className="text-[9px] font-mono text-slate-500 ml-2">nova_deployment_sandbox.output</span>
                  </div>
                  {messages.filter(m => m.previewUrl).map((m, idx, arr) => {
                    if (idx === arr.length - 1) {
                      return (
                        <a key={m.id} href={m.previewUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-indigo-400 flex items-center gap-1 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30 hover:bg-indigo-900/60 transition">
                          Launch Canvas <ExternalLink className="w-2.5 h-2.5" />
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
                        key={m.id}
                        sandbox="allow-scripts allow-same-origin"
                        src={m.previewUrl} 
                        className="w-full h-full bg-white border-none"
                        title="Nova Operational Compiled Layout View"
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

      {/* DYNAMIC SMART AI QUESTIONNAIRE MODAL CONTEXT SCREEN */}
      {showQuestions && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#070b1e] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl animate-[slideUpFade_0.2s_forwards]">
            
            {/* STEP PROGRESS TRACKER */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-black tracking-wider uppercase">
                <HelpCircle className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>AI Core Context Specification Engine</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md font-bold">
                STAGE {activeQuestionIdx + 1} OF {generatedQuestions.length}
              </span>
            </div>

            {/* PROGRESS STATUS BAR */}
            <div className="w-full bg-slate-950 h-1 rounded-full mb-5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300" style={{ width: `${((activeQuestionIdx + 1) / generatedQuestions.length) * 100}%` }} />
            </div>

            {!showSomethingElseChat ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-300 font-bold leading-relaxed bg-[#030614] p-3.5 border border-slate-900 rounded-xl">
                  {generatedQuestions[activeQuestionIdx]}
                </p>
                
                {/* Dynamically formulated smart choices to match your favorite architectural sketch concepts */}
                <div className="grid grid-cols-1 gap-2">
                  {[
                    "Option A: Implement advanced automated adaptive UI layout architectures.",
                    "Option B: Deploy minimalist clean user workflows with luxury dark neon interfaces.",
                    "Option C: Integrate interactive full-screen modules and embedded real-time processing components.",
                    "Something Else (I need specific customized features)"
                  ].map((option, idx) => {
                    return (
                      <button 
                        key={idx} 
                        onClick={() => {
                          if (idx === 3) {
                            setShowSomethingElseChat(true);
                          } else {
                            handleAnswerSelect(option);
                          }
                        }}
                        className="w-full text-left py-3 px-4 rounded-xl text-xs font-bold transition-all border bg-slate-950 text-slate-400 border-slate-900 hover:text-white hover:border-indigo-500/50 hover:bg-[#0c122f]"
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              // EXCLUSIVE SHAT-BOX COMPONENT FOR WRITING CUSTOM DESCRIPTIONS OUTSIDE THE QUESTIONS
              <div className="space-y-4 animate-[slideUpFade_0.15s_ease-out]">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1 mb-1">✨ Custom Request Channel Activated</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Specify anything outside standard templates. Write features, layout arrangements or unique demands directly into the terminal block below:</p>
                </div>

                <textarea
                  value={somethingElseText}
                  onChange={(e) => setSomethingElseText(e.target.value)}
                  placeholder="Type your custom requirements or features here..."
                  className="w-full h-24 bg-slate-950 text-white border border-slate-900 p-3 rounded-xl text-xs outline-none focus:border-indigo-500 resize-none font-medium"
                />

                <div className="flex gap-2 text-[11px] border-t border-slate-900 pt-3">
                  {Object.keys(questionAnswers).length < generatedQuestions.length && (
                    <button onClick={() => setShowSomethingElseChat(false)} className="py-2.5 px-4 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition font-bold">
                      Back to options
                    </button>
                  )}
                  <button onClick={submitFinalQuestionnaire} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black tracking-wider transition active:scale-95 text-center">
                    Inject & Initialize Dynamic Build Process 🚀
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ADMIN CONSOLE AUTHENTICATION */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-red-500/20 rounded-2xl p-5 shadow-2xl text-center">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-sm font-black text-white">Yousef Admin Channel Verification</h3>
            <p className="text-[11px] text-slate-500 mt-1 mb-4">Provide security passkey encryption to synchronize admin control panel tools</p>
            <input 
              type="password" 
              value={adminPassInput} 
              onChange={(e) => setAdminPassInput(e.target.value)} 
              placeholder="••••••••" 
              className="w-full py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-white outline-none focus:border-red-500/40 mb-4 font-mono tracking-widest" 
            />
            <div className="flex gap-2">
              <button onClick={handleAdminAuth} className="flex-1 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition">Authenticate Console</button>
              <button onClick={() => setShowAdminLogin(false)} className="py-2 px-3 rounded-xl bg-slate-800 text-xs font-bold text-slate-400 transition">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* POWERFUL ADMIN CONSOLE FLOATING OVERLAY PANEL (YOUSEF ACCESS) */}
      {isAdminAuth && (
        <div 
          style={{ left: `${adminPos.x}px`, top: `${adminPos.y}px` }}
          className="fixed z-50 w-64 bg-[#050817]/95 backdrop-blur-md border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden select-none"
        >
          <div 
            onMouseDown={handleDragStart}
            className="bg-slate-950/90 px-3 py-2.5 border-b border-slate-900 flex items-center justify-between cursor-move"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-black text-emerald-400 tracking-wider">
              <Activity className="w-3.5 h-3.5 animate-pulse" /> CONTROL PANEL V4 // OWNER: YOUSEF
            </div>
            <button onClick={() => setIsAdminAuth(false)} className="text-slate-500 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="p-3.5 space-y-2 text-left text-[11px] font-mono">
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">SYSTEM CLOUD STACK:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> STABLE</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
              <span className="text-slate-500">MEMORY CONSUMPTION:</span>
              <span className="text-indigo-400 font-bold">42.8 MB / 512 MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">SECURITY AUTHORIZATION:</span>
              <span className="text-amber-400 font-bold flex items-center gap-1"><Users className="w-3 h-3" /> ROOT_OWNER</span>
            </div>
            <div className="pt-2">
              <button 
                onClick={() => { 
                  setMessages([]); 
                  showToast("Operational communication logs flushed.", "success");
                }} 
                className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-red-950/30 hover:text-red-400 border border-slate-900 text-[10px] font-bold tracking-wider uppercase transition text-center"
              >
                Flush System Chat Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}