---
description: Pro-level design system generator for LP, business cards, SNS, slides, and brand guidelines. Supports 12 style presets, Japanese fonts, WCAG 2.1 AA, animations, Tailwind, and Pencil.dev MCP integration.
---

# Design Command — Pro Design System Generator

**Usage**: `/design <task description>`

デザインタスクを受け取り、プロレベルの成果物を生成する統合デザインコマンド。

---

## 対応成果物タイプ

| タイプ | 説明 | 主要仕様 |
|--------|------|---------|
| `lp` | ランディングページ | レスポンシブ・アニメーション・CTA最適化 |
| `card` | 名刺 | 91mm×55mm・印刷対応（300dpi・トンボ付き） |
| `sns` | SNSビジュアル | Instagram/X/Facebook各サイズ対応 |
| `slides` | スライド/プレゼン | 16:9・アニメーション・HTML出力 |
| `brand` | ブランドガイドライン | カラー・タイポ・ロゴルール |
| `ui` | WebアプリUI | コンポーネント設計・Tailwind対応 |

---

## 12スタイルプリセット

### TIER 1 — ラグジュアリー・ハイエンド

```
LUXURY
  Primary: #0A0A0A / #F5F0E8 / #C9A84C (ゴールド)
  Font: Zen Old Mincho (見出し) + Noto Serif JP (本文)
  特徴: 余白最大化・細線・上品なセリフ・金箔表現
  用途: 高級ブランド・不動産・ジュエリー・ホテル

EDITORIAL
  Primary: #1A1A1A / #FFFFFF / #E8E0D0 (クリーム)
  Font: Shippori Mincho B1 (見出し) + Noto Sans JP (本文)
  特徴: 大胆な文字組み・非対称レイアウト・写真重視
  用途: 雑誌・ファッション・アート・クリエイター
```

### TIER 2 — コーポレート・プロフェッショナル

```
CORPORATE_JP
  Primary: #1E3A5F (ネイビー) / #FFFFFF / #E8F0F8
  Font: Noto Sans JP Bold (見出し) + Noto Sans JP Regular (本文)
  特徴: 信頼感・整然・グリッドベース
  用途: 中堅企業・BtoB・コンサル・士業

POLITICIAN (政治家ブランド)
  Primary: #0D2137 (深紺) / #FFFFFF / #C41E3A (日本の赤)
  Font: Noto Serif JP Black (見出し) + Noto Sans JP (本文)
  特徴: 力強さ・誠実さ・日本的権威感
  アクセント: 家紋モチーフ・和柄パターン
  用途: 政治家・行政・公共サービス

POST_CABINETS (POST CABINETSブランド)
  Primary: #0F172A (ダークネイビー) / #F8FAFC / #6366F1 (インディゴ)
  Secondary: #EC4899 (ピンク) / #14B8A6 (ティール)
  Font: Noto Sans JP Bold + Inter (英数字のみ)
  特徴: モダン・テック・マーケティング感・データドリブン
  用途: POST CABINETS社内資料・営業資料・クライアント提案
```

### TIER 3 — クリエイティブ・モダン

```
BRUTALIST
  Primary: #000000 / #FFFFFF / #FFE500 (イエロー) / #FF3B30 (レッド)
  Font: Noto Sans JP Black + M PLUS 1p Black
  特徴: 太いボーダー・生々しいレイアウト・ズレ・主張
  用途: スタートアップ・アート・若者向け

MINIMAL_ZEN
  Primary: #F7F5F0 / #2C2C2C / #8B7355 (土色)
  Font: Zen Kaku Gothic New (見出し) + Noto Sans JP Light (本文)
  特徴: 極限の余白・モノクロ基調・禅的シンプルさ
  用途: 和雑貨・茶道・日本文化・ライフスタイル

TECH_DARK
  Primary: #0F0F0F / #F0F0F0 / #00FF88 (グリーン蛍光)
  Font: JetBrains Mono + Noto Sans JP
  特徴: ダーク・コード感・グロー効果・グリッド
  用途: SaaS・開発ツール・テック企業・AI
```

