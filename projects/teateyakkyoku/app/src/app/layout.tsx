import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "てあて薬局",
  description: "あなたの疲れに寄り添う、オーダーメイドの漢方体験",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "てあて薬局" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2C4A3E",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{
        margin: 0,
        padding: 0,
        backgroundColor: "#E8E0D5",
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "'Inter', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', sans-serif",
      }}>
        <div style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#FDF8F2",
          boxShadow: "0 0 60px rgba(0,0,0,0.15)",
        }}>
          {children}
        </div>
      </body>
    </html>
  );
}
