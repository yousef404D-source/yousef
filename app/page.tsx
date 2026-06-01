"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Send, Lock, X, Mic, Image, Monitor, Tablet, Smartphone, Eye, Layout, Sparkles, Sliders, RefreshCw, Cpu
} from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string; previewUrl?: string; };

export default function NovaAI() {
  const [authStep, setAuthStep] = useState<"AUTH" | "WORKSPACE">("AUTH");
  const [password, setPassword] = useState("");
  const [wrongPass, setWrongPass] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenSize, setScreenSize] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showQuestions, setShowQuestions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const unlock = () => {
    if (password === "1234") { // استبدل كلمة المرور هنا بما يناسبك
      setAuthStep("WORKSPACE");
    } else {
      setWrongPass(true);
      setTimeout(() => setWrongPass(false), 800);
    }
  };

  const handleAction = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setInput("");

    if (userMsg.toLowerCase().includes("build") || userMsg.includes("صمم") || userMsg.includes("موقع")) {
      setShowQuestions(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/nova", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: userMsg }) });
      const data = await res.json();
      setMessages(prev => [...prev, { id: "ass-" + Date.now(), role: "assistant", content: data.code || "Done!" }]);
    } catch {
      setMessages(prev => [...prev, { id: "err", role: "assistant", content: "Error connecting to server." }]);
    }
    setLoading(false);
  };

  const deployWebsite = () => {
    setShowQuestions(false);
    setLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: "dep-" + Date.now(), 
        role: "assistant", 
        content: "🚀 Deployed successfully!", 
        previewUrl: "https://example.com" // رابط المعاينة التجريبي
      }]);
      setLoading(false);
    }, 2000);
  };

  if (authStep === "AUTH") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-slate-100 p-4">
        <div className={`w-full max-w-sm bg-slate-950 p-6 rounded-2xl border text-center transition-all ${wrongPass ? 'border-red-500 shadow-lg' : 'border-slate-800'}`}>
          <h1 className="text-lg font-bold mb-4 tracking-wider">NOVA ENTER</h1>
          <input type="password" placeholder="••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && unlock()} className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-sm outline-none focus:border-indigo-500 mb-4" />
          <button onClick={unlock} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl tracking-wide transition">SUBMIT</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-200 flex flex-col font-sans">
      <header className="px-6 py-4 border-b border-slate-900 bg-slate-950 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-bold uppercase tracking-wider">Nova Workspace v2</span>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center gap-1"><Sliders className="w-3.5 h-3.5" /> Settings</button>
      </header>

      {/* تقسيم الشاشة بالتساوي 50% لكل جانب لمنع الضيق والتداخل */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 overflow-hidden">
        
        {/* قسم الشات (اليسار) */}
        <div className="border-r border-slate-900 bg-slate-950/20 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-28">
            {messages.length === 0 && (
              <div className="text-center py-20 max-w-xs mx-auto text-slate-500 text-xs leading-relaxed">
                Type your command to build a layout or ask a question. Everything is spaced cleanly.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.role === "assistant" ? "items-start" : "items-end"}`}>
                <span className="text-[9px] font-mono text-slate-500 mb-1 uppercase">{m.role}</span>
                <div className={`max-w-[85%] p-3.5 text-sm rounded-xl border ${m.role === "assistant" ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-indigo-600/10 border-indigo-500/30 text-indigo-200"}`}>{m.content}</div>
              </div>
            ))}
            {loading && <div className="text-xs font-mono text-indigo-400 animate-pulse flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> System compiling...</div>}
            <div ref={bottomRef} />
          </div>

          {/* الحاوية السفلية للإدخال */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-900">
            {showSettings && (
              <div className="mb-3 p-3 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-500 block mb-1">Engine</span><select className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-white outline-none"><option>Next.js 14</option><option>Vite React</option></select></div>
                <div><span className="text-slate-500 block mb-1">Style</span><select className="w-full p-1.5 bg-slate-950 border border-slate-800 rounded text-white outline-none"><option>Bento Grid</option><option>Minimal SaaS</option></select></div>
              </div>
            )}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1.5 focus-within:border-indigo-500 transition">
              <input type="text" placeholder="Type command to launch deployment..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAction()} className="flex-1 bg-transparent border-none outline-none text-xs px-2 text-white" />
              <button onClick={handleAction} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"><Send className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        {/* قسم المعاينة (اليمين) */}
        <div className="bg-slate-950 flex flex-col overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-900 flex justify-between items-center text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> LIVE VIEWPORT</span>
            <div className="flex bg-slate-900 p-1 border border-slate-800 rounded-lg">
              <button onClick={() => setScreenSize("desktop")} className={`p-1 rounded ${screenSize === "desktop" ? "bg-slate-800 text-indigo-400" : ""}`}><Monitor className="w-3.5 h-3.5" /></button>
              <button onClick={() => setScreenSize("tablet")} className={`p-1 rounded ${screenSize === "tablet" ? "bg-slate-800 text-indigo-400" : ""}`}><Tablet className="w-3.5 h-3.5" /></button>
              <button onClick={() => setScreenSize("mobile")} className={`p-1 rounded ${screenSize === "mobile" ? "bg-slate-800 text-indigo-400" : ""}`}><Smartphone className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <div className="flex-1 p-4 bg-slate-900/10 flex items-center justify-center overflow-auto">
            <div className="bg-slate-950 border border-slate-900 h-full rounded-xl flex flex-col items-center justify-center transition-all shadow-inner overflow-hidden" style={{ width: screenSize === "desktop" ? "100%" : screenSize === "tablet" ? "600px" : "360px" }}>
              {messages.filter(m => m.previewUrl).length > 0 ? (
                <iframe src={messages.filter(m => m.previewUrl).slice(-1)[0].previewUrl} className="w-full h-full border-none" />
              ) : (
                <div className="text-center p-6 text-slate-600 font-mono text-xs space-y-2">
                  <Layout className="w-6 h-6 mx-auto text-slate-800" />
                  <p>Awaiting Compilation Blueprint Execution.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* نافذة الأسئلة المنبثقة */}
      {showQuestions && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center"><span className="text-xs font-mono text-indigo-400 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> SPECIFICATIONS</span><button onClick={() => setShowQuestions(false)}><X className="w-4 h-4" /></button></div>
            <h3 className="text-xs font-bold text-slate-200">Select preferred layout template direction:</h3>
            <div className="space-y-2">
              <button onClick={deployWebsite} className="w-full text-left p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs text-slate-300 transition">✨ Futuristic Dark Cyber Theme</button>
              <button onClick={deployWebsite} className="w-full text-left p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-indigo-500 text-xs text-slate-300 transition">💼 Clean Minimal Corporate White</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}