"use client";

import { useState, useEffect } from "react";

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("ai-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const generate = async () => {
    if (!prompt) return;

    setLoading(true);
    setThinking(true);
    setResult("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setResult(data.result);

      const updated = [prompt, ...history];
      setHistory(updated);
      localStorage.setItem("ai-history", JSON.stringify(updated));
    } catch (err) {
      setResult("❌ حدث خطأ أثناء التوليد");
    }

    setThinking(false);
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow}></div>

      <div style={styles.container}>
        <div style={styles.left}>
          <h1 style={styles.logo}>⚡ Crystal AI Builder</h1>

          <p style={styles.desc}>
            أنشئ أي مشروع تريده باستخدام الذكاء الاصطناعي
          </p>

          <textarea
            style={styles.textarea}
            placeholder="ابني لي موقع ألعاب احترافي مع لوحة تحكم ودفع إلكتروني..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <button onClick={generate} style={styles.button}>
            {loading ? "🧠 Thinking..." : "🚀 Generate Project"}
          </button>

          {thinking && (
            <div style={styles.thinkingBox}>
              <p>🧠 AI is analyzing your idea...</p>
              <p>⚡ Generating architecture...</p>
              <p>🎨 Improving UI/UX...</p>
              <p>🔒 Adding smart features...</p>
            </div>
          )}

          {result && (
            <div style={styles.result}>
              <h2>🔥 Generated Result</h2>

              <pre style={styles.pre}>{result}</pre>
            </div>
          )}
        </div>

        <div style={styles.right}>
          <h2 style={styles.historyTitle}>📜 History</h2>

          <div style={styles.historyBox}>
            {history.length === 0 && (
              <p style={{ opacity: 0.6 }}>No history yet</p>
            )}

            {history.map((item, index) => (
              <div
                key={index}
                style={styles.historyItem}
                onClick={() => setPrompt(item)}
              >
                {item}
              </div>
            ))}
          </div>

          <div style={styles.stats}>
            <div style={styles.statCard}>
              <h3>⚡ AI Speed</h3>
              <p>Ultra Fast</p>
            </div>

            <div style={styles.statCard}>
              <h3>🧠 Thinking</h3>
              <p>Enabled</p>
            </div>

            <div style={styles.statCard}>
              <h3>🔥 Quality</h3>
              <p>Premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    overflow: "hidden",
    position: "relative",
    fontFamily: "Arial",
  },

  bgGlow: {
    position: "absolute",
    width: "600px",
    height: "600px",
    background: "#2563eb",
    filter: "blur(200px)",
    opacity: 0.2,
    top: "-200px",
    left: "-100px",
  },

  container: {
    display: "flex",
    gap: "20px",
    padding: "40px",
  },

  left: {
    flex: 1,
  },

  right: {
    width: "320px",
  },

  logo: {
    fontSize: "42px",
    marginBottom: "10px",
  },

  desc: {
    opacity: 0.7,
    marginBottom: "20px",
  },

  textarea: {
    width: "100%",
    height: "180px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    background: "#0f172a",
    color: "white",
    padding: "20px",
    fontSize: "16px",
    outline: "none",
  },

  button: {
    marginTop: "15px",
    width: "100%",
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background: "linear-gradient(90deg,#2563eb,#7c3aed)",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  thinkingBox: {
    marginTop: "20px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    padding: "15px",
    borderRadius: "15px",
    lineHeight: "2",
  },

  result: {
    marginTop: "20px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "20px",
  },

  pre: {
    whiteSpace: "pre-wrap",
    lineHeight: "1.7",
  },

  historyTitle: {
    marginBottom: "15px",
  },

  historyBox: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    padding: "15px",
    maxHeight: "400px",
    overflow: "auto",
  },

  historyItem: {
    padding: "12px",
    borderRadius: "12px",
    background: "#111827",
    marginBottom: "10px",
    cursor: "pointer",
  },

  stats: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  statCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "16px",
    padding: "15px",
  },
};