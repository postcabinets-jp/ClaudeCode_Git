import type { FatigueType } from "@/types";
import kampoMaster from "./kampo-master.json";

// ====================================================
// 商品マスター — Notion漢方データ（140件）から自動変換
// ====================================================

export interface KampoProduct {
  id: string;              // "k001" 形式
  name: string;            // 処方名
  reading: string;         // 読み仮名
  tsumuraNo: string;       // ツムラ番号
  oneLiner: string;        // 効能一言
  types: FatigueType[];    // マッピング結果
  symptoms: string[];      // 主な適応症状
  ingredients: string;     // 主な構成生薬
  insurance: boolean;      // 保険適用
  otc: string;             // 市販品
  constitution: string[];  // 体質・証
  classification: string[]; // 薬効分類
  source: string;          // 出典・文献
  caution: string;         // 注意事項
  alias: string;           // 別名・通称
}

// --- 薬効分類 → FatigueType マッピング ---

const CLASSIFICATION_MAP: Record<string, FatigueType[]> = {
  "安神（あんじん）":       ["brain", "nerve"],
  "清熱（せいねつ）":       ["brain"],
  "活血（かっけつ）":       ["blood"],
  "補血（ほけつ）":         ["blood"],
  "解表（かいひょう）":     ["nerve"],
  "理気（りき）":           ["organ"],
  "消食（しょうしょく）":   ["organ"],
  "温裏（おんり）":         ["organ"],
  "瀉下（しゃか）":         ["organ"],
  "補気（ほき）":           ["energy"],
  "補陽（ほよう）":         ["energy"],
  "補陰（ほいん）":         ["energy"],
};

// --- 症状 → FatigueType 補完マッピング ---

const SYMPTOM_MAP: Record<string, FatigueType[]> = {
  "不眠":             ["brain", "nerve"],
  "不安・ストレス":   ["brain", "nerve"],
  "頭痛":             ["brain"],
  "神経症":           ["brain"],
  "冷え性":           ["blood"],
  "月経不順・婦人科": ["blood"],
  "むくみ":           ["blood"],
  "肩こり":           ["blood"],
  "しびれ":           ["blood"],
  "めまい":           ["nerve"],
  "動悸":             ["nerve"],
  "更年期":           ["nerve"],
  "胃腸不調":         ["organ"],
  "便秘":             ["organ"],
  "下痢":             ["organ"],
  "泌尿器":           ["organ"],
  "疲労・倦怠感":     ["energy"],
  "風邪・感冒":       ["energy"],
};

// --- 絵文字マッピング ---

const EMOJI_BY_TYPE: Record<FatigueType, string> = {
  brain: "\u{1F9E0}",   // 🧠
  blood: "\u{1FA78}",   // 🩸
  nerve: "\u{1F33F}",   // 🌿
  organ: "\u{1FAD0}",   // 🫚 (ginger root – closest to organ/内臓)
  energy: "\u26A1",     // ⚡
};

// --- 背景色マッピング ---

const BG_BY_TYPE: Record<FatigueType, string> = {
  brain: "#EBF0F5",
  blood: "#F5EAEA",
  nerve: "#F0EDF5",
  organ: "#EBF5EB",
  energy: "#F5F0E8",
};

// --- JSON → KampoProduct 変換 ---

interface KampoMasterRecord {
  name: string;
  reading: string;
  tsumuraNo: string;
  category: string;
  oneLiner: string;
  symptoms: string[];
  constitution: string[];
  classification: string[];
  ingredients: string;
  source: string;
  caution: string;
  insurance: boolean;
  otc: string;
  alias: string;
  status?: string;
}

function resolveTypes(record: KampoMasterRecord): FatigueType[] {
  const set = new Set<FatigueType>();

  // 薬効分類ベース
  for (const cls of record.classification) {
    const mapped = CLASSIFICATION_MAP[cls];
    if (mapped) mapped.forEach((t) => set.add(t));
  }

  // 症状ベース補完
  for (const sym of record.symptoms) {
    const mapped = SYMPTOM_MAP[sym];
    if (mapped) mapped.forEach((t) => set.add(t));
  }

  // どれにも該当しない場合は energy をデフォルトに
  if (set.size === 0) set.add("energy");

  return Array.from(set);
}

function convertToKampoProducts(records: KampoMasterRecord[]): KampoProduct[] {
  return records.map((r, i) => {
    const id = `k${String(i + 1).padStart(3, "0")}`;
    return {
      id,
      name: r.name,
      reading: r.reading,
      tsumuraNo: r.tsumuraNo,
      oneLiner: r.oneLiner,
      types: resolveTypes(r),
      symptoms: r.symptoms,
      ingredients: r.ingredients,
      insurance: r.insurance,
      otc: r.otc,
      constitution: r.constitution,
      classification: r.classification,
      source: r.source,
      caution: r.caution,
      alias: r.alias,
    };
  });
}

// ====================================================
// エクスポート: 全商品データ（140件）
// ====================================================

export const PRODUCTS_DATA: KampoProduct[] = convertToKampoProducts(
  kampoMaster as KampoMasterRecord[],
);

// タイプ別フィルター
export function getProductsByType(type: FatigueType): KampoProduct[] {
  return PRODUCTS_DATA.filter((p) => p.types.includes(type));
}

// タイプ別おすすめ（最大N件）
export function getRecommendedProducts(type: FatigueType, limit = 2): KampoProduct[] {
  return getProductsByType(type).slice(0, limit);
}

// ホーム画面用のシンプルな形式に変換
export function toHomeProductCard(p: KampoProduct): {
  id: string;
  name: string;
  desc: string;
  price: string;
  emoji: string;
  bg: string;
} {
  const emoji = EMOJI_BY_TYPE[p.types[0]] ?? "\u26A1";
  const bg = BG_BY_TYPE[p.types[0]] ?? "#F5F0E8";
  const priceLabel = p.insurance ? "保険適用" : "市販";

  return {
    id: p.id,
    name: p.name,
    desc: p.oneLiner.slice(0, 15) + "\u2026",
    price: priceLabel,
    emoji,
    bg,
  };
}

// 絵文字取得ヘルパー（shop等で使用）
export function getKampoEmoji(p: KampoProduct): string {
  return EMOJI_BY_TYPE[p.types[0]] ?? "\u26A1";
}

// 後方互換のために ProductData を KampoProduct のエイリアスとしてエクスポート
export type ProductData = KampoProduct;
