import type { FatigueType, DiagnosisResult } from "@/types";

// 診断質問（各タイプ4問 = 計20問）
export const DIAGNOSIS_QUESTIONS = [
  // 脳疲労
  { id: "b1", text: "考えすぎて眠れないことがある", category: "brain" as FatigueType },
  { id: "b2", text: "集中力が続かない・頭がぼーっとする", category: "brain" as FatigueType },
  { id: "b3", text: "小さなことが気になって止まらない", category: "brain" as FatigueType },
  { id: "b4", text: "記憶力や判断力が落ちた気がする", category: "brain" as FatigueType },
  // 血流不足
  { id: "bl1", text: "手足が冷えやすい", category: "blood" as FatigueType },
  { id: "bl2", text: "肩こり・頭痛が慢性的にある", category: "blood" as FatigueType },
  { id: "bl3", text: "顔色が悪い・青白いと言われる", category: "blood" as FatigueType },
  { id: "bl4", text: "生理不順・生理痛がひどい（該当する方）", category: "blood" as FatigueType },
  // 自律神経
  { id: "n1", text: "気温の変化に体がついていけない", category: "nerve" as FatigueType },
  { id: "n2", text: "朝スッキリ起きられない・夜眠れない", category: "nerve" as FatigueType },
  { id: "n3", text: "緊張したり、急に不安になることがある", category: "nerve" as FatigueType },
  { id: "n4", text: "動悸・息切れ・めまいがある", category: "nerve" as FatigueType },
  // 内臓疲労
  { id: "o1", text: "食後に眠くなる・胃が重い", category: "organ" as FatigueType },
  { id: "o2", text: "お腹が張りやすい・便通が不安定", category: "organ" as FatigueType },
  { id: "o3", text: "食欲がムラになりやすい", category: "organ" as FatigueType },
  { id: "o4", text: "お酒を飲むと次の日がつらい", category: "organ" as FatigueType },
  // エネルギー不足
  { id: "e1", text: "朝からだるくて体が重い", category: "energy" as FatigueType },
  { id: "e2", text: "やる気が出ない・何もしたくない", category: "energy" as FatigueType },
  { id: "e3", text: "少し動くだけで疲れる", category: "energy" as FatigueType },
  { id: "e4", text: "風邪を引きやすい・治りが遅い", category: "energy" as FatigueType },
];

// スコア集計 → 診断結果
export function calcDiagnosisResult(
  answers: Record<string, number> // questionId → 0〜4点
): DiagnosisResult {
  const scores: Record<FatigueType, number> = {
    brain: 0, blood: 0, nerve: 0, organ: 0, energy: 0,
  };

  for (const q of DIAGNOSIS_QUESTIONS) {
    scores[q.category] += answers[q.id] ?? 0;
  }

  // 同点グループ内をシャッフルしてから降順ソート（Math.randomソートはバイアスあり）
  const entries = Object.entries(scores) as [FatigueType, number][];
  // フィッシャー–イェーツシャッフルで先に順番をランダム化
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  return {
    scores,
    primaryType: sorted[0][0],
    secondaryType: sorted[1][0],
    createdAt: new Date().toISOString(),
  };
}

// レベル計算（継続日数ベース）
export function calcCharacterLevel(continuousDays: number): 1 | 2 | 3 {
  if (continuousDays >= 14) return 3;
  if (continuousDays >= 7) return 2;
  return 1;
}
