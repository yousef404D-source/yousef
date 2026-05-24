"use client";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0f",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontSize: "60px",
          marginBottom: "20px",
        }}
      >
        NOVA AI
      </h1>

      <p
        style={{
          color: "#888",
          fontSize: "18px",
        }}
      >
        Bot is working successfully.
      </p>
    </main>
  );
}