### TIER 4 — SNS・コンテンツ特化

```
SNS_WARM
  Primary: #FFF8F0 / #2D1B0E / #FF6B35 (オレンジ) / #F7C59F
  Font: Noto Sans JP Bold + M PLUS Rounded 1c
  特徴: 温かみ・親しみやすさ・丸み・カジュアル
  用途: Instagram・飲食・美容・ライフスタイル

SNS_COOL
  Primary: #EEF2FF / #1E1B4B / #818CF8 (ライトインディゴ)
  Font: Noto Sans JP + Kaisei Tokumin
  特徴: クール・洗練・都会的・インテリ感
  用途: X(Twitter)・ビジネス系インフルエンサー

GRADIENT_MODERN
  Primary: linear-gradient(135deg, #667EEA, #764BA2)
  Accent: #FFFFFF / #F0E6FF
  Font: Noto Sans JP Bold
  特徴: グラデ背景・ガラスモーフィズム・フローティング
  注意: ⚠️ 紫グラデは陳腐化リスク — 差別化が必要な場合のみ使用
  用途: アプリ・SaaS・LP（汎用）
```

### TIER 5 — 印刷・オフライン特化

```
PRINT_CARD
  印刷仕様: 91mm×55mm（名刺標準）
  BleedArea: +3mm全周（97mm×61mm）
  SafeArea: 内側2mm（87mm×51mm）
  解像度: 300dpi必須
  ColorMode: CMYK（RGB変換式記載）
  Font: 最小6pt・アウトライン化推奨
  用途: 名刺・DM・フライヤー
```

---

## 日本語フォントスタック

```css
/* 見出し — セリフ系（格調・権威） */
"Zen Old Mincho", "Shippori Mincho B1", "Noto Serif JP", serif

/* 見出し — ゴシック系（モダン・力強） */
"Noto Sans JP", "M PLUS 1p", "Zen Kaku Gothic New", sans-serif

/* 本文 — 可読性最優先 */
"Noto Sans JP", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif

/* 丸ゴシック — 親しみやすさ */
"M PLUS Rounded 1c", "Kosugi Maru", sans-serif

/* 英数字専用（日本語フォントと混植） */
"Inter var", "SF Pro Display", -apple-system

/* 等幅（コード・テック） */
"JetBrains Mono", "Fira Code", monospace
```

### Google Fonts インポート例

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Noto+Serif+JP:wght@400;600;900&family=Zen+Old+Mincho:wght@400;700;900&family=M+PLUS+1p:wght@400;700;800&family=M+PLUS+Rounded+1c:wght@400;700&display=swap" rel="stylesheet">
```

---

## WCAG 2.1 AA アクセシビリティ基準

### カラーコントラスト必須要件

```
通常テキスト（18pt未満・Bold14pt未満）: コントラスト比 ≥ 4.5:1
大きなテキスト（18pt以上・Bold14pt以上）: コントラスト比 ≥ 3:1
UI コンポーネント・グラフィック要素: コントラスト比 ≥ 3:1
```

### 検証ツール統合

```javascript
// コントラスト比計算（実装に含めること）
function getContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AA判定
function isWCAG_AA(fg, bg, isLargeText = false) {
  const ratio = getContrastRatio(fg, bg);
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
}
```

### フォーカス・キーボード対応

```css
/* フォーカスリング — 必ず実装 */
:focus-visible {
  outline: 3px solid #005FCC;
  outline-offset: 2px;
  border-radius: 2px;
}

/* フォーカス非表示は禁止 */
/* NG: outline: none; */
/* NG: outline: 0; */
```

### セマンティックHTML必須

```html
<!-- 見出し階層を正しく使用 -->
<h1> → <h2> → <h3> (スキップ禁止)

<!-- ランドマーク -->
<header>, <main>, <nav>, <footer>, <section aria-label="...">

