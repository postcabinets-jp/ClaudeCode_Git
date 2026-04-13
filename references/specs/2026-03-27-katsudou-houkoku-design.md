# 活動報告ビラ生成システム — 設計書

## 概要

大阪府議会議員（nobu）の定期活動報告ビラを、素材投入からデザイン完成まで一気通貫で生成するシステム。

- **Skill**: `/katsudou-houkoku` — ワークフロー統括
- **Agent**: `flyer-composer` — コンテンツ構成専門

## 要件

| 項目 | 仕様 |
|------|------|
| 配布形態 | 紙（印刷）＋ デジタル（LINE・Instagram） |
| 紙サイズ | A4両面フラット |
| 内容カテゴリ | 議会実績・地域活動・政策・プロフィール・予定（都度変動） |
| 発行頻度 | 定期（号数管理） |
| 写真 | 毎号自前写真を使用 |
| デザイン | POLITICIANプリセット（深紺 #0D2137 / 白 #FFFFFF / 赤 #C41E3A） |

## アーキテクチャ

```
ユーザー（nobu）
  │
  │ /katsudou-houkoku 第3号 "議会質問特集"
  │  + 写真パス、実績テキスト、トピック指定
  │
  ▼
┌─────────────────────────────────┐
│  Skill: /katsudou-houkoku       │
│  (ワークフロー統括)              │
│                                  │
│  1. 入力パース（号数・テーマ）    │
│  2. flyer-composer Agent起動     │
│     → コンテンツ構成JSON返却     │
│  3. HTML生成                     │
│     → POLITICIANプリセット       │
│     → A4両面HTML                 │
│  4. 出力                         │
│     → 印刷用PDF (300dpi)         │
│     → デジタル用PNG              │
│     → ソースHTML                 │
└─────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────┐
│  Agent: flyer-composer           │
│  (コンテンツ構成専門)             │
│                                  │
│  入力: 素材テキスト・写真・号数   │
│  処理:                           │
│   - 素材を6ブロックに分類        │
│   - 文字量を紙面制約に最適化     │
│   - 見出しのトーン統一           │
│   - 写真配置の優先度決定         │
│  出力: 構造化JSON                │
└─────────────────────────────────┘
```

### ファイル配置

```
~/.claude/commands/katsudou-houkoku.md   ← Skill（スラッシュコマンド）
~/.claude/agents/flyer-composer.md       ← Agent（コンテンツ構成）
```

## flyer-composer Agent 詳細

### 入力

- 素材テキスト（自由記述 or 箇条書き）
- 写真パス（複数可）
- 号数（第○号）
- 特集テーマ（任意）
- 発行月

### 6ブロック構成（A4両面）

**表面（第一印象）**

| ブロック | 役割 | 目安文字数 |
|----------|------|-----------|
| 1. ヘッダー | 号数・タイトル・発行月・名前・キャッチコピー | 50字 |
| 2. メイン特集 | 一番伝えたいこと。写真大 | 300字 |
| 3. サブトピック x2-3 | 地域活動・イベント報告など。写真小 | 各120字 |

**裏面（じっくり読む人向け）**

| ブロック | 役割 | 目安文字数 |
|----------|------|-----------|
| 4. 実績・数字 | 議会での成果、具体的な数字 | 200字 |
| 5. コラム/想い | 個人の想い、理念、エピソード | 200字 |
| 6. フッター | プロフィール・連絡先・SNS QRコード・次号予告 | 100字 |

### 出力JSON構造

```json
{
  "issue": 3,
  "date": "2026年4月",
  "theme": "議会質問特集",
  "front": {
    "header": {
      "catchcopy": "...",
      "subtitle": "..."
    },
    "main": {
      "headline": "...",
      "body": "...",
      "photo": "path/to/photo.jpg",
      "photo_caption": "..."
    },
    "sub": [
      { "headline": "...", "body": "...", "photo": "path" }
    ]
  },
  "back": {
    "results": {
      "headline": "...",
      "items": [
        { "label": "...", "value": "..." }
      ]
    },
    "column": {
      "headline": "...",
      "body": "..."
    },
    "footer": {
      "profile": "...",
      "contact": {
        "office": "...",
        "phone": "...",
        "email": "..."
      },
      "qr_targets": ["LINE", "Instagram", "Website"],
      "next_preview": "..."
    }
  }
}
```

### Agent ルール

1. **文字量厳守** — A4に収まる量に必ず削る。溢れるなら削る
2. **政治家トーン** — 誠実・力強い・具体的。ポエムにしない
3. **数字ファースト** — 「実現」より「○○件対応」「○○%改善」
4. **写真指示つき** — どの写真をどのサイズでどこに置くか明示

## /katsudou-houkoku Skill 詳細

### 使い方

```bash
# 最小
/katsudou-houkoku 第3号

# フル指定
/katsudou-houkoku 第3号 "子育て支援特集" --photos ./photos/april/

# 素材流し込み
/katsudou-houkoku 第3号
- 3/15 府議会で子育て支援について質問した
- 3/20 岸和田だんじり祭り実行委員会に参加
```

### ワークフロー

```
Step 1: 入力パース
  → 号数・テーマ・写真パス・素材テキストを抽出

Step 2: flyer-composer Agent 起動
  → 素材を渡してコンテンツ構成JSONを取得

Step 3: ユーザー確認
  → 構成案を表示「この内容でデザインに進む？」

Step 4: HTML生成
  → POLITICIANプリセットでA4両面HTML生成
  → 表面・裏面をそれぞれ設計
  → 写真はプレースホルダ or 実パス参照

Step 5: 出力
  → output/flyer/vol-XXX/ に保存
    ├── front.html
    ├── back.html
    ├── combined.html（両面プレビュー）
    ├── print.css（印刷用スタイル）
    └── digital/
        ├── line.png（1200x848px）
        └── insta.png（1080x1350px）

Step 6: Playwright でスクリーンショット
  → HTMLをブラウザレンダリングしてPNG/PDF化
```

### デザイン仕様（POLITICIANプリセット準拠）

| 項目 | 値 |
|------|-----|
| メインカラー | 深紺 #0D2137 |
| サブカラー | 白 #FFFFFF |
| アクセント | 赤 #C41E3A |
| 見出しフォント | Noto Serif JP Black |
| 本文フォント | Noto Sans JP Regular |
| 印刷解像度 | 300dpi |
| 塗り足し | 3mm全周 |
| デジタル（LINE） | 1200x848px |
| デジタル（Instagram） | 1080x1350px |

### HTML生成のルール

1. 単一HTMLファイル（CSS埋め込み）で完結
2. Google Fonts CDN使用（Noto Serif JP, Noto Sans JP）
3. 印刷用CSS（@media print）を同梱
4. 写真は `<img>` タグで絶対パス参照
5. QRコードはプレースホルダ画像（後から差し替え）

## 将来拡張

- **アプローチC移行**: `flyer-researcher` Agent追加でNotion/カレンダーから素材自動収集
- **号数DB**: Notion Projectsに「活動報告」を追加し、号数・発行日・テーマを管理
- **テンプレート複数化**: 特集号・速報号・年末まとめ号など
