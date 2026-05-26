"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type DeployResponse = {
  success?: boolean;
  url?: string;
  error?: string;
};

export default function NovaAI() {
  /* ---------------- PASSWORD ---------------- */

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

  /* ---------------- STATES ---------------- */

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [robotMood, setRobotMood] =
    useState<
      | "idle"
      | "thinking"
      | "happy"
      | "typing"
    >("idle");

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */

  async function sendMessage() {
    if (!input.trim()) return;

    const text = input;

    console.log(
      "📤 USER MESSAGE:",
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

    setRobotMood("thinking");

    /* ---------------- THINKING ---------------- */

    setMessages((prev) => [
      ...prev,

      {
        role: "assistant",

        content:
          "Nova AI is thinking...",
      },
    ]);

    await new Promise((resolve) =>
      setTimeout(resolve, 2500)
    );

    setRobotMood("typing");

    try {
      console.log(
        "🚀 STARTING DEPLOY..."
      );

      /* ---------------- BUILDING ---------------- */

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content:
            "Analyzing request...",
        },
      ]);

      await new Promise((resolve) =>
        setTimeout(resolve, 2200)
      );

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content:
            "Generating advanced UI...",
        },
      ]);

      await new Promise((resolve) =>
        setTimeout(resolve, 2500)
      );

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content:
            "Building animations...",
        },
      ]);

      await new Promise((resolve) =>
        setTimeout(resolve, 2500)
      );

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content:
            "Optimizing website...",
        },
      ]);

      await new Promise((resolve) =>
        setTimeout(resolve, 2500)
      );

      /* ---------------- API ---------------- */

      const res = await fetch(
        "/api/deploy",

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            prompt: text,
          }),
        }
      );

      console.log(
        "📡 STATUS:",
        res.status
      );

      const raw =
        await res.text();

      console.log(
        "📥 RAW:",
        raw
      );

      const data: DeployResponse =
        JSON.parse(raw);

      console.log(
        "✅ FINAL DATA:",
        data
      );

      /* ---------------- MORE BUILD ---------------- */

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content:
            "Finalizing project...",
        },
      ]);

      await new Promise((resolve) =>
        setTimeout(resolve, 3500)
      );

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content:
            "Deploying website...",
        },
      ]);

      await new Promise((resolve) =>
        setTimeout(resolve, 4000)
      );

      /* ---------------- SUCCESS ---------------- */

      setRobotMood("happy");

      setMessages((prev) => [
        ...prev,

        {
          role: "assistant",

          content: data.success
            ? `✅ Website completed successfully

${data.url}`
            : data.error ||
              "Nova AI failed.",
        },
      ]);
    } catch (err) {
      console.log(
        "❌ CLIENT ERROR:",
        err
      );

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

    setTimeout(() => {
      setRobotMood("idle");
    }, 4000);
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  /* ---------------- ROBOT ---------------- */

  function RobotFace({
    size = 65,
  }: {
    size?: number;
  }) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 28,

          background:
            robotMood === "thinking"
              ? "linear-gradient(135deg,#2563eb,#7c3aed)"
              : robotMood === "happy"
              ? "linear-gradient(135deg,#10b981,#06b6d4)"
              : robotMood === "typing"
              ? "linear-gradient(135deg,#f59e0b,#ef4444)"
              : "linear-gradient(135deg,#0f172a,#1e293b)",

          position: "relative",

          transition:
            "all .4s ease",

          animation:
            robotMood === "thinking"
              ? "float 2s infinite"
              : robotMood === "happy"
              ? "happy 1s infinite"
              : "idle 4s infinite",

          boxShadow:
            "0 0 40px rgba(59,130,246,.35)",
        }}
      >
        {/* EYES */}

        <div
          style={{
            position: "absolute",

            top: size * 0.32,

            left: size * 0.22,

            width: size * 0.12,

            height:
              robotMood === "typing"
                ? 4
                : size * 0.12,

            borderRadius: 999,

            background: "white",

            animation:
              "blink 4s infinite",
          }}
        />

        <div
          style={{
            position: "absolute",

            top: size * 0.32,

            right: size * 0.22,

            width: size * 0.12,

            height:
              robotMood === "typing"
                ? 4
                : size * 0.12,

            borderRadius: 999,

            background: "white",

            animation:
              "blink 4s infinite",
          }}
        />

        {/* MOUTH */}

        <div
          style={{
            position: "absolute",

            bottom: size * 0.2,

            left: "50%",

            transform:
              "translateX(-50%)",

            width:
              robotMood === "happy"
                ? size * 0.32
                : size * 0.2,

            height:
              robotMood === "happy"
                ? 10
                : 4,

            borderRadius: 999,

            background: "white",

            transition:
              "all .3s ease",
          }}
        />

        {/* THINKING DOTS */}

        {robotMood ===
          "thinking" && (
          <>
            <div
              style={{
                position:
                  "absolute",

                top: -8,

                right: -4,

                width: 10,

                height: 10,

                borderRadius: 999,

                background:
                  "#60a5fa",

                animation:
                  "pulse 1s infinite",
              }}
            />

            <div
              style={{
                position:
                  "absolute",

                top: -20,

                right: 8,

                width: 7,

                height: 7,

                borderRadius: 999,

                background:
                  "#c084fc",

                animation:
                  "pulse 1.5s infinite",
              }}
            />
          </>
        )}
      </div>
    );
  }

  /* ---------------- PASSWORD PAGE ---------------- */

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",

          background:
            "#050816",

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
              "rgba(255,255,255,.05)",

            border:
              "1px solid rgba(255,255,255,.06)",

            borderRadius: 35,

            padding: 45,

            backdropFilter:
              "blur(20px)",

            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",

              justifyContent:
                "center",

              marginBottom: 25,
            }}
          >
            <RobotFace size={90} />
          </div>

          <h1
            style={{
              fontSize: 60,

              marginBottom: 10,
            }}
          >
            Nova AI
          </h1>

          <p
            style={{
              opacity: 0.6,

              marginBottom: 30,
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

              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",

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

  /* ---------------- MAIN ---------------- */

  return (
    <div
      style={{
        background:
          "#050816",

        minHeight: "100vh",

        color: "white",

        fontFamily: "Arial",

        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes blink {
          0% { transform: scaleY(1); }
          48% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
          52% { transform: scaleY(1); }
          100% { transform: scaleY(1); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulse {
          0% { opacity: .4; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: .4; transform: scale(.8); }
        }

        @keyframes happy {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes idle {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* MAIN AREA */}

      <div
        style={{
          minHeight: "100vh",

          display: "flex",

          flexDirection:
            "column",

          padding:
            "40px 40px 170px",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",

            alignItems: "center",

            gap: 16,

            marginBottom: 40,
          }}
        >
          <RobotFace />

          <div>
            <h1
              style={{
                fontSize: 34,

                margin: 0,
              }}
            >
              Nova AI
            </h1>

            <p
              style={{
                opacity: 0.6,

                marginTop: 5,
              }}
            >
              AI Website Builder
            </p>
          </div>
        </div>

        {/* HERO */}

        {messages.length === 0 && (
          <div
            style={{
              flex: 1,

              display: "flex",

              justifyContent:
                "center",

              alignItems:
                "center",
            }}
          >
            <div
              style={{
                width: "100%",

                maxWidth: 1100,

                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "center",

                  marginBottom: 30,
                }}
              >
                <RobotFace size={120} />
              </div>

              <h1
                style={{
                  fontSize: 90,

                  fontWeight: 900,

                  marginBottom: 20,
                }}
              >
                Nova AI
              </h1>

              <p
                style={{
                  opacity: 0.6,

                  fontSize: 24,

                  marginBottom: 50,
                }}
              >
                Create powerful AI websites instantly
              </p>
            </div>
          </div>
        )}

        {/* CHAT */}

        <div
          style={{
            width: "100%",

            maxWidth: 1100,

            margin:
              messages.length > 0
                ? "0 auto"
                : "auto auto 0",
          }}
        >
          {messages.map(
            (m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 35,
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

                    gap: 12,

                    marginBottom: 10,
                  }}
                >
                  {m.role ===
                    "assistant" && (
                    <RobotFace size={42} />
                  )}

                  <div
                    style={{
                      opacity: 0.5,

                      fontSize: 13,
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
                        ? 28
                        : 0,

                    border:
                      m.role ===
                      "assistant"
                        ? "1px solid rgba(255,255,255,.05)"
                        : "none",

                    wordBreak:
                      "break-word",
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

            left: 0,

            right: 0,

            padding: 25,

            background:
              "rgba(5,8,22,.92)",

            backdropFilter:
              "blur(20px)",

            borderTop:
              "1px solid rgba(255,255,255,.05)",
          }}
        >
          <div
            style={{
              maxWidth: 1100,

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
                placeholder="Describe your website..."
                style={{
                  flex: 1,

                  background:
                    "transparent",

                  border: "none",

                  outline: "none",

                  color: "white",

                  fontSize: 20,
                }}
              />

              <button
                onClick={
                  sendMessage
                }
                disabled={loading}
                style={{
                  background:
                    "linear-gradient(135deg,#2563eb,#7c3aed)",

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
                  : "Generate"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}