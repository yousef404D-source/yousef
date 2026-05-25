"use client";

import {
  useState,
  useRef,
  useEffect,
} from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type NovaResponse = {
  reply?: string;
};

export default function NovaClip() {

  /* ---------------- PASSWORD ---------------- */

  const [authorized, setAuthorized] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const realPassword =
    "yousefyousefyousef505";

  function unlock() {

    if (
      password === realPassword
    ) {

      setAuthorized(true);

    } else {

      alert("Wrong Password");
    }
  }

  /* ---------------- CHAT ---------------- */

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [phase, setPhase] =
    useState<
      "thinking" |
      "building" |
      "sending" |
      ""
    >("");

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, loading]);

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

    setPhase("thinking");

    setTimeout(() => {
      setPhase("building");
    }, 1500);

    setTimeout(() => {
      setPhase("sending");
    }, 3500);

    try {

      const res =
        await fetch("/api/nova", {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: text,
          }),
        });

      const data:
        NovaResponse =
          await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Nova AI failed.",
        },
      ]);

    } catch (err) {

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

    setPhase("");
  }

  function handleKeyDown(
    e:
      React.KeyboardEvent<HTMLInputElement>
  ) {

    if (e.key === "Enter") {

      sendMessage();
    }
  }

  /* ---------------- ROBOT ---------------- */

  function RobotFace() {

    return (

      <div
        style={{
          width: 95,
          height: 95,

          borderRadius: "50%",

          background:
            phase === "thinking"
              ? "linear-gradient(135deg,#2563eb,#60a5fa)"
              : phase === "building"
              ? "linear-gradient(135deg,#7c3aed,#c084fc)"
              : phase === "sending"
              ? "linear-gradient(135deg,#06b6d4,#22d3ee)"
              : "linear-gradient(135deg,#2563eb,#7c3aed)",

          display: "flex",

          justifyContent:
            "center",

          alignItems:
            "center",

          position: "relative",

          transition:
            "all .4s ease",

          boxShadow:
            "0 0 60px rgba(59,130,246,.45)",

          animation:
            loading
              ? "pulse 1.5s infinite"
              : "none",
        }}
      >

        {/* eyes */}

        <div
          style={{
            position: "absolute",

            top: 35,

            left: 24,

            width: 16,

            height: 16,

            borderRadius: "50%",

            background: "white",

            animation:
              loading
                ? "blink 1s infinite"
                : "none",
          }}
        />

        <div
          style={{
            position: "absolute",

            top: 35,

            right: 24,

            width: 16,

            height: 16,

            borderRadius: "50%",

            background: "white",

            animation:
              loading
                ? "blink 1s infinite"
                : "none",
          }}
        />

        {/* mouth */}

        <div
          style={{
            position: "absolute",

            bottom: 24,

            width:
              phase === "thinking"
                ? 18
                : 35,

            height: 6,

            borderRadius: 20,

            background: "white",

            transition:
              "all .3s ease",
          }}
        />

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

          alignItems:
            "center",

          color: "white",

          fontFamily:
            "Arial",
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

            textAlign:
              "center",
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
            <RobotFace />
          </div>

          <h1
            style={{
              fontSize: 55,

              marginBottom: 10,
            }}
          >
            Nova Clip
          </h1>

          <p
            style={{
              opacity: .6,

              marginBottom: 35,
            }}
          >
            Secure AI access
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
                "#2563eb",

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

  /* ---------------- MAIN WEBSITE ---------------- */

  return (

    <div
      style={{
        background:
          "#050816",

        minHeight: "100vh",

        color: "white",

        overflow: "hidden",

        fontFamily:
          "Arial",
      }}
    >

      {/* animations */}

      <style>{`

        @keyframes pulse {

          0% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }

          100% {
            transform: scale(1);
          }
        }

        @keyframes blink {

          0% {
            opacity: 1;
          }

          50% {
            opacity: .3;
          }

          100% {
            opacity: 1;
          }
        }

      `}</style>

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

          alignItems:
            "center",

          paddingTop: 25,

          gap: 20,
        }}
      >

        <div
          style={{
            transform:
              "scale(.7)",
          }}
        >
          <RobotFace />
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

              alignItems:
                "center",

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
                  textAlign:
                    "center",

                  marginBottom: 45,
                }}
              >

                <div
                  style={{
                    display: "flex",

                    justifyContent:
                      "center",

                    marginBottom: 20,
                  }}
                >
                  <RobotFace />
                </div>

                <h1
                  style={{
                    fontSize: 75,

                    fontWeight: 900,

                    marginBottom: 15,
                  }}
                >
                  Nova Clip
                </h1>

                <p
                  style={{
                    opacity: .6,

                    fontSize: 22,
                  }}
                >
                  AI Website Builder
                </p>

              </div>

              {/* INPUT */}

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

                  placeholder="Describe your website..."

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

                      cursor:
                        "pointer",

                      fontSize: 16,
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
        )}

        {/* CHAT */}

        {messages.length > 0 && (

          <>
            <div
              style={{
                flex: 1,

                overflowY:
                  "auto",

                padding:
                  "40px 80px 170px",

                maxWidth: 1200,

                width: "100%",

                margin:
                  "0 auto",
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

                        gap: 12,

                        marginBottom: 12,
                      }}
                    >

                      {m.role ===
                        "assistant" && (
                        <div
                          style={{
                            transform:
                              "scale(.45)",
                            marginLeft:
                              -20,
                          }}
                        >
                          <RobotFace />
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: 14,

                          opacity: .5,
                        }}
                      >
                        {m.role ===
                        "user"
                          ? "YOU"
                          : "NOVA CLIP"}
                      </div>

                    </div>

                    <div
                      style={{
                        fontSize: 20,

                        lineHeight:
                          1.8,

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

              {/* THINKING */}

              {loading && (

                <div
                  style={{
                    marginTop: 10,
                  }}
                >

                  <div
                    style={{
                      display: "flex",

                      alignItems:
                        "center",

                      gap: 15,
                    }}
                  >

                    <RobotFace />

                    <div>

                      <div
                        style={{
                          fontSize: 22,

                          fontWeight:
                            700,
                        }}
                      >
                        Nova Clip
                      </div>

                      <div
                        style={{
                          opacity: .6,

                          marginTop: 8,
                        }}
                      >
                        {phase ===
                          "thinking" &&
                          "Thinking..."}

                        {phase ===
                          "building" &&
                          "Adding final touches..."}

                        {phase ===
                          "sending" &&
                          "Generating website..."}
                      </div>

                    </div>

                  </div>

                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* BOTTOM INPUT */}

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

                    placeholder="Describe your website..."

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
                      : "Generate"}
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