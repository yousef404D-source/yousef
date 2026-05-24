"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  // 🌙 THEME
  const [dark, setDark] = useState(true);

  // 💬 CHAT
  const [messages, setMessages] = useState([]);

  // 💾 PROJECTS
  const [projects, setProjects] = useState([]);

  const userId = "user-1";

  // 📦 LOAD PROJECTS (SAFE)
  useEffect(() => {
    const saved = localStorage.getItem(`projects-${userId}`);
    if (saved) {
      try {
        setProjects(JSON.parse(saved || "[]"));
      } catch {
        setProjects([]);
      }
    }
  }, []);

  // 💾 SAVE PROJECT (SAFE + FIXED STATE)
  function saveProject(htmlData, ideaText) {
    const newProject = {
      id: Date.now(),
      idea: ideaText,
      html: htmlData,
    };

    setProjects((prev) => {
      const updated = [newProject, ...prev];

      localStorage.setItem(
        `projects-${userId}`,
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  // ⏳ THINKING DELAY
  function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // 🚀 GENERATE AI (IMPROVED PROMPT)
  async function generate() {
    if (!idea.trim() || loading) return;

    setLoading(true);

    // 💬 user chat (animated)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type: "user",
        text: idea,
      },
    ]);

    try {
      // 🧠 thinking delay BEFORE request (better UX)
      await delay(2000);

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: `
You are a senior SaaS UI/UX designer and full-stack architect.

TASK:
- Build a complete production-ready website
- Do NOT copy or repeat user text
- Improve the idea creatively
- Add: hero, features, pricing, footer
- Make it modern, premium, responsive

Concept:
${idea}
          `,
        }),
      });

      const data = await res.json();
      const result = data.html || "";

      setHtml(result);

      // 💬 AI response chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          type: "ai",
          text: "✨ Website generated successfully",
        },
      ]);

      saveProject(result, idea);
      setIdea("");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // ⌨️ ENTER KEY
  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  }

  return (
    <div className={dark ? "dark page" : "light page"}>

      {/* 🌙☀️ THEME BUTTON */}
      <div className="themeBtn" onClick={() => setDark(!dark)}>
        {dark ? <FaSun /> : <FaMoon />}
      </div>

      {/* HERO */}
      <div className="hero">
        <h1>Nova Clip AI Builder</h1>

        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your website idea..."
        />

        <button onClick={generate} disabled={loading}>
          {loading ? "Thinking..." : "Enter"}
        </button>
      </div>

      {/* 💬 CHAT ANIMATION (FIXED KEYS) */}
      <div className="chatContainer">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={
                m.type === "user"
                  ? "chat user"
                  : "chat ai"
              }
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 🖥️ PREVIEW */}
      {html && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="preview"
        >
          <iframe srcDoc={html} />
        </motion.div>
      )}

      {/* 💾 PROJECTS */}
      <div className="projects">
        <h2>Saved Projects</h2>

        {projects.map((p) => (
          <div
            key={p.id}
            className="projectCard"
            onClick={() => setHtml(p.html)}
          >
            {p.idea}
          </div>
        ))}
      </div>

      {/* STYLE */}
      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 40px;
          transition: 0.3s;
        }

        .dark {
          background: #0b0f19;
          color: white;
        }

        .light {
          background: #f5f7ff;
          color: black;
        }

        /* 🌙☀️ BUTTON */
        .themeBtn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #222;
          color: white;
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
        }

        .hero {
          text-align: center;
          margin-top: 60px;
        }

        textarea {
          width: 60%;
          height: 120px;
          margin-top: 20px;
          padding: 15px;
          border-radius: 10px;
        }

        button {
          margin-top: 15px;
          padding: 12px 20px;
          border-radius: 10px;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* 💬 CHAT */
        .chatContainer {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .chat {
          width: 60%;
          padding: 15px;
          border-radius: 14px;
        }

        .user {
          background: rgba(59,130,246,0.2);
          align-self: flex-end;
        }

        .ai {
          background: rgba(34,197,94,0.2);
          align-self: flex-start;
        }

        /* 🖥️ PREVIEW */
        .preview iframe {
          width: 100%;
          height: 600px;
          border: none;
          margin-top: 40px;
        }

        /* 💾 PROJECTS */
        .projects {
          margin-top: 60px;
          text-align: center;
        }

        .projectCard {
          width: 60%;
          margin: 10px auto;
          padding: 12px;
          background: rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}