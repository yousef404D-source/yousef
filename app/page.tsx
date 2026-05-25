"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function NovaClip() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* ---------------- SEND ---------------- */

  async function sendMessage() {
    if (!input.trim()) return;

    const text = input;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setInput("");

    setLoading(true);

    try {
      const res = await fetch("/api/nova", {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Something went wrong",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI Error",
        },
      ]);
    }

    setLoading(false);
  }

  /* ---------------- ENTER ---------------- */

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  /* ---------------- SUGGESTIONS ---------------- */

  const suggestions = [
    "Build me a futuristic AI website",
    "Create a restaurant website",
    "Make a gaming dashboard",
    "Build a SaaS landing page",
    "Create a portfolio website",
    "Build a crypto app UI",
  ];

  return (
    <div
      style={{
        background: "#0b1020",
        minHeight: "100vh",
        color: "white",
        overflow: "hidden",
      }}
    >
      {/* ---------------- SIDEBAR ---------------- */}

      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 80,
          height: "100vh",
          borderRight:
            "1px solid rgba(255,255,255,0.06)",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 20,
          gap: 20,

          background:
            "rgba(255,255,255,0.02)",

          backdropFilter: "blur(20px)",
        }}
      >
        <div style={{ fontSize: 24 }}>
          ⚡
        </div>

        <div style={{ opacity: 0.5 }}>
          💬
        </div>

        <div style={{ opacity: 0.5 }}>
          📁
        </div>

        <div style={{ opacity: 0.5 }}>
          ⚙️
        </div>
      </div>

      {/* ---------------- MAIN ---------------- */}

      <div
        style={{
          marginLeft: 80,
          minHeight: "100vh",

          display: "flex",
          flexDirection: "column",

          transition: "0.4s",
        }}
      >
        {/* ---------------- CENTER MODE ---------------- */}

        {!hasMessages && (
          <div
            style={{
              flex: 1,

              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              padding: 30,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 950,
              }}
            >
              {/* TITLE */}

              <div
                style={{
                  textAlign: "center",
                  marginBottom: 40,
                }}
              >
                <h1
                  style={{
                    fontSize: 60,
                    fontWeight: 800,
                    marginBottom: 15,
                  }}
                >
                  NOVA CLIP
                </h1>

                <p
                  style={{
                    opacity: 0.6,
                    fontSize: 22,
                  }}
                >
                  What should we build today?
                </p>
              </div>

              {/* INPUT */}

              <div
                style={{
                  background:
                    "rgba(255,255,255,0.08)",

                  border:
                    "1px solid rgba(255,255,255,0.08)",

                  borderRadius: 35,

                  padding: 25,

                  backdropFilter:
                    "blur(30px)",

                  boxShadow:
                    "0 0 50px rgba(59,130,246,0.15)",
                }}
              >
                <input
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Message NOVA CLIP..."

                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "white",
                    fontSize: 24,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",

                    alignItems: "center",

                    marginTop: 20,
                  }}
                >
                  <div
                    style={{
                      opacity: 0.5,
                    }}
                  >
                    ⚡ Smart AI
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    style={{
                      background:
                        "#2563eb",

                      border: "none",

                      color: "white",

                      padding:
                        "12px 24px",

                      borderRadius: 15,

                      cursor: "pointer",

                      fontSize: 16,
                    }}
                  >
                    {loading
                      ? "Thinking..."
                      : "Send"}
                  </button>
                </div>
              </div>

              {/* SUGGESTIONS */}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,

                  justifyContent:
                    "center",

                  marginTop: 25,
                }}
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setInput(s)
                    }
                    style={{
                      background:
                        "rgba(255,255,255,0.06)",

                      border:
                        "1px solid rgba(255,255,255,0.08)",

                      color: "white",

                      padding:
                        "12px 18px",

                      borderRadius: 999,

                      cursor: "pointer",

                      opacity: 0.8,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- CHAT MODE ---------------- */}

        {hasMessages && (
          <>
            {/* CHAT */}

            <div
              style={{
                flex: 1,
                overflowY: "auto",

                padding:
                  "40px 80px 140px",

                maxWidth: 1100,
                width: "100%",
                margin: "0 auto",
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 35,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      opacity: 0.5,
                      marginBottom: 8,
                    }}
                  >
                    {m.role === "user"
                      ? "YOU"
                      : "NOVA CLIP"}
                  </div>

                  <div
                    style={{
                      fontSize: 20,
                      lineHeight: 1.7,

                      background:
                        m.role === "assistant"
                          ? "rgba(255,255,255,0.05)"
                          : "transparent",

                      borderRadius: 24,

                      padding:
                        m.role === "assistant"
                          ? 25
                          : 0,

                      border:
                        m.role === "assistant"
                          ? "1px solid rgba(255,255,255,0.06)"
                          : "none",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>

            {/* INPUT BOTTOM */}

            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 80,
                right: 0,

                padding: 20,

                background:
                  "rgba(11,16,32,0.85)",

                backdropFilter:
                  "blur(20px)",

                borderTop:
                  "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  maxWidth: 1100,
                  margin: "0 auto",

                  background:
                    "rgba(255,255,255,0.06)",

                  borderRadius: 25,

                  padding: 20,

                  border:
                    "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 15,
                    alignItems: "center",
                  }}
                >
                  <input
                    value={input}
                    onChange={(e) =>
                      setInput(
                        e.target.value
                      )
                    }
                    onKeyDown={
                      handleKeyDown
                    }

                    placeholder="Message NOVA CLIP..."

                    style={{
                      flex: 1,

                      background:
                        "transparent",

                      border: "none",

                      outline: "none",

                      color: "white",

                      fontSize: 18,
                    }}
                  />

                  <button
                    onClick={sendMessage}
                    disabled={loading}
                    style={{
                      background:
                        "#2563eb",

                      border: "none",

                      color: "white",

                      padding:
                        "12px 22px",

                      borderRadius: 14,

                      cursor: "pointer",
                    }}
                  >
                    {loading
                      ? "..."
                      : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}