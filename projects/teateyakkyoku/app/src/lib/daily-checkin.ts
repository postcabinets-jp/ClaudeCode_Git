import type { FatigueType } from "@/types";

// ===== 毎日チェックイン質問プール =====

export type TimeSlot = "morning" | "afternoon" | "evening" | "all";

export interface DailyQuestion {
  id: string;
  text: string;
  category: FatigueType;
  timeSlot: TimeSlot | TimeSlot[];
}

export interface DailyCheckinResult {
  questionIds: string[];
  answers: Record<string, number>; // questionId → 0/1/2
  scores: Record<FatigueType, number>;
  overallPercent: number;
  feedback: string;
  typeFeedback: string;
  createdAt: string;
  timeSlot: TimeSlot;
}

export const DAILY_QUESTIONS: DailyQuestion[] = [
  // 脳疲労（brain）: 10問
  { id: "dc-b01", text: "今日は頭がぼーっとする感じがある", category: "brain", timeSlot: ["morning", "afternoon"] },
  { id: "dc-b02", text: "集中しようとしてもすぐ気が散ってしまう", category: "brain", timeSlot: "afternoon" },
  { id: "dc-b03", text: "考えがまとまらない・判断に迷う", category: "brain", timeSlot: "afternoon" },
  { id: "dc-b04", text: "頭が重い・締め付けられる感じがある", category: "brain", timeSlot: "all" },
  { id: "dc-b05", text: "昨夜、考え事が止まらなかった", category: "brain", timeSlot: "morning" },
  { id: "dc-b06", text: "今日は何かを覚えるのが難しそう", category: "brain", timeSlot: ["morning", "afternoon"] },
  { id: "dc-b07", text: "些細なことにイライラしやすい", category: "brain", timeSlot: "all" },
  { id: "dc-b08", text: "スマホやPCの画面を見ると目が疲れる", category: "brain", timeSlot: ["afternoon", "evening"] },
  { id: "dc-b09", text: "仕事や家事の段取りが頭に入ってこない", category: "brain", timeSlot: ["morning", "afternoon"] },
  { id: "dc-b10", text: "今日はぼんやり過ごしてしまった気がする", category: "brain", timeSlot: "evening" },

  // 血流不足（blood）: 10問
  { id: "dc-bl01", text: "手足が冷たいと感じる", category: "blood", timeSlot: "all" },
  { id: "dc-bl02", text: "肩や首がこっている", category: "blood", timeSlot: "all" },
  { id: "dc-bl03", text: "顔色が悪い・くすんでいると感じる", category: "blood", timeSlot: "morning" },
  { id: "dc-bl04", text: "体がむくんでいる気がする", category: "blood", timeSlot: ["morning", "evening"] },
  { id: "dc-bl05", text: "指先やつま先がしびれる感じがある", category: "blood", timeSlot: "all" },
  { id: "dc-bl06", text: "頭痛がある、または頭痛が出そうな感じがする", category: "blood", timeSlot: "all" },
  { id: "dc-bl07", text: "目の下にクマができている", category: "blood", timeSlot: "morning" },
  { id: "dc-bl08", text: "体が重だるくて動きたくない", category: "blood", timeSlot: ["morning", "afternoon"] },
  { id: "dc-bl09", text: "肌が乾燥してカサカサする", category: "blood", timeSlot: "all" },
  { id: "dc-bl10", text: "温かい飲み物が欲しいと感じる", category: "blood", timeSlot: "all" },

  // 自律神経（nerve）: 10問
  { id: "dc-n01", text: "昨夜はよく眠れなかった", category: "nerve", timeSlot: "morning" },
  { id: "dc-n02", text: "朝スッキリ起きられなかった", category: "nerve", timeSlot: "morning" },
  { id: "dc-n03", text: "今日は気分が不安定な気がする", category: "nerve", timeSlot: "all" },
  { id: "dc-n04", text: "動悸やドキドキを感じることがあった", category: "nerve", timeSlot: "all" },
  { id: "dc-n05", text: "緊張して体がこわばっている", category: "nerve", timeSlot: "afternoon" },
  { id: "dc-n06", text: "天気や気温の変化で体調が悪い", category: "nerve", timeSlot: "all" },
  { id: "dc-n07", text: "呼吸が浅い・息苦しさを感じる", category: "nerve", timeSlot: "all" },
  { id: "dc-n08", text: "汗のかき方が変だと感じる（急に出る/出ない）", category: "nerve", timeSlot: "all" },
  { id: "dc-n09", text: "めまいやふらつきを感じた", category: "nerve", timeSlot: "all" },
  { id: "dc-n10", text: "寝る前にリラックスできる自信がない", category: "nerve", timeSlot: "evening" },

  // 内臓疲労（organ）: 10問
  { id: "dc-o01", text: "胃が重い・もたれている感じがある", category: "organ", timeSlot: "all" },
  { id: "dc-o02", text: "食欲がわかない", category: "organ", timeSlot: ["morning", "afternoon"] },
  { id: "dc-o03", text: "お腹が張っている・ガスが溜まっている", category: "organ", timeSlot: "all" },
  { id: "dc-o04", text: "便通が良くない（便秘・下痢）", category: "organ", timeSlot: "morning" },
  { id: "dc-o05", text: "食後にすぐ眠くなる", category: "organ", timeSlot: "afternoon" },
  { id: "dc-o06", text: "口の中が苦い・味が変な感じがする", category: "organ", timeSlot: "morning" },
  { id: "dc-o07", text: "脂っこいものを想像すると気持ち悪い", category: "organ", timeSlot: "all" },
  { id: "dc-o08", text: "昨日の食事が胃に残っている感じがする", category: "organ", timeSlot: "morning" },
  { id: "dc-o09", text: "お腹がゴロゴロ鳴る・不安定", category: "organ", timeSlot: "all" },
  { id: "dc-o10", text: "水分を摂っても喉の渇きが取れない", category: "organ", timeSlot: "all" },

  // エネルギー不足（energy）: 10問
  { id: "dc-e01", text: "朝から体がだるくて重い", category: "energy", timeSlot: "morning" },
  { id: "dc-e02", text: "やる気が出ない・何もしたくない", category: "energy", timeSlot: "all" },
  { id: "dc-e03", text: "少し動いただけで疲れを感じる", category: "energy", timeSlot: "all" },
  { id: "dc-e04", text: "声に力が入らない・話すのがおっくう", category: "energy", timeSlot: "all" },
  { id: "dc-e05", text: "階段を上ると息切れする", category: "energy", timeSlot: "afternoon" },
  { id: "dc-e06", text: "昼前にもう疲れている", category: "energy", timeSlot: "afternoon" },
  { id: "dc-e07", text: "休んでも疲れが取れた気がしない", category: "energy", timeSlot: "morning" },
  { id: "dc-e08", text: "人と会うのがおっくうに感じる", category: "energy", timeSlot: "all" },
  { id: "dc-e09", text: "免疫が落ちている気がする（喉が痛い等）", category: "energy", timeSlot: "all" },
  { id: "dc-e10", text: "今日一日を乗り切れるか不安", category: "energy", timeSlot: "morning" },
];

