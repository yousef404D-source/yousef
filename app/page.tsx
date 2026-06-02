"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type DeployResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

export default function NovaAI() {
  // إنشاء مستمع Supabase خاص بمكونات العميل (Client Components)
  const supabase = createClientComponentClient();

  /* ---------------- STATES ---------------- */
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [robotMood, setRobotMood] = useState<"idle" | "thinking" | "happy" | "typing">("idle");

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- AUTH LOGIC (SUPABASE) ---------------- */
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setAuthorized(true);
      setLoadingAuth(false);
    };

    checkUser();

    // الاستماع الفوري لتغير حالة المستخدم (تسجيل دخول / خروج)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthorized(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function loginWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "",
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Auth error:", error);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMessages([]);
  }

  /* ---------------- SCROLL EFFECT ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- ACTION HANDLERS ---------------- */
  async function sendMessage() {
    if (!input.trim() || loading) return;

    const text = input;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    setRobotMood("thinking");

    const loadingSteps = [
      "Nova AI is thinking...",
      "Analyzing request...",
      "Generating modern UI...",
      "Deploying website...",
    ];

    for (const step of loadingSteps) {
      setMessages((prev) => [...prev, { role: "assistant", content: step }]);
      await new Promise((r) => setTimeout(r, 1400));
    }

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data: DeployResponse = await res.json();
      setRobotMood("happy");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.success
            ? `✅ Website generated successfully\n\n🌍 ${data.url}`
            : data.error || "Failed to generate website.",
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "AI system error." }]);
    }

    setLoading(false);
    setTimeout(() => setRobotMood("idle"), 3000);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") sendMessage();
  }

  /* ---------------- ANIMATION STYLES (SAFE INJECTION) ---------------- */
  const animationStyles = `
    @keyframes blink { 0%, 48%, 52%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.1); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
    @keyframes happy { 0%, 100% { transform: rotate(0); } 25% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
    @keyframes idle { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
    .animate-blink { animation: blink 4s infinite; }
    .animate-float { animation: float 2s infinite ease-in-out; }
    .animate-pulse-custom { animation: pulse 1.2s infinite; }
    .animate-happy { animation: happy 0.6s infinite ease-in-out; }
    .animate-idle { animation: idle 3s infinite ease-in-out; }
  `;

  /* ---------------- ROBOT FACE COMPONENT ---------------- */
  function RobotFace({ size = 70 }: { size?: number }) {
    const getBgGradient = () => {
      if (robotMood === "thinking") return "from-blue-600 to-purple-600";
      if (robotMood === "happy") return "from-emerald-500 to-cyan-500";
      if (robotMood === "typing") return "from-amber-500 to-red-500";
      return "from-slate-900 to-slate-800";
    };

    const getAnimationClass = () => {
      if (robotMood === "thinking") return "animate-float";
      if (robotMood === "happy") return "animate-happy";
      return "animate-idle";
    };

    return (
      <div
        className={`bg-gradient-to-br ${getBgGradient()} ${getAnimationClass()} relative shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500`}
        style={{ width: size, height: size, borderRadius: size * 0.35 }}
      >
        {/* EYES */}
        <div
          className="absolute bg-white animate-blink transition-all duration-300 rounded-full"
          style={{
            top: size * 0.32,
            left: size * 0.22,
            width: size * 0.12,
            height: robotMood === "typing" ? 3 : size * 0.12,
          }}
        />
        <div
          className="absolute bg-white animate-blink transition-all duration-300 rounded-full"
          style={{
            top: size * 0.32,
            right: size * 0.22,
            width: size * 0.12,
            height: robotMood === "typing" ? 3 : size * 0.12,
          }}
        />

        {/* MOUTH */}
        <div
          className="absolute bg-white left-1/2 bottom-[20%] -translate-x-1/2 rounded-full transition-all duration-300"
          style={{
            width: robotMood === "happy" ? size * 0.38 : size * 0.2,
            height: robotMood === "happy" ? size * 0.12 : 4,
          }}
        />

        {/* THINKING LIGHTS */}
        {robotMood === "thinking" && (
          <>
            <div className="absolute -top-2 -right-1 w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse-custom" />
            <div className="absolute -top-5 right-2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse-custom [animation-delay:0.4s]" />
          </>
        )}
      </div>
    );
  }

  /* ---------------- LOADING AUTH STATE ---------------- */
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#020617] flex justify-center items-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="opacity-60 text-sm tracking-wide">Establishing secure connection...</p>
        </div>
      </div>
    );
  }

  /* ---------------- SIGN IN INTERFACE ---------------- */
  if (!authorized) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#111827,#020617)] flex justify-center items-center p-6 text-white font-sans">
        <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
        <div className="w-full max-w-[460px] bg-white/[0.02] border border-white/[0.06] backdrop-blur-3xl rounded-[32px] p-10 text-center shadow-[0_0_100px_rgba(124,58,237,0.08)]">
          <div className="flex justify-center mb-6">
            <RobotFace size={90} />
          </div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            Nova AI
          </h1>
          <p className="opacity-50 mb-8 text-sm">
            Instant, futuristic AI website generation. Sign in to start building.
          </p>

          <button
            onClick={loginWithGoogle}
            className="w-full py-4 px-6 border border-white/10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] active:scale-[0.98] text-white font-medium flex items-center justify-center gap-3 transition-all duration-200 shadow-xl"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN APP INTERFACE ---------------- */
  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden font-sans">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

      {/* HEADER */}
      <header className="p-6 md:px-12 flex justify-between items-center border-b border-white/[0.03]">
        <div className="flex items-center gap-4">
          <RobotFace size={55} />
          <div>
            <h1 className="text-xl font-bold tracking-wide">Nova AI</h1>
            <p className="text-xs opacity-50">AI Website Builder</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs border border-white/10 rounded-xl bg-white/[0.02] hover:bg-red-500/20 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
        >
          Sign Out
        </button>
      </header>

      {/* HERO SECTION */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center mt-24 px-6">
          <RobotFace size={110} />
          <h1 className="text-5xl md:text-7xl font-black mt-8 tracking-tight bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
            Nova AI
          </h1>
          <p className="opacity-50 text-base md:text-lg mt-3 max-w-md">
            Describe your vision, and watch Nova assemble your custom production-ready platform.
          </p>
        </div>
      )}

      {/* CHAT CONTAINER */}
      <main className="w-full max-w-4xl mx-auto px-6 pt-8 pb-40">
        {messages.map((m, i) => (
          <div key={i} className="mb-8 last:mb-0">
            <div className="flex items-center gap-3 mb-2">
              {m.role === "assistant" && <RobotFace size={36} />}
              <span className="text-[11px] tracking-widest opacity-40 uppercase font-bold">
                {m.role === "assistant" ? "Nova Assistant" : "You"}
              </span>
            </div>
            <div
              className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap ${
                m.role === "assistant"
                  ? "bg-white/[0.03] border border-white/[0.04] p-6 rounded-2xl md:rounded-3xl"
                  : "pl-2 opacity-90"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </main>

      {/* FIXED CONTROL PANEL */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-[#050816]/90 backdrop-blur-lg border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto bg-white/[0.03] border border-white/[0.06] rounded-2xl p-3">
          <div className="flex gap-4 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => !loading && setRobotMood("typing")}
              onBlur={() => !loading && setRobotMood("idle")}
              disabled={loading}
              placeholder="Describe your dream website..."
              className="flex-1 bg-transparent border-none outline-none text-white text-base md:text-lg px-2 disabled:opacity-50 placeholder:text-slate-600"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:opacity-40 font-bold text-sm tracking-wide active:scale-95 transition-all"
            >
              {loading ? "Processing..." : "Generate"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}