"use client";

import { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const send = async () => {
    if (!prompt) return;

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setResult("حدث خطأ...");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>⚡ AI Project Builder</h1>
        <p style={styles.sub}>
          اكتب فكرتك وأنا أبني لك مشروع كامل (كود + هيكل + ميزات)
        </p>

        <textarea
          style={styles.textarea}
          placeholder="مثال: ابني لي موقع متجر إلكتروني حديث مع لوحة تحكم"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button style={styles.button} onClick={send}>
          {loading ? "جاري التفكير..." : "🚀 توليد المشروع"}
        </button>

        {result && (
          <div style={styles.output}>
            <h3>🧠 النتيجة:</h3>
            <pre style={{ whiteSpace: "pre-wrap" }}>{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(120deg,#0f172a,#1e293b)",
    color: "white",
    fontFamily: "Arial",
  },
  card: {
    width: "600px",
    padding: "20px",
    borderRadius: "15px",
    background: "#111827",
    boxShadow: "0 0 30px rgba(0,0,0,0.5)",
  },
  title: { fontSize: "24px", marginBottom: "10px" },
  sub: { fontSize: "14px", opacity: 0.7 },
  textarea: {
    width: "100%",
    height: "120px",
    marginTop: "15px",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },
  button: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#3b82f6",
    color: "white",
    cursor: "pointer",
  },
  output: {
    marginTop: "20px",
    padding: "10px",
    background: "#0b1220",
    borderRadius: "10px",
  },
};