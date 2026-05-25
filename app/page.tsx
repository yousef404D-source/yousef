"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Log = {
  email: string;
  message: string;
  time: number;
};

export default function Page() {
  /* ---------------- BRAND ---------------- */
  const APP_NAME = "⚡ NOVA CLIP";

  /* ---------------- AUTH ---------------- */
  const SITE_PASSWORD = "yousefyousefyousef505";
  const ADMIN_EMAIL = "yousefbaker505@gmail.com";

  const [access, setAccess] = useState(false);
  const [password, setPassword] = useState("");

  /* ---------------- CHAT ---------------- */
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /* ---------------- ADMIN ---------------- */
  const [isAdmin, setIsAdmin] = useState(false);

  /* ---------------- LOGS ---------------- */
  const [logs, setLogs] = useState<Log[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- ADMIN COMMAND ---------------- */
  useEffect(() => {
    (window as any).ad = () => {
      const email = prompt("Admin Email:");

      if (!email) return;

      const clean = email.trim().toLowerCase();

      if (clean === ADMIN_EMAIL) {
        setIsAdmin(true);
        alert("🔥 Admin Mode Activated");
      } else {
        console.error("ERROR: Unauthorized access");
        alert("ERROR: Unauthorized access");
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

  /* ---------------- SMART ACCOUNT COMPARISON ---------------- */
  function compareAccounts() {
    const a = prompt("First email:");
    const b = prompt("Second email:");

    if (!a || !b) return;

    const score =
      (a.split("@")[1] === b.split("@")[1] ? 50 : 0) +
      (a.length === b.length ? 20 : 0) +
      (a[0] === b[0] ? 20 : 0) +
      (a.includes("admin") || b.includes("admin") ? 10 : 0);

    alert(`🔍 Similarity Score: ${score}/100`);
  }

  /* ---------------- SEND AI MESSAGE ---------------- */
  async function send() {
    if (!input.trim()) return;

    setExpanded(true);
    setLoading(true);

    const text = input;

    setMessages((p) => [...p, { role: "user", content: text }]);
    setInput("");

    setMessages((p) => [
      ...p,
      { role: "assistant", content: "🧠 Thinking..." },
    ]);

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      setMessages((p) =>
        p.filter((m) => m.content !== "🧠 Thinking...")
      );

      if (data?.type === "chat") {
        setMessages((p) => [
          ...p,
          { role: "assistant", content: data.reply },
        ]);
      }

      if (data?.type === "project") {
        setMessages((p) => [
          ...p,
          {
            role: "assistant",
            content: "🚀 Website generated successfully!",
          },
        ]);
      }

      setLogs((p) => [
        {
          email: "user",
          message: text,
          time: Date.now(),
        },
        ...p,
      ]);
    } catch (e) {
      setMessages((p) => [
        ...p.filter((m) => m.content !== "🧠 Thinking..."),
        { role: "assistant", content: "❌ AI Error" },
      ]);
    }

    setLoading(false);
  }

  /* ---------------- ADMIN PANEL ---------------- */
  if (isAdmin) {
    return (
      <div style={{ padding: 30, background: "#000", color: "white" }}>
        <h1>🔥 {APP_NAME} ADMIN</h1>

        <button onClick={compareAccounts}>
          🔍 Compare Accounts
        </button>

        <h3 style={{ marginTop: 20 }}>📊 Logs</h3>

        {logs.map((l, i) => (
          <div key={i} style={{ opacity: 0.7 }}>
            {l.message}
          </div>
        ))}

        <button onClick={() => setIsAdmin(false)}>
          Exit Admin
        </button>
      </div>
    );
  }

  /* ---------------- LOGIN SCREEN ---------------- */
  if (!access) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 320,
            padding: 20,
            background: "#111",
            borderRadius: 12,
            color: "white",
          }}
        >
          <h2>{APP_NAME}</h2>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 10,
            }}
          />

          <button
            onClick={unlock}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 10,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI (COPILOT STYLE FIXED) ---------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        animate={{ width: expanded ? "100%" : 520 }}
        transition={{ duration: 0.4 }}
        style={{
          background: "#0a0a0a",
          border: "1px solid #222",
          borderRadius: 18,
          padding: 20,
          color: "white",
          maxWidth: 950,
        }}
      >
        <h2 style={{ textAlign: "center" }}>{APP_NAME}</h2>

        {/* CHAT */}
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background:
                      m.role === "user" ? "#3b82f6" : "#111",
                    maxWidth: "70%",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Nova Clip..."
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 20,
              background: "#111",
              border: "1px solid #333",
              color: "white",
            }}
          />

          <button
            onClick={send}
            style={{
              padding: "0 20px",
              borderRadius: 20,
              background: "#3b82f6",
              color: "white",
              border: "none",
            }}
          >
            Send
          </button>
        </div>
      </motion.div>
    </div>
  );
}