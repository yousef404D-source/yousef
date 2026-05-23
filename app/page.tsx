"use client";
import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // استدعاء API الذكاء الاصطناعي
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: input }),
    });
    const data = await res.json();

    const aiReply = { role: "assistant", content: data.result };
    setMessages([...newMessages, aiReply]);

    // إذا الرد فيه كود HTML → عرضه في الـ Preview
    if (data.result.includes("<html")) {
      setPreview(data.result);
    }
  };

  return (
    <div className={`page ${messages.length > 0 ? "workspace" : "chat-only"}`}>
      {/* CHAT AREA */}
      <div className="chat">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.role === "assistant" && m.content.includes("<html") ? (
                <span>Generated website preview updated →</span>
              ) : (
                <p>{m.content}</p>
              )}
            </div>
          ))}
        </div>

        <div className="input-box">
          <textarea
            placeholder="Describe your idea..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>

      {/* PREVIEW AREA */}
      {preview && (
        <div className="preview">
          <div className="browser-bar">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="url">nova-clip.ai/preview</span>
          </div>
          <iframe srcDoc={preview} />
        </div>
      )}

      {/* STYLE */}
      <style jsx>{`
        .page {
          display: flex;
          min-height: 100vh;
          background: #0b0b0f;
          color: white;
          font-family: Inter, Geist, sans-serif;
          transition: all 0.6s ease;
        }
        .chat-only {
          justify-content: center;
          align-items: center;
        }
        .workspace {
          display: grid;
          grid-template-columns: 400px 1fr;
        }
        .chat {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        .msg {
          margin-bottom: 15px;
          line-height: 1.5;
        }
        .msg.user {
          text-align: right;
          color: #3b82f6;
        }
        .msg.assistant {
          text-align: left;
          color: #d1d5db;
        }
        .input-box {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        textarea {
          width: 100%;
          height: 80px;
          background: #14141b;
          border: none;
          outline: none;
          color: white;
          font-size: 16px;
          border-radius: 12px;
          padding: 12px;
          resize: none;
          margin-bottom: 10px;
        }
        button {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          color: white;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        button:hover {
          transform: scale(1.05);
        }
        .preview {
          background: #0f0f15;
          display: flex;
          flex-direction: column;
        }
        .browser-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #14141b;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #facc15; }
        .dot.green { background: #22c55e; }
        .url {
          margin-left: 20px;
          font-size: 12px;
          color: #9ca3af;
        }
        iframe {
          flex: 1;
          border: none;
        }
      `}</style>
    </div>
  );
}
