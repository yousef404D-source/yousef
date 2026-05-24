"use client";

import { useEffect, useState } from "react";
import {
  FaMicrophone,
  FaRobot,
  FaBolt,
  FaBrain,
} from "react-icons/fa";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { motion } from "framer-motion";

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [displayedResult, setDisplayedResult] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [thinking, setThinking] =
    useState<boolean>(false);

  const [history, setHistory] = useState<string[]>(
    []
  );

  const [projectType, setProjectType] =
    useState<string>("Website");

  const [language, setLanguage] =
    useState<string>("English");

  const {
    transcript,
    listening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    const saved =
      localStorage.getItem("ai-history");

    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (transcript) {
      setPrompt(transcript);
    }
  }, [transcript]);

  const improvePrompt = async () => {
    if (!prompt) return;

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      setPrompt(data.result);
    } catch (err) {
      console.log(err);
    }
  };

  const generate = async () => {
    if (!prompt) return;

    setLoading(true);
    setThinking(true);

    setResult("");
    setDisplayedResult("");

    try {
      const res = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            prompt,
            projectType,
            language,
            history,
          }),
        }
      );

      const data = await res.json();

      const fullText =
        data.result || "No result";

      setResult(fullText);

      let i = 0;

      const interval = setInterval(() => {
        setDisplayedResult(
          fullText.slice(0, i)
        );

        i++;

        if (i > fullText.length) {
          clearInterval(interval);
        }
      }, 5);

      const updated = [prompt, ...history];

      setHistory(updated);

      localStorage.setItem(
        "ai-history",
        JSON.stringify(updated)
      );
    } catch (err) {
      setResult(
        "❌ حدث خطأ أثناء التوليد"
      );
    }

    setThinking(false);
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={styles.container}
      >
        <div style={styles.left}>
          <h1 style={styles.logo}>
            ⚡ Crystal AI Builder
          </h1>

          <p style={styles.desc}>
            Build Any Project With AI
          </p>

          <div style={styles.row}>
            <select
              value={projectType}
              onChange={(e) =>
                setProjectType(
                  e.target.value
                )
              }
              style={styles.select}
            >
              <option>Website</option>
              <option>Dashboard</option>
              <option>Game</option>
              <option>Mobile App</option>
              <option>SaaS</option>
            </select>

            <select
              value={language}
              onChange={(e) =>
                setLanguage(
                  e.target.value
                )
              }
              style={styles.select}
            >
              <option>English</option>
              <option>Arabic</option>
            </select>
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Build me a futuristic AI dashboard..."
            value={prompt}
            onChange={(e) =>
              setPrompt(e.target.value)
            }
          />

          <div style={styles.actions}>
            <button
              style={styles.voiceButton}
              onClick={() => {
                SpeechRecognition.startListening(
                  {
                    continuous: true,
                    language: "ar",
                  }
                );
              }}
            >
              <FaMicrophone />
              {listening
                ? " Listening..."
                : " Voice"}
            </button>

            <button
              style={styles.improveButton}
              onClick={improvePrompt}
            >
              ✨ Improve Prompt
            </button>
          </div>

          <button
            style={styles.generateButton}
            onClick={generate}
          >
            {loading
              ? "🧠 Thinking..."
              : "🚀 Generate"}
          </button>

          {thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.thinking}
            >
              <p>
                <FaBrain /> Analyzing
                project...
              </p>

              <p>
                <FaBolt /> Building
                architecture...
              </p>

              <p>
                <FaRobot /> Improving
                UI/UX...
              </p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.result}
            >
              <h2>
                🔥 Generated Result
              </h2>

              <pre style={styles.pre}>
                {displayedResult}
              </pre>
            </motion.div>
          )}

          {result && (
            <div style={styles.preview}>
              <div style={styles.previewTop}>
                <div style={styles.dot}></div>
                <div style={styles.dot}></div>
                <div style={styles.dot}></div>
              </div>

              <iframe
                srcDoc={`
                <html>
                  <body style="
                    background:#020617;
                    color:white;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                    height:100vh;
                    font-family:Arial;
                  ">
                    <h1>🚀 AI Preview</h1>
                  </body>
                </html>
              `}
                style={{
                  width: "100%",
                  height: "400px",
                  border: "none",
                  borderRadius: "15px",
                }}
              />
            </div>
          )}
        </div>

        <div style={styles.right}>
          <h2>📜 History</h2>

          <div style={styles.history}>
            {history.map(
              (
                item: string,
                index: number
              ) => (
                <div
                  key={index}
                  style={styles.historyItem}
                  onClick={() =>
                    setPrompt(item)
                  }
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "white",
    overflow: "hidden",
    position: "relative",
    fontFamily: "Arial",
  },

  bg: {
    position: "absolute",
    width: "700px",
    height: "700px",
    background: "#2563eb",
    filter: "blur(250px)",
    opacity: 0.15,
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
    width: "300px",
  },

  logo: {
    fontSize: "45px",
    fontWeight: "bold",
  },

  desc: {
    opacity: 0.7,
    marginBottom: "20px",
  },

  row: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },

  select: {
    flex: 1,
    padding: "12px",
    borderRadius: "14px",
    background: "#0f172a",
    color: "white",
    border: "1px solid #1e293b",
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

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  voiceButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "14px",
    border: "none",
    background: "#111827",
    color: "white",
    cursor: "pointer",
  },

  improveButton: {
    flex: 1,
    padding: "12px",
    borderRadius: "14px",
    border: "none",
    background:
      "linear-gradient(90deg,#7c3aed,#2563eb)",
    color: "white",
    cursor: "pointer",
  },

  generateButton: {
    width: "100%",
    marginTop: "15px",
    padding: "15px",
    borderRadius: "15px",
    border: "none",
    background:
      "linear-gradient(90deg,#2563eb,#7c3aed)",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
    cursor: "pointer",
  },

  thinking: {
    marginTop: "20px",
    background: "#0f172a",
    padding: "15px",
    borderRadius: "15px",
    border: "1px solid #1e293b",
    lineHeight: "2",
  },

  result: {
    marginTop: "20px",
    background: "#0f172a",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
  },

  pre: {
    whiteSpace: "pre-wrap",
    lineHeight: "1.7",
  },

  preview: {
    marginTop: "20px",
    background: "#0f172a",
    padding: "15px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
  },

  previewTop: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
  },

  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#334155",
  },

  history: {
    background: "#0f172a",
    padding: "15px",
    borderRadius: "20px",
    border: "1px solid #1e293b",
    maxHeight: "600px",
    overflow: "auto",
  },

  historyItem: {
    padding: "12px",
    borderRadius: "12px",
    background: "#111827",
    marginBottom: "10px",
    cursor: "pointer",
  },
};