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

export default function Home() {
  const ADMIN_EMAIL = "yousefbaker505@gmail.com";

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

  /* ---------------- ADMIN (CONSOLE COMMAND) ---------------- */
  useEffect(() => {
    (window as any).ad = async () => {
      const email = prompt("Enter admin email:");
      if (email === ADMIN_EMAIL) {
        setIsAdmin(true);
        alert("✅ Admin Mode Activated");
      } else {
        alert("❌ Access Denied");
      }
    };
  }, []);

  /* ---------------- SEND MESSAGE ---------------- */
  async function send() {
    if (!input.trim()) return;

    setStarted(true);

    const userMsg: Message = { role: "user", content: input };

    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    // fake thinking animation
    setMessages((p) => [
      ...p,
      { role: "assistant", content: "🧠 Nova AI is thinking..." },
    ]);

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      /* ---------------- CHAT ---------------- */
      if (data.type === "chat") {
        setMessages((p) => [
          ...p,
          { role: "assistant", content: data.reply },
        ]);
      }

      /* ---------------- PROJECT ---------------- */
      if (data.type === "project") {
        setMessages((p) => [
          ...p,
          { role: "assistant", content: "🚀 Building project..." },
        ]);

        setHtml(data.html);

        const newProject = {
          id: Date.now(),
          title: data.spec.title,
          html: data.html,
        };

        setProjects((p) => [newProject, ...p]);

        setMessages((p) => [
          ...p,
          { role: "assistant", content: "✅ Project Ready!" },
        ]);
      }
    } catch (e) {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "❌ Error in Nova AI" },
      ]);
    }

    setLoading(false);
  }

  /* ---------------- ADMIN PANEL ---------------- */
  if (isAdmin) {
    return (
      <div style={{ padding: 30, background: "#050816", color: "white" }}>
        <h1>🔥 NOVA ADMIN PANEL</h1>

        <p>🤖 AI Status: ACTIVE</p>
        <p>🚀 Builder: RUNNING</p>

        <h2 style={{ marginTop: 20 }}>📁 Projects</h2>

        {projects.length === 0 && <p>No projects yet</p>}

        {projects.map((p) => (
          <div
            key={p.id}
            style={{
              padding: 10,
              marginTop: 10,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 10,
            }}
          >
            {p.title}
          </div>
        ))}

        <button
          onClick={() => setIsAdmin(false)}
          style={{ marginTop: 20, padding: 10 }}
        >
          Exit Admin
        </button>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        transition: "0.5s",
      }}
    >
      {/* SIDEBAR */}
      {started && (
        <motion.div
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          style={{
            width: 250,
            borderRight: "1px solid #222",
            padding: 10,
          }}
        >
          <h3>📁 Projects</h3>

          {projects.map((p) => (
            <div key={p.id} style={{ marginTop: 10 }}>
              ⚡ {p.title}
            </div>
          ))}
        </motion.div>
      )}

      {/* CHAT AREA */}
      <motion.div
        animate={{
          width: started ? "100%" : "60%",
          margin: "auto",
        }}
        transition={{ duration: 0.5 }}
        style={{ padding: 20 }}
      >
        {/* HEADER */}
        <h1 style={{ textAlign: "center" }}>🤖 Nova AI</h1>

        {/* CHAT BOX */}
        <div style={{ marginTop: 20 }}>
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: m.role === "user" ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  padding: 12,
                  margin: "8px 0",
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
          placeholder="اكتب فكرتك أو سوي موقع..."
          style={{
            width: "100%",
            height: 100,
            marginTop: 20,
            padding: 12,
            borderRadius: 12,
            outline: "none",
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
            color: "white",
            borderRadius: 12,
            border: "none",
          }}
        >
          {loading ? "Thinking..." : "Send 🚀"}
        </button>

        {/* WEBSITE PREVIEW */}
        {html && (
          <motion.iframe
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            srcDoc={html}
            style={{
              width: "100%",
              height: "100vh",
              marginTop: 20,
              borderRadius: 12,
              border: "none",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}