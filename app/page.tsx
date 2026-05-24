"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: input,
        }),
      });

      const data = await res.json();

      setResponse(data.result);
    } catch (err) {
      setResponse("Error talking to bot.");
    }

    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "40px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>
        NOVA AI CHAT TEST
      </h1>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask the AI to build a website..."
        style={{
          height: "120px",
          background: "#111",
          color: "white",
          border: "1px solid #333",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "16px",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          width: "200px",
          padding: "14px",
          border: "none",
          borderRadius: "12px",
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          marginBottom: "30px",
        }}
      >
        {loading ? "Generating..." : "Send"}
      </button>

      <div
        style={{
          flex: 1,
          background: "#111",
          borderRadius: "12px",
          padding: "20px",
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {response || "AI response will appear here"}
      </div>
    </main>
  );
}