import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Nova — AI Website Builder",
  description:
    "Describe a website in plain language and Nova builds it — real code, a live preview, and instant edits as you keep talking.",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
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
          background: "#000000",
          color: "#ffffff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
