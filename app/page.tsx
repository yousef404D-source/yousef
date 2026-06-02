"use client";

import { useState } from "react";

export default function NovaAI() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);

  const [messages, setMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);

  const [input, setInput] = useState("");

  const correctPassword = "nova123";

  // 🎤 Voice to Text
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

  // 📩 إرسال رسالة
  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", text: input },
    ];

    setMessages(newMessages);
    setInput("");

    // 🤖 رد AI وهمي
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "🤖 Nova AI: تم استلام رسالتك وتحليلها بنجاح...",
        },
      ]);
    }, 700);
  };

  // 🔐 شاشة الباسورد
  if (!isAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white overflow-hidden relative">

        {/* خلفية أنيميشن */}
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

  // 🤖 واجهة الشات
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-purple-950 to-black text-white">

      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between">
        <h1 className="font-bold text-lg">🤖 Nova AI</h1>
        <span className="text-white/50 text-sm">AI Chat System</span>
      </div>

      {/* Messages */}
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

      {/* Input */}
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

        {/* Send */}
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