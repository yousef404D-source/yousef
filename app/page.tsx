"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Project = {
  id: number;
  idea: string;
  html: string;
  user_id: string;
};

export default function Home() {

  // 🔒 PASSWORD
  const [access, setAccess] =
    useState(false);

  const [password, setPassword] =
    useState("");

  const SITE_PASSWORD =
    "yousefyousefyousef505";

  // 🌙 THEME
  const [darkMode, setDarkMode] =
    useState(true);

  // 💬 CHAT
  const [idea, setIdea] =
    useState("");

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [loading, setLoading] =
    useState(false);

  // 🌐 WEBSITE
  const [html, setHtml] =
    useState("");

  // 📂 PROJECTS
  const [projects, setProjects] =
    useState<Project[]>([]);

  const userId = "nova-user";

  const bottomRef =
    useRef<HTMLDivElement>(null);

  // 🔒 LOGIN
  function unlockSite() {

    if (
      password === SITE_PASSWORD
    ) {
      setAccess(true);
    } else {
      alert("Wrong Password");
    }
  }

  // 📂 LOAD PROJECTS
  useEffect(() => {

    if (access) {
      loadProjects();
    }

  }, [access]);

  async function loadProjects() {

    if (!supabase) return;

    const { data } =
      await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("id", {
          ascending: false,
        });

    if (data) {
      setProjects(data);
    }
  }

  // 💾 SAVE
  async function saveProject(
    htmlData: string,
    ideaText: string
  ) {

    if (!supabase) return;

    const newProject = {
      id: Date.now(),
      idea: ideaText,
      html: htmlData,
      user_id: userId,
    };

    await supabase
      .from("projects")
      .insert([newProject]);

    setProjects((prev) => [
      newProject,
      ...prev,
    ]);
  }

  // 🚀 GENERATE WEBSITE
  async function generateWebsite() {

    if (!idea.trim()) return;

    const userMessage = {
      role: "user" as const,
      content: idea,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setLoading(true);

    setIdea("");

    // 🤖 AI MESSAGES
    setTimeout(() => {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "🧠 Thinking about your idea...",
        },
      ]);

    }, 400);

    setTimeout(() => {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "🎨 Designing modern UI...",
        },
      ]);

    }, 1300);

    setTimeout(() => {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚡ Building your website...",
        },
      ]);

    }, 2200);

    try {

      await new Promise((resolve) =>
        setTimeout(resolve, 3000)
      );

      const res = await fetch(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            idea:
              userMessage.content,
          }),
        }
      );

      const data =
        await res.json();

      if (data.html) {

        setHtml(data.html);

        await saveProject(
          data.html,
          userMessage.content
        );

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "✅ Website completed successfully.",
          },
        ]);
      }

    } catch (err) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Failed to build website.",
        },
      ]);
    }

    setLoading(false);
  }

  // ⌨️ ENTER
  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      generateWebsite();
    }
  }

  // 🔽 AUTO SCROLL
  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // 🔒 PASSWORD SCREEN
  if (!access) {

    return (

      <div className="lock-page">

        <div className="lock-box">

          <h1>
            NOVA CLIP
          </h1>

          <p>
            Enter Password
          </p>

          <input
            type="password"
            placeholder="Password..."
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <button
            onClick={unlockSite}
          >
            Unlock
          </button>

        </div>

        <style jsx>{`

          .lock-page{
            min-height:100vh;
            background:#0f172a;
            display:flex;
            justify-content:center;
            align-items:center;
            font-family:Arial;
          }

          .lock-box{
            width:400px;
            background:rgba(255,255,255,0.08);
            padding:40px;
            border-radius:30px;
            color:white;
            text-align:center;
            backdrop-filter:blur(20px);
          }

          h1{
            font-size:50px;
          }

          input{
            width:100%;
            padding:16px;
            border:none;
            border-radius:15px;
            margin-top:20px;
            background:#111827;
            color:white;
            outline:none;
          }

          button{
            width:100%;
            margin-top:20px;
            padding:15px;
            border:none;
            border-radius:15px;
            cursor:pointer;
            font-weight:bold;
          }

        `}</style>

      </div>
    );
  }

  return (

    <div
      className={
        darkMode
          ? "page dark"
          : "page light"
      }
    >

      {/* 🌙 THEME */}
      <button
        className="theme-btn"
        onClick={() =>
          setDarkMode(!darkMode)
        }
      >
        {darkMode
          ? "☀️"
          : "🌙"}
      </button>

      {/* 🌌 BG */}
      <div className="bg">

        <div className="orb orb1"></div>

        <div className="orb orb2"></div>

      </div>

      {/* 💬 CHAT */}
      <div
        className={
          messages.length === 0
            ? "chat-container center"
            : "chat-container top"
        }
      >

        {/* 🧠 TITLE */}
        <h1 className="logo">
          NOVA CLIP
        </h1>

        <p className="subtitle">
          Build websites with AI
        </p>

        {/* 💬 MESSAGES */}
        <div className="messages">

          {messages.map(
            (msg, index) => (

              <div
                key={index}
                className={
                  msg.role === "user"
                    ? "user-msg"
                    : "ai-msg"
                }
              >
                {msg.content}
              </div>
            )
          )}

          <div ref={bottomRef}></div>

        </div>

        {/* ✍️ INPUT */}
        <div className="input-box">

          <textarea
            placeholder="Describe your website idea..."
            value={idea}
            onChange={(e) =>
              setIdea(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
          />

          <button
            onClick={
              generateWebsite
            }
            disabled={loading}
          >
            {loading
              ? "Thinking..."
              : "Generate"}
          </button>

        </div>

      </div>

      {/* 🌐 WEBSITE */}
      {html && (

        <div className="website-view">

          <iframe
            srcDoc={html}
            title="website"
          />

        </div>
      )}

      {/* 🎨 CSS */}
      <style jsx>{`

        .page{
          min-height:100vh;
          overflow-x:hidden;
          background:#020617;
          color:white;
          font-family:Arial;
          position:relative;
        }

        .dark{
          background:#020617;
          color:white;
        }

        .light{
          background:#f8fafc;
          color:black;
        }

        .theme-btn{
          position:fixed;
          top:20px;
          right:20px;
          width:55px;
          height:55px;
          border-radius:50%;
          border:none;
          cursor:pointer;
          font-size:22px;
          z-index:999;
        }

        .bg{
          position:absolute;
          inset:0;
          overflow:hidden;
        }

        .orb{
          position:absolute;
          width:500px;
          height:500px;
          border-radius:50%;
          filter:blur(140px);
        }

        .orb1{
          background:#2563eb;
          top:-100px;
          left:-100px;
          opacity:0.3;
        }

        .orb2{
          background:#7c3aed;
          bottom:-100px;
          right:-100px;
          opacity:0.3;
        }

        .chat-container{
          position:relative;
          z-index:2;
          max-width:900px;
          margin:auto;
          transition:0.5s;
          padding:30px;
        }

        .center{
          display:flex;
          flex-direction:column;
          justify-content:center;
          min-height:100vh;
        }

        .top{
          padding-top:40px;
        }

        .logo{
          font-size:70px;
          text-align:center;
          margin-bottom:10px;
        }

        .subtitle{
          text-align:center;
          opacity:0.7;
          margin-bottom:40px;
        }

        .messages{
          display:flex;
          flex-direction:column;
          gap:15px;
          margin-bottom:25px;
        }

        .user-msg{
          align-self:flex-end;
          background:#2563eb;
          padding:16px 20px;
          border-radius:20px;
          max-width:70%;
          animation:fadeUp 0.3s ease;
        }

        .ai-msg{
          align-self:flex-start;
          background:rgba(255,255,255,0.08);
          backdrop-filter:blur(20px);
          padding:16px 20px;
          border-radius:20px;
          max-width:70%;
          animation:fadeUp 0.3s ease;
        }

        .input-box{
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.1);
          backdrop-filter:blur(20px);
          border-radius:30px;
          padding:20px;
        }

        textarea{
          width:100%;
          border:none;
          resize:none;
          outline:none;
          background:transparent;
          color:inherit;
          font-size:18px;
          height:100px;
        }

        button{
          margin-top:15px;
          padding:14px 24px;
          border:none;
          border-radius:14px;
          cursor:pointer;
          font-weight:bold;
        }

        .website-view{
          position:relative;
          z-index:2;
          margin-top:40px;
          width:100%;
          height:100vh;
          animation:fadeUp 0.5s ease;
        }

        iframe{
          width:100%;
          height:100%;
          border:none;
          background:white;
        }

        @keyframes fadeUp{

          from{
            opacity:0;
            transform:translateY(20px);
          }

          to{
            opacity:1;
            transform:translateY(0px);
          }
        }

      `}</style>

    </div>
  );
}