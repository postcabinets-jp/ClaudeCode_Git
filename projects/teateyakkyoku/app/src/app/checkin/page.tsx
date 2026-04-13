"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { CHARACTERS } from "@/types";
import {
  selectDailyQuestions,
  calcCheckinResult,
  type DailyQuestion,
  type DailyCheckinResult,
} from "@/lib/daily-checkin";

type Phase = "loading" | "question" | "result" | "already_done";

// 4択: 0=ない, 1=あまりない, 2=ときどきある, 3=よくある
const ANSWER_OPTIONS = [
  { label: "よくある", score: 3, fill: "#2C4A3E", color: "#FFFFFF", border: "none" },
  { label: "ときどきある", score: 2, fill: "#F5F0E8", color: "#1E2D2A", border: "1px solid #E0D8CC" },
  { label: "あまりない", score: 1, fill: "#F5F0E8", color: "#1E2D2A", border: "1px solid #E0D8CC" },
  { label: "ない", score: 0, fill: "#F5F0E8", color: "#1E2D2A", border: "1px solid #E0D8CC" },
];

export default function CheckinPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const recentCheckinQuestionIds = useUserStore((s) => s.recentCheckinQuestionIds);
  const incrementCheckin = useUserStore((s) => s.incrementCheckin);
  const addCheckinQuestionIds = useUserStore((s) => s.addCheckinQuestionIds);
  const hasCheckedInToday = useUserStore((s) => s.hasCheckedInToday);

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<DailyQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Omit<DailyCheckinResult, "createdAt" | "timeSlot"> | null>(null);
  const [animating, setAnimating] = useState(false);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    if (!profile.character) {
      router.replace("/diagnosis");
      return;
    }
    if (hasCheckedInToday()) {
      setPhase("already_done");
      return;
    }

    const history = profile.diagnosisHistory;
    const secondaryType = history.length > 0
      ? (history[0].secondaryType ?? "nerve")
      : "nerve";

    const qs = selectDailyQuestions(
      profile.character.type,
      secondaryType,
      recentCheckinQuestionIds
    );
    setQuestions(qs);
    setPhase("question");
  }, [hasHydrated, profile, recentCheckinQuestionIds, router]);

  if (!hasHydrated || !profile || !profile.character) return null;

  const charBase = CHARACTERS[profile.character.type];
  const currentQ = questions[currentIndex];

  const handleAnswer = (score: number) => {
    if (animating || !currentQ) return;
    setSelectedScore(score);
    setAnimating(true);

    const newAnswers = { ...answers, [currentQ.id]: score };
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedScore(null);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
        setAnimating(false);
      } else {
        const res = calcCheckinResult(questions, newAnswers);
        setResult(res);
        incrementCheckin();
        addCheckinQuestionIds(questions.map((q) => q.id));
        setPhase("result");
        setAnimating(false);
      }
    }, 250);
  };

  // ===== Loading =====
  if (phase === "loading") {
    return (
      <div style={{
        height: "100svh",
        backgroundColor: "#FDF8F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ fontSize: 32 }}>{charBase.emoji}</div>
      </div>
    );
  }

  // ===== Already done =====
  if (phase === "already_done") {
    return (
      <div style={{
        height: "100svh",
        backgroundColor: "#FDF8F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
        padding: "0 32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 72 }}>{charBase.emoji}</div>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#1E2D2A" }}>
            今日はもうチェック済みだよ
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#6B9E8F", lineHeight: 1.6 }}>
            また明日チェックしてね。<br />継続することが大切だよ！
          </p>
        </div>
        <button
          onClick={() => router.push("/home")}
          style={{
            padding: "16px 32px",
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

  // ===== Result =====
  if (phase === "result" && result) {
    const overallPercent = result.overallPercent;
    const barColor = overallPercent >= 70 ? "#C05050" : overallPercent >= 40 ? "#E8956D" : "#4CAF8A";

    return (
      <div style={{
        minHeight: "100svh",
        backgroundColor: "#FDF8F2",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
      }}>
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px 24px 40px",
          gap: 24,
        }}>
          {/* キャラ */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "#2C4A3E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              margin: "0 auto 8px",
            }}>
              {charBase.emoji}
            </div>
            <div style={{ fontSize: 13, color: "#6B9E8F", fontWeight: 600 }}>
              {charBase.name} Lv.{profile.character.level}
            </div>
          </div>

          {/* フィードバックカード */}
          <div style={{
            backgroundColor: "#2C4A3E",
            borderRadius: 20,
            padding: "18px 22px",
            width: "100%",
            maxWidth: 340,
          }}>
            <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#FDF8F2", lineHeight: 1.5 }}>
              {result.feedback}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: "#A8C5BB", lineHeight: 1.6 }}>
              {result.typeFeedback}
            </p>
          </div>

          {/* スコアバー */}
          <div style={{ width: "100%", maxWidth: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, color: "#8A9E98" }}>
              <span>今日の疲労スコア</span>
              <span style={{ fontWeight: 700, color: barColor }}>{overallPercent}%</span>
            </div>
            <div style={{ height: 8, backgroundColor: "#EDE8E0", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${overallPercent}%`,
                backgroundColor: barColor,
                borderRadius: 4,
                transition: "width 0.8s ease",
              }} />
            </div>
          </div>

          <button
            onClick={() => router.push("/home")}
            style={{
              width: "100%",
              maxWidth: 340,
              padding: "16px",
              borderRadius: 16,
              backgroundColor: "#2C4A3E",
              border: "none",
              color: "#FDF8F2",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ホームに戻る
          </button>

          <p style={{ fontSize: 11, color: "#8A9E98", textAlign: "center", padding: "0 24px", lineHeight: 1.6, margin: 0 }}>
            体調記録は健康管理の目安です。体調に変化を感じたら医療機関を受診してください。
          </p>
        </div>
      </div>
    );
  }

  // ===== Question =====
  return (
    <div style={{
      height: "100svh",
      backgroundColor: "#FDF8F2",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        height: 56,
      }}>
        <button
          onClick={() => router.push("/home")}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#fff",
            border: "1px solid #E8E5E0",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <p style={{ flex: 1, margin: 0, fontSize: 15, fontWeight: 700, color: "#1E2D2A" }}>
          今日の体チェック
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "#8A9E98" }}>
          {currentIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        padding: "24px 20px",
        overflowY: "auto",
      }}>

        {/* キャラエリア */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 120,
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#2C4A3E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
          }}>
            {charBase.emoji}
          </div>
          <p style={{ margin: 0, fontSize: 14, color: "#6B7F7A" }}>今日の調子はどう？</p>
        </div>

        {/* 質問カード */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 20,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
        }}>
          {/* Q番号 */}
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#2C4A3E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#FDF8F2" }}>Q{currentIndex + 1}</span>
          </div>

          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1E2D2A", lineHeight: 1.5 }}>
            {currentQ?.text}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#8A9E98" }}>
            あなたに当てはまる頻度を選んでください
          </p>

          {/* 選択肢 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ANSWER_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => handleAnswer(opt.score)}
                disabled={animating}
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: selectedScore === opt.score ? "#1A3830" : opt.fill,
                  border: opt.border,
                  cursor: animating ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  transition: "all 0.15s",
                  width: "100%",
                  opacity: animating ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: opt.score === 3 ? 600 : 400, color: opt.color }}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 進捗ドット */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i < currentIndex ? "#4CAF8A" : i === currentIndex ? "#2C4A3E" : "#DDD8D0",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
