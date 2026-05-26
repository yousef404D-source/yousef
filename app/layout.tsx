export const metadata = {
  title: "Nova AI",
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
          fontFamily: "Arial",
        }}
      >
        {children}
      </body>
    </html>
  );
}