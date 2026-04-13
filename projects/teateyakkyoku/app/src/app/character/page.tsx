"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { CHARACTERS } from "@/types";
import { TabBar } from "@/components/TabBar";

const FATIGUE_LABELS: Record<string, string> = {
  brain: "脳疲労タイプ",
  blood: "血流不足タイプ",
  nerve: "自律神経タイプ",
  organ: "内臓疲労タイプ",
  energy: "エネルギー不足タイプ",
};

const LEVEL_BADGES: Record<number, { color: string; label: string }> = {
  1: { color: "#6B9E8F", label: "🥚 たまご期" },
  2: { color: "#E8956D", label: "🌱 めばえ期" },
  3: { color: "#FFD700", label: "⭐ 覚醒期" },
};

const DAILY_CARE: Record<string, { emoji: string; label: string; detail: string }[]> = {
  brain: [
    { emoji: "🧘", label: "5分瞑想", detail: "目を閉じて深呼吸するだけでOK" },
    { emoji: "📵", label: "デジタルデトックス", detail: "食事中はスマホを置く" },
    { emoji: "🌿", label: "補中益気湯を飲む", detail: "気力回復のサポート" },
  ],
  blood: [
    { emoji: "🚶", label: "10分ウォーキング", detail: "血流を促進する有酸素運動" },
    { emoji: "🛁", label: "湯船につかる", detail: "38〜40℃で10分が理想" },
    { emoji: "🔴", label: "桂枝茯苓丸を飲む", detail: "血の滞りを改善" },
  ],
  nerve: [
    { emoji: "🎵", label: "リラックス音楽", detail: "就寝前30分、自然音がおすすめ" },
    { emoji: "⏰", label: "就寝時間を固定", detail: "23時には布団に入る習慣" },
    { emoji: "🌸", label: "加味逍遙散を飲む", detail: "自律神経を整える" },
  ],
  organ: [
    { emoji: "🍵", label: "白湯を飲む", detail: "起床直後に1杯、胃腸を目覚めさせる" },
    { emoji: "🥗", label: "よく噛む（30回）", detail: "消化の負担を大幅に軽減" },
    { emoji: "🌾", label: "六君子湯を飲む", detail: "胃腸の働きをサポート" },
  ],
  energy: [
    { emoji: "☀️", label: "朝日を浴びる", detail: "起床後15分、セロトニン活性化" },
    { emoji: "🍳", label: "タンパク質朝食", detail: "たまご・豆腐でエネルギーチャージ" },
    { emoji: "💪", label: "補中益気湯を飲む", detail: "気力・体力を補う" },
  ],
};

export default function CharacterPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  if (!profile?.character) {
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
          justifyContent: "center",
          gap: 16,
          padding: "0 32px",
        }}>
          <span style={{ fontSize: 56 }}>🌿</span>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1E2D2A" }}>
            キャラクターはまだいません
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#6B9E8F", textAlign: "center", lineHeight: 1.5 }}>
            診断を受けることで、あなたの<br/>疲労タイプに合ったキャラが現れます
          </p>
          <button
            onClick={() => router.push("/diagnosis")}
            style={{
              padding: "14px 32px",
              borderRadius: 28,
              backgroundColor: "#E8956D",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            診断する
          </button>
        </div>
        <TabBar activePath="/character" />
      </div>
    );
  }

  const char = profile.character;
  const charBase = CHARACTERS[char.type];
  const xpPercent = Math.min(100, ((char.level - 1) / 3) * 100 + 40);
  const levelBadge = LEVEL_BADGES[char.level];
  const dailyCare = DAILY_CARE[char.type] ?? [];

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
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Hero section */}
        <div style={{
          backgroundColor: "#2C4A3E",
          padding: "20px 24px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
          {/* Level badge */}
          <div style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 12,
            color: "#A8C5BB",
            fontWeight: 600,
          }}>
            {levelBadge.label}
          </div>

          {/* Character */}
          <div style={{
            width: 130,
            height: 130,
            borderRadius: 65,
            background: "radial-gradient(circle, #3D6B5A 0%, #2C4A3E 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 60,
            boxShadow: "0 0 0 16px rgba(255,255,255,0.05), 0 16px 40px rgba(0,0,0,0.3)",
          }}>
            {charBase.emoji}
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 13, color: "#A8C5BB" }}>
              {FATIGUE_LABELS[char.type]}
            </p>
            <h1 style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: "#FDF8F2" }}>
              {char.name}
            </h1>
          </div>

          {/* XP Bar */}
          <div style={{ width: "100%", maxWidth: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#A8C5BB" }}>Lv.{char.level}</span>
              <span style={{ fontSize: 11, color: "#A8C5BB" }}>
                {char.level < 3 ? `Lv.${char.level + 1}へ` : "MAX"}
              </span>
            </div>
            <div style={{
              height: 8,
              backgroundColor: "#1E3830",
              borderRadius: 4,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${xpPercent}%`,
                borderRadius: 4,
                background: "linear-gradient(90deg, #E8956D, #F5C49A)",
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}>
            {[
              { emoji: "🔥", label: "継続日数", value: `${profile.continuousDays}日` },
              { emoji: "✅", label: "チェックイン", value: `${profile.totalCheckins}回` },
              { emoji: "🔍", label: "診断回数", value: `${profile.diagnosisHistory.length}回` },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: "14px 10px",
                textAlign: "center",
                border: "1px solid #F0EAE0",
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.emoji}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1E2D2A" }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: "#6B9E8F" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: "16px 20px 0" }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: "18px 20px",
            border: "1px solid #F0EAE0",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#6B9E8F", letterSpacing: 1 }}>
              キャラクター紹介
            </p>
            <p style={{ margin: 0, fontSize: 14, color: "#1E2D2A", lineHeight: 1.8 }}>
              {charBase.description}
            </p>
          </div>
        </div>

        {/* Daily Care */}
        <div style={{ padding: "16px 20px 20px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "#1E2D2A" }}>
            今日のケアルーティン
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {dailyCare.map((care, i) => (
              <div key={i} style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                border: "1px solid #F0EAE0",
              }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: "#F5F0E8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}>
                  {care.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1E2D2A" }}>
                    {care.label}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6B9E8F" }}>
                    {care.detail}
                  </p>
                </div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#6B9E8F",
                  backgroundColor: "#F0EDE8",
                  borderRadius: 10,
                  padding: "3px 10px",
                  flexShrink: 0,
                }}>
                  おすすめ
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TabBar activePath="/character" />
    </div>
  );
}