<!-- 画像 -->
<img alt="説明テキスト"> (装飾画像は alt="")

<!-- ボタン -->
<button type="button" aria-label="具体的な説明">
```

---

## アニメーション仕様

### パフォーマンス優先アニメーション

```css
/* GPU最適化 — transformとopacityのみ使用 */
.animate-fade-up {
  animation: fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* スクロールトリガー */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.animate-on-scroll.in-view {
  opacity: 1;
  transform: none;
}

/* 動き低減ユーザーへの配慮（必須） */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Intersection Observer（スクロールアニメーション）

```javascript
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
```

---

## Tailwind CSS 設計パターン

### カスタムテーマ設定

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        jp: ['"Noto Sans JP"', 'sans-serif'],
        'jp-serif': ['"Noto Serif JP"', '"Zen Old Mincho"', 'serif'],
        'jp-round': ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      colors: {
        // POST CABINETS ブランドカラー
        postcab: {
          dark:    '#0F172A',
          light:   '#F8FAFC',
          indigo:  '#6366F1',
          pink:    '#EC4899',
          teal:    '#14B8A6',
        },
        // 政治家ブランドカラー
        political: {
          navy:  '#0D2137',
          red:   '#C41E3A',
          white: '#FFFFFF',
          gold:  '#C9A84C',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // 名刺サイズ定義
      width: {
        'card-91': '91mm',
        'card-bleed': '97mm',
      },
      height: {
        'card-55': '55mm',
        'card-bleed': '61mm',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

### 日本語テキスト用Tailwindクラス

```html
<!-- 日本語特有の調整 -->
<p class="font-jp leading-[2] tracking-wide text-base">
  日本語本文テキスト
</p>

<h1 class="font-jp-serif font-black leading-tight tracking-tighter">
  見出しテキスト
</h1>

<!-- 禁則処理 -->
<p class="break-words" style="overflow-wrap: break-word; word-break: keep-all; line-break: strict;">
  日本語の禁則処理対応テキスト
</p>
```

---

## SNSビジュアルサイズガイド

```
Instagram投稿 (正方形):  1080×1080px (1:1)
Instagram投稿 (縦):      1080×1350px (4:5)
Instagram Stories:       1080×1920px (9:16)
Instagram Reels:         1080×1920px (9:16)
X (Twitter) 投稿:        1200×675px  (16:9)
X ヘッダー:              1500×500px
Facebook投稿:            1200×630px  (1.91:1)
LinkedIn投稿:            1200×628px
YouTube サムネイル:      1280×720px  (16:9)
```

---

## Pencil.dev MCP 統合

Pencilが利用可能な場合、`.pen`ファイルへの出力を優先する。

### 利用可能確認

```
1. get_editor_state() — エディタ状態確認
2. アクティブな.penファイルがあればそこに出力
3. なければ open_document('new') で新規作成
```

### スタイルガイド取得フロー

```
1. get_style_guide_tags() — 利用可能タグ確認
2. get_style_guide(tags, name) — プリセットに合うスタイルガイド取得
3. get_guidelines('landing-page'|'mobile-app'|'web-app'|'slides') — ガイドライン取得
4. batch_design() でデザイン生成
```

### 名刺デザイン（Pencil）

```
1. get_guidelines('design-system') で印刷ルール確認
2. batch_design() で91mm×55mmフレーム作成
3. snapshot_layout() でレイアウト確認
4. get_screenshot() でビジュアル検証
5. export_nodes() でPNG/PDF出力
```

---

## Google Stitch 統合

Google Stitchが利用可能な場合、UIコンポーネント生成に活用：

```
対応タスク:
- UIコンポーネントのプロトタイプ生成
- レスポンシブレイアウトの自動調整
- デザイントークンの管理
```

---

## アンチパターン禁止リスト

### フォント禁止

```
❌ Inter (日本語テキストに使用) — 日本語グリフ品質が低い
❌ システムフォントのみ使用 — ブランド統一性が失われる
❌ 3種類以上のフォントファミリー混在 — 視覚的ノイズ
❌ 12px未満のフォントサイズ — 可読性・アクセシビリティ違反
```

### カラー禁止

```
❌ 紫グラデーション (linear-gradient(purple, pink)) — 2020年代前半の陳腐化デザイン
❌ テキストと背景のコントラスト比 < 4.5:1 — WCAG AA違反
❌ 4色以上のブランドカラー同時使用 — 視覚的混乱
❌ 純粋な #FFFFFF 背景 + 純粋な #000000 テキスト — 眼精疲労（#FAFAF9 + #1A1A1A推奨）
❌ 赤+緑の組み合わせをメインに — 色覚多様性への配慮不足
```

### レイアウト禁止

```
❌ outline: none / outline: 0 — キーボードユーザーのフォーカス不可視
❌ 見出し階層スキップ (h1→h3) — SEO・アクセシビリティ違反
❌ 装飾目的の <table> — セマンティクス違反
❌ 1行テキストの過剰な letter-spacing — 可読性低下
❌ 日本語に英語CSSのword-break適用 — 禁則処理破壊
```

### アニメーション禁止

```
❌ top/left/margin でのアニメーション — リペイント発生・パフォーマンス悪化
❌ @keyframes での width/height アニメーション — レイアウトシフト
❌ prefers-reduced-motion 未対応 — アクセシビリティ違反
❌ 3秒以上のアニメーション — UX阻害
❌ 自動再生の点滅コンテンツ (3Hz以上) — 光感受性発作リスク
```

### 印刷禁止（名刺）

```
❌ RGB カラーモードで入稿 — 印刷色ずれ
❌ 塗り足し(bleed)なし — 断裁時の白フチ
❌ テキスト非アウトライン化 — フォント埋め込みエラー
❌ 解像度 72dpi — 印刷でぼやける（300dpi必須）
❌ 5pt未満のフォント — 印刷で潰れる
```

---

## ワークフロー

### Phase 1: 要件分析 `[Mode: Analyze]`

1. 成果物タイプ特定 (lp/card/sns/slides/brand/ui)
2. スタイルプリセット選択 or カスタム
3. ターゲット・目的・使用コンテキスト確認
4. Pencil.dev MCPが利用可能か `get_editor_state()` で確認

### Phase 2: デザイン設計 `[Mode: Design]`

1. カラーパレット定義（WCAG AA検証付き）
2. タイポグラフィスケール設定
3. グリッド・スペーシングシステム定義
4. アニメーション戦略決定

### Phase 3: 生成 `[Mode: Generate]`

**Pencil利用可能な場合:**
```
get_guidelines(topic) → get_style_guide() → batch_design() → snapshot_layout() → get_screenshot()
```

**コード出力の場合:**
- HTML/CSS/Tailwind で実装
- アクセシビリティチェック実施
- アニメーション実装（prefers-reduced-motion対応）

### Phase 4: 検証 `[Mode: Validate]`

- WCAG AA コントラスト比確認
- レスポンシブ表示確認
- アニメーション動作確認
- 印刷仕様確認（名刺の場合）

---

## 使用例

```bash
# ランディングページ
/design POST CABINETSのSEOサービスLP、POST_CABINETSプリセット使用

# 名刺デザイン
/design nobu（POST CABINETS代表）の名刺、LUXURY プリセット、Pencilで出力

# SNSビジュアル
/design 政治家としての政策発表Instagram投稿、POLITICIANプリセット

# スライド
/design アドネス大阪の投資家向けピッチデッキ、EDITORIAL プリセット

# ブランドガイドライン
/design POST CABINETSのブランドガイドライン一式作成
```

---

## 関連コマンド

- `/plan` — 大規模デザインプロジェクトの事前計画
- `/multi-frontend` — フロントエンド実装との統合
- `/code-review` — 生成コードのレビュー
