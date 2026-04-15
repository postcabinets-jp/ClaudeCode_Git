"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIAGNOSIS_QUESTIONS, ANSWER_OPTIONS, calcDiagnosisResult } from "@/lib/diagnosis";
import { useUserStore } from "@/store/userStore";

type FatigueSection = {
  label: string;
  emoji: string;
  ids: string[];
};

const SECTIONS: FatigueSection[] = [
  { label: "脳疲労", emoji: "🧠", ids: ["b1", "b2", "b3", "b4"] },
  { label: "血流不足", emoji: "🩸", ids: ["bl1", "bl2", "bl3", "bl4"] },
  { label: "自律神経", emoji: "🌿", ids: ["n1", "n2", "n3", "n4"] },
  { label: "内臓疲労", emoji: "🫚", ids: ["o1", "o2", "o3", "o4"] },
  { label: "エネルギー", emoji: "⚡", ids: ["e1", "e2", "e3", "e4"] },
];

export default function DiagnosisPage() {
  const router = useRouter();
  const updateDiagnosis = useUserStore((s) => s.updateDiagnosis);
  const setProfile = useUserStore((s) => s.setProfile);
  const profile = useUserStore((s) => s.profile);

  // answers: questionId → score (0〜3)
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const totalQuestions = DIAGNOSIS_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const handleAnswer = (id: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [id]: score }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;

    const result = calcDiagnosisResult(answers);

    if (!profile) {
      setProfile({
        id: crypto.randomUUID(),
        nickname: "てあてユーザー",
        diagnosisHistory: [],
        continuousDays: 0,
        totalCheckins: 0,
        createdAt: new Date().toISOString(),
      });
    }

    updateDiagnosis(result);
    router.push("/result");
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        backgroundColor: "#FDF8F2",
        fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
        paddingBottom: 32,
      }}
    >
      {/* ページヘッダー */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid #F0EAE0",
          backgroundColor: "#FDF8F2",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 800,
            color: "#1E2D2A",
          }}
        >
          あなたの疲労タイプを調べます
        </p>
        <p
          style={{
            margin: "4px 0 12px",
            fontSize: 13,
            color: "#6B9E8F",
          }}
        >
          20の質問に答えてください（約2分）
        </p>
        {/* 進捗バー */}
        <div
          style={{
            height: 4,
            backgroundColor: "#E8E0D5",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(answeredCount / totalQuestions) * 100}%`,
              backgroundColor: "#2C4A3E",
              borderRadius: 2,
              transition: "width 0.2s ease",
            }}
          />
        </div>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 11,
            color: "#A8C5BB",
            textAlign: "right",
          }}
        >
          {answeredCount} / {totalQuestions}
        </p>
      </div>

      {/* セクション一覧 */}
      <div style={{ padding: "0 16px", marginTop: 16 }}>
        {SECTIONS.map((section) => {
          const sectionQuestions = DIAGNOSIS_QUESTIONS.filter((q) =>
            section.ids.includes(q.id)
          );

          return (
            <div key={section.label} style={{ marginBottom: 20 }}>
              {/* セクションヘッダー */}
              <div
                style={{
                  backgroundColor: "#2C4A3E",
                  borderRadius: "12px 12px 0 0",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>{section.emoji}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#FFFFFF",
                  }}
                >
                  {section.label}
                </span>
              </div>

              {/* 質問行 */}
              <div
                style={{
                  borderRadius: "0 0 12px 12px",
                  overflow: "hidden",
                  border: "1px solid #F0EAE0",
                  borderTop: "none",
                }}
              >
                {sectionQuestions.map((q, idx) => {
                  const selectedScore = answers[q.id];
                  const isAnswered = selectedScore !== undefined;
                  const isLast = idx === sectionQuestions.length - 1;

                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: "14px 16px",
                        backgroundColor: isAnswered ? "#F5F0E8" : "#FFFFFF",
                        borderBottom: isLast ? "none" : "1px solid #F0EAE0",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      {/* 質問テキスト */}
                      <p
                        style={{
                          margin: "0 0 10px",
                          fontSize: 14,
                          color: "#1E2D2A",
                          lineHeight: 1.5,
                        }}
                      >
                        {q.text}
                      </p>

                      {/* 4択ボタン */}
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        {ANSWER_OPTIONS.map((option) => {
                          const isSelected = selectedScore === option.score;
                          return (
                            <button
                              key={option.score}
                              onClick={() => handleAnswer(q.id, option.score)}
                              style={{
                                flex: 1,
                                height: 36,
                                borderRadius: 8,
                                border: isSelected
                                  ? "none"
                                  : "1px solid #E0D8CE",
                                cursor: "pointer",
                                backgroundColor: isSelected
                                  ? "#2C4A3E"
                                  : "#FFFFFF",
                                color: isSelected ? "#FFFFFF" : "#6B9E8F",
                                fontSize: 12,
                                fontWeight: isSelected ? 700 : 500,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition:
                                  "background-color 0.15s ease, color 0.15s ease",
                                whiteSpace: "nowrap",
                                padding: "0 4px",
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 送信ボタン */}
      <div style={{ padding: "8px 16px 0" }}>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 28,
            border: "none",
            cursor: allAnswered ? "pointer" : "not-allowed",
            backgroundColor: allAnswered ? "#2C4A3E" : "#CCCCCC",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background-color 0.2s ease",
            boxShadow: allAnswered
              ? "0 8px 24px rgba(44,74,62,0.25)"
              : "none",
          }}
        >
          診断する →
        </button>
        {!allAnswered && (
          <p
            style={{
              margin: "8px 0 0",
              textAlign: "center",
              fontSize: 12,
              color: "#AAAAAA",
            }}
          >
            残り {totalQuestions - answeredCount} 問あります
          </p>
        )}
      </div>
    </div>
  );
}
