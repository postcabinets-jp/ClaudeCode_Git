"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { CHARACTERS } from "@/types";
import { TabBar } from "@/components/TabBar";
import { Modal } from "@/components/Modal";
import { signOut } from "@/lib/supabase/auth";

const FATIGUE_LABELS: Record<string, string> = {
  brain: "脳疲労タイプ",
  blood: "血流不足タイプ",
  nerve: "自律神経タイプ",
  organ: "内臓疲労タイプ",
  energy: "エネルギー不足タイプ",
};

// 全キャラ一覧（図鑑用）
const ALL_CHARS = [
  { type: "brain", emoji: "🦊", name: "シロ" },
  { type: "blood", emoji: "🐻", name: "ホノ" },
  { type: "nerve", emoji: "🦌", name: "シカ" },
  { type: "organ", emoji: "🐢", name: "コテツ" },
  { type: "energy", emoji: "🐱", name: "モコ" },
];

export default function MyPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const clearProfile = useUserStore((s) => s.clearProfile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  const [editing, setEditing] = useState(false);
  const [newNickname, setNewNickname] = useState("");

  useEffect(() => {
    if (hasHydrated && !profile) router.replace("/onboarding");
  }, [hasHydrated, profile, router]);

  if (!hasHydrated || !profile) return null;

  const char = profile.character;
  const charBase = char ? CHARACTERS[char.type] : null;

  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    clearProfile();
    router.replace("/onboarding");
  };

  const handleReset = () => {
    setResetModalOpen(true);
  };

  const confirmReset = () => {
    setResetModalOpen(false);
    clearProfile();
    router.replace("/onboarding");
  };

  const handleStartEditing = () => {
    setNewNickname(profile.nickname ?? "");
    setEditing(true);
  };

  const handleSaveNickname = () => {
    const trimmed = newNickname.trim();
    if (trimmed) {
      setProfile({ ...profile, nickname: trimmed });
    }
    setEditing(false);
  };

  const handleCancelEditing = () => {
    setEditing(false);
  };

  return (
    <div style={{
      minHeight: "100svh",
      backgroundColor: "#FDF8F2",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
    }}>
      <Modal
        open={resetModalOpen}
        title="データをリセットしますか？"
        message="キャラクターや診断履歴がすべて削除されます。"
        onConfirm={confirmReset}
        onCancel={() => setResetModalOpen(false)}
        confirmLabel="リセットする"
        cancelLabel="やめる"
        variant="confirm"
      />
      <div style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "8px 20px 20px",
      }}>

        {/* Profile Card — myProfileCard */}
        <div style={{
          backgroundColor: "#2C4A3E",
          borderRadius: 24,
          padding: 20,
          display: "flex",
          flexDirection: editing ? "column" : "row",
          alignItems: editing ? "stretch" : "center",
          gap: 16,
          boxShadow: "0 4px 16px rgba(0,0,0,0.20)",
        }}>
          {/* Top row: Avatar + Info + Edit button */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            {/* Avatar */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              background: "radial-gradient(circle, #3D6B5A, #2C4A3E)",
              border: "2px solid #E8956D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}>
              {charBase?.emoji ?? "🌿"}
            </div>

            {/* Info */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#FDF8F2" }}>
                {profile.nickname ?? "てあてユーザー"} さん
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#E8956D" }}>
                {char ? FATIGUE_LABELS[char.type] : "未診断"}
              </p>
            </div>

            {!editing && (
              <div
                onClick={handleStartEditing}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#A8C5BB",
                }}
              >
                ✏️
              </div>
            )}
          </div>

          {/* Inline nickname edit form */}
          {editing && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 4,
            }}>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="ニックネームを入力"
                autoFocus
                style={{
                  backgroundColor: "#1E3830",
                  color: "#FDF8F2",
                  border: "1px solid #6B9E8F",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 16,
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleCancelEditing}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 12,
                    border: "1px solid #6B9E8F",
                    backgroundColor: "transparent",
                    color: "#A8C5BB",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveNickname}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 12,
                    border: "none",
                    backgroundColor: "#E8956D",
                    color: "#1E3830",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Character Gallery — charSection */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: "16px",
          border: "1px solid #F0EAE0",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#1E2D2A" }}>
            キャラクター図鑑
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            {ALL_CHARS.map((c) => {
              const unlocked = char?.type === c.type;
              return (
                <div
                  key={c.type}
                  onClick={() => unlocked && router.push("/character")}
                  style={{
                    flex: 1,
                    backgroundColor: unlocked ? "#fff" : "#F0F0F0",
                    borderRadius: 18,
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    opacity: unlocked ? 1 : 0.5,
                    cursor: unlocked ? "pointer" : "default",
                    border: unlocked ? "1.5px solid #E0D8CC" : "none",
                    boxShadow: unlocked ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  <span style={{ fontSize: 28, color: unlocked ? undefined : "#AAAAAA" }}>
                    {unlocked ? c.emoji : c.emoji}
                  </span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: unlocked ? "#1E2D2A" : "#AAAAAA",
                    textAlign: "center",
                  }}>
                    {c.name}
                  </span>
                  {!unlocked && (
                    <span style={{ fontSize: 12, color: "#CCCCCC" }}>🔒</span>
                  )}
                  {unlocked && char && (
                    <div style={{
                      fontSize: 9,
                      color: "#C8A96E",
                      backgroundColor: "rgba(200,169,110,0.15)",
                      borderRadius: 10,
                      padding: "2px 7px",
                      fontWeight: 600,
                    }}>
                      Lv.{char.level}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
        }}>
          {[
            { emoji: "🔥", label: "継続", value: `${profile.continuousDays}日` },
            { emoji: "✅", label: "チェックイン", value: `${profile.totalCheckins}回` },
            { emoji: "🔍", label: "診断", value: `${profile.diagnosisHistory.length}回` },
          ].map((s) => (
            <div key={s.label} style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: "14px 10px",
              textAlign: "center",
              border: "1px solid #F0EAE0",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1E2D2A" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#6B9E8F" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu — menuSection */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          border: "1px solid #F0EAE0",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          {[
            { icon: "🛒", label: "購入履歴", onClick: () => router.push("/kampo"), badge: null },
            { icon: "📦", label: "定期便の管理", onClick: () => router.push("/kampo"), badge: "準備中" },
            { icon: "⚙️", label: "設定", onClick: () => {}, badge: null },
          ].map((item, i, arr) => (
            <button
              key={item.label}
              onClick={item.onClick}
              style={{
                width: "100%",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                backgroundColor: "transparent",
                border: "none",
                borderBottom: i < arr.length - 1 ? "1px solid #F5F2EE" : "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: "#F5F3F0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: 15, color: "#1A1A1A" }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: "#C8A96E",
                  backgroundColor: "rgba(200,169,110,0.12)",
                  borderRadius: 10, padding: "4px 8px",
                }}>
                  {item.badge}
                </span>
              )}
              <span style={{ fontSize: 16, color: "#CCCCCC" }}>›</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            padding: "14px",
            borderRadius: 16,
            border: "none",
            backgroundColor: "transparent",
            color: "#6B9E8F",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ログアウト
        </button>

        {/* Reset */}
        <button
          onClick={handleReset}
          style={{
            padding: "14px",
            borderRadius: 16,
            border: "1.5px solid #F5EEE8",
            backgroundColor: "transparent",
            color: "#C07060",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          データをリセットする
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#C8C0B8", margin: 0 }}>
          てあて薬局
        </p>
      </div>

      <TabBar activePath="/mypage" />
    </div>
  );
}
