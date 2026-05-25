"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function NovaAI() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  const realPassword = "yousefyousefyousef505";

  function unlock() {
    if (password === realPassword) {
      setAuthorized(true);
    } else {
      alert("Wrong Password");
    }
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE (WITH LOGS) ---------------- */

  async function sendMessage() {
    if (!input.trim()) return;

    const text = input;

    console.log("📤 Sending message:", text);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
    ]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/nova", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      console.log("📡 Status:", res.status);
      console.log("📡 OK?:", res.ok);
      console.log("📡 Headers:", res.headers);

      const raw = await res.text();
      console.log("📥 RAW RESPONSE:", raw);

      let data;
      try {
        data = JSON.parse(raw);
        console.log("✅ JSON PARSED:", data);
      } catch (e) {
        console.log("❌ NOT JSON RESPONSE");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.reply || "Nova AI failed.",
        },
      ]);
    } catch (err) {
      console.error("❌ ERROR:", err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI system error.",
        },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  /* ---------------- PASSWORD PAGE ---------------- */

  if (!authorized) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#050816",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial",
      }}>
        <div style={{
          width: 520,
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.06)",
          borderRadius: 35,
          padding: 45,
          backdropFilter: "blur(20px)",
        }}>
          <h1 style={{ fontSize: 55 }}>Nova AI</h1>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            style={{
              width: "100%",
              padding: 20,
              borderRadius: 20,
              border: "none",
              background: "rgba(255,255,255,.05)",
              color: "white",
              fontSize: 18,
            }}
          />

          <button
            onClick={unlock}
            style={{
              width: "100%",
              marginTop: 25,
              padding: 18,
              borderRadius: 20,
              border: "none",
              background: "#2563eb",
              color: "white",
              fontSize: 18,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */

  return (
    <div style={{ background: "#050816", minHeight: "100vh", color: "white" }}>
      
      <div style={{ marginLeft: 90, padding: 40 }}>

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <b>{m.role}:</b> {m.content}
          </div>
        ))}

        <div ref={bottomRef} />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          style={{
            width: "70%",
            padding: 15,
            marginTop: 20,
          }}
        />

        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>

      </div>
    </div>
  );
}