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
  /* ---------------- SECURITY ---------------- */
  const ADMIN_EMAIL = "yousefbaker505@gmail.com";
  const SITE_PASSWORD = "yousefyousefyousef505";

  const [access, setAccess] = useState(false);
  const [password, setPassword] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);

  /* ---------------- CHAT ---------------- */
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  /* ---------------- LOGS / AI MEMORY ---------------- */
  const [logs, setLogs] = useState<Log[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- ADMIN CONSOLE ---------------- */
  useEffect(() => {
    (window as any).ad = () => {
      const email = prompt("Admin Email:");

      if (email?.trim().toLowerCase() === ADMIN_EMAIL) {
        setIsAdmin(true);
        alert("🔥 Admin Mode Activated");
      } else {
        alert("❌ Access Denied");
      }
    };
  }, []);

  /* ---------------- PASSWORD ---------------- */
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
      (a.split("@")[1] === b.split("@")[1] ? 40 : 0) +
      (a[0] === b[0] ? 20 : 0) +
      (a.length === b.length ? 20 : 0) +
      (a.includes("admin") || b.includes("admin") ? 20 : 0);

    alert(
      `🔍 Account Similarity Score: ${score}/100\n\n${
        score > 60 ? "⚠️ High similarity detected" : "✅ Low similarity"
      }`
    );
  }

  /* ---------------- SEND MESSAGE (STABLE AI FLOW) ---------------- */
  async function send() {
    if (!input.trim()) return;

    setExpanded(true);
    setLoading(true);

    const userText = input;

    setMessages((p) => [...p, { role: "user", content: userText }]);
    setInput("");

    // fake thinking (no freeze bug)
    setMessages((p) => [
      ...p,
      { role: "assistant", content: "🧠 Thinking..." },
    ]);

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      // remove thinking safely
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
            content: "🚀 Project generated successfully!",
          },
        ]);
      }

      // logs system
      setLogs((p) => [
        {
          email: "user",
          message: userText,
          time: Date.now(),
        },
        ...p,
      ]);
    } catch (e) {
      setMessages((p) => [
        ...p.filter((m) => m.content !== "🧠 Thinking..."),
        { role: "assistant", content: "❌ AI Server Error" },
      ]);
    }

    setLoading(false);
  }

  /* ---------------- ADMIN PANEL ---------------- */
  if (isAdmin) {
    return (
      <div style={{ padding: 30, background: "#000", color: "white" }}>
        <h1>🔥 ADMIN DASHBOARD</h1>

        <button onClick={compareAccounts}>
          🔍 Compare Accounts
        </button>

        <h3 style={{ marginTop: 20 }}>📜 Logs</h3>

        {logs.map((l, i) => (
          <div key={i} style={{ marginTop: 10, opacity: 0.8 }}>
            {l.message}
          </div>
        ))}

        <button
          onClick={() => setIsAdmin(false)}
          style={{ marginTop: 20 }}
        >
          Exit Admin
        </button>
      </div>
    );
  }

  /* ---------------- LOCK SCREEN ---------------- */
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
          <h2>🔐 Nova AI</h2>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginTop: 10,
              borderRadius: 8,
            }}
          />

          <button
            onClick={unlock}
            style={{
              width: "100%",
              marginTop: 10,
              padding: 10,
              background: "#3b82f6",
              borderRadius: 8,
              color: "white",
            }}
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI (PREMIUM DARK CHAT) ---------------- */
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
        <h2 style={{ textAlign: "center" }}>⚡ NOVA AI</h2>

        {/* CHAT */}
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 10,
                  margin: "6px 0",
                  borderRadius: 12,
                  background:
                    m.role === "user" ? "#3b82f6" : "#111",
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
          placeholder="Type your idea..."
          style={{
            width: "100%",
            height: 90,
            marginTop: 15,
            padding: 10,
            borderRadius: 10,
            background: "#111",
            color: "white",
            border: "1px solid #333",
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
          {loading ? "Thinking..." : "Send"}
        </button>
      </motion.div>
    </div>
  );
}