"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { CHARACTERS } from "@/types";
import { TabBar } from "@/components/TabBar";
import { getRecommendedProducts, toHomeProductCard } from "@/lib/products-data";
import type { FatigueType } from "@/types";

const FATIGUE_LABELS: Record<string, string> = {
  brain: "脳疲労タイプ",
  blood: "血流不足タイプ",
  nerve: "自律神経タイプ",
  organ: "内臓疲労タイプ",
  energy: "エネルギー不足タイプ",
};

// キャラの状態テキスト — スコアに応じて変わる
function getCharStatus(score: number): string {
  if (score >= 14) return "かなり疲れているよ…無理しないで";
  if (score >= 10) return "少し疲れ気味だよ…";
  if (score >= 6) return "まあまあ元気そうだね！";
  return "今日も元気いっぱい！";
}

// 最新診断スコアを 0-100 に換算（最大 16×5=80点 → 100%）
function calcFatigueScore(scores: Record<string, number>): number {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return Math.round((total / 80) * 100);
}

// タイプ別アドバイス
const REC_TIPS: Record<string, { title: string; desc: string; emoji: string }[]> = {
  brain: [
    { emoji: "🧘", title: "5分間の深呼吸", desc: "交感神経を落ち着かせ、脳の疲れをリセット" },
    { emoji: "💤", title: "睡眠の質を高める", desc: "就寝1時間前はスマホをオフに" },
  ],
  blood: [
    { emoji: "🚶", title: "軽いウォーキング", desc: "10分歩くだけで血流が改善される" },
    { emoji: "🛁", title: "温活ルーティン", desc: "湯船に10分浸かって体の芯から温める" },
  ],
  nerve: [
    { emoji: "🎵", title: "リラックス音楽", desc: "就寝前30分、クラシックや自然音を聞く" },
    { emoji: "🌙", title: "就寝時間を固定", desc: "同じ時間に寝ることで自律神経が整う" },
  ],
  organ: [
    { emoji: "🍵", title: "白湯を飲む習慣", desc: "朝起きてすぐ白湯を1杯で胃腸を目覚めさせる" },
    { emoji: "🥗", title: "よく噛んで食べる", desc: "30回噛むことで消化の負担を減らす" },
  ],
  energy: [
    { emoji: "☀️", title: "朝日を浴びる", desc: "起床後15分、太陽光でセロトニンを活性化" },
    { emoji: "🍳", title: "タンパク質を摂る", desc: "朝食にたまごや豆腐を加えてエネルギーチャージ" },
  ],
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return "おやすみなさい";
  if (h < 12) return "おはようございます";
  if (h < 18) return "こんにちは";
  return "こんばんは";
}

