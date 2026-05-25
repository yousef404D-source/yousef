"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type UserData = {
  email: string;
  credits: number;
  premium: boolean;
};

export default function NovaAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [preview, setPreview] =
    useState("");

  const [showPayment, setShowPayment] =
    useState(false);

  const [admin, setAdmin] =
    useState(false);

  const [user] = useState<UserData>({
    email:
      "yousefbaker505@gmail.com",

    credits: 20,

    premium: false,
  });

  const bottomRef =
    useRef<HTMLDivElement>(null);

  const hasMessages =
    messages.length > 0;

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* ---------------- ADMIN SYSTEM ---------------- */

  useEffect(() => {
    (
      window as any
    ).AD = () => {

      const adminEmail =
        "yousefbaker505@gmail.com";

      const currentEmail =
        user.email
          .trim()
          .toLowerCase();

      if (
        currentEmail ===
        adminEmail
      ) {
        setAdmin(true);
      } else {
        alert("ERROR");
      }
    };
  }, [user.email]);

  /* ---------------- AI SYSTEM ---------------- */

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

    const lower =
      text.toLowerCase();

    const isProject =
      lower.includes("build") ||
      lower.includes("website") ||
      lower.includes("dashboard") ||
      lower.includes("app") ||
      lower.includes("platform") ||
      lower.includes("gaming") ||
      lower.includes("portfolio") ||
      lower.includes("landing");

    const hugeProject =
      text.length > 180;

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

      const data =
        await res.json();

      /* ---------------- SIMPLE CHAT ---------------- */

      if (!isProject) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.reply ||
              "I understand.",
          },
        ]);

        setLoading(false);

        return;
      }

      /* ---------------- PROJECT PREVIEW ---------------- */

      setPreview(`
        <div style="
          padding:40px;
          background:#0b1020;
          color:white;
          border-radius:30px;
          font-family:Arial;
        ">
          <h1 style="
            font-size:50px;
            margin-bottom:20px;
          ">
            ${data.title ||
              "Nova Project"}
          </h1>

          <p style="
            opacity:.7;
            line-height:1.8;
          ">
            ${
              data.description ||
              "AI Generated Website"
            }
          </p>

          <div style="
            margin-top:30px;
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(220px,1fr));
            gap:20px;
          ">
            <div style="
              padding:30px;
              background:
                rgba(255,255,255,.05);
              border-radius:24px;
            ">
              Hero Section
            </div>

            <div style="
              padding:30px;
              background:
                rgba(255,255,255,.05);
              border-radius:24px;
            ">
              Dashboard
            </div>

            <div style="
              padding:30px;
              background:
                rgba(255,255,255,.05);
              border-radius:24px;
            ">
              AI Features
            </div>

            <div style="
              padding:30px;
              background:
                rgba(255,255,255,.05);
              border-radius:24px;
            ">
              Premium UI
            </div>
          </div>
        </div>
      `);

      /* ---------------- CREDIT SYSTEM ---------------- */

      if (
        hugeProject &&
        user.credits <= 0
      ) {
        setShowPayment(true);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "This project requires more credits before completion.",
          },
        ]);

        setLoading(false);

        return;
      }

      /* ---------------- FINAL AI RESPONSE ---------------- */

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Project generation started successfully.",
        },
      ]);

    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "AI system error.",
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

  /* ---------------- UI ---------------- */

  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom,#050816,#0b1020)",

        minHeight: "100vh",

        color: "white",

        overflow: "hidden",

        fontFamily:
          "Arial, sans-serif",
      }}
    >
      {/* ---------------- SIDEBAR ---------------- */}

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
            "rgba(255,255,255,.02)",

          backdropFilter:
            "blur(20px)",

          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          paddingTop: 30,

          gap: 25,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          N
        </div>

        <div
          style={{
            width: 45,
            height: 45,

            borderRadius: 16,

            background:
              "rgba(255,255,255,.06)",
          }}
        />

        <div
          style={{
            width: 45,
            height: 45,

            borderRadius: 16,

            background:
              "rgba(255,255,255,.04)",
          }}
        />

        <div
          style={{
            width: 45,
            height: 45,

            borderRadius: 16,

            background:
              "rgba(255,255,255,.04)",
          }}
        />
      </div>

      {/* ---------------- MAIN ---------------- */}

      <div
        style={{
          marginLeft: 90,

          minHeight: "100vh",

          display: "flex",

          flexDirection: "column",
        }}
      >
        {/* ---------------- CENTER MODE ---------------- */}

        {!hasMessages && (
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
                <h1
                  style={{
                    fontSize: 75,

                    fontWeight: 900,

                    marginBottom: 15,

                    letterSpacing:
                      "-3px",
                  }}
                >
                  Nova AI
                </h1>

                <p
                  style={{
                    opacity: 0.55,

                    fontSize: 23,
                  }}
                >
                  Start building something incredible
                </p>
              </div>

              {/* ---------------- INPUT ---------------- */}

              <div
                style={{
                  background:
                    "rgba(255,255,255,.05)",

                  border:
                    "1px solid rgba(255,255,255,.06)",

                  borderRadius: 40,

                  padding: 28,

                  backdropFilter:
                    "blur(40px)",

                  boxShadow:
                    "0 0 120px rgba(59,130,246,.12)",
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
                      "space-between",

                    alignItems: "center",

                    marginTop: 25,
                  }}
                >
                  <div
                    style={{
                      opacity: 0.45,
                    }}
                  >
                    AI Website Operating System
                  </div>

                  <button
                    onClick={
                      sendMessage
                    }

                    disabled={
                      loading
                    }

                    style={{
                      background:
                        "#2563eb",

                      border: "none",

                      color: "white",

                      padding:
                        "14px 28px",

                      borderRadius: 18,

                      fontSize: 16,

                      cursor:
                        "pointer",
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

        {/* ---------------- CHAT MODE ---------------- */}

        {hasMessages && (
          <>
            <div
              style={{
                flex: 1,

                overflowY: "auto",

                padding:
                  "40px 80px 200px",

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
                        fontSize: 13,

                        opacity: 0.4,

                        marginBottom: 10,

                        letterSpacing:
                          "1px",
                      }}
                    >
                      {m.role ===
                      "user"
                        ? "YOU"
                        : "NOVA AI"}
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

                        borderRadius: 30,

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

                        backdropFilter:
                          "blur(30px)",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                )
              )}

              {/* ---------------- PREVIEW ---------------- */}

              {preview && (
                <div
                  style={{
                    marginTop: 50,
                  }}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        preview,
                    }}
                  />
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ---------------- INPUT BOTTOM ---------------- */}

            <div
              style={{
                position: "fixed",

                bottom: 0,

                left: 90,

                right: 0,

                padding: 25,

                background:
                  "rgba(5,8,22,.85)",

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
                    onClick={
                      sendMessage
                    }

                    disabled={
                      loading
                    }

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

      {/* ---------------- PAYMENT PAGE ---------------- */}

      {showPayment && (
        <div
          style={{
            position: "fixed",

            inset: 0,

            background:
              "rgba(0,0,0,.88)",

            display: "flex",

            justifyContent:
              "center",

            alignItems: "center",

            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: 600,

              background:
                "#0b1020",

              borderRadius: 40,

              padding: 50,

              border:
                "1px solid rgba(255,255,255,.06)",
            }}
          >
            <h1
              style={{
                fontSize: 45,

                marginBottom: 20,
              }}
            >
              Continue Building
            </h1>

            <p
              style={{
                opacity: 0.65,

                lineHeight: 1.8,

                marginBottom: 35,
              }}
            >
              Your current project
              requires additional
              credits and premium
              generation access.
            </p>

            <button
              style={{
                width: "100%",

                background:
                  "#2563eb",

                border: "none",

                color: "white",

                padding: 18,

                borderRadius: 20,

                fontSize: 18,

                cursor: "pointer",
              }}
            >
              Upgrade Subscription
            </button>
          </div>
        </div>
      )}

      {/* ---------------- ADMIN PANEL ---------------- */}

      {admin && (
        <div
          style={{
            position: "fixed",

            top: 20,

            right: 20,

            width: 420,

            background:
              "#0b1020",

            border:
              "1px solid rgba(255,255,255,.06)",

            borderRadius: 30,

            padding: 30,

            zIndex: 9999,
          }}
        >
          <h2
            style={{
              marginBottom: 25,
            }}
          >
            Admin Panel
          </h2>

          <div
            style={{
              display: "grid",
              gap: 15,
            }}
          >
            <div
              style={{
                padding: 20,

                borderRadius: 20,

                background:
                  "rgba(255,255,255,.05)",
              }}
            >
              Accounts
            </div>

            <div
              style={{
                padding: 20,

                borderRadius: 20,

                background:
                  "rgba(255,255,255,.05)",
              }}
            >
              Logs
            </div>

            <div
              style={{
                padding: 20,

                borderRadius: 20,

                background:
                  "rgba(255,255,255,.05)",
              }}
            >
              Credits & Premium
            </div>
          </div>
        </div>
      )}
    </div>
  );
}