"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

// 4項目の定義
const ITEMS = [
  {
    key: "brain",
    emoji: "🧠",
    label: "頭の疲れ",
    minLabel: "スッキリ",
    maxLabel: "ぼーっとする",
  },
  {
    key: "body",
    emoji: "💪",
    label: "体の重さ",
    minLabel: "軽い",
    maxLabel: "重だるい",
  },
  {
    key: "stomach",
    emoji: "🫁",
    label: "胃腸の調子",
    minLabel: "快調",
    maxLabel: "重い・不快",
  },
  {
    key: "sleep",
    emoji: "😴",
    label: "睡眠の質",
    minLabel: "ぐっすり",
    maxLabel: "眠れなかった",
  },
] as const;

type ItemKey = (typeof ITEMS)[number]["key"];

type SliderValues = Record<ItemKey, number>;

function getBorderColor(value: number): string {
  if (value <= 2) return "#6B9E8F";
  if (value === 3) return "#C8A96E";
  return "#E8956D";
}

function SliderCard({
  emoji,
  label,
  minLabel,
  maxLabel,
  value,
  onChange,
}: {
  emoji: string;
  label: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const borderColor = getBorderColor(value);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #F0EAE0",
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 16,
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-left-color 0.3s ease",
      }}
    >
      {/* ラベル行 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{emoji}</span>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1E2D2A",
            }}
          >
            {label}
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: borderColor,
            minWidth: 36,
            textAlign: "right",
            transition: "color 0.3s ease",
          }}
        >
          {value} / 5
        </span>
      </div>

      {/* スライダー */}
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          height: 6,
          accentColor: "#2C4A3E",
          cursor: "pointer",
margin: 0,
        }}
      />

      {/* 両端ラベル */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 11, color: "#8A9E98" }}>{minLabel}</span>
        <span style={{ fontSize: 11, color: "#8A9E98" }}>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function CheckinPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const incrementCheckin = useUserStore((s) => s.incrementCheckin);
  const hasCheckedInToday = useUserStore((s) => s.hasCheckedInToday);

  const [values, setValues] = useState<SliderValues>({
    brain: 3,
    body: 3,
    stomach: 3,
    sleep: 3,
  });

  const [alreadyDone, setAlreadyDone] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!profile) {
      router.replace("/onboarding");
      return;
    }
    if (hasCheckedInToday()) {
      setAlreadyDone(true);
    }
  }, [hasHydrated, profile, router, hasCheckedInToday]);

  // ローディング中
  if (!hasHydrated || !profile) return null;

  // キャラアイコン（未設定でも表示できるようにフォールバック）
  const charEmoji = profile.character?.emoji ?? "🌿";

  // 既にチェックイン済み
  if (alreadyDone) {
    return (
      <div
        style={{
          height: "100svh",
          backgroundColor: "#FDF8F2",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
          padding: "0 32px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64 }}>{charEmoji}</div>
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 18,
              fontWeight: 700,
              color: "#1E2D2A",
            }}
          >
            今日はもう記録済みです
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#6B9E8F",
              lineHeight: 1.6,
            }}
          >
            また明日、体の調子を記録してね。
          </p>
        </div>
        <button
          onClick={() => router.push("/home")}
          style={{
            height: 56,
            width: "100%",
            maxWidth: 320,
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

  const handleRecord = () => {
    // LocalStorageに詳細データを保存
    const record = {
      date: new Date().toISOString().slice(0, 10),
      values,
      recordedAt: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(
        localStorage.getItem("teatey_checkin_logs") ?? "[]"
      ) as unknown[];
      existing.push(record);
      localStorage.setItem("teatey_checkin_logs", JSON.stringify(existing));
    } catch {
      // LocalStorage 書き込み失敗は無視
    }

    incrementCheckin();
    router.push("/home");
  };

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
      {/* ヘッダー */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px 12px",
        }}
      >
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
        <span style={{ fontSize: 20 }}>{charEmoji}</span>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            color: "#1E2D2A",
          }}
        >
          今日の調子を記録
        </p>
      </div>

      {/* スライダーリスト */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "8px 20px 24px",
          overflowY: "auto",
        }}
      >
        {ITEMS.map((item) => (
          <SliderCard
            key={item.key}
            emoji={item.emoji}
            label={item.label}
            minLabel={item.minLabel}
            maxLabel={item.maxLabel}
            value={values[item.key]}
            onChange={(v) =>
              setValues((prev) => ({ ...prev, [item.key]: v }))
            }
          />
        ))}

        {/* 記録ボタン */}
        <button
          onClick={handleRecord}
          style={{
            marginTop: 8,
            width: "100%",
            height: 56,
            borderRadius: 28,
            backgroundColor: "#2C4A3E",
            color: "#FDF8F2",
            fontSize: 16,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            letterSpacing: "0.02em",
          }}
        >
          記録する
        </button>

        <p
          style={{
            fontSize: 11,
            color: "#8A9E98",
            textAlign: "center",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          体調記録は健康管理の目安です。体調に変化を感じたら医療機関を受診してください。
        </p>
      </div>
    </div>
  );
}
