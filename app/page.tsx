"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

/* ---------------- TYPES ---------------- */

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Project = {
  id: number;
  idea: string;
  html: string;
  user_id: string;
};

export default function Home() {
  const ADMIN_EMAIL = "yousefbaker505@gmail.com";

  /* ---------------- STATES ---------------- */

  const [isAdmin, setIsAdmin] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [started, setStarted] = useState(false);

  const [idea, setIdea] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const [html, setHtml] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  const userId = "nova-user";

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ---------------- ADMIN CHECK ---------------- */

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        loadLogs();
      }
    }

    checkAdmin();
  }, []);

  /* ---------------- LOAD LOGS ---------------- */

  async function loadLogs() {
    const { data } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLogs(data);
  }

  /* ---------------- LOAD PROJECTS ---------------- */

  async function loadProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("id", { ascending: false });

    if (data) setProjects(data);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  /* ---------------- SAVE PROJECT ---------------- */

  async function saveProject(htmlData: string, ideaText: string) {
    const newProject = {
      id: Date.now(),
      idea: ideaText,
      html: htmlData,
      user_id: userId,
    };

    await supabase.from("projects").insert([newProject]);
    setProjects((p) => [newProject, ...p]);
  }

  /* ---------------- AI GENERATION ---------------- */

  async function generateWebsite() {
    if (!idea.trim()) return;

    if (!started) setStarted(true);

    setMessages((p) => [...p, { role: "user", content: idea }]);
    setIdea("");
    setLoading(true);

    setMessages((p) => [
      ...p,
      { role: "assistant", content: "🧠 فهمت فكرتك..." },
    ]);

    setTimeout(() => {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "🎨 أحلل التصميم..." },
      ]);
    }, 500);

    setTimeout(() => {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "⚡ أبني الموقع..." },
      ]);
    }, 1000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();

      if (data.html) {
        setHtml(data.html);
        await saveProject(data.html, idea);

        setMessages((p) => [
          ...p,
          { role: "assistant", content: "✅ تم إنشاء الموقع!" },
        ]);
      }
    } catch (err) {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "❌ خطأ في التوليد" },
      ]);
    }

    setLoading(false);
  }

  /* ---------------- CONSOLE COMMAND (ad) ---------------- */

  useEffect(() => {
    (window as any).ad = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      console.log("🔎 checking admin...");

      if (!user) {
        console.log("❌ not logged in");
        return;
      }

      await new Promise((r) => setTimeout(r, 500));

      if (user.email === ADMIN_EMAIL) {
        console.log("🔥 ADMIN GRANTED");
        setIsAdmin(true);
        loadLogs();

        console.log("🚀 ADMIN PANEL OPENED");
      } else {
        console.log("❌ ACCESS DENIED");
      }
    };

    console.log("💡 type: ad (in console to open admin)");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- ADMIN PAGE ---------------- */

  if (isAdmin) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1f", color: "white", padding: 30 }}>
        <h1>🔥 ADMIN DASHBOARD</h1>

        <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
          <div style={card}>📁 Projects: {projects.length}</div>
          <div style={card}>📜 Logs: {logs.length}</div>
        </div>

        <h2 style={{ marginTop: 30 }}>📜 Logs</h2>

        {logs.map((log) => (
          <div key={log.id} style={logCard}>
            <p>💬 {log.prompt}</p>
            <p>📧 {log.email}</p>
            <p>⏰ {log.created_at}</p>
          </div>
        ))}
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: darkMode ? "#020617" : "#fff",
        color: darkMode ? "white" : "black",
        display: "flex",
        justifyContent: started ? "flex-start" : "center",
        alignItems: started ? "flex-start" : "center",
        paddingTop: started ? 40 : 0,
        transition: "0.5s",
      }}
    >
      <div style={{ width: started ? "100%" : "60%", maxWidth: 900 }}>
        
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>🚀 AI BUILDER</h1>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        {/* CHAT */}
        <div style={{ marginTop: 20 }}>
          {messages.map((m, i) => (
            <div key={i} style={bubble(m.role)}>
              {m.role}: {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="اكتب فكرتك..."
          style={input}
        />

        <button onClick={generateWebsite} disabled={loading} style={btn}>
          {loading ? "AI thinking..." : "Generate 🚀"}
        </button>

        {/* PREVIEW */}
        {html && (
          <iframe
            srcDoc={html}
            style={{ width: "100%", height: "100vh", marginTop: 20 }}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const card = {
  padding: 15,
  background: "rgba(255,255,255,0.05)",
  borderRadius: 10,
};

const logCard = {
  padding: 10,
  marginTop: 10,
  background: "rgba(255,255,255,0.05)",
};

const bubble = (role: string) => ({
  padding: 10,
  marginBottom: 8,
  borderRadius: 10,
  background: role === "user" ? "#3b82f6" : "rgba(255,255,255,0.08)",
});

const input = {
  width: "100%",
  height: 100,
  marginTop: 20,
  padding: 10,
};

const btn = {
  width: "100%",
  marginTop: 10,
  padding: 12,
  background: "#3b82f6",
  color: "white",
};