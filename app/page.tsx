"use client";

import { useEffect, useRef, useState } from "react";
import {
  FaMicrophone,
  FaRobot,
  FaBolt,
  FaBrain,
  FaLock,
  FaMagic,
  FaEye,
  FaBug,
  FaStop,
} from "react-icons/fa";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { motion, AnimatePresence } from "framer-motion";

export default function GeneratorPage() {
  // 🔒 ACCESS
  const [access, setAccess] = useState(false);
  const [password, setPassword] = useState("");
  const SITE_PASSWORD = "yousefyousefyousef505";

  const unlockSite = () => {
    if (password === SITE_PASSWORD) setAccess(true);
    else alert("❌ Wrong Password");
  };

  // 🚀 CORE STATES
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [displayed, setDisplayed] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [history, setHistory] = useState([]);

  const [projectType, setProjectType] = useState("Website");
  const [language, setLanguage] = useState("English");

  // ⚙️ FEATURES
  const [threeD, setThreeD] = useState(false);

  // 🧠 MEMORY
  const [userStyle, setUserStyle] = useState({ vibe: "futuristic" });

  // 🎤 VOICE
  const { transcript, listening, resetTranscript } =
    useSpeechRecognition();

  const intervalRef = useRef(null);

  // 🌙 LOAD VOICE → PROMPT
  useEffect(() => {
    if (transcript) setPrompt(transcript);
  }, [transcript]);

  // 🧠 SAVE MEMORY
  useEffect(() => {
    localStorage.setItem("nova-style", JSON.stringify(userStyle));
  }, [userStyle]);

  // 🎤 TOGGLE VOICE
  const toggleVoice = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    } else {
      SpeechRecognition.startListening({
        continuous: true,
        language: "ar",
      });
    }
  };

  // ⌨️ ENTER KEY FIX
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generate();
    }
  };

  // ✍️ TYPE ANIMATION FIXED
  const typeText = (text) => {
    let i = 0;
    setDisplayed("");

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(intervalRef.current);
    }, 8);
  };

  // 🚀 GENERATE
  const generate = async () => {
    if (!prompt) return;

    setLoading(true);
    setThinking(true);
    setResult("");
    setDisplayed("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          projectType,
          language,
          userStyle,
        }),
      });

      const data = await res.json();
      const full = data.result || "No result";

      setResult(full);
      typeText(full);

      setHistory((prev) => {
        const updated = [prompt, ...prev];
        return updated.slice(0, 20);
      });
    } catch (err) {
      setResult("❌ Error generating result");
    }

    setThinking(false);
    setLoading(false);
  };

  // 🐞 DEBUG
  const debugAI = () => {
    if (!result) return alert("No result to debug");
    alert("🧠 Debug mode active (hook ready)");
  };

  // 🔒 LOCK SCREEN
  if (!access) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <motion.div className="p-10 rounded-2xl bg-zinc-900 text-center">
          <FaLock size={50} />
          <h1 className="text-2xl mt-4">Nova Clip Locked</h1>

          <input
            type="password"
            className="mt-4 p-3 w-full rounded bg-black border"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={unlockSite}
            className="mt-4 w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded"
          >
            Enter
          </button>
        </motion.div>
      </div>
    );
  }

  // 🚀 MAIN UI
  return (
    <div
      className={`min-h-screen bg-black text-white p-6 ${
        threeD ? "perspective-1000" : ""
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">⚡ Nova Clip</h1>

        <button
          onClick={debugAI}
          className="p-2 bg-red-600 rounded"
        >
          <FaBug /> Debug
        </button>
      </div>

      {/* INPUT */}
      <textarea
        className="w-full p-4 bg-zinc-900 rounded"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your idea..."
      />

      {/* ACTIONS */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={toggleVoice}
          className="p-3 bg-zinc-800 rounded flex items-center gap-2"
        >
          {listening ? <FaStop /> : <FaMicrophone />}
          {listening ? "Stop" : "Voice"}
        </button>

        <button
          onClick={generate}
          className="flex-1 p-3 bg-blue-600 rounded"
        >
          {loading ? "..." : "Enter"}
        </button>

        <button
          onClick={() => setPrompt("")}
          className="p-3 bg-zinc-800 rounded"
        >
          Clear
        </button>
      </div>

      {/* THINKING */}
      {thinking && (
        <div className="mt-4 space-y-1">
          <p>
            <FaBrain /> Thinking...
          </p>
          <p>
            <FaBolt /> Building...
          </p>
          <p>
            <FaRobot /> Optimizing...
          </p>
        </div>
      )}

      {/* RESULT */}
      {result && (
        <AnimatePresence>
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-zinc-900 rounded whitespace-pre-wrap"
          >
            {displayed}
          </motion.pre>
        </AnimatePresence>
      )}

      {/* HISTORY */}
      <div className="mt-6">
        <h2 className="text-xl mb-2">History</h2>

        {history.map((h, i) => (
          <div
            key={i}
            className="p-2 bg-zinc-800 mt-2 rounded cursor-pointer"
            onClick={() => setPrompt(h)}
          >
            {h}
          </div>
        ))}
      </div>
    </div>
  );
}