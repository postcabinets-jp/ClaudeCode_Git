"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { CHARACTERS } from "@/types";

const FATIGUE_LABELS: Record<string, string> = {
  brain: "脳疲労タイプ",
  blood: "血流不足タイプ",
  nerve: "自律神経タイプ",
  organ: "内臓疲労タイプ",
  energy: "エネルギー不足タイプ",
};

const SCORE_LABELS: Record<string, string> = {
  brain: "脳",
  blood: "血流",
  nerve: "自律",
  organ: "内臓",
  energy: "活力",
};

function getScoreLabel(score: number): string {
  if (score >= 4) return "高め";
  if (score >= 3) return "やや高め";
  if (score >= 2) return "普通";
  if (score >= 1) return "低め";
  return "なし";
}

export default function ResultPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const latestDiagnosis = profile?.diagnosisHistory[0];
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!latestDiagnosis || !profile?.character) {
      router.replace("/diagnosis");
    }
  }, [hasHydrated, latestDiagnosis, profile, router]);

  if (!hasHydrated) return null;
  if (!latestDiagnosis || !profile?.character) return null;

  const char = profile.character;
  const charBase = CHARACTERS[char.type];

  const handleShare = async () => {
    const text = `てあて薬局で診断！\n私の疲労タイプは「${FATIGUE_LABELS[char.type]}」でした。\nパートナーは${char.name}${charBase.emoji}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "てあて薬局 診断結果", text });
      } catch {
        // ユーザーがキャンセルした場合は何もしない
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

      {/* Result Content — nR5jq */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        padding: "24px 28px 40px",
        overflow: "auto",
      }}>

        {/* Badge — rBadge */}
        <div style={{
          backgroundColor: "rgba(232,149,109,0.12)",
          borderRadius: 20,
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          border: "1px solid rgba(232,149,109,0.2)",
        }}>
          <span style={{ fontSize: 14 }}>✨</span>
          <span style={{ fontSize: 12, color: "#E8956D", fontWeight: 700 }}>診断完了</span>
        </div>

        {/* Subtitle — rMainTitle */}
        <p style={{
          margin: 0,
          fontSize: 15,
          color: "#C8DDD6",
          fontWeight: 400,
        }}>
          あなたの疲労タイプは
        </p>

        {/* Type title — rTypeTitle */}
        <h1 style={{
          margin: 0,
          fontSize: 32,
          fontWeight: 800,
          color: "#FFFFFF",
          textAlign: "center",
        }}>
          {FATIGUE_LABELS[char.type]}
        </h1>

        {/* Character circle — CharBirthCircle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            background: "radial-gradient(circle, #3D6B5A 0%, #2C4A3E 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 0 0 20px rgba(232,149,109,0.08), 0 20px 60px rgba(232,149,109,0.18)",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 80, lineHeight: 1 }}>{charBase.emoji}</span>
            <span style={{ color: "#E8956D", fontSize: 17, fontWeight: 700 }}>{char.name}</span>
            <span style={{ color: "#A8C5BB", fontSize: 12 }}>{char.levelName}</span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#A8C5BB", textAlign: "center" }}>
            チェックインを続けると{char.name}が育ちます
          </p>
        </div>

        {/* Score Cards — EN29o */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          {(["brain", "blood", "nerve", "organ", "energy"] as const).map((type) => {
            const score = latestDiagnosis.scores[type] ?? 0;
            const isPrimary = type === char.type;
            return (
              <div key={type} style={{
                flex: 1,
                borderRadius: 14,
                padding: 12,
                backgroundColor: isPrimary ? "#E8956D" : "#1E3830",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}>
                <span style={{ fontSize: 10, color: isPrimary ? "rgba(255,255,255,0.8)" : "#6B9E8F" }}>
                  {SCORE_LABELS[type]}
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#FDF8F2" }}>{score}</span>
                <span style={{ fontSize: 8, color: isPrimary ? "rgba(255,255,255,0.7)" : "#6B9E8F" }}>
                  {getScoreLabel(score)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Description */}
        <p style={{
          margin: 0,
          color: "#A8C5BB",
          fontSize: 14,
          textAlign: "center",
          lineHeight: 1.8,
        }}>
          {charBase.description}
        </p>

        {/* CTA Buttons — StartBtns */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
          {/* Primary CTA: チェックイン開始 */}
          <button
            onClick={() => router.push("/home")}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 28,
              backgroundColor: "#E8956D",
              color: "#1E3830",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 8px 24px rgba(232,149,109,0.4)",
            }}
          >
            毎日チェックインを始める
            <span>→</span>
          </button>

          {/* Secondary CTA: おすすめ漢方 */}
          <button
            onClick={() => router.push("/kampo")}
            style={{
              width: "100%",
              height: 52,
              borderRadius: 28,
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "#FDF8F2",
              fontSize: 14,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.18)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span>💊</span> おすすめ漢方を見る
          </button>
        </div>

        {/* Share row — shareRow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <button
            onClick={handleShare}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "#6B9E8F",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>{copied ? "✅" : "📤"}</span> {copied ? "コピーしました！" : "結果をシェア"}
          </button>
        </div>
      </div>
    </div>
  );
}
