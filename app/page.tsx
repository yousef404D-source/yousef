"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type NovaResponse = {
  reply?: string;
  questions?: {
    question: string;
    options: string[];
  }[];
};

export default function NovaAI() {
  const [authorized, setAuthorized] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const realPassword =
    "yousefyousefyousef505";

  function unlock() {
    if (password === realPassword) {
      setAuthorized(true);
    } else {
      alert("Wrong Password");
    }
  }

  const [messages, setMessages] =
    useState<Message[]>([];

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(
    customMessage?: string
  ) {
    const text =
      customMessage || input;

    if (!text.trim()) return;

    console.log(
      "📤 Sending message:",
      text
    );

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setInput("");

    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Thinking...",
      },
    ]);

    try {
      const res = await fetch(
        "/api/nova",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: text,
          }),
        }
      );

      console.log(
        "📡 Status:",
        res.status
      );

      const raw =
        await res.text();

      console.log(
        "📥 RAW RESPONSE:",
        raw
      );

      let data:
        | NovaResponse
        | null = null;

      try {
        data =
          JSON.parse(
            raw
          ) as NovaResponse;

        console.log(
          "✅ JSON:",
          data
        );
      } catch {
        console.log(
          "❌ NOT JSON"
        );
      }

      setMessages((prev) => {
        const updated = [...prev];

        updated.pop();

        return [
          ...updated,
          {
            role: "assistant",
            content:
              data?.reply ||
              "Nova AI failed.",
          },
        ];
      });
    } catch (err) {
      console.error(err);

      setMessages((prev) => {
        const updated = [...prev];

        updated.pop();

        return [
          ...updated,
          {
            role: "assistant",
            content:
              "AI system error.",
          },
        ];
      });
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

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#050816",
          display: "flex",
          justifyContent:
            "center",
          alignItems: "center",
          color: "white",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            width: 520,
            background:
              "rgba(255,255,255,.04)",
            border:
              "1px solid rgba(255,255,255,.06)",
            borderRadius: 35,
            padding: 45,
            backdropFilter:
              "blur(20px)",
          }}
        >
          <h1
            style={{
              fontSize: 55,
              marginBottom: 10,
            }}
          >
            Nova AI
          </h1>

          <p
            style={{
              opacity: 0.6,
              marginBottom: 35,
            }}
          >
            Secure access required
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            placeholder="Enter Password"
            style={{
              width: "100%",
              padding: 20,
              borderRadius: 20,
              border: "none",
              outline: "none",
              background:
                "rgba(255,255,255,.05)",
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
              cursor: "pointer",
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#050816",
        minHeight: "100vh",
        color: "white",
        overflow: "hidden",
        fontFamily: "Arial",
      }}
    >
      {/* SIDEBAR */}

      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 90,
          height: "100vh",
          borderRight:
            "1px solid rgba(255,255,255,.05)",
          background:
            "rgba(255,255,255,.03)",
          backdropFilter:
            "blur(20px)",
          display: "flex",
          flexDirection:
            "column",
          alignItems: "center",
          paddingTop: 30,
          gap: 20,
        }}
      >
        <div
          style={{
            width: 55,
            height: 55,
            borderRadius: "50%",
            overflow: "hidden",
            border:
              "2px solid rgba(255,255,255,.1)",
          }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
            alt="robot"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>

      {/* MAIN */}

      <div
        style={{
          marginLeft: 90,
          minHeight: "100vh",
          display: "flex",
          flexDirection:
            "column",
        }}
      >
        {/* EMPTY */}

        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent:
                "center",
              alignItems: "center",
              padding: 40,
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 1000,
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 45,
                }}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    overflow: "hidden",
                    margin:
                      "0 auto 20px",
                    border:
                      "4px solid rgba(255,255,255,.08)",
                  }}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                    alt="robot"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit:
                        "cover",
                    }}
                  />
                </div>

                <h1
                  style={{
                    fontSize: 75,
                    fontWeight: 900,
                    marginBottom: 15,
                  }}
                >
                  Nova AI
                </h1>

                <p
                  style={{
                    opacity: 0.6,
                    fontSize: 22,
                  }}
                >
                  Start messaging
                  Nova AI...
                </p>
              </div>

              <div
                style={{
                  background:
                    "rgba(255,255,255,.05)",
                  border:
                    "1px solid rgba(255,255,255,.06)",
                  borderRadius: 35,
                  padding: 28,
                  backdropFilter:
                    "blur(30px)",
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
                  placeholder="Start messaging Nova AI..."
                  style={{
                    width: "100%",
                    background:
                      "transparent",
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
                      "flex-end",
                    marginTop: 20,
                  }}
                >
                  <button
                    onClick={() =>
                      sendMessage()
                    }
                    disabled={loading}
                    style={{
                      background:
                        "#2563eb",
                      border: "none",
                      color: "white",
                      padding:
                        "14px 28px",
                      borderRadius: 18,
                      cursor:
                        "pointer",
                      fontSize: 16,
                    }}
                  >
                    {loading
                      ? "Thinking..."
                      : "Send"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHAT */}

        {messages.length > 0 && (
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding:
                  "40px 80px 170px",
                maxWidth: 1200,
                width: "100%",
                margin: "0 auto",
              }}
            >
              {messages.map(
                (m, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 40,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      {m.role ===
                        "assistant" && (
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                          alt="robot"
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius:
                              "50%",
                          }}
                        />
                      )}

                      <div
                        style={{
                          fontSize: 14,
                          opacity: 0.7,
                          fontWeight: 700,
                        }}
                      >
                        {m.role ===
                        "user"
                          ? "YOU"
                          : "NOVA AI"}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 20,
                        lineHeight: 1.8,
                        background:
                          m.role ===
                          "assistant"
                            ? "rgba(255,255,255,.05)"
                            : "transparent",
                        borderRadius: 28,
                        padding:
                          m.role ===
                          "assistant"
                            ? 30
                            : 0,
                        border:
                          m.role ===
                          "assistant"
                            ? "1px solid rgba(255,255,255,.05)"
                            : "none",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                )
              )}

              <div ref={bottomRef} />
            </div>

            {/* INPUT */}

            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 90,
                right: 0,
                padding: 25,
                background:
                  "rgba(5,8,22,.9)",
                backdropFilter:
                  "blur(20px)",
                borderTop:
                  "1px solid rgba(255,255,255,.05)",
              }}
            >
              <div
                style={{
                  maxWidth: 1200,
                  margin: "0 auto",
                  background:
                    "rgba(255,255,255,.05)",
                  borderRadius: 30,
                  padding: 22,
                  border:
                    "1px solid rgba(255,255,255,.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 15,
                    alignItems:
                      "center",
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
                    placeholder="Start messaging Nova AI..."
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
                    onClick={() =>
                      sendMessage()
                    }
                    disabled={loading}
                    style={{
                      background:
                        "#2563eb",
                      border: "none",
                      color: "white",
                      padding:
                        "12px 24px",
                      borderRadius: 16,
                      cursor:
                        "pointer",
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