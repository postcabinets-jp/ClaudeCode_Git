"use client";

import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { TabBar } from "@/components/TabBar";

const SCORE_LABELS: Record<string, string> = {
  brain: "脳疲労",
  blood: "血流",
  nerve: "自律神経",
  organ: "内臓",
  energy: "活力",
};

const SCORE_COLORS: Record<string, string> = {
  brain: "#7C9EC6",
  blood: "#E87C6D",
  nerve: "#7CC6A8",
  organ: "#C6B87C",
  energy: "#B87CC6",
};

export default function ReportPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  if (!hasHydrated) return null;

  const history = profile?.diagnosisHistory ?? [];
  const latest = history[0];

  const typeKeys = ["brain", "blood", "nerve", "organ", "energy"] as const;

  // Weekly average
  const weekData = history.slice(0, 7);
  const avgScores = typeKeys.reduce((acc, type) => {
    const sum = weekData.reduce((s, d) => s + (d.scores[type] ?? 0), 0);
    acc[type] = weekData.length > 0 ? Math.round(sum / weekData.length) : 0;
    return acc;
  }, {} as Record<string, number>);

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
        padding: "8px 20px 20px",
      }}>
        {/* Header */}
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#6B9E8F", fontWeight: 500 }}>健康の記録</p>
          <h1 style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#1E2D2A" }}>健康レポート</h1>
        </div>

        {/* Before/After Card — 診断履歴2件以上の場合のみ表示 */}
        {history.length >= 2 && (() => {
          const first = history[history.length - 1];
          const latest2 = history[0];
          const totalBefore = Object.values(first.scores).reduce((a, b) => a + b, 0);
          const totalAfter = Object.values(latest2.scores).reduce((a, b) => a + b, 0);
          const diff = totalBefore - totalAfter;
          const improved = diff > 0;
          return (
            <div style={{
              backgroundColor: "#2C4A3E",
              borderRadius: 24,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#888888" }}>
                ビフォーアフター比較
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Before */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#666666" }}>初回診断</span>
                  <div style={{
                    width: 80, height: 80, borderRadius: 40,
                    backgroundColor: "#2A2A2A",
                    border: "3px solid #444444",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF" }}>{totalBefore}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#666666" }}>疲労度</span>
                </div>
                {/* Arrow */}
                <span style={{ fontSize: 20, color: "#C8A96E" }}>→</span>
                {/* After */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#E8956D" }}>最新診断</span>
                  <div style={{
                    width: 80, height: 80, borderRadius: 40,
                    backgroundColor: "#2A2A2A",
                    border: "3px solid #E8956D",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: "#FFFFFF" }}>{totalAfter}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#888888" }}>疲労度</span>
                </div>
              </div>
              {/* Improve badge */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                backgroundColor: "rgba(232,149,109,0.12)",
                borderRadius: 14, padding: "10px 16px",
              }}>
                <span style={{ fontSize: 14 }}>{improved ? "↘" : "↗"}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#E8956D" }}>
                  {improved
                    ? `疲労スコアが ${diff}pt 改善しました`
                    : `疲労スコアが ${Math.abs(diff)}pt 増加しています`}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Summary Card */}
        <div style={{
          backgroundColor: "#2C4A3E",
          borderRadius: 24,
          padding: "20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "#A8C5BB", fontWeight: 600 }}>
            直近の状態サマリー
          </p>
          {latest ? (
            <div style={{ display: "flex", gap: 8 }}>
              {typeKeys.map((type) => {
                const score = latest.scores[type] ?? 0;
                const maxScore = 16;
                const pct = Math.min(100, (score / maxScore) * 100);
                return (
                  <div key={type} style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}>
                    {/* Mini bar */}
                    <div style={{
                      width: "100%",
                      height: 60,
                      backgroundColor: "#1E3830",
                      borderRadius: 6,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}>
                      <div style={{
                        height: `${pct}%`,
                        backgroundColor: SCORE_COLORS[type],
                        borderRadius: 4,
                        transition: "height 0.6s ease",
                      }} />
                    </div>
                    <span style={{ fontSize: 9, color: "#A8C5BB" }}>{SCORE_LABELS[type]}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#FDF8F2" }}>{score}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ margin: 0, color: "#6B9E8F", fontSize: 13 }}>
              診断データがありません
            </p>
          )}
        </div>

        {/* Streak */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          padding: "16px 20px",
          border: "1px solid #F0EAE0",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: "rgba(232,149,109,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
          }}>
            🔥
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "#E8956D" }}>
              {profile?.continuousDays ?? 0}
              <span style={{ fontSize: 14, fontWeight: 500, color: "#6B9E8F", marginLeft: 4 }}>日継続</span>
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#A8C5BB" }}>
              総チェックイン: {profile?.totalCheckins ?? 0}回
            </p>
          </div>
        </div>

        {/* Weekly Checkin Bar Chart */}
        {weekData.length > 0 && (() => {
          // 過去7件を古い順に並べ、日付ラベルと合計スコアを生成
          const chartData = [...weekData].reverse().map((d) => {
            const date = new Date(d.createdAt);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            const total = Object.values(d.scores).reduce((a, b) => a + b, 0);
            return { label, total };
          });
          const maxTotal = Math.max(...chartData.map((d) => d.total), 1);
          const BAR_MAX_HEIGHT = 80;

          return (
            <div style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: "16px 20px",
              border: "1px solid #F0EAE0",
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#6B9E8F", letterSpacing: 1 }}>
                週次チェックイン推移
              </p>
              <p style={{ margin: "0 0 16px", fontSize: 11, color: "#A8C5BB" }}>
                直近 {chartData.length} 回の疲労スコア合計
              </p>
              {/* Bar chart */}
              <div style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 6,
                height: BAR_MAX_HEIGHT + 32,
              }}>
                {chartData.map((d, i) => {
                  const barH = Math.max(4, Math.round((d.total / maxTotal) * BAR_MAX_HEIGHT));
                  const isLatest = i === chartData.length - 1;
                  return (
                    <div key={i} style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      justifyContent: "flex-end",
                    }}>
                      {/* Score label */}
                      <span style={{ fontSize: 10, fontWeight: 700, color: isLatest ? "#E8956D" : "#6B9E8F" }}>
                        {d.total}
                      </span>
                      {/* Bar */}
                      <div style={{
                        width: "100%",
                        height: barH,
                        backgroundColor: isLatest ? "#E8956D" : "#A8C5BB",
                        borderRadius: "4px 4px 0 0",
                        opacity: isLatest ? 1 : 0.6,
                      }} />
                      {/* Date label */}
                      <span style={{ fontSize: 9, color: "#6B9E8F", whiteSpace: "nowrap" }}>
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#E8956D" }} />
                <span style={{ fontSize: 10, color: "#6B9E8F" }}>最新</span>
                <div style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#A8C5BB", opacity: 0.6, marginLeft: 8 }} />
                <span style={{ fontSize: 10, color: "#6B9E8F" }}>過去</span>
              </div>
            </div>
          );
        })()}

        {/* Weekly Average */}
        {weekData.length > 0 && (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: "16px 20px",
            border: "1px solid #F0EAE0",
          }}>
            <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, color: "#6B9E8F", letterSpacing: 1 }}>
              直近 {weekData.length} 回の平均スコア
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {typeKeys.map((type) => {
                const avg = avgScores[type];
                const maxScore = 16;
                const pct = Math.min(100, (avg / maxScore) * 100);
                return (
                  <div key={type} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 12, color: "#1E2D2A", width: 52, flexShrink: 0 }}>
                      {SCORE_LABELS[type]}
                    </span>
                    <div style={{
                      flex: 1,
                      height: 8,
                      backgroundColor: "#F0EAE0",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: SCORE_COLORS[type],
                        borderRadius: 4,
                      }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1E2D2A", width: 24, textAlign: "right" }}>
                      {avg}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: "16px",
            border: "1px solid #F0EAE0",
          }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, color: "#6B9E8F", letterSpacing: 1 }}>
              診断履歴
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((diag, i) => {
                const date = new Date(diag.createdAt);
                const topType = Object.entries(diag.scores).sort(([, a], [, b]) => b - a)[0];
                return (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < history.length - 1 ? "1px solid #F5F2EE" : "none",
                  }}>
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: SCORE_COLORS[topType[0]] ?? "#A8C5BB",
                      flexShrink: 0,
                      marginRight: 12,
                    }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1E2D2A" }}>
                        {SCORE_LABELS[topType[0]]}が高め
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: "#6B9E8F" }}>
                        {date.getMonth() + 1}/{date.getDate()} {date.getHours()}:{String(date.getMinutes()).padStart(2, "0")}
                      </p>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1E2D2A" }}>
                      {topType[1]}pt
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && (
          <div style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: "40px 20px",
            textAlign: "center",
            border: "1.5px dashed #E0D8CC",
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 32 }}>📊</p>
            <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1E2D2A" }}>
              データがまだありません
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#6B9E8F" }}>
              診断を受けると記録が溜まっていきます
            </p>
            <button
              onClick={() => router.push("/diagnosis")}
              style={{
                padding: "10px 24px",
                borderRadius: 20,
                backgroundColor: "#2C4A3E",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              診断する
            </button>
          </div>
        )}
      </div>

      <TabBar activePath="/report" />
    </div>
  );
}
