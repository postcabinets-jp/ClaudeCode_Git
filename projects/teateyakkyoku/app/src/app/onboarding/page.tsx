"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { signInWithGoogle } from "@/lib/supabase/auth";

const STEPS = [
  { emoji: "🔍", title: "5分の疲労診断", desc: "10の質問であなたの疲れタイプがわかる" },
  { emoji: "🌱", title: "キャラクターを育てる", desc: "毎日のチェックインでキャラが成長する" },
  { emoji: "💊", title: "専門家が選ぶ漢方", desc: "タイプ別に最適な漢方をお届け" },
];

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) setErrorMsg(decodeURIComponent(error));
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      // OAuth リダイレクトが発生するためここには通常到達しない
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "ログインに失敗しました";
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100svh",
      backgroundColor: "#2C4A3E",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
    }}>

      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "20px 28px 40px",
      }}>

        {/* Logo area */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          paddingTop: 32,
          paddingBottom: 48,
        }}>
          <div style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: "rgba(232,149,109,0.12)",
            border: "1px solid rgba(232,149,109,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 44,
          }}>
            🌿
          </div>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#FFFFFF" }}>てあて薬局</p>
          <p style={{ margin: 0, fontSize: 13, color: "#A8C5BB" }}>あなたの健康パートナー</p>
        </div>

        {/* Feature steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                backgroundColor: i === 0 ? "#3D5F52" : "rgba(255,255,255,0.05)",
                borderRadius: 20,
                padding: "0 20px",
                height: 72,
                border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{s.emoji}</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#FDF8F2" }}>{s.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#A8C5BB", lineHeight: 1.4 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* エラーメッセージ */}
          {errorMsg && (
            <div style={{
              backgroundColor: "rgba(200,80,60,0.15)",
              border: "1px solid rgba(200,80,60,0.3)",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 12,
              color: "#F5A090",
              lineHeight: 1.5,
            }}>
              {errorMsg}
            </div>
          )}

          {/* Googleでログインボタン */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              height: 56,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              color: "#1E2D2A",
              fontSize: 16,
              fontWeight: 700,
              border: "1px solid #E0D8CC",
              cursor: loading ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {/* Google G マーク */}
            {!loading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            ) : (
              <span style={{ fontSize: 16 }}>...</span>
            )}
            {loading ? "ログイン中..." : "Googleで始める"}
          </button>

          {/* ゲストで始める */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => router.push("/diagnosis")}
              style={{
                background: "none",
                border: "none",
                color: "#A8C5BB",
                fontSize: 13,
                cursor: "pointer",
                padding: "8px 0",
                fontFamily: "inherit",
              }}
            >
              名前なしで今すぐ始める →
            </button>
          </div>

          {/* 下部テキスト */}
          <p style={{
            margin: 0,
            fontSize: 11,
            color: "#6B9E8F",
            textAlign: "center",
            lineHeight: 1.6,
          }}>
            ログインすることで利用規約に同意し、<br/>
            漢方の一般的な知識提供であることを了承します
          </p>
        </div>
      </div>
    </div>
  );
}
