import type { FatigueType, DiagnosisResult } from "@/types";

// 回答選択肢（4択: 0〜3点）
export const ANSWER_OPTIONS = [
  { label: "よくある", score: 3 },
  { label: "たまにある", score: 2 },
  { label: "あまりない", score: 1 },
  { label: "ない", score: 0 },
] as const;

// 診断質問（各タイプ4問 = 計20問）
// 各カテゴリ固有の症状に特化し、重複を最小化
export const DIAGNOSIS_QUESTIONS = [
  // 脳疲労 — 思考・集中・情緒の過負荷
  { id: "b1", text: "頭の中で考えが止まらず、切り替えられない", category: "brain" as FatigueType },
  { id: "b2", text: "集中しようとしても、すぐに頭がぼんやりする", category: "brain" as FatigueType },
  { id: "b3", text: "些細なことで感情が揺れやすくなった", category: "brain" as FatigueType },
  { id: "b4", text: "人の名前や予定をすぐ忘れてしまう", category: "brain" as FatigueType },

  // 血流不足 — 冷え・血色・循環
  { id: "bl1", text: "手先や足先が冷たく、温まりにくい", category: "blood" as FatigueType },
  { id: "bl2", text: "唇や爪の色が白っぽい・青っぽい", category: "blood" as FatigueType },
  { id: "bl3", text: "肩や首がこりやすく、ほぐしても戻りやすい", category: "blood" as FatigueType },
  { id: "bl4", text: "目の下にクマができやすい", category: "blood" as FatigueType },

  // 自律神経 — リズム・体温調節・心拍
  { id: "n1", text: "季節の変わり目や天気の変化で体調を崩す", category: "nerve" as FatigueType },
  { id: "n2", text: "急に汗をかいたり、寒気がしたりする", category: "nerve" as FatigueType },
  { id: "n3", text: "動悸や息苦しさを感じることがある", category: "nerve" as FatigueType },
  { id: "n4", text: "寝つきが悪い、または夜中に目が覚める", category: "nerve" as FatigueType },

  // 内臓疲労 — 消化・食欲・お腹
  { id: "o1", text: "食後に胃が重い・もたれる感じがする", category: "organ" as FatigueType },
  { id: "o2", text: "お腹が張る・ガスがたまりやすい", category: "organ" as FatigueType },
  { id: "o3", text: "食欲にムラがあり、食べたくない時がある", category: "organ" as FatigueType },
  { id: "o4", text: "便通が不安定（便秘・軟便を繰り返す）", category: "organ" as FatigueType },

  // エネルギー不足 — だるさ・免疫・活力
  { id: "e1", text: "休んでも疲れが取れず、だるさが続く", category: "energy" as FatigueType },
  { id: "e2", text: "少し体を動かしただけで、すぐ疲れる", category: "energy" as FatigueType },
  { id: "e3", text: "風邪をひきやすい、または治りが遅い", category: "energy" as FatigueType },
  { id: "e4", text: "声に力が出ない・話すのがおっくうに感じる", category: "energy" as FatigueType },
];

// スコア集計 → 診断結果
export function calcDiagnosisResult(
  answers: Record<string, number> // questionId → 0〜3点
): DiagnosisResult {
  const scores: Record<FatigueType, number> = {
    brain: 0, blood: 0, nerve: 0, organ: 0, energy: 0,
  };

  for (const q of DIAGNOSIS_QUESTIONS) {
    scores[q.category] += answers[q.id] ?? 0;
  }

  // 降順ソート（同点の場合は安定ソートで元の順序を維持 — ランダム性を排除）
  const entries = Object.entries(scores) as [FatigueType, number][];
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  const primary = sorted[0];
  const secondary = sorted[1];

  // 1点差以内は混合タイプとして secondary を意味ある形で返す
  // 差が大きい場合でも secondaryType は2位のカテゴリを返す
  return {
    scores,
    primaryType: primary[0],
    secondaryType: secondary[0],
    createdAt: new Date().toISOString(),
  };
}

// レベル計算（継続日数ベース）
export function calcCharacterLevel(continuousDays: number): 1 | 2 | 3 {
  if (continuousDays >= 14) return 3;
  if (continuousDays >= 7) return 2;
  return 1;
}
