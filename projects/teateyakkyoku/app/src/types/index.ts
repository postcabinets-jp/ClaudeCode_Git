// ===== 疲労タイプ =====
export type FatigueType =
  | "brain"      // 脳疲労 → シロ（白い狐）
  | "blood"      // 血流不足 → ホノ（赤い熊）
  | "nerve"      // 自律神経 → シカ（青い鹿）
  | "organ"      // 内臓疲労 → コテツ（黄色いカメ）
  | "energy";    // エネルギー不足 → モコ（紫の猫）

// ===== キャラクター =====
export interface Character {
  type: FatigueType;
  name: string;           // シロ / ホノ / シカ / コテツ / モコ
  emoji: string;          // 🦊 / 🐻 / 🦌 / 🐢 / 🐱
  level: 1 | 2 | 3;
  levelName: string;      // たまご期 / めばえ期 / 覚醒期
  description: string;
  color: string;          // primary color hex
}

export const CHARACTERS: Record<FatigueType, Omit<Character, "level" | "levelName">> = {
  brain:  { type: "brain",  name: "シロ",   emoji: "🦊", description: "静かで賢い白い狐。考えすぎを癒し、心を落ち着かせてくれる。", color: "#DDE8E4" },
  blood:  { type: "blood",  name: "ホノ",   emoji: "🐻", description: "温かくぽっちゃりした熊。体の巡りを助け、じんわり温めてくれる。", color: "#F5C4A8" },
  nerve:  { type: "nerve",  name: "シカ",   emoji: "🦌", description: "繊細でしなやかな鹿。リズムを整え、穏やかな眠りへ導く。", color: "#A8D4C8" },
  organ:  { type: "organ",  name: "コテツ", emoji: "🐢", description: "じっくり丁寧なカメ。消化を助け、お腹の中から整える。", color: "#E8D4A0" },
  energy: { type: "energy", name: "モコ",   emoji: "🐱", description: "活発でマイペースな猫。気力を補い、前向きな力をくれる。", color: "#C4B8E8" },
};

export const LEVEL_NAMES: Record<1 | 2 | 3, string> = {
  1: "たまご期",
  2: "めばえ期",
  3: "覚醒期",
};

// ===== 診断 =====
export interface DiagnosisQuestion {
  id: string;
  text: string;
  category: FatigueType;
}

export interface DiagnosisResult {
  scores: Record<FatigueType, number>;
  primaryType: FatigueType;
  secondaryType: FatigueType;
  createdAt: string;
}

// ===== ユーザー =====
export interface UserProfile {
  id: string;
  nickname?: string;
  character?: Character;
  diagnosisHistory: DiagnosisResult[];
  continuousDays: number;
  totalCheckins: number;
  createdAt: string;
  agreedDisclaimer?: boolean;
}
