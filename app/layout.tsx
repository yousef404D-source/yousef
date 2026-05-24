import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  Show,
} from "@clerk/nextjs";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              background: "#020617",
              color: "white",
            }}
          >
            <h2>⚡ Crystal AI</h2>

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <Show when="signed-out">
                <SignInButton />
                <SignUpButton />
              </Show>

              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>

          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}