// ===== 時間帯判定 =====

export function getCurrentTimeSlot(): TimeSlot {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  return "evening";
}

// ===== 質問選択アルゴリズム =====

function matchesTimeSlot(q: DailyQuestion, slot: TimeSlot): boolean {
  if (q.timeSlot === "all") return true;
  if (Array.isArray(q.timeSlot)) return q.timeSlot.includes(slot);
  return q.timeSlot === slot;
}

function randomPick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function selectDailyQuestions(
  primaryType: FatigueType,
  secondaryType: FatigueType,
  recentQuestionIds: string[] = []
): DailyQuestion[] {
  const now = new Date();
  const timeSlot = getCurrentTimeSlot();
  const dayOfWeek = now.getDay(); // 0=日, 1=月, 6=土
  const month = now.getMonth() + 1; // 1-12

  // 時間帯フィルタ + 直近重複排除
  const available = DAILY_QUESTIONS.filter(
    (q) => matchesTimeSlot(q, timeSlot) && !recentQuestionIds.includes(q.id)
  );

  // 候補が極端に少ない場合は重複排除を緩和（直近1日のみ除外）
  const fallback = recentQuestionIds.slice(0, 10); // 最新10件のみ除外
  const availableFallback = DAILY_QUESTIONS.filter(
    (q) => matchesTimeSlot(q, timeSlot) && !fallback.includes(q.id)
  );

  const pool = available.length >= 5 ? available : availableFallback;

  const primaryPool = pool.filter((q) => q.category === primaryType);
  const secondaryPool = pool.filter((q) => q.category === secondaryType);
  const otherPool = pool.filter(
    (q) => q.category !== primaryType && q.category !== secondaryType
  );

  const selected: DailyQuestion[] = [];

  // primaryType から2問
  selected.push(...randomPick(primaryPool, Math.min(2, primaryPool.length)));
  // secondaryType から1問
  selected.push(...randomPick(secondaryPool, Math.min(1, secondaryPool.length)));

  // 曜日ボーナス
  const isMonday = dayOfWeek === 1;
  const isFriday = dayOfWeek === 5;
  const isSeasonChange = [3, 6, 9, 12].includes(month);

  if (isMonday && timeSlot === "morning") {
    const energyExtra = otherPool.filter((q) => q.category === "energy");
    if (energyExtra.length > 0) selected.push(...randomPick(energyExtra, 1));
  }

  if (isFriday && timeSlot === "evening") {
    const nerveExtra = otherPool.filter((q) => q.category === "nerve");
    if (nerveExtra.length > 0) selected.push(...randomPick(nerveExtra, 1));
  }

  if (isSeasonChange) {
    const nerveBonus = otherPool.filter(
      (q) => q.category === "nerve" && !selected.find((s) => s.id === q.id)
    );
    if (nerveBonus.length > 0 && selected.length < 4) {
      selected.push(...randomPick(nerveBonus, 1));
    }
  }

  // 最低3問を保証（足りない場合はotherPoolから補填）
  while (selected.length < 3) {
    const remaining = pool.filter((q) => !selected.find((s) => s.id === q.id));
    if (remaining.length === 0) break;
    selected.push(...randomPick(remaining, 1));
  }

  // 最大5問
  return selected.slice(0, 5);
}