export default function HomePage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const setProfileFromGoogle = useUserStore((s) => s.setProfileFromGoogle);

  useEffect(() => {
    if (!hasHydrated) return;

    (async () => {
      if (!profile) {
        // Supabaseセッションがあればプロフィールを初期化
        const { getUser } = await import("@/lib/supabase/auth");
        const user = await getUser();
        if (user) {
          setProfileFromGoogle({
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split("@")[0] || "ユーザー",
            email: user.email || "",
            avatar: user.user_metadata?.avatar_url,
          });
        } else {
          router.replace("/onboarding");
        }
      }
    })();
  }, [hasHydrated, profile, router, setProfileFromGoogle]);

  if (!hasHydrated || !profile) return null;

  const hasCheckedInToday = useUserStore((s) => s.hasCheckedInToday);
  const checkedInToday = hasCheckedInToday();

  const char = profile.character;
  const charBase = char ? CHARACTERS[char.type] : null;
  const latest = profile.diagnosisHistory[0];
  const fatigueScore = latest ? calcFatigueScore(latest.scores) : null;
  const charStatus = fatigueScore !== null ? getCharStatus(fatigueScore) : "診断してみよう！";
  const tips = char ? REC_TIPS[char.type] : [];
  const products = char
    ? getRecommendedProducts(char.type as FatigueType, 2).map(toHomeProductCard)
    : [];

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
        gap: 20,
        padding: "16px 20px 20px",
      }}>

        {/* Header — uOO0L */}
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#8A9E98", fontWeight: 400 }}>
              {getGreeting()}
            </p>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#1E2D2A" }}>
              {profile.nickname ?? "てあてユーザー"}さん
            </h1>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {profile.continuousDays > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(232,149,109,0.12)",
                borderRadius: 20,
                padding: "5px 10px",
              }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#E8956D" }}>
                  {profile.continuousDays}日
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Character Card — urfnN */}
        <div style={{
          backgroundColor: "#2C4A3E",
          borderRadius: 24,
          padding: "24px 24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.20)",
        }}>
          {/* Top row — JlYT4: タイプタグ + 疲労スコア */}
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            {char ? (
              <div style={{
                backgroundColor: "#E8956D",
                borderRadius: 20,
                padding: "6px 12px",
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#1E2D2A" }}>
                  {FATIGUE_LABELS[char.type]}
                </span>
              </div>
            ) : (
              <div style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: "6px 12px",
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#A8C5BB" }}>未診断</span>
              </div>
            )}
            <div style={{ flex: 1 }} />
            {fatigueScore !== null && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
                  {fatigueScore}
                </span>
                <span style={{ fontSize: 11, color: "#9BB5A8", marginBottom: 2 }}>/ 100</span>
              </div>
            )}
          </div>
          {fatigueScore !== null && (
            <p style={{ margin: "-8px 0 0", fontSize: 10, color: "#9BB5A8", textAlign: "right" }}>
              疲労スコア
            </p>
          )}

          {/* Char area — bG8Io */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: "radial-gradient(circle, #3D6B5A 0%, #2C4A3E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              flexShrink: 0,
            }}>
              {charBase?.emoji ?? "🌿"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "#A8C5BB" }}>
                  {char?.levelName ?? "まだ診断していません"}
                </p>
                <p style={{ margin: "2px 0 4px", fontSize: 22, fontWeight: 700, color: "#FDF8F2" }}>
                  {char?.name ?? "？"}
                </p>
                {/* 吹き出し — SpeechBubble */}
                <div style={{
                  backgroundColor: "#1E3830",
                  borderRadius: 12,
                  padding: "7px 12px",
                }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#A8C5BB", whiteSpace: "nowrap" }}>{charStatus}</p>
                </div>
              </div>
              <button
                onClick={() => router.push("/character")}
                style={{
                  alignSelf: "flex-start",
                  padding: "6px 14px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  border: "none",
                  color: "#FDF8F2",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                詳細を見る
              </button>
            </div>
          </div>

        </div>

        {/* Daily Check Button — uq7sF */}
        <button
          onClick={() => !checkedInToday && router.push("/checkin")}
          style={{
            height: 56,
            borderRadius: 28,
            backgroundColor: checkedInToday ? "#A8C5BB" : "#2C4A3E",
            color: "#FDF8F2",
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            cursor: checkedInToday ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: checkedInToday ? "none" : "0 4px 16px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ fontSize: 16 }}>{checkedInToday ? "✅" : "📊"}</span>
          {checkedInToday ? "今日のチェック完了！" : "今日の疲労チェック"}
        </button>

        {/* Recommend Products — Jme2P */}
        {products.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1E2D2A" }}>
                あなたへのおすすめ
              </p>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => router.push("/kampo")}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#E8956D", fontWeight: 500 }}
              >
                すべて見る
              </button>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {products.map((p) => (
                <div
                  key={p.name}
                  onClick={() => router.push(`/kampo/${p.id}`)}
                  style={{
                    flex: 1,
                    backgroundColor: "#fff",
                    borderRadius: 16,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: p.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}>
                    {p.emoji}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1E2D2A" }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#888888" }}>{p.desc}</p>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#E8956D" }}>{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips — キャラからのアドバイス */}
        {tips.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E2D2A" }}>
                {char?.name}からのアドバイス
              </p>
            </div>
            {tips.map((tip) => (
              <div
                key={tip.title}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  border: "1px solid #F0EAE0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: "#F5F0E8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}>
                  {tip.emoji}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E2D2A" }}>{tip.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6B9E8F", lineHeight: 1.4 }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state — 未診断 */}
        {!char && (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: "28px 20px",
            textAlign: "center",
            border: "1.5px dashed #E0D8CC",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 36 }}>🌿</p>
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1E2D2A" }}>
              まずは診断してみよう
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B9E8F", lineHeight: 1.5 }}>
              あなたの疲労タイプを知ることで<br />最適なケアが見つかります
            </p>
            <button
              onClick={() => router.push("/diagnosis")}
              style={{
                padding: "12px 28px",
                borderRadius: 24,
                backgroundColor: "#E8956D",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              診断スタート
            </button>
          </div>
        )}
      </div>

      <TabBar activePath="/home" />
    </div>
  );
}
