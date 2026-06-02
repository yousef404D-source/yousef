"use client";

import { useState } from "react";

/* ===================== TYPES ===================== */
type Message = {
  role: "user" | "bot";
  text: string;
};

/* ===================== COMPONENT ===================== */
export default function NovaAI() {
  const [password, setPassword] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  const correctPassword = "nova123";

  /* ===================== VOICE TO TEXT ===================== */
  const startVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("المتصفح لا يدعم الصوت");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
    };

    recognition.start();
  };

  /* ===================== SEND MESSAGE ===================== */
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setTimeout(() => {
      const botMessage: Message = {
        role: "bot",
        text: "🤖 Nova AI: تم استلام رسالتك وتحليلها بنجاح...",
      };

      setMessages((prev) => [...prev, botMessage]);
    }, 700);
  };

  /* ===================== LOGIN SCREEN ===================== */
  if (!isAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">

        {/* Glow Background */}
        <div className="absolute w-[500px] h-[500px] bg-purple-600 blur-[120px] opacity-30 animate-pulse rounded-full"></div>

        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20 w-[340px] animate-fadeIn">

          <h1 className="text-2xl font-bold text-center mb-4">
            🔐 Nova AI Login
          </h1>

          <input
            type="password"
            placeholder="Enter Password"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full mt-4 p-3 bg-purple-600 rounded-lg hover:scale-105 transition"
            onClick={() => setIsAuth(password === correctPassword)}
          >
            دخول
          </button>

          {password && password !== correctPassword && (
            <p className="text-red-400 text-sm mt-2 text-center">
              ❌ Password incorrect
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ===================== MAIN UI ===================== */
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-purple-950 to-black text-white">

      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h1 className="font-bold text-lg">🤖 Nova AI</h1>
        <span className="text-white/40 text-sm">AI Chat System</span>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl max-w-[75%] animate-fadeIn ${
              msg.role === "user"
                ? "bg-purple-600 ml-auto"
                : "bg-white/10"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-white/10 flex gap-2 items-center">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 p-3 rounded-xl bg-black/40 border border-white/20 outline-none"
        />

        {/* 🎤 Voice */}
        <button
          onClick={startVoice}
          className="p-3 bg-blue-600 rounded-xl hover:scale-110 transition"
        >
          🎤
        </button>

        {/* SEND */}
        <button
          onClick={sendMessage}
          className="p-3 bg-purple-600 rounded-xl hover:scale-110 transition"
        >
          ➤
        </button>
      </div>
    </div>
  );
}