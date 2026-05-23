"use client";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [preview, setPreview] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const recognitionRef = useRef(null);

  // Speech-to-Text
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        setInput(event.results[0][0].transcript);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const startVoice = () => {
    if (recognitionRef.current) recognitionRef.current.start();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setExpanded(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea: input }),
    });
    const data = await res.json();

    const aiReply = { role: "assistant", content: data.result };
    setMessages([...newMessages, aiReply]);

    if (data.result.includes("<html")) {
      setPreview(data.result);
    }

    // Text-to-Speech
    const utterance = new SpeechSynthesisUtterance(aiReply.content);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className={`page ${darkMode ? "dark" : "light"} ${expanded ? "workspace" : "chat-only"}`}>
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
          <div className="actions">
            <button className="voice-btn" onClick={startVoice}>🎤</button>
            <input type="file" className="file-upload" />
            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>
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
          font-family: Inter, Geist, sans-serif;
          transition: all 0.6s ease;
        }
        .dark { background: #0b0b0f; color: white; }
        .light { background: #f9fafb; color: #111; }
        .chat-only { justify-content: center; align-items: center; }
        .workspace { display: grid; grid-template-columns: 400px 1fr; }
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
          animation: fadeIn 0.6s ease;
        }
        .msg { margin-bottom: 15px; line-height: 1.5; }
        .msg.user { text-align: right; color: #3b82f6; }
        .msg.assistant { text-align: left; color: #d1d5db; }
        .input-box { padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
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
          transition: all 0.3s ease;
        }
        .actions { display: flex; gap: 10px; }
        .send-btn, .voice-btn {
          width: 44px; height: 44px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          color: white;
          transition: transform 0.2s ease;
        }
        .send-btn:hover, .voice-btn:hover { transform: scale(1.1); }
        .file-upload { color: #9ca3af; }
        .preview { background: #0f0f15; display: flex; flex-direction: column; }
        .browser-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 12px; background: #14141b;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #facc15; }
        .dot.green { background: #22c55e; }
        .url { margin-left: 20px; font-size: 12px; color: #9ca3af; }
        iframe { flex: 1; border: none; }
        @keyframes fadeIn { from {opacity:0;} to {opacity:1;} }
      `}</style>
    </div>
  );
}
