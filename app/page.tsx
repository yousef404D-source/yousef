"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Project = {
  id: number;
  idea: string;
  html: string;
  user_id: string;
};

export default function Home() {
  const [idea, setIdea] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>([]);

  // 🌙 DARK MODE
  const [darkMode, setDarkMode] =
    useState<boolean>(true);

  // 👤 USER ID
  const userId = "nova-user";

  // 📦 LOAD PROJECTS
  useEffect(() => {
    loadProjects();
  }, []);

  // 💾 LOAD SAVED PROJECTS
  async function loadProjects() {
    const { data, error } =
      await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("id", {
          ascending: false,
        });

    if (!error && data) {
      setProjects(data);
    }
  }

  // 💾 SAVE PROJECT
  async function saveProject(
    htmlData: string,
    ideaText: string
  ) {
    const newProject = {
      id: Date.now(),
      idea: ideaText,
      html: htmlData,
      user_id: userId,
    };

    await supabase
      .from("projects")
      .insert([newProject]);

    setProjects((prev) => [
      newProject,
      ...prev,
    ]);
  }

  // 🚀 GENERATE WEBSITE
  async function generate() {
    if (!idea.trim()) return;

    setLoading(true);

    try {

      // 🧠 Fake AI Delay
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );

      const res = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            idea,
          }),
        }
      );

      const data = await res.json();

      const result =
        data.html || "";

      setHtml(result);

      await saveProject(
        result,
        idea
      );

      setIdea("");

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // ⌨️ ENTER KEY
  function handleKeyDown(
    e: React.KeyboardEvent<
      HTMLTextAreaElement
    >
  ) {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      generate();
    }
  }

  return (
    <div
      className={
        darkMode
          ? "page dark"
          : "page light"
      }
    >

      {/* 🌙☀️ MODE BUTTON */}
      <button
        className="theme-btn"
        onClick={() =>
          setDarkMode(!darkMode)
        }
      >
        {darkMode
          ? "☀️"
          : "🌙"}
      </button>

      {/* 🌌 BACKGROUND */}
      <div className="bg">
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
      </div>

      {/* 🚀 HERO */}
      <div className="hero">

        <h1>
          ⚡ NOVA CLIP AI
        </h1>

        <p>
          Build futuristic websites
          with AI power
        </p>

        {/* 💬 CHAT BOX */}
        <div className="chat-box">

          <textarea
            value={idea}
            onChange={(e) =>
              setIdea(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Describe your dream website..."
          />

          <button
            onClick={generate}
            disabled={loading}
          >
            {loading
              ? "🧠 Thinking..."
              : "🚀 Generate"}
          </button>
        </div>

        {/* 🤖 THINKING */}
        {loading && (
          <div className="thinking">
            <div className="thinking-box">
              ⚡ AI analyzing...
            </div>

            <div className="thinking-box">
              🎨 Building UI...
            </div>

            <div className="thinking-box">
              🧠 Generating code...
            </div>
          </div>
        )}

        {/* 🖥️ PREVIEW */}
        {html && (
          <div className="preview">

            <div className="preview-top">
              <div className="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <p>
                Live Preview
              </p>
            </div>

            <iframe
              srcDoc={html}
              title="preview"
            />
          </div>
        )}

      </div>

      {/* 📂 PROJECTS */}
      <div className="projects">

        <h2>
          📂 Saved Projects
        </h2>

        {projects.length === 0 && (
          <p className="empty">
            No projects yet
          </p>
        )}

        {projects.map((p) => (
          <div
            key={p.id}
            className="project-card"
            onClick={() =>
              setHtml(p.html)
            }
          >
            {p.idea}
          </div>
        ))}
      </div>

      {/* 🎨 STYLES */}
      <style jsx>{`

        .page {
          min-height: 100vh;
          padding: 40px;
          font-family: Arial;
          transition: 0.3s;
          overflow-x: hidden;
          position: relative;
        }

        .dark {
          background: #020617;
          color: white;
        }

        .light {
          background: #f8fafc;
          color: black;
        }

        .theme-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 55px;
          height: 55px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          font-size: 22px;
          z-index: 999;
          background: white;
        }

        .bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
        }

        .orb {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          filter: blur(140px);
        }

        .orb1 {
          background: #2563eb;
          top: -100px;
          left: -100px;
          opacity: 0.3;
        }

        .orb2 {
          background: #7c3aed;
          bottom: -100px;
          right: -100px;
          opacity: 0.3;
        }

        .hero {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 900px;
          margin: auto;
        }

        h1 {
          font-size: 70px;
          margin-top: 60px;
        }

        p {
          opacity: 0.7;
          margin-top: -10px;
        }

        .chat-box {
          margin-top: 40px;
          background: rgba(15,23,42,0.7);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 20px;
          border-radius: 30px;
          backdrop-filter: blur(15px);
          animation: fadeUp 0.5s ease;
        }

        textarea {
          width: 100%;
          height: 160px;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          color: inherit;
          font-size: 18px;
        }

        button {
          margin-top: 20px;
          padding: 15px 30px;
          border: none;
          border-radius: 15px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
        }

        .thinking {
          margin-top: 25px;
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          animation: fadeUp 0.5s ease;
        }

        .thinking-box {
          background: rgba(255,255,255,0.08);
          padding: 12px 20px;
          border-radius: 15px;
        }

        .preview {
          margin-top: 40px;
          border-radius: 25px;
          overflow: hidden;
          animation: fadeUp 0.6s ease;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .preview-top {
          background: #111827;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .dots {
          position: absolute;
          left: 20px;
          display: flex;
          gap: 7px;
        }

        .dots span {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: white;
        }

        iframe {
          width: 100%;
          height: 700px;
          border: none;
          background: white;
        }

        .projects {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 50px auto;
        }

        .project-card {
          margin-top: 15px;
          padding: 18px;
          border-radius: 18px;
          cursor: pointer;
          background: rgba(255,255,255,0.08);
          transition: 0.3s;
        }

        .project-card:hover {
          transform: scale(1.02);
        }

        .empty {
          opacity: 0.5;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }

      `}</style>
    </div>
  );
}