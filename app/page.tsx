"use client";

import { useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  async function generate() {
    if (!idea.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });

      const data = await res.json();
      setOutput(data.result || "");

    } catch (err) {
      console.error(err);
      setOutput("ERROR");
    }

    setLoading(false);
  }

  return (
    <div className="page">

      {/* BACKGROUND */}
      <div className="grid-bg"></div>

      {/* TOP BAR */}
      <header className="topbar">
        <div className="logo">
          <div className="logo-mark"></div>
          <span className="logo-text">NOVA CLIP</span>
        </div>

        <div className="ai-badge">
          Nova Clip AI Engine
        </div>
      </header>

      {/* MAIN */}
      <main className="hero">

        <h1>Where ideas become reality</h1>

        <p>Build apps and websites using AI instantly</p>

        {/* PROMPT BOX */}
        <div className="prompt-box">

          <textarea
            placeholder="Describe what you want to build..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generate();
              }
            }}
          />

          <div className="prompt-bottom">

            <div className="bottom-left">
              {/* 🔥 فقط هذا التعديل */}
              <button className="model-btn">Groq AI</button>
            </div>

            <div className="bottom-right">

              <button
                className={`send-btn ${loading ? "loading" : ""}`}
                onClick={generate}
              >
                {loading ? (
                  <div className="spinner"></div>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M13 5l7 7-7 7" />
                  </svg>
                )}
              </button>

            </div>

          </div>
        </div>

        {/* OUTPUT */}
        {output && (
          <div className="result-preview">
            {output.includes("<html") ? (
              <iframe srcDoc={output} />
            ) : (
              <pre>{output}</pre>
            )}
          </div>
        )}

      </main>

      {/* STYLE */}
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0b0b0f;
          color: white;
          font-family: Inter, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.4;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 30px;
          position: relative;
          z-index: 10;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-mark {
          width: 14px;
          height: 14px;
          border-radius: 4px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          box-shadow: 0 0 10px rgba(59,130,246,0.5);
        }

        .logo-text {
          font-weight: 800;
          letter-spacing: 1px;
        }

        .ai-badge {
          font-size: 12px;
          color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 12px;
          border-radius: 999px;
        }

        .hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 90px;
          position: relative;
          z-index: 10;
        }

        h1 {
          font-size: 64px;
          text-align: center;
          margin-bottom: 10px;
        }

        p {
          color: #9ca3af;
          text-align: center;
          margin-bottom: 30px;
        }

        .prompt-box {
          width: 800px;
          background: #14141b;
          border-radius: 20px;
          padding: 18px;
          border: 1px solid rgba(255,255,255,0.08);
        }

        textarea {
          width: 100%;
          height: 120px;
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 16px;
          resize: none;
        }

        .prompt-bottom {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }

        .model-btn {
          background: #20202a;
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          padding: 8px 14px;
          border-radius: 999px;
        }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #e5e7eb);
          color: #0b0b0f;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .result-preview {
          width: 800px;
          margin-top: 20px;
          background: #14141b;
          border-radius: 20px;
          padding: 12px;
        }

        iframe {
          width: 100%;
          height: 500px;
          border: none;
        }

        pre {
          white-space: pre-wrap;
          color: #d1d5db;
        }

        @media (max-width: 900px) {
          .prompt-box, .result-preview {
            width: 95%;
          }

          h1 {
            font-size: 40px;
          }
        }
      `}</style>

    </div>
  );
}