"use client";
import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ProjectFiles = {
  "index.html": string;
  "style.css": string;
  "app.js": string;
};

export default function Workspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [files, setFiles] = useState<ProjectFiles>({
    "index.html": "",
    "style.css": "",
    "app.js": "",
  });

  const [activeTab, setActiveTab] =
    useState<keyof ProjectFiles>("index.html");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const buildPreview = (
    html: string,
    css: string,
    js: string
  ) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}<\/script>
      </body>
      </html>
    `;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    setInput("");
    setThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: userMessage,
        }),
      });

      const data = await res.json();

      setThinking(false);
      setExpanded(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Project generated successfully.",
        },
      ]);

      let parsed;

      try {
        parsed = JSON.parse(data.result);
      } catch {
        parsed = {
          files: {
            "index.html": data.result,
            "style.css": "",
            "app.js": "",
          },
        };
      }

      const html =
        parsed?.files?.["index.html"] || "";

      const css =
        parsed?.files?.["style.css"] || "";

      const js =
        parsed?.files?.["app.js"] || "";

      setFiles({
        "index.html": html,
        "style.css": css,
        "app.js": js,
      });

      setLoadingPreview(true);

      setTimeout(() => {
        const finalPreview = buildPreview(
          html,
          css,
          js
        );

        const iframe =
          document.getElementById(
            "preview-frame"
          ) as HTMLIFrameElement;

        if (iframe) {
          iframe.srcdoc = finalPreview;
        }

        setLoadingPreview(false);
      }, 1200);
    } catch (err) {
      console.error(err);

      setThinking(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Generation failed. Please try again.",
        },
      ]);
    }
  };

  return (
    <div
      className={`page ${
        expanded ? "workspace" : "centered"
      }`}
    >
      <div className="grid-bg"></div>
      <div className="ambient-light"></div>

      {/* Sidebar */}
      {expanded && (
        <div className="sidebar glass">
          <div>
            <h2 className="logo">NOVA</h2>
            <p className="sub">
              AI Architect Workspace
            </p>
          </div>

          <div className="project-section">
            <h4>Projects</h4>

            <div className="project-card">
              SaaS Platform
            </div>

            <div className="project-card">
              AI Dashboard
            </div>

            <div className="project-card">
              Startup Landing
            </div>
          </div>

          <div className="file-tree">
            <h4>Files</h4>

            {Object.keys(files).map((file) => (
              <div
                key={file}
                className={`file ${
                  activeTab === file
                    ? "active-file"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    file as keyof ProjectFiles
                  )
                }
              >
                {file}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="chat glass">
        <div className="messages">
          {messages.length === 0 && (
            <div className="hero-state">
              <h1>
                Build production-ready AI
                applications
              </h1>

              <p>
                Generate fullstack apps,
                dashboards, SaaS platforms
                and modern websites.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`msg ${m.role}`}
            >
              {m.content}
            </div>
          ))}

          {thinking && (
            <div className="thinking">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        <div className="input-box">
          <textarea
            placeholder="Describe your idea..."
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage}>
            Generate
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      {expanded && (
        <div className="preview glass">
          <div className="browser-bar">
            <div className="dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>

            <div className="url">
              nova-ai/preview
            </div>

            <button className="deploy-btn">
              Deploy
            </button>
          </div>

          <div className="tabs">
            {Object.keys(files).map((file) => (
              <div
                key={file}
                className={`tab ${
                  activeTab === file
                    ? "active-tab"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    file as keyof ProjectFiles
                  )
                }
              >
                {file}
              </div>
            ))}
          </div>

          <div className="editor-wrapper">
            <div className="editor">
              <pre>{files[activeTab]}</pre>
            </div>

            <div className="live-preview">
              {loadingPreview ? (
                <div className="loading-preview">
                  Rendering preview...
                </div>
              ) : (
                <iframe id="preview-frame" />
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #07070a;
          color: white;
          font-family: Inter, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .centered {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .workspace {
          display: grid;
          grid-template-columns: 260px 420px 1fr;
        }

        .grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(
              rgba(255, 255, 255, 0.03)
                1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.03)
                1px,
              transparent 1px
            );
          background-size: 40px 40px;
          z-index: 0;
        }

        .ambient-light {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(
              circle at 30% 30%,
              rgba(59, 130, 246, 0.12),
              transparent 40%
            ),
            radial-gradient(
              circle at 70% 70%,
              rgba(139, 92, 246, 0.12),
              transparent 40%
            );
          z-index: 0;
        }

        .glass {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-right: 1px solid
            rgba(255, 255, 255, 0.05);
        }

        .sidebar {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .logo {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }

        .sub {
          color: #888;
          margin-top: 6px;
          font-size: 13px;
        }

        .project-section h4,
        .file-tree h4 {
          color: #999;
          margin-bottom: 14px;
        }

        .project-card {
          background: rgba(255,255,255,0.04);
          padding: 14px;
          border-radius: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: 0.3s;
        }

        .project-card:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }

        .file {
          padding: 10px;
          border-radius: 10px;
          cursor: pointer;
          margin-bottom: 8px;
          color: #aaa;
        }

        .file:hover,
        .active-file {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        .chat {
          display: flex;
          flex-direction: column;
          height: 100vh;
          padding: 30px;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
        }

        .hero-state {
          margin-top: 30%;
        }

        .hero-state h1 {
          font-size: 42px;
          line-height: 1.1;
          max-width: 600px;
        }

        .hero-state p {
          color: #888;
          margin-top: 20px;
          max-width: 520px;
          font-size: 16px;
        }

        .msg {
          margin-bottom: 16px;
          padding: 14px 18px;
          border-radius: 14px;
          width: fit-content;
          max-width: 90%;
          white-space: pre-wrap;
        }

        .msg.user {
          margin-left: auto;
          background: #2563eb;
        }

        .msg.assistant {
          background: rgba(255,255,255,0.06);
        }

        .thinking {
          display: flex;
          gap: 8px;
          padding: 12px;
        }

        .thinking span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #aaa;
          animation: bounce 1.2s infinite;
        }

        .thinking span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .thinking span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }

          40% {
            transform: scale(1);
          }
        }

        .input-box {
          display: flex;
          gap: 14px;
          margin-top: 20px;
        }

        textarea {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: none;
          border-radius: 16px;
          padding: 16px;
          color: white;
          resize: none;
          min-height: 60px;
          outline: none;
          font-size: 15px;
        }

        button {
          background: linear-gradient(
            135deg,
            #2563eb,
            #7c3aed
          );
          border: none;
          color: white;
          border-radius: 16px;
          padding: 0 24px;
          cursor: pointer;
          transition: 0.3s;
        }

        button:hover {
          transform: scale(1.04);
        }

        .preview {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .browser-bar {
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 18px;
          border-bottom: 1px solid
            rgba(255,255,255,0.05);
        }

        .dots {
          display: flex;
          gap: 8px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .red {
          background: #ef4444;
        }

        .yellow {
          background: #facc15;
        }

        .green {
          background: #22c55e;
        }

        .url {
          color: #888;
          font-size: 13px;
        }

        .deploy-btn {
          background: rgba(255,255,255,0.08);
          padding: 10px 16px;
          border-radius: 10px;
        }

        .tabs {
          display: flex;
          gap: 10px;
          padding: 14px;
          border-bottom: 1px solid
            rgba(255,255,255,0.05);
        }

        .tab {
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
          color: #999;
        }

        .active-tab,
        .tab:hover {
          background: rgba(255,255,255,0.08);
          color: white;
        }

        .editor-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          flex: 1;
          overflow: hidden;
        }

        .editor {
          overflow: auto;
          background: #0d0d12;
          padding: 20px;
          border-right: 1px solid
            rgba(255,255,255,0.05);
        }

        pre {
          color: #d1d5db;
          font-size: 13px;
          white-space: pre-wrap;
        }

        .live-preview {
          background: white;
          overflow: hidden;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }

        .loading-preview {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          background: white;
        }

        @media (max-width: 1200px) {
          .workspace {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: none;
          }

          .preview {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}