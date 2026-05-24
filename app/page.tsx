"use client";

import { useEffect, useState } from "react";

type Project = {
  id: number;
  idea: string;
  html: string;
};

export default function Home() {
  const [idea, setIdea] = useState<string>("");
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [projects, setProjects] = useState<Project[]>([]);

  const userId = "user-1"; // لاحقًا نربطه مع login

  // 📦 LOAD PROJECTS (from Supabase later)
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setProjects(data as Project[]);
    }
  }

  // 💾 SAVE PROJECT (FIXED TYPES)
  async function saveProject(htmlData: string, ideaText: string) {
    const newProject = {
      id: Date.now(),
      idea: ideaText,
      html: htmlData,
      user_id: userId,
    };

    await supabase.from("projects").insert([newProject]);

    setProjects((prev) => [newProject, ...prev]);
  }

  // 🚀 GENERATE AI
  async function generate() {
    if (!idea.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();

      const result = data.html || "";

      setHtml(result);

      await saveProject(result, idea);

      setIdea("");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h1>⚡ Nova Clip AI Builder</h1>

      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        placeholder="Describe your website..."
        style={{
          width: "100%",
          height: 120,
          marginTop: 20,
          padding: 10,
        }}
      />

      <button
        onClick={generate}
        disabled={loading}
        style={{
          marginTop: 10,
          padding: 10,
          cursor: "pointer",
        }}
      >
        {loading ? "Thinking..." : "Generate"}
      </button>

      {/* PREVIEW */}
      {html && (
        <div style={{ marginTop: 30 }}>
          <iframe
            srcDoc={html}
            style={{ width: "100%", height: 500 }}
          />
        </div>
      )}

      {/* PROJECTS */}
      <div style={{ marginTop: 40 }}>
        <h2>Saved Projects</h2>

        {projects.map((p) => (
          <div
            key={p.id}
            style={{
              padding: 10,
              border: "1px solid #ccc",
              marginTop: 10,
              cursor: "pointer",
            }}
            onClick={() => setHtml(p.html)}
          >
            {p.idea}
          </div>
        ))}
      </div>
    </div>
  );
}