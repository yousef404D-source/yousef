"use client";

import { useEffect, useRef, useState } from "react";
// import { supabase } from "@/utils/supabaseClient"; // قم بإلغاء التعليق عند ربط Supabase

type Message = { role: "user" | "assistant"; content: string };
type Mode = "builder" | "chat";
type AuthStep = "SYSTEM_PASSWORD" | "AUTHORIZED";

export default function NovaAI() {
  /* ---------------- STATES ---------------- */
  const [authStep, setAuthStep] = useState<AuthStep>("SYSTEM_PASSWORD");
  const [password, setPassword] = useState("");
  const [wrongPass, setWrongPass] = useState(false);
  const [aiMode, setAiMode] = useState<Mode>("builder");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [robotMood, setRobotMood] = useState<"idle" | "thinking" | "happy" | "sad" | "typing">("idle");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- ADMIN PANEL STATES ---------------- */
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPos, setAdminPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0 });

  /* ---------------- SCROLL & EFFECTS ---------------- */
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

  /* ---------------- AUTH LOGIC ---------------- */
  async function unlock() {
    setWrongPass(false);
    if (password === "123") { // استبدل 123 بالباسورد الحقيقي أو بالـ API
      setRobotMood("happy");
      setTimeout(() => {
        setAuthStep("AUTHORIZED");
        setRobotMood("idle");
      }, 1000);
    } else {
      setRobotMood("sad");
      setWrongPass(true);
      setTimeout(() => setRobotMood("idle"), 2500);
    }
  }

  /* ---------------- SEND MESSAGES ---------------- */
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
      const loadingSteps = ["Analyzing architecture...", "Compiling React Components...", "Deploying via Nova Engine..."];
      for (const step of loadingSteps) {
        setMessages((prev) => [...prev, { role: "assistant", content: step }]);
        await new Promise((r) => setTimeout(r, 1200));
      }
      setRobotMood("happy");
      setMessages((prev) => [...prev, { role: "assistant", content: "✅ Website successfully deployed!\n\n🌍 https://nova-ai.live/your-site" }]);
    } else {
      await new Promise((r) => setTimeout(r, 1500));
      setRobotMood("happy");
      setMessages((prev) => [...prev, { role: "assistant", content: "I am Nova AI, a highly advanced artificial intelligence. I can answer any question or help you build complex systems. How can I assist you further?" }]);
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
      alert("Unauthorized access detected.");
      setShowAdminLogin(false);
    }
  }

  /* ---------------- REALISTIC ROBOT COMPONENT ---------------- */
  function RealisticRobot({ size = 50 }: { size?: number }) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          position: "relative",
          background: "linear-gradient(145deg, #0f172a, #020617)",
          boxShadow: robotMood === "sad" ? "0 0 20px rgba(220, 38, 38, 0.4), inset 0 0 10px #000" :
                     robotMood === "happy" ? "0 0 25px rgba(16, 185, 129, 0.5), inset 0 0 10px #000" :
                     "0 0 20px rgba(59, 130, 246, 0.4), inset 0 0 10px #000",
          border: "2px solid rgba(255,255,255,0.05)",
          overflow: "hidden",
          transition: "all 0.5s ease",
          animation: robotMood === "thinking" ? "pulseGlow 1.5s infinite" : "float 4s ease-in-out infinite"
        }}
      >
        {/* Eye Screen */}
        <div style={{ position: "absolute", inset: "15%", background: "#000", borderRadius: "50%", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center" }}>
          
          {/* Glowing Eye Core */}
          <div
            style={{
              width: robotMood === "sad" ? "40%" : robotMood === "happy" ? "60%" : "50%",
              height: robotMood === "sad" ? "20%" : robotMood === "happy" ? "40%" : "50%",
              background: robotMood === "sad" ? "#ef4444" : robotMood === "happy" ? "#10b981" : "#3b82f6",
              borderRadius: robotMood === "sad" ? "10px" : "50%",
              boxShadow: `0 0 15px ${robotMood === "sad" ? "#ef4444" : robotMood === "happy" ? "#10b981" : "#3b82f6"}`,
              transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: robotMood === "sad" ? "rotate(15deg) translateY(5px)" : "none",
              animation: "realisticBlink 5s infinite"
            }}
          />
          
          {/* Eyelids for expressions */}
          <div style={{
            position: "absolute", top: 0, width: "100%", height: "50%", background: "#000",
            transformOrigin: "top", transition: "transform 0.4s",
            transform: robotMood === "sad" ? "rotate(20deg) translateY(-10%)" : robotMood === "happy" ? "translateY(-80%)" : "translateY(-100%)"
          }} />
          <div style={{
            position: "absolute", bottom: 0, width: "100%", height: "50%", background: "#000",
            transformOrigin: "bottom", transition: "transform 0.4s",
            transform: robotMood === "happy" ? "rotate(-10deg) translateY(-20%)" : "translateY(100%)"
          }} />
        </div>
      </div>
    );
  }

  /* ---------------- AUTH SCREEN ---------------- */
  if (authStep === "SYSTEM_PASSWORD") {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top,#111827,#020617)", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Arial", color: "white" }}>
        <style>{`
          @keyframes shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-10px);} 75% {transform: translateX(10px);} }
          @keyframes realisticBlink { 0%, 96%, 98%, 100% {transform: scaleY(1)} 97%, 99% {transform: scaleY(0.1)} }
          @keyframes pulseGlow { 0%, 100% {box-shadow: 0 0 20px rgba(59,130,246,0.4)} 50% {box-shadow: 0 0 50px rgba(124,58,237,0.8)} }
          @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-5px)} }
        `}</style>
        
        <div style={{ width: 500, background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.05)", backdropFilter: "blur(30px)", borderRadius: 30, padding: 50, textAlign: "center", animation: wrongPass ? "shake 0.4s" : "none" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}><RealisticRobot size={90} /></div>
          <h1 style={{ fontSize: 48, marginBottom: 10, fontWeight: 800 }}>System Login</h1>
          <p style={{ opacity: 0.5, marginBottom: 30 }}>Authenticate to access Nova AI</p>
          
          <input
            type="password" placeholder="System Password" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlock()}
            style={{ width: "100%", padding: 20, borderRadius: 15, border: wrongPass ? "1px solid #ef4444" : "1px solid rgba(255,255,255,.1)", background: "rgba(0,0,0,0.3)", color: "white", outline: "none", fontSize: 18 }}
          />
          <button onClick={unlock} style={{ width: "100%", marginTop: 20, padding: 18, borderRadius: 15, border: "none", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontSize: 18, cursor: "pointer", fontWeight: "bold" }}>Enter System</button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN CHAT INTERFACE ---------------- */
  return (
    <div 
      onMouseMove={handleDragMove} 
      onMouseUp={handleDragEnd} 
      style={{ minHeight: "100vh", background: "#050816", color: "white", overflow: "hidden", fontFamily: "Arial", position: "relative" }}
    >
      <style>{`
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes realisticBlink { 0%, 96%, 98%, 100% {transform: scaleY(1)} 97%, 99% {transform: scaleY(0.1)} }
        @keyframes pulseGlow { 0%, 100% {box-shadow: 0 0 20px rgba(59,130,246,0.4)} 50% {box-shadow: 0 0 50px rgba(124,58,237,0.8)} }
        @keyframes float { 0%, 100% {transform: translateY(0)} 50% {transform: translateY(-5px)} }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      {/* HEADER WITH MODES */}
      <div style={{ padding: "20px 40px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(5,8,22,0.8)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <RealisticRobot size={45} />
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", background: "linear-gradient(to right, #fff, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Nova AI</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
              <span style={{ fontSize: 12, opacity: 0.6 }}>System Online</span>
            </div>
          </div>
        </div>

        {/* AI MODE SWITCHER */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4 }}>
          <button onClick={() => setAiMode("builder")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: aiMode === "builder" ? "rgba(255,255,255,0.1)" : "transparent", color: aiMode === "builder" ? "white" : "rgba(255,255,255,0.4)", fontWeight: aiMode === "builder" ? "bold" : "normal", transition: "all 0.3s" }}>
            🛠️ Website Builder
          </button>
          <button onClick={() => setAiMode("chat")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: aiMode === "chat" ? "rgba(255,255,255,0.1)" : "transparent", color: aiMode === "chat" ? "white" : "rgba(255,255,255,0.4)", fontWeight: aiMode === "chat" ? "bold" : "normal", transition: "all 0.3s" }}>
            💬 Super Chat
          </button>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "40px 20px 150px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "10vh", animation: "slideUpFade 0.8s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 30 }}><RealisticRobot size={120} /></div>
            <h2 style={{ fontSize: 42, marginBottom: 10 }}>How can I help you today?</h2>
            <p style={{ opacity: 0.5, fontSize: 18 }}>Current Mode: {aiMode === "builder" ? "Creating advanced websites" : "Answering all questions intelligently"}</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 30, display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", animation: "slideUpFade 0.4s ease-out forwards" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              {m.role === "assistant" ? <RealisticRobot size={32} /> : <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3b82f6", display: "flex", justifyContent: "center", alignItems: "center", fontSize: 12 }}>US</div>}
              <span style={{ fontSize: 13, opacity: 0.5 }}>{m.role === "assistant" ? "NOVA AI" : "YOU"}</span>
            </div>
            <div style={{ maxWidth: "80%", background: m.role === "assistant" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #2563eb, #4f46e5)", padding: "18px 24px", borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px", border: m.role === "assistant" ? "1px solid rgba(255,255,255,0.05)" : "none", fontSize: 16, lineHeight: 1.6, whiteSpace: "pre-wrap", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: 25, background: "linear-gradient(to top, rgba(5,8,22,1) 60%, rgba(5,8,22,0))", pointerEvents: "none" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 10, display: "flex", alignItems: "center", pointerEvents: "auto", backdropFilter: "blur(20px)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => !loading && setRobotMood("typing")}
            onBlur={() => !loading && setRobotMood("idle")}
            placeholder={aiMode === "builder" ? "Describe the website you want to generate..." : "Ask Nova AI anything..."}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "white", fontSize: 16, padding: "15px 20px" }}
          />
          <button onClick={sendMessage} disabled={loading} style={{ border: "none", padding: "14px 28px", borderRadius: 16, background: "white", color: "black", cursor: "pointer", fontSize: 16, fontWeight: "bold", transition: "all 0.2s" }}>
            {loading ? "Processing..." : "Send"}
          </button>
        </div>
      </div>

      {/* ---------------- SECRET ADMIN PASSWORD PROMPT ---------------- */}
      {showAdminLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "#111827", padding: 30, borderRadius: 20, border: "1px solid #ef4444", width: 400, animation: "slideUpFade 0.3s" }}>
            <h3 style={{ color: "#ef4444", margin: "0 0 15px 0" }}>⚠️ RESTRICTED AREA</h3>
            <p style={{ opacity: 0.7, marginBottom: 20, fontSize: 14 }}>Enter Admin Key to access Master Control Panel.</p>
            <input type="password" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdminAuth()} placeholder="Master Key..." style={{ width: "100%", padding: 15, borderRadius: 10, border: "none", background: "rgba(0,0,0,0.5)", color: "white", marginBottom: 15 }} autoFocus />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAdminLogin(false)} style={{ flex: 1, padding: 12, background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleAdminAuth} style={{ flex: 1, padding: 12, background: "#ef4444", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>Access</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- DRAGGABLE ADMIN PANEL ---------------- */}
      {isAdminAuth && (
        <div 
          style={{ position: "fixed", left: adminPos.x, top: adminPos.y, width: 600, background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, zIndex: 99, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", backdropFilter: "blur(20px)", overflow: "hidden", animation: "slideUpFade 0.3s" }}
        >
          {/* Header Draggable Area */}
          <div 
            onMouseDown={handleDragStart} 
            style={{ padding: "15px 20px", background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "grab", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px #ef4444" }}/>
              <span style={{ fontWeight: "bold", letterSpacing: 1, fontSize: 14 }}>MASTER CONTROL PANEL</span>
            </div>
            <button onClick={() => setIsAdminAuth(false)} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: 18 }}>×</button>
          </div>

          {/* Admin Content */}
          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: 15, borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ opacity: 0.5, fontSize: 12 }}>Online Users</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#10b981" }}>1,432</div>
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", padding: 15, borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ opacity: 0.5, fontSize: 12 }}>Sites Generated</div>
                <div style={{ fontSize: 24, fontWeight: "bold", color: "#3b82f6" }}>89,204</div>
              </div>
            </div>

            <h4 style={{ margin: "0 0 15px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 10 }}>User Management</h4>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {[
                { email: "admin@nova.ai", status: "Active", ip: "192.168.1.1" },
                { email: "user_992@gmail.com", status: "Online", ip: "10.0.0.45" },
                { email: "hacker@test.com", status: "Suspicious", ip: "Unknown" },
              ].map((u, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <div style={{ fontSize: 14 }}>{u.email}</div>
                    <div style={{ fontSize: 11, opacity: 0.5 }}>IP: {u.ip} • Status: {u.status}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ padding: "6px 12px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Edit</button>
                    <button style={{ padding: "6px 12px", background: "rgba(239,68,68,0.2)", color: "#f87171", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Ban</button>
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