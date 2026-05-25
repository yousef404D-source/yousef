"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Project = {
  id: number;
  title: string;
  html: string;
};

export default function Page() {
  const ADMIN_EMAIL = "yousefbaker505@gmail.com";
  const SITE_PASSWORD = "nova123"; // 🔐 الباسورد رجعناه

  const [access, setAccess] = useState(false);
  const [password, setPassword] = useState("");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [started, setStarted] = useState(false);
  const [html, setHtml] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- ADMIN CONSOLE ---------------- */
  useEffect(() => {
    (window as any).ad = () => {
      const email = prompt("Admin Email:");

      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
        alert("🔥 Admin Mode Activated");
      } else {
        alert("❌ Access Denied");
      }
    };
  }, []);

  /* ---------------- LOGIN ---------------- */
  function unlock() {
    if (password === SITE_PASSWORD) {
      setAccess(true);
    } else {
      alert("❌ Wrong Password");
    }
  }

  /* ---------------- SEND ---------------- */
  async function send() {
    if (!input.trim()) return;

    setStarted(true);

    setMessages((p) => [...p, { role: "user", content: input }]);
    setInput("");
    setLoading(true);

    setMessages((p) => [
      ...p,
      { role: "assistant", content: "🧠 Thinking..." },
    ]);

    const res = await fetch("/api/nova", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    if (data.type === "chat") {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: data.reply },
      ]);
    }

    if (data.type === "project") {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "🚀 Building project..." },
      ]);

      setHtml(data.html);

      setProjects((p) => [
        {
          id: Date.now(),
          title: data.spec.title,
          html: data.html,
        },
        ...p,
      ]);

      setMessages((p) => [
        ...p,
        { role: "assistant", content: "✅ Done!" },
      ]);
    }

    setLoading(false);
  }

  /* ---------------- LOCK SCREEN ---------------- */
  if (!access) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0b1220",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: 320,
            padding: 25,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 16,
            textAlign: "center",
            color: "white",
          }}
        >
          <h2>🔐 Nova AI</h2>

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 15,
              borderRadius: 8,
              outline: "none",
            }}
          />

          <button
            onClick={unlock}
            style={{
              width: "100%",
              marginTop: 15,
              padding: 10,
              background: "#3b82f6",
              color: "white",
              borderRadius: 8,
              border: "none",
            }}
          >
            Unlock
          </button>
        </motion.div>
      </div>
    );
  }

  /* ---------------- ADMIN ---------------- */
  if (isAdmin) {
    return (
      <div style={{ padding: 30, background: "#050816", color: "white" }}>
        <h1>🔥 ADMIN PANEL</h1>
        <p>AI Active</p>
        <p>Builder Running</p>

        <button
          onClick={() => setIsAdmin(false)}
          style={{ marginTop: 20, padding: 10 }}
        >
          Exit Admin
        </button>
      </div>
    );
  }

  /* ---------------- MAIN UI (FIXED DESIGN) ---------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        animate={{ width: started ? "100%" : 520 }} // 🔥 مش عريض
        transition={{ duration: 0.4 }}
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 20,
          padding: 20,
          color: "white",
          maxWidth: 900,
        }}
      >
        <h2 style={{ textAlign: "center" }}>🤖 Nova AI</h2>

        {/* CHAT */}
        <div style={{ marginTop: 15, maxHeight: 400, overflowY: "auto" }}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === "user" ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  padding: 10,
                  margin: "6px 0",
                  borderRadius: 12,
                  background:
                    m.role === "user"
                      ? "#3b82f6"
                      : "rgba(255,255,255,0.08)",
                }}
              >
                {m.content}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب فكرتك..."
          style={{
            width: "100%",
            height: 90,
            marginTop: 15,
            padding: 10,
            borderRadius: 10,
          }}
        />

        <button
          onClick={send}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 10,
            padding: 12,
            background: "#3b82f6",
            borderRadius: 10,
            color: "white",
            border: "none",
          }}
        >
          {loading ? "Thinking..." : "Send 🚀"}
        </button>

        {/* PREVIEW */}
        {html && (
          <iframe
            srcDoc={html}
            style={{
              width: "100%",
              height: "80vh",
              marginTop: 15,
              borderRadius: 12,
              border: "none",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}