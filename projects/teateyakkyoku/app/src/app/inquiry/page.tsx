"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { PRODUCTS_DATA } from "@/lib/products-data";
import { saveInquiry } from "@/lib/supabase/db";
import { TabBar } from "@/components/TabBar";

type Phase = "form" | "sending" | "done" | "error";

function InquiryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profile = useUserStore((s) => s.profile);

  const kampoId = searchParams.get("kampo");
  const kampo = kampoId ? PRODUCTS_DATA.find((p) => p.id === kampoId) : null;

  const [phase, setPhase] = useState<Phase>("form");
  const [name, setName] = useState(profile?.nickname ?? "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    kampo ? `「${kampo.name}」について相談したいです。` : ""
  );

  // プロファイルが後からhydrateされた場合に初期値を更新
  useEffect(() => {
    if (profile?.nickname && !name) {
      setName(profile.nickname);
    }
  }, [profile?.nickname]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setPhase("sending");

    const ok = await saveInquiry({
      anonId: profile.id,
      kampoId: kampo?.id,
      kampoName: kampo?.name,
      userName: name,
      email,
      message,
    });

    setPhase(ok ? "done" : "error");
  }

  // 完了画面
  if (phase === "done") {
    return (
      <div
        style={{
          minHeight: "100svh",
          backgroundColor: "#FDF8F2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
          padding: "0 32px",
          gap: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56 }}>✅</div>
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 20,
              fontWeight: 700,
              color: "#1E2D2A",
            }}
          >
            送信しました
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#6B9E8F", lineHeight: 1.7 }}>
            通常1-2営業日以内にご返信いたします。
          </p>
        </div>
        <button
          onClick={() => router.push("/home")}
          style={{
            marginTop: 8,
            padding: "14px 40px",
            borderRadius: 28,
            backgroundColor: "#2C4A3E",
            color: "#FDF8F2",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ホームに戻る
        </button>
      </div>
    );
  }

  // エラー画面
  if (phase === "error") {
    return (
      <div
        style={{
          minHeight: "100svh",
          backgroundColor: "#FDF8F2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
          padding: "0 32px",
          gap: 20,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56 }}>⚠️</div>
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 18,
              fontWeight: 700,
              color: "#1E2D2A",
            }}
          >
            送信に失敗しました
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#6B9E8F", lineHeight: 1.7 }}>
            時間をおいてもう一度お試しください。
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 300 }}>
          <button
            onClick={() => setPhase("form")}
            style={{
              padding: "14px",
              borderRadius: 28,
              backgroundColor: "#2C4A3E",
              color: "#FDF8F2",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            もう一度試す
          </button>
          <button
            onClick={() => router.push("/home")}
            style={{
              padding: "14px",
              borderRadius: 28,
              backgroundColor: "transparent",
              color: "#6B9E8F",
              fontSize: 15,
              fontWeight: 600,
              border: "1.5px solid #C8D8D4",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const isSending = phase === "sending";

  return (
    <div
      style={{
        minHeight: "100svh",
        backgroundColor: "#FDF8F2",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          backgroundColor: "#FDF8F2",
          borderBottom: "1px solid #F0EAE0",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            color: "#1E2D2A",
            flex: 1,
          }}
        >
          🌿 漢方のご相談
        </p>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "24px 20px 32px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {/* サブテキスト */}
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#6B9E8F",
            lineHeight: 1.7,
          }}
        >
          お気軽にご相談ください。薬剤師が個別にお答えします。
        </p>

        {/* 相談する漢方 */}
        {kampo && (
          <div
            style={{
              backgroundColor: "#F0F5F3",
              borderRadius: 16,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 28,
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#E8F5E9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              🌿
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 2px",
                  fontSize: 11,
                  color: "#8A9E98",
                  fontWeight: 600,
                }}
              >
                相談する漢方
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1E2D2A",
                }}
              >
                {kampo.name}
              </p>
            </div>
          </div>
        )}

        {/* フォーム */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* お名前 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4A6B63",
              }}
            >
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田 花子"
              required
              disabled={isSending}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                border: "1.5px solid #E0D8CC",
                backgroundColor: "#fff",
                fontSize: 15,
                color: "#1E2D2A",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          {/* メールアドレス */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4A6B63",
              }}
            >
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              disabled={isSending}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                border: "1.5px solid #E0D8CC",
                backgroundColor: "#fff",
                fontSize: 15,
                color: "#1E2D2A",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
          </div>

          {/* ご相談内容 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#4A6B63",
              }}
            >
              ご相談内容
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ご相談内容をご記入ください"
              required
              rows={5}
              disabled={isSending}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                border: "1.5px solid #E0D8CC",
                backgroundColor: "#fff",
                fontSize: 15,
                color: "#1E2D2A",
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
                lineHeight: 1.7,
              }}
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSending}
            style={{
              height: 56,
              borderRadius: 28,
              backgroundColor: isSending ? "#A8C5BB" : "#2C4A3E",
              color: "#FDF8F2",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: isSending ? "default" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: isSending ? "none" : "0 4px 16px rgba(0,0,0,0.20)",
            }}
          >
            {isSending ? "送信中…" : "送信する"}
          </button>
        </form>
      </div>

      <TabBar activePath="/home" />
    </div>
  );
}

export default function InquiryPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100svh",
            backgroundColor: "#FDF8F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
            color: "#6B9E8F",
            fontSize: 14,
          }}
        >
          読み込み中…
        </div>
      }
    >
      <InquiryForm />
    </Suspense>
  );
}
