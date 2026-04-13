"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIAGNOSIS_QUESTIONS, calcDiagnosisResult } from "@/lib/diagnosis";
import { useUserStore } from "@/store/userStore";

export default function DiagnosisPage() {
  const router = useRouter();
  const updateDiagnosis = useUserStore((s) => s.updateDiagnosis);
  const setProfile = useUserStore((s) => s.setProfile);
  const profile = useUserStore((s) => s.profile);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<"yes" | "no" | null>(null);
  const [phase, setPhase] = useState<"intro" | "question" | "section-break">("intro");

  const SECTION_NAMES = ["脳疲労", "血流", "自律神経", "内臓", "エネルギー"];
  const SECTION_BREAK_INDICES = [3, 7, 11, 15];

  const current = DIAGNOSIS_QUESTIONS[currentIndex];
  const total = DIAGNOSIS_QUESTIONS.length;
  const progress = (currentIndex / total) * 100;
  const isLast = currentIndex === total - 1;

  const handleAnswer = (choice: "yes" | "no") => {
    setSelected(choice);
    setTimeout(() => {
      const score = choice === "yes" ? 4 : 0;
      const newAnswers = { ...answers, [current.id]: score };
      setAnswers(newAnswers);
      setSelected(null);

      if (isLast) {
        const result = calcDiagnosisResult(newAnswers);
        if (!profile) {
          setProfile({
            id: crypto.randomUUID(),
            diagnosisHistory: [],
            continuousDays: 0,
            totalCheckins: 0,
            createdAt: new Date().toISOString(),
          });
        }
        updateDiagnosis(result);
        router.push("/result");
      } else if (SECTION_BREAK_INDICES.includes(currentIndex)) {
        setPhase("section-break");
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    }, 180);
  };

  // 診断説明画面
  if (phase === "intro") {
    return (
      <div style={{
        minHeight: "100svh",
        backgroundColor: "#FDF8F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
        padding: "0 24px",
        overflowY: "auto",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%", maxWidth: 360, padding: "40px 0" }}>
          <div style={{ fontSize: 64, lineHeight: 1 }}>🔍</div>

          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1E2D2A", textAlign: "center" }}>
            あなたの疲労タイプ診断
          </p>

          <p style={{ margin: 0, fontSize: 14, color: "#6B9E8F", textAlign: "center", lineHeight: 1.7 }}>
            20の質問に答えるだけで、<br />あなたの疲れの原因が<br />わかります。
          </p>

          <div style={{ width: "100%", height: 1, backgroundColor: "#E8E0D5" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#1E2D2A" }}>⏱ 所要時間: 約3分</p>
            <p style={{ margin: 0, fontSize: 14, color: "#1E2D2A" }}>📋 質問数: 20問</p>
            <p style={{ margin: 0, fontSize: 14, color: "#1E2D2A" }}>🎁 結果: あなた専用のキャラクター&漢方提案</p>
          </div>

          <div style={{ width: "100%", height: 1, backgroundColor: "#E8E0D5" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E2D2A" }}>5つの疲労タイプ</p>
            <p style={{ margin: 0, fontSize: 13, color: "#1E2D2A" }}>🦊 脳疲労</p>
            <p style={{ margin: 0, fontSize: 13, color: "#1E2D2A" }}>🐻 血流不足</p>
            <p style={{ margin: 0, fontSize: 13, color: "#1E2D2A" }}>🦌 自律神経</p>
            <p style={{ margin: 0, fontSize: 13, color: "#1E2D2A" }}>🐢 内臓疲労</p>
            <p style={{ margin: 0, fontSize: 13, color: "#1E2D2A" }}>🐱 エネルギー不足</p>
          </div>

          <button
            onClick={() => setPhase("question")}
            style={{
              width: "100%",
              height: 56,
              borderRadius: 28,
              backgroundColor: "#2C4A3E",
              color: "#FDF8F2",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 8px 24px rgba(44,74,62,0.25)",
              marginTop: 8,
            }}
          >
            診断を始める →
          </button>
        </div>
      </div>
    );
  }

  // セクション区切り画面
  if (phase === "section-break") {
    const doneIdx = SECTION_BREAK_INDICES.indexOf(currentIndex);
    const doneSectionName = SECTION_NAMES[doneIdx] ?? SECTION_NAMES[0];
    const nextSectionName = SECTION_NAMES[doneIdx + 1] ?? "";
    const filledDots = doneIdx + 1;

    return (
      <div style={{
        minHeight: "100svh",
        backgroundColor: "#FDF8F2",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
        gap: 16,
        padding: "0 24px",
      }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1E2D2A", textAlign: "center" }}>
          {doneSectionName}チェック完了!
        </p>
        {nextSectionName && (
          <p style={{ margin: 0, fontSize: 14, color: "#6B9E8F", textAlign: "center" }}>
            次は「{nextSectionName}」チェック
          </p>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          {SECTION_NAMES.map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: i < filledDots ? "#2C4A3E" : "#E0DDD8",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => {
            setPhase("question");
            setCurrentIndex(currentIndex + 1);
          }}
          style={{
            marginTop: 24,
            padding: "14px 32px",
            borderRadius: 28,
            backgroundColor: "#2C4A3E",
            color: "#FDF8F2",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
          }}
        >
          次のセクションへ →
        </button>
      </div>
    );
  }

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
        gap: 24,
        padding: "20px 24px 24px",
      }}>

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {currentIndex > 0 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#fff",
                  border: "1px solid #E8E0D5",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                ←
              </button>
            ) : (
              <div style={{ width: 36 }} />
            )}
            <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#6B9E8F" }}>疲労タイプ診断</span>
            </div>
            <div style={{ width: 36, display: "flex", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 12, color: "#A8C5BB" }}>{currentIndex + 1}/{total}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{
              height: 6,
              backgroundColor: "#E8E0D5",
              borderRadius: 3,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${progress + (1 / total) * 100}%`,
                backgroundColor: "#2C4A3E",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }} />
            </div>
            {/* Section dots */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const sectionSize = Math.floor(total / 5);
                const active = Math.floor(currentIndex / sectionSize) >= i;
                return (
                  <div key={i} style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: active ? "#1A1A1A" : "#E0DDD8",
                    transition: "background-color 0.2s",
                  }} />
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          padding: "32px 28px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          boxShadow: "0 4px 20px rgba(44,74,62,0.07)",
          flex: 1,
        }}>
          {/* Q number + question text */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#2C4A3E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#FDF8F2" }}>
                Q{currentIndex + 1}
              </span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "#1A1A1A",
                lineHeight: 1.5,
              }}>
                {current.text}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#AAAAAA" }}>
                当てはまると思う場合は「はい」を選んでください
              </p>
            </div>
          </div>

          {/* Yes / No buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => handleAnswer("yes")}
              style={{
                height: 56,
                borderRadius: 28,
                backgroundColor: selected === "yes" ? "#1A3830" : "#2C4A3E",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                width: "100%",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700, color: "#FFFFFF" }}>はい</span>
            </button>
            <button
              onClick={() => handleAnswer("no")}
              style={{
                height: 56,
                borderRadius: 28,
                backgroundColor: selected === "no" ? "#E8E5E0" : "#F5F3F0",
                border: "1px solid #E0DDD8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
                width: "100%",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1A1A" }}>いいえ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
