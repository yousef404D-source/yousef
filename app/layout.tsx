import "./globals.css";

export const metadata = {
  title: "Nova AI",
  description:
    "AI Website Builder",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#050816",
          color: "white",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            padding: "20px",
            background: "#020617",
            borderBottom:
              "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            ⚡ Nova AI
          </h2>
        </header>

        {children}
      </body>
    </html>
  );
}