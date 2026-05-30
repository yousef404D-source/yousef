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
  Globe,
  ExternalLink
} from "lucide-react";

type Message = { 
  role: "user" | "assistant"; 
  content: string; 
  previewUrl?: string; // لإضافة رابط الموقع الحي داخل الرسالة
};
type Mode = "builder" | "chat";
type AuthStep = "SYSTEM_PASSWORD" | "LOADING_TRANSITION" | "AUTHORIZED";
type RobotMood = "idle" | "thinking" | "happy" | "sad" | "typing";

export default function NovaAI() {
  /* ---------------- STATES ---------------- */
  const [authStep, setAuthStep] = useState<AuthStep>("SYSTEM_PASSWORD");
  const [password, setPassword] = useState("");
  const [wrongPass, setWrongPass] = useState(false);
  const [aiMode, setAiMode] = useState<Mode>("builder");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [robotMood, setRobotMood] = useState<RobotMood>("idle");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- ADMIN PANEL STATES ---------------- */
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPos, setAdminPos] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  /* ---------------- SCROLL EFFECT ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  /* ---------------- AUTH LOGIC WITH SYSTEM ANIMATION ---------------- */
  async function unlock() {
    setWrongPass(false);
    if (password === "123") {
      setRobotMood("happy");
      setWrongPass(false);
      
      // الانتقال إلى مرحلة أنيميشن التحميل السيبراني قبل فتح الشات
      setTimeout(() => {
        setAuthStep("LOADING_TRANSITION");
        
        // بعد انتهاء أنيميشن التحميل نفتح الشات الفعلي
        setTimeout(() => {
          setAuthStep("AUTHORIZED");
          setRobotMood("idle");
        }, 2200);
      }, 800);

    } else {
      setRobotMood("sad");
      setWrongPass(true);
      setTimeout(() => setWrongPass(false), 500); // إيقاف الهز
      setTimeout(() => setRobotMood("idle"), 2500);
    }
  }

  /* ---------------- SEND MESSAGES (REAL API CONNECTION) ---------------- */
  async function sendMessage() {
    if (!input.trim()) return;

    // Secret Admin Command
    if (input.trim() === "/ad") {
      setShowAdminLogin(true);
      setInput("");
      return;
    }

    const text = input;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setRobotMood("thinking");

    if (aiMode === "builder") {
      try {
        // الاتصال الفعلي بالـ API الموجود في مشروعك بمسار app/api/nova/route.ts
        const res = await fetch("/api/nova", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });
        
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "فشل توليد الموقع الحقيقي.");
        }

        setRobotMood("happy");
        setMessages((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: `✅ تم بناء وتوليد الموقع الفعلي بنجاح طبقاً لأعلى معايير الـ UI/UX المستقبلية!\n\nيمكنك الآن استعراض موقعك والتفاعل معه بالكامل بالأسفل أو فتحه في صفحة مستقلة.`,
            previewUrl: data.url // تخزين الرابط الحي للـ iframe والزر
          }
        ]);

      } catch (err: any) {
        setRobotMood("sad");
        setMessages((prev) => [
          ...prev, 
          { role: "assistant", content: `❌ خطأ في محرك Nova الفعلي: ${err.message}` }
        ]);
      }
    } else {
      // وضع الشات العادي (المحادثة الفائقة الدقيقة)
      try {
        const res = await fetch("/api/nova", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: `أجب على السؤال التالي بشكل فخم وذكي ومختصر جداً: ${text}` }),
        });
        const data = await res.json();
        
        setRobotMood("happy");
        setMessages((prev) => [
          ...prev, 
          { role: "assistant", content: data.code || "أنا هنا لخدمتك ومعالجة كافة البيانات بذكاء." }
        ]);
      } catch (e) {
        setRobotMood("sad");
        setMessages((prev) => [...prev, { role: "assistant", content: "عذراً، حدثت مشكلة في الاتصال بالمحرك." }]);
      }
    }

    setLoading(false);
    setTimeout(() => setRobotMood("idle"), 3000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  function handleAdminAuth() {
    if (adminPassInput === "yousefyousefyousef505") {
      setIsAdminAuth(true);
      setShowAdminLogin(false);
      setAdminPassInput("");
    } else {
      alert("⚠️ CRITICAL ERROR: Unauthorized access attempt recorded.");
      setShowAdminLogin(false);
      setAdminPassInput("");
    }
  }

  /* ---------------- REALISTIC ROBOT COMPONENT ---------------- */
  function RealisticRobot({ size = 50 }: { size?: number }) {
    const getGlowStyle = () => {
      if (robotMood === "sad") return "0 0 35px #ef4444, inset 0 0 15px #000"; 
      if (robotMood === "happy") return "0 0 35px #10b981, inset 0 0 15px #000"; 
      if (robotMood === "thinking") return "0 0 40px #a855f7, inset 0 0 15px #000"; 
      if (robotMood === "typing") return "0 0 30px #f59e0b, inset 0 0 15px #000"; 
      return "0 0 30px #3b82f6, inset 0 0 15px #000"; 
    };

    const getEyeColor = () => {
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
          borderRadius: "50%",
          position: "relative",
          background: "linear-gradient(145deg, #0f172a, #020617)",
          boxShadow: getGlowStyle(),
          border: `2px solid ${getEyeColor()}40`,
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          animation: robotMood === "thinking" ? "pulseGlow 1.2s infinite ease-in-out" : "float 4s ease-in-out infinite"
        }}
      >
        <div style={{ position: "absolute", inset: "15%", background: "#000", borderRadius: "50%", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div
            style={{
              width: robotMood === "sad" ? "45%" : robotMood === "happy" ? "65%" : "50%",
              height: robotMood === "sad" ? "15%" : robotMood === "happy" ? "45%" : "50%",
              background: getEyeColor(),
              borderRadius: robotMood === "sad" ? "4px" : "50%",
              boxShadow: `0 0 20px ${getEyeColor()}`,
              transition: "all 0.3s ease",
              transform: robotMood === "sad" ? "translateY(4px)" : "none",
              animation: "realisticBlink 4s infinite"
            }}
          />
          <div style={{
            position: "absolute", top: 0, width: "100%", height: "50%", background: "#000",
            transformOrigin: "top", transition: "transform 0.3s",
            transform: robotMood === "sad" ? "translateY(5%)" : robotMood === "happy" ? "translateY(-75%)" : "translateY(-100%)"
          }} />
          <div style={{
            position: "absolute", bottom: 0, width: "100%", height: "50%", background: "#000",
            transformOrigin: "bottom", transition: "transform 0.3s",
            transform: robotMood === "happy" ? "translateY(15%)" : "translateY(100%)"
          }} />
        </div>
      </div>
    );
  }

  /* ---------------- 1. FIRST SCREEN: SYSTEM PASSWORD ---------------- */
  if (authStep === "SYSTEM_PASSWORD") {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(circle at center, #0b0f24 0%, #030510 100%)", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Arial", color: "white" }} dir="rtl">
        <style>{`
          @keyframes shake { 0%, 100% {transform: translateX(0);} 20%, 60% {transform: translateX(-8px);} 40%, 80% {transform: translateX(8px);} }
          @keyframes realisticBlink { 0%, 95%, 97%, 100% {transform: scaleY(1)} 96%, 98% {transform: scaleY(0.1)} }
          @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-8px)} }
        `}</style>
        
        <div style={{ width: 460, background: "rgba(10, 15, 36, 0.7)", border: `1px solid ${wrongPass ? '#ef4444' : 'rgba(59, 130, 246, 0.2)'}`, backdropFilter: "blur(25px)", borderRadius: 28, padding: "40px 30px", textAlign: "center", boxShadow: wrongPass ? "0 0 40px rgba(239, 68, 68, 0.15)" : "0 20px 50px rgba(0,0,0,0.4)", animation: wrongPass ? "shake 0.4s ease-in-out" : "none" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 25 }}><RealisticRobot size={100} /></div>
          
          <h1 style={{ fontSize: 28, marginBottom: 8, fontWeight: 800 }}>بوابة العبور الآمن</h1>
          <p style={{ opacity: 0.5, fontSize: 13, marginBottom: 30 }}>الرجاء إدخال رمز النظام للاتصال بـ Nova AI</p>
          
          <div style={{ position: "relative" }}>
            <input
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              style={{ width: "100%", padding: "18px 20px", borderRadius: 16, border: wrongPass ? "2px solid #ef4444" : "1px solid rgba(255,255,255,0.08)", background: "#040714", color: "white", outline: "none", fontSize: 16, textAlign: "center", letterSpacing: "4px" }}
            />
            <Lock style={{ position: "absolute", right: 18, top: 20, width: 18, height: 18, opacity: 0.3 }} />
          </div>

          {wrongPass && (
            <p style={{ color: "#ef4444", fontSize: 12, marginTop: 10, fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <AlertTriangle className="w-4 h-4" /> الرمز المدخل غير صحيح. حاول مجدداً.
            </p>
          )}

          <button onClick={unlock} style={{ width: "100%", marginTop: 20, padding: 16, borderRadius: 16, border: "none", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "white", fontSize: 15, cursor: "pointer", fontWeight: "bold", boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)" }}>
            بدء التحقق والمصادقة
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- 2. SECOND SCREEN: INTERMEDIATE CYBER LOADING ---------------- */
  if (authStep === "LOADING_TRANSITION") {
    return (
      <div style={{ minHeight: "100vh", background: "#030510", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontFamily: "Arial", color: "white" }} dir="rtl">
        <div style={{ textAlign: "center" }}>
          <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 30px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px dashed #10b981", animation: "spin 10s linear infinite", opacity: 0.6 }}></div>
            <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1px solid #3b82f6", opacity: 0.3 }}></div>
            <RealisticRobot size={90} />
          </div>

          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <CheckCircle2 className="w-5 h-5" /> تم قبول الرمز بنجاح
            </h2>
            <p style={{ opacity: 0.5, fontSize: 12, marginTop: 6, letterSpacing: "1px" }}>LOADING NOVA CORE WORKSPACE...</p>
          </div>

          <div style={{ width: 240, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 10, margin: "20px auto 0", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "linear-gradient(90deg, #3b82f6, #10b981)", width: "100%", animation: "slideLoading 2s forwards" }}></div>
          </div>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes slideLoading { from { transform: translateX(100%); } to { transform: translateX(0%); } }
        `}</style>
      </div>
    );
  }

  /* ---------------- 3. THIRD SCREEN: AUTHORIZED SYSTEM ---------------- */
  return (
    <div 
      onMouseMove={handleDragMove} 
      onMouseUp={handleDragEnd} 
      style={{ minHeight: "100vh", background: "#040612", color: "white", overflow: "hidden", fontFamily: "Arial", position: "relative" }}
      dir="rtl"
    >
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(25px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%, 100% {box-shadow: 0 0 20px rgba(59,130,246,0.4)} 50% {box-shadow: 0 0 50px rgba(139,92,246,0.7)} }
        @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-6px)} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
      `}</style>

      {/* HEADER BAR */}
      <header style={{ padding: "15px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(4,6,18,0.7)", backdropFilter: "blur(15px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <RealisticRobot size={45} />
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: "extrabold", background: "linear-gradient(to left, #fff, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NOVA MAIN CORE</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: 11, opacity: 0.5 }}>SECURE TUNNEL ACTIVE</span>
            </div>
          </div>
        </div>

        {/* AI MODE SWITCHER */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: 3 }}>
          <button onClick={() => setAiMode("builder")} style={{ padding: "8px 18px", borderRadius: 11, border: "none", cursor: "pointer", background: aiMode === "builder" ? "rgba(255,255,255,0.08)" : "transparent", color: aiMode === "builder" ? "white" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "bold", transition: "all 0.2s" }}>
            🛠️ محرك البناء
          </button>
          <button onClick={() => setAiMode("chat")} style={{ padding: "8px 18px", borderRadius: 11, border: "none", cursor: "pointer", background: aiMode === "chat" ? "rgba(255,255,255,0.08)" : "transparent", color: aiMode === "chat" ? "white" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: "bold", transition: "all 0.2s" }}>
            💬 محادثة فائقة
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER CHAT */}
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "40px 20px 160px", minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
        
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "12vh", animation: "slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 25 }}><RealisticRobot size={110} /></div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>كيف يمكنني صياغة نظامك اليوم؟</h2>
            <p style={{ opacity: 0.4, fontSize: 14 }}>
              الوضع الفعال الحالي: {aiMode === "builder" ? "توليد كود وبناء مواقع حية ورفعها" : "إجابة ذكية ومفتوحة على كافة الأسئلة والبرمجيات"}
            </p>
          </div>
        )}

        {/* MESSAGES FEEDS */}
        <div style={{ flex: 1 }}>
          {messages.map((m, i) => {
            const isAss = m.role === "assistant";
            const hasUrl = !!m.previewUrl;
            
            return (
              <div key={i} style={{ marginBottom: 35, display: "flex", flexDirection: "column", alignItems: isAss ? "flex-start" : "flex-end", animation: "slideUpFade 0.3s ease-out" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexDirection: isAss ? "row" : "row-reverse" }}>
                  {isAss ? <RealisticRobot size={28} /> : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #4f46e5)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 10, fontWeight: "bold" }}>UR</div>}
                  <span style={{ fontSize: 11, opacity: 0.4, fontWeight: "bold" }}>{isAss ? "NOVA AI CORE" : "YOU"}</span>
                </div>
                
                {/* صندوق الرسالة */}
                <div style={{ 
                  maxWidth: "90%", 
                  background: hasUrl ? "#051a10" : isAss ? "rgba(255,255,255,0.03)" : "linear-gradient(135deg, #2563eb, #4f46e5)", 
                  border: hasUrl ? "2px solid #10b981" : isAss ? "1px solid rgba(255,255,255,0.05)" : "none",
                  color: hasUrl ? "#10b981" : "white",
                  padding: "16px 22px", 
                  borderRadius: isAss ? "20px 20px 20px 4px" : "20px 20px 4px 20px", 
                  fontSize: 15, 
                  lineHeight: 1.6, 
                  whiteSpace: "pre-wrap", 
                  boxShadow: hasUrl ? "0 0 25px rgba(16,185,129,0.08)" : "0 10px 30px rgba(0,0,0,0.15)",
                  textAlign: "right"
                }}>
                  {m.content}

                  {/* 🚀 الـ Magic الفعلي: عند نجاح بناء الموقع يتم حقن أزرار المعاينة وشاشة iframe فوراً */}
                  {hasUrl && (
                    <div style={{ marginTop: 20 }}>
                      <a 
                        href={m.previewUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#10b981", color: "black", borderRadius: 10, fontWeight: "bold", fontSize: 13, textDecoration: "none", boxShadow: "0 4px 15px rgba(16,185,129,0.3)" }}
                      >
                        <ExternalLink className="w-4 h-4" /> فتح الموقع في نافذة جديدة حية
                      </a>

                      {/* شاشة العرض والتشغيل المباشر للموقع التفاعلي */}
                      <div style={{ marginTop: 15, background: "#000", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(16,185,129,0.3)" }}>
                        <div style={{ background: "#0a0f0d", padding: "8px 15px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid rgba(16,185,129,0.1)" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b" }} />
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                          <span style={{ fontSize: 11, opacity: 0.5, marginRight: 10, fontFamily: "monospace" }}>nova_live_browser.html</span>
                        </div>
                        <iframe 
                          src={m.previewUrl} 
                          style={{ width: "100%", height: "450px", border: "none", background: "white" }} 
                          title="Nova Live Website Preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* BOX INPUT AT BOTTOM */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "30px 20px", background: "linear-gradient(to top, #040612 70%, rgba(4,6,18,0))", zIndex: 30 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", background: "rgba(10, 14, 35, 0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "6px 10px", display: "flex", alignItems: "center", backdropFilter: "blur(20px)", boxShadow: "0 15px 40px rgba(0,0,0,0.4)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => !loading && setRobotMood("typing")}
            onBlur={() => !loading && setRobotMood("idle")}
            disabled={loading}
            placeholder={aiMode === "builder" ? "اصنع لي موقع متجر إلكتروني فخم بنظام نيون غامق..." : "اسألني عن أي سكريبت أو قاعدة بيانات برمجية..."}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 14, padding: "14px 15px", textAlign: "right" }}
          />
          <button 
            onClick={sendMessage} 
            disabled={loading || !input.trim()} 
            style={{ border: "none", padding: "12px 24px", borderRadius: 14, background: "white", color: "black", cursor: "pointer", fontSize: 14, fontWeight: "bold", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}
          >
            {loading ? "جاري البناء الفعلي..." : <><Send className="w-4 h-4 transform rotate-180" /> إرسال</>}
          </button>
        </div>
      </div>

      {/* ---------------- SECRET ADMIN PROMPT MODAL ---------------- */}
      {showAdminLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(2, 3, 10, 0.85)", backdropFilter: "blur(12px)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#0c0407", padding: 35, borderRadius: 24, border: "2px solid #ef4444", width: 420, boxShadow: "0 0 40px rgba(239, 68, 68, 0.15)", animation: "slideUpFade 0.25s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15, color: "#ef4444" }}>
              <ShieldAlert className="w-5 h-5" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: "extrabold" }}>منطقة محظورة بالكامل</h3>
            </div>
            <p style={{ opacity: 0.6, marginBottom: 25, fontSize: 13, lineHeight: 1.5 }}>الرجاء إدخل المفتاح الرئيسي (Master Key) لفك تشفير لوحة التحكم العليا.</p>
            
            <input 
              type="password" 
              value={adminPassInput} 
              onChange={e => setAdminPassInput(e.target.value)} 
              onKeyDown={e => e.key === "Enter" && handleAdminAuth()} 
              placeholder="تشفير روت الـ Master..." 
              style={{ width: "100%", padding: 15, borderRadius: 12, border: "1px solid rgba(239,68,68,0.2)", background: "#020308", color: "white", marginBottom: 20, textAlign: "center", fontSize: 14 }} 
              autoFocus 
            />
            
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setShowAdminLogin(false); setAdminPassInput(""); }} style={{ flex: 1, padding: 12, background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, cursor: "pointer", fontSize: 13 }}>إلغاء الأمر</button>
              <button onClick={handleAdminAuth} style={{ flex: 1, padding: 12, background: "#ef4444", color: "white", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: "bold", fontSize: 13, boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)" }}>تأكيد الهوية</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DRAGGABLE GLASS ADMIN PANEL ---------------- */}
      {isAdminAuth && (
        <div 
          style={{ position: "fixed", left: adminPos.x, top: adminPos.y, width: 560, background: "rgba(11, 16, 43, 0.95)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 20, zIndex: 99, boxShadow: "0 25px 60px rgba(0,0,0,0.6)", backdropFilter: "blur(25px)", overflow: "hidden", animation: "slideUpFade 0.3s ease-out" }}
        >
          <div 
            onMouseDown={handleDragStart} 
            style={{ padding: "16px 20px", background: "rgba(4, 7, 24, 0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "grab", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
              <span style={{ fontWeight: "extrabold", fontSize: 13, color: "#fff" }}>لوحة تحكم المشرف الأعلى (MASTER PANEL)</span>
            </div>
            <button onClick={() => setIsAdminAuth(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}><X className="w-5 h-5" /></button>
          </div>

          <div style={{ padding: 22 }}>
            <div style={{ display: "flex", gap: 15, marginBottom: 25 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: 15, borderRadius: 14, border: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12 }}>
                <Users className="w-8 h-8 text-indigo-400" />
                <div>
                  <div style={{ opacity: 0.4, fontSize: 11 }}>المستخدمين النشطين</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#10b981", fontFamily: "monospace", marginTop: 2 }}>1,432</div>
                </div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.02)", padding: 15, borderRadius: 14, border: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12 }}>
                <Activity className="w-8 h-8 text-indigo-400" />
                <div>
                  <div style={{ opacity: 0.4, fontSize: 11 }}>إجمالي الـ Deploys</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#3b82f6", fontFamily: "monospace", marginTop: 2 }}>89,204</div>
                </div>
              </div>
            </div>

            <h4 style={{ margin: "0 0 12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 8, fontSize: 13, color: "#818cf8" }}>سجلات الرصد والتحكم الحية</h4>
            
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              {[
                { email: "admin@nova.ai", status: "Active", ip: "192.168.1.1", color: "#10b981" },
                { email: "user_992@gmail.com", status: "Online", ip: "10.0.0.45", color: "#3b82f6" },
                { email: "hacker@test.com", status: "Suspicious", ip: "Unknown", color: "#ef4444" },
              ].map((u, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: "bold" }}>{u.email}</div>
                    <div style={{ fontSize: 11, opacity: 0.4, marginTop: 2 }}>IP: {u.ip} • الحالة: <span style={{ color: u.color }}>{u.status}</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "6px 12px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>تعديل</button>
                    <button style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>حظر</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}