// ===== スコア計算 =====

export function calcCheckinResult(
  questions: DailyQuestion[],
  answers: Record<string, number>
): Omit<DailyCheckinResult, "createdAt" | "timeSlot"> {
  const scores: Record<FatigueType, number> = {
    brain: 0, blood: 0, nerve: 0, organ: 0, energy: 0,
  };

  for (const q of questions) {
    scores[q.category] += answers[q.id] ?? 0;
  }

  const totalAnswered = questions.length;
  const maxPossible = totalAnswered * 3;
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const overallPercent = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  // 最も高いタイプ
  const topType = (Object.entries(scores) as [FatigueType, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  // 全体フィードバック
  let feedback: string;
  if (overallPercent >= 70) {
    feedback = "今日はちょっとしんどそうだね… 無理しないで";
  } else if (overallPercent >= 40) {
    feedback = "少し疲れが出てるみたい。お茶でも飲んで一息つこう";
  } else if (overallPercent > 0) {
    feedback = "まあまあの調子だね！ この調子でいこう";
  } else {
    feedback = "絶好調！ 今日も元気にいこう！";
  }

  // タイプ別一言
  const TYPE_FEEDBACK: Record<FatigueType, string> = {
    brain: "頭を使いすぎかも。5分だけ目を閉じてみて",
    blood: "体が冷えてない？ 温かい飲み物がおすすめだよ",
    nerve: "自律神経が乱れ気味。深呼吸を3回やってみよう",
    organ: "お腹が疲れてるみたい。消化の良いものを選んでね",
    energy: "エネルギーが足りてないかも。少し休憩しよう",
  };

  const typeFeedback = scores[topType] > 0
    ? TYPE_FEEDBACK[topType]
    : "今日も体を大切にしてね！";

  return {
    questionIds: questions.map((q) => q.id),
    answers,
    scores,
    overallPercent,
    feedback,
    typeFeedback,
  };
}
