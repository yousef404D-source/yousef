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
  /* ---------------- AUTH ---------------- */

  const [authorized, setAuthorized] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const [wrongPass, setWrongPass] =
    useState(false);

  async function unlock() {
    setWrongPass(false);

    try {
      const res = await fetch(
        "/api/auth",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setAuthorized(true);
      } else {
        setWrongPass(true);
      }
    } catch {
      setWrongPass(true);
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

    setRobotMood("thinking");

    const loadingSteps = [
      "Nova AI is thinking...",
      "Analyzing request...",
      "Generating modern UI...",
      "Creating animations...",
      "Building components...",
      "Optimizing performance...",
      "Deploying website...",
    ];

    for (const step of loadingSteps) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: step,
        },
      ]);

      await new Promise((r) =>
        setTimeout(r, 1800)
      );
    }

    try {
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

      const data: DeployResponse =
        await res.json();

      setRobotMood("happy");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",

          content: data.success
            ? `✅ Website generated successfully

🌍 ${data.url}`
            : data.error ||
              "Failed to generate website.",
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

    setTimeout(() => {
      setRobotMood("idle");
    }, 3000);
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
    size = 70,
  }: {
    size?: number;
  }) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 26,

          background:
            robotMood === "thinking"
              ? "linear-gradient(135deg,#2563eb,#7c3aed)"
              : robotMood === "happy"
              ? "linear-gradient(135deg,#10b981,#06b6d4)"
              : robotMood === "typing"
              ? "linear-gradient(135deg,#f59e0b,#ef4444)"
              : "linear-gradient(135deg,#111827,#1e293b)",

          position: "relative",

          transition:
            "all .4s ease",

          boxShadow:
            "0 0 50px rgba(59,130,246,.4)",

          animation:
            robotMood === "thinking"
              ? "float 2s infinite"
              : robotMood === "happy"
              ? "happy 1s infinite"
              : "idle 4s infinite",
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

            left: "50%",

            bottom: size * 0.2,

            transform:
              "translateX(-50%)",

            width:
              robotMood === "happy"
                ? size * 0.35
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

        {/* THINKING */}

        {robotMood ===
          "thinking" && (
          <>
            <div
              style={{
                position:
                  "absolute",

                top: -10,
                right: -2,

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

                top: -22,
                right: 8,

                width: 6,
                height: 6,

                borderRadius: 999,

                background:
                  "#c084fc",

                animation:
                  "pulse 1.4s infinite",
              }}
            />
          </>
        )}
      </div>
    );
  }

  /* ---------------- LOGIN ---------------- */

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",

          background:
            "radial-gradient(circle at top,#111827,#020617)",

          display: "flex",

          justifyContent:
            "center",

          alignItems: "center",

          padding: 30,

          fontFamily: "Arial",

          color: "white",
        }}
      >
        <div
          style={{
            width: 540,

            background:
              "rgba(255,255,255,.05)",

            border:
              "1px solid rgba(255,255,255,.08)",

            backdropFilter:
              "blur(25px)",

            borderRadius: 40,

            padding: 45,

            textAlign: "center",

            boxShadow:
              "0 0 80px rgba(59,130,246,.15)",
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
            <RobotFace size={100} />
          </div>

          <h1
            style={{
              fontSize: 62,
              marginBottom: 12,
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
            Secure AI access system
          </p>

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter")
                unlock();
            }}
            style={{
              width: "100%",

              padding: 20,

              borderRadius: 20,

              border:
                wrongPass
                  ? "1px solid #ef4444"
                  : "1px solid rgba(255,255,255,.08)",

              background:
                "rgba(255,255,255,.05)",

              color: "white",

              outline: "none",

              fontSize: 18,
            }}
          />

          {wrongPass && (
            <div
              style={{
                marginTop: 12,

                color: "#ef4444",

                fontSize: 14,
              }}
            >
              Wrong password
            </div>
          )}

          <button
            onClick={unlock}
            style={{
              width: "100%",

              marginTop: 28,

              padding: 18,

              border: "none",

              borderRadius: 20,

              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",

              color: "white",

              fontSize: 18,

              cursor: "pointer",

              fontWeight: 700,
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
        minHeight: "100vh",

        background:
          "#050816",

        color: "white",

        overflow: "hidden",

        fontFamily: "Arial",
      }}
    >
      <style>{`
        @keyframes blink{
          0%{transform:scaleY(1)}
          48%{transform:scaleY(1)}
          50%{transform:scaleY(.1)}
          52%{transform:scaleY(1)}
          100%{transform:scaleY(1)}
        }

        @keyframes float{
          0%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
          100%{transform:translateY(0)}
        }

        @keyframes pulse{
          0%{opacity:.4;transform:scale(.8)}
          50%{opacity:1;transform:scale(1.2)}
          100%{opacity:.4;transform:scale(.8)}
        }

        @keyframes happy{
          0%{transform:rotate(0)}
          25%{transform:rotate(-4deg)}
          50%{transform:rotate(4deg)}
          100%{transform:rotate(0)}
        }

        @keyframes idle{
          0%{transform:scale(1)}
          50%{transform:scale(1.03)}
          100%{transform:scale(1)}
        }
      `}</style>

      {/* HEADER */}

      <div
        style={{
          padding:
            "35px 45px 20px",

          display: "flex",

          alignItems: "center",

          gap: 18,
        }}
      >
        <RobotFace />

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
            }}
          >
            Nova AI
          </h1>

          <p
            style={{
              marginTop: 6,
              opacity: 0.6,
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
            display: "flex",

            justifyContent:
              "center",

            alignItems: "center",

            flexDirection:
              "column",

            marginTop: 100,
          }}
        >
          <RobotFace size={130} />

          <h1
            style={{
              fontSize: 90,

              marginTop: 35,

              fontWeight: 900,
            }}
          >
            Nova AI
          </h1>

          <p
            style={{
              opacity: 0.6,

              fontSize: 24,

              marginTop: 10,
            }}
          >
            Create futuristic AI websites instantly
          </p>
        </div>
      )}

      {/* CHAT */}

      <div
        style={{
          width: "100%",

          maxWidth: 1100,

          margin: "50px auto",

          padding:
            "0 30px 180px",
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
                    fontSize: 13,
                    opacity: 0.5,
                  }}
                >
                  {m.role ===
                  "assistant"
                    ? "NOVA AI"
                    : "YOU"}
                </div>
              </div>

              <div
                style={{
                  background:
                    m.role ===
                    "assistant"
                      ? "rgba(255,255,255,.05)"
                      : "transparent",

                  border:
                    m.role ===
                    "assistant"
                      ? "1px solid rgba(255,255,255,.05)"
                      : "none",

                  padding:
                    m.role ===
                    "assistant"
                      ? 28
                      : 0,

                  borderRadius: 28,

                  fontSize: 20,

                  lineHeight: 1.8,

                  whiteSpace:
                    "pre-wrap",
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

            border:
              "1px solid rgba(255,255,255,.06)",

            borderRadius: 30,

            padding: 22,
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
              placeholder="Describe your dream website..."
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
                border: "none",

                padding:
                  "15px 28px",

                borderRadius: 18,

                background:
                  "linear-gradient(135deg,#2563eb,#7c3aed)",

                color: "white",

                cursor: "pointer",

                fontSize: 16,

                fontWeight: 700,
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
  );
}