"use client";
import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [preview, setPreview] = useState("");

  const questions = [
    {
      q: "ما هو نوع الموقع الذي تريده؟",
      options: ["Landing Page", "E-commerce", "Portfolio"],
    },
    {
      q: "من هو الجمهور المستهدف؟",
      options: ["شركات ناشئة", "مطورين", "مستخدمين عامين"],
    },
    {
      q: "ما هي الميزة الأساسية؟",
      options: ["عرض منتجات", "خدمات SaaS", "مدونة"],
    },
    {
      q: "ما هو الطابع العام للتصميم؟",
      options: ["Minimal", "Futuristic", "Classic"],
    },
    {
      q: "هل تحتاج إلى قسم إضافي؟",
      options: ["Testimonials", "Pricing", "FAQ"],
    },
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    setThinking(true);

    setTimeout(async () => {
      setThinking(false);

      if (Object.keys(answers).length < 5) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "لنبدأ بالأسئلة الخاصة بالمشروع:" },
        ]);
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea: input, answers }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "تم توليد الموقع بنجاح!" },
        ]);
        setPreview(data.result);
      }
    }, 2000);
  };

  const chooseAnswer = (qIndex: number, option: string) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  return (
    <div className="page">
      <div className="chat">
        <div className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <p>{m.content}</p>
            </div>
          ))}
          {thinking && <div className="thinking">Thinking...</div>}
        </div>

        {/* عرض الأسئلة */}
        {Object.keys(answers).length < 5 &&
          questions.map((q, i) =>
            !answers[i] ? (
              <div key={i} className="question">
                <p>{q.q}</p>
                <div className="options">
                  {q.options.map((opt) => (
                    <button key={opt} onClick={() => chooseAnswer(i, opt)}>
                      {opt}
                    </button>
                  ))}
                  <input
                    type="text"
                    placeholder="Other..."
                    onBlur={(e) =>
                      e.target.value && chooseAnswer(i, e.target.value)
                    }
                  />
                </div>
              </div>
            ) : null
          )}

        <div className="input-box">
          <textarea
            placeholder="اكتب فكرتك..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={sendMessage}>➤</button>
        </div>
      </div>

      {/* معاينة الموقع */}
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

      <style jsx>{`
        .page {
          display: flex;
          min-height: 100vh;
          background: #0b0b0f;
          color: white;
          font-family: Inter, Geist, sans-serif;
        }
        .chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 20px;
        }
        .messages {
          flex: 1;
          overflow-y: auto;
        }
        .msg {
          margin-bottom: 15px;
        }
        .msg.user {
          text-align: right;
          color: #3b82f6;
        }
        .msg.assistant {
          text-align: left;
          color: #d1d5db;
        }
        .thinking {
          font-style: italic;
          color: #9ca3af;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        .question { margin: 20px 0; }
        .options { display: flex; gap: 10px; flex-wrap: wrap; }
        .options button {
          background: #3b82f6;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          color: white;
          cursor: pointer;
        }
        .options input {
          background: #14141b;
          border: none;
          padding: 8px;
          border-radius: 8px;
          color: white;
        }
        .input-box { display: flex; gap: 10px; margin-top: 20px; }
        textarea {
          flex: 1;
          background: #14141b;
          border: none;
          border-radius: 8px;
          padding: 12px;
          color: white;
        }
        button {
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          color: white;
          cursor: pointer;
        }
        .preview {
          flex: 1;
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
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ef4444; }
        .dot.yellow { background: #facc15; }
        .dot.green { background: #22c55e; }
        .url { margin-left: 20px; font-size: 12px; color: #9ca3af; }
        iframe { flex: 1; border: none; }
      `}</style>
    </div>
  );
}
