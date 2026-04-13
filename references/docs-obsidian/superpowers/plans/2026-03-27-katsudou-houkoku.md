# 活動報告ビラ生成システム Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/katsudou-houkoku` スラッシュコマンドと `flyer-composer` エージェントを作成し、素材投入→コンテンツ構成→A4両面HTMLデザイン生成→デジタル出力まで一気通貫で実行できるようにする。

**Architecture:** Skill（コマンド）がワークフロー統括、Agent（flyer-composer）がコンテンツ構成を担当する2層構成。デザイン生成は既存の `/design` コマンドの POLITICIANプリセットを活用。出力は `output/flyer/vol-XXX/` に保存。

**Tech Stack:** Claude Code Skill（Markdown）、Claude Code Agent（Markdown）、HTML/CSS（Google Fonts CDN）、Playwright（スクリーンショット/PDF化）

---

## File Structure

| ファイル | 役割 |
|---------|------|
| `~/.claude/agents/flyer-composer.md` | コンテンツ構成エージェント |
| `~/.claude/commands/katsudou-houkoku.md` | ワークフロー統括スラッシュコマンド |

---

### Task 1: flyer-composer Agent 作成

**Files:**
- Create: `~/.claude/agents/flyer-composer.md`

- [ ] **Step 1: Agent ファイル作成**

`~/.claude/agents/flyer-composer.md` を以下の内容で作成する:

```markdown
---
name: flyer-composer
description: 政治家活動報告ビラのコンテンツ構成専門エージェント。素材テキスト・写真パスを受け取り、A4両面6ブロック構成のJSONを返す。
tools: ["Read", "Glob", "Grep"]
model: sonnet
---

あなたは**政治家活動報告ビラのコンテンツ構成**専門エージェントです。

## あなたの仕事

素材（テキスト・写真パス・号数・テーマ）を受け取り、A4両面に収まるビラのコンテンツ構成を作成する。

## A4両面 6ブロック構成

### 表面（第一印象・パッと見て伝わる）

| # | ブロック | 役割 | 目安文字数 |
|---|----------|------|-----------|
| 1 | ヘッダー | 号数・タイトル・発行月・名前・キャッチコピー | 50字 |
| 2 | メイン特集 | 一番伝えたいこと。写真大きめ | 300字 |
| 3 | サブトピック×2-3 | 地域活動・イベント報告など。写真小 | 各120字 |

### 裏面（じっくり読む人向け）

| # | ブロック | 役割 | 目安文字数 |
|---|----------|------|-----------|
| 4 | 実績・数字 | 議会での成果、具体的な数字 | 200字 |
| 5 | コラム/想い | 個人の想い、理念、エピソード | 200字 |
| 6 | フッター | プロフィール・連絡先・SNS QRコード・次号予告 | 100字 |

## 絶対に守るルール

1. **文字量厳守** — 上記の目安文字数を超えない。A4に収まる量に必ず削る。溢れるくらいなら削る。情報の取捨選択があなたの最大の仕事。
2. **政治家トーン** — 誠実・力強い・具体的。ポエムにしない。「未来を切り拓く」のような空虚な表現禁止。
3. **数字ファースト** — 「○○を実現しました」より「○○件の相談に対応」「予算○○万円を確保」。
4. **写真指示つき** — どの写真をどのブロックでどのサイズ（大/中/小）で使うか明示する。
5. **キャッチコピーは具体的に** — その号でしか使えない固有のコピーにする。「活動報告」のような汎用語だけにしない。

## 入力で受け取る情報

- `issue`: 号数（例: 3）
- `date`: 発行月（例: 2026年4月）
- `theme`: 特集テーマ（任意。なければ素材から判断）
- `materials`: 素材テキスト（箇条書き or 自由記述）
- `photos`: 写真パスのリスト（任意）

## 出力フォーマット

必ず以下のJSON構造で出力すること。コードブロック（```json）で囲む。

```json
{
  "issue": 3,
  "date": "2026年4月",
  "theme": "議会質問特集",
  "front": {
    "header": {
      "catchcopy": "子どもの未来に、予算がついた。",
      "subtitle": "大阪府議会議員 nobu 活動報告 第3号"
    },
    "main": {
      "headline": "府議会で子育て支援策を提案、予算2,000万円を確保",
      "body": "本文テキスト（300字以内）...",
      "photo": "photos/gikai-shitsumon.jpg",
      "photo_size": "large",
      "photo_caption": "3月15日 大阪府議会本会議にて"
    },
    "sub": [
      {
        "headline": "岸和田だんじり祭り実行委員会に参加",
        "body": "本文テキスト（120字以内）...",
        "photo": "photos/danjiri.jpg",
        "photo_size": "small"
      }
    ]
  },
  "back": {
    "results": {
      "headline": "この3ヶ月の実績",
      "items": [
        { "label": "府民相談対応", "value": "47件" },
        { "label": "議会質問", "value": "3回" },
        { "label": "地域イベント参加", "value": "12回" }
      ]
    },
    "column": {
      "headline": "児童養護施設出身の私が、議場に立つ理由",
      "body": "本文テキスト（200字以内）..."
    },
    "footer": {
      "profile": "大阪府議会議員（岸和田市選挙区）/ POST CABINETS代表 / 児童養護施設出身",
      "contact": {
        "office": "大阪府岸和田市○○町○-○",
        "phone": "072-XXX-XXXX",
        "email": "nobu@example.com"
      },
      "qr_targets": ["LINE公式", "Instagram", "公式サイト"],
      "next_preview": "次号は6月発行予定。テーマ「泉州の産業振興」"
    }
  }
}
```

## 素材が足りない場合

- テーマだけ指定されて素材がない場合: プレースホルダテキストを入れ、`[要差し替え: ○○の具体的内容]` と明示する
- 写真パスがない場合: `photo` を `"placeholder"` にし、`photo_caption` に「○○の写真を挿入」と書く
```

- [ ] **Step 2: 動作確認**

Claude Code で以下を実行して、エージェントが認識されることを確認:

```
Agent tool で flyer-composer を subagent_type に指定して呼び出し、
テスト素材を渡してJSON出力を確認する
```

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/agents/flyer-composer.md
git commit -m "feat: add flyer-composer agent for political activity report flyers"
```

---

### Task 2: /katsudou-houkoku Skill 作成

**Files:**
- Create: `~/.claude/commands/katsudou-houkoku.md`

- [ ] **Step 1: Skill ファイル作成**

`~/.claude/commands/katsudou-houkoku.md` を以下の内容で作成する:

```markdown
---
description: 政治家活動報告ビラを一気通貫で生成する。素材投入→コンテンツ構成→A4両面HTMLデザイン→印刷用/デジタル用出力。
---

# /katsudou-houkoku — 活動報告ビラ生成

入力された素材から、A4両面の活動報告ビラを生成する。

## ワークフロー

### Step 1: 入力パース

ユーザーの入力から以下を抽出する:
- **号数**: 「第○号」「vol.○」「#○」のいずれかのパターン。なければ聞く
- **テーマ**: 引用符で囲まれた文字列、または素材内容から推定
- **写真**: `--photos パス` または素材中のファイルパス
- **素材テキスト**: 上記以外のすべてのテキスト

抽出結果を表示して確認:
```
📋 入力内容:
  号数: 第3号
  テーマ: 子育て支援特集
  写真: 3枚（photos/a.jpg, photos/b.jpg, photos/c.jpg）
  素材: 5項目
```

### Step 2: flyer-composer Agent でコンテンツ構成

Agent tool を使い、subagent_type="flyer-composer" で起動する。

プロンプト:
```
以下の素材から活動報告ビラのコンテンツ構成JSONを作成してください。

号数: {issue}
発行月: {date}
テーマ: {theme}
写真: {photos}

素材:
{materials}
```

返却されたJSONを整形して表示する。

### Step 3: ユーザー確認

構成案を見やすく表示:

```
📰 活動報告 第3号「子育て支援特集」構成案

【表面】
  ヘッダー: 「子どもの未来に、予算がついた。」
  メイン: 府議会で子育て支援策を提案〜 [写真大: gikai.jpg]
  サブ1: 岸和田だんじり祭り〜 [写真小: danjiri.jpg]
  サブ2: 地域防災訓練〜 [写真小: bousai.jpg]

【裏面】
  実績: 相談47件 / 質問3回 / イベント12回
  コラム: 「児童養護施設出身の私が〜」
  フッター: プロフィール + QR 3種
```

「この内容でデザインに進む？修正があれば言ってください」と聞く。
修正指示があれば Step 2 に戻って再構成。

### Step 4: HTML生成

承認を得たら、A4両面のHTMLを生成する。

#### デザイン仕様（POLITICIANプリセット）

```
カラー:
  メイン: 深紺 #0D2137
  背景: 白 #FFFFFF
  アクセント: 赤 #C41E3A
  テキスト: #1A1A1A（本文）/ #FFFFFF（紺背景上）

フォント（Google Fonts CDN）:
  見出し: Noto Serif JP Black
  本文: Noto Sans JP Regular
  数字: Inter Bold（英数字のみ）

サイズ:
  A4: 210mm × 297mm
  塗り足し: +3mm全周 = 216mm × 303mm
  安全領域: 内側5mm

印刷:
  解像度: 300dpi 相当（CSS px で設計、印刷時にスケール）
```

#### HTML構造

1つのHTMLファイルに表面・裏面の両方を含める。`page-break-after: always` で分離。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>活動報告 第{issue}号</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Noto+Serif+JP:wght@700;900&family=Inter:wght@700&display=swap" rel="stylesheet">
  <style>
    /* 全体リセット・基本設定 */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --navy: #0D2137;
      --red: #C41E3A;
      --white: #FFFFFF;
      --text: #1A1A1A;
      --bg-light: #F5F7FA;
    }

    body {
      font-family: "Noto Sans JP", sans-serif;
      color: var(--text);
      line-height: 1.8;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 8mm;
      margin: 0 auto;
      background: var(--white);
      position: relative;
      overflow: hidden;
    }

    @media print {
      .page { page-break-after: always; margin: 0; padding: 8mm; }
      .page:last-child { page-break-after: avoid; }
    }

    /* ヘッダー */
    .header {
      background: var(--navy);
      color: var(--white);
      padding: 6mm;
      margin: -8mm -8mm 6mm -8mm;
    }
    .header .issue {
      font-family: "Inter", sans-serif;
      font-weight: 700;
      font-size: 10pt;
      color: var(--red);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .header .catchcopy {
      font-family: "Noto Serif JP", serif;
      font-weight: 900;
      font-size: 22pt;
      line-height: 1.4;
      margin: 3mm 0;
    }
    .header .subtitle {
      font-size: 9pt;
      opacity: 0.8;
    }

    /* メイン特集 */
    .main-feature {
      margin-bottom: 6mm;
    }
    .main-feature .headline {
      font-family: "Noto Serif JP", serif;
      font-weight: 900;
      font-size: 16pt;
      color: var(--navy);
      border-left: 4px solid var(--red);
      padding-left: 4mm;
      margin-bottom: 4mm;
      line-height: 1.4;
    }
    .main-feature .photo {
      width: 100%;
      max-height: 80mm;
      object-fit: cover;
      border-radius: 2mm;
      margin-bottom: 2mm;
    }
    .main-feature .caption {
      font-size: 7pt;
      color: #666;
      margin-bottom: 3mm;
    }
    .main-feature .body {
      font-size: 10pt;
      line-height: 1.9;
    }

    /* サブトピック */
    .sub-topics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80mm, 1fr));
      gap: 4mm;
    }
    .sub-topic {
      background: var(--bg-light);
      padding: 4mm;
      border-radius: 2mm;
    }
    .sub-topic .headline {
      font-weight: 700;
      font-size: 11pt;
      color: var(--navy);
      margin-bottom: 2mm;
    }
    .sub-topic .photo {
      width: 100%;
      height: 40mm;
      object-fit: cover;
      border-radius: 1mm;
      margin-bottom: 2mm;
    }
    .sub-topic .body {
      font-size: 9pt;
      line-height: 1.8;
    }

    /* 裏面: 実績 */
    .results {
      margin-bottom: 6mm;
    }
    .results .headline {
      font-family: "Noto Serif JP", serif;
      font-weight: 900;
      font-size: 16pt;
      color: var(--navy);
      text-align: center;
      margin-bottom: 4mm;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3mm;
      text-align: center;
    }
    .result-item {
      background: var(--navy);
      color: var(--white);
      padding: 4mm;
      border-radius: 2mm;
    }
    .result-item .value {
      font-family: "Inter", sans-serif;
      font-weight: 700;
      font-size: 20pt;
      color: var(--red);
    }
    .result-item .label {
      font-size: 8pt;
      margin-top: 1mm;
    }

    /* コラム */
    .column {
      background: var(--bg-light);
      padding: 6mm;
      border-radius: 2mm;
      margin-bottom: 6mm;
    }
    .column .headline {
      font-family: "Noto Serif JP", serif;
      font-weight: 700;
      font-size: 13pt;
      color: var(--navy);
      margin-bottom: 3mm;
    }
    .column .body {
      font-size: 10pt;
      line-height: 1.9;
    }

    /* フッター */
    .footer {
      background: var(--navy);
      color: var(--white);
      padding: 5mm;
      margin: auto -8mm -8mm -8mm;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 4mm;
      align-items: center;
    }
    .footer .profile {
      font-size: 8pt;
      line-height: 1.6;
    }
    .footer .qr-area {
      display: flex;
      gap: 3mm;
    }
    .footer .qr-item {
      text-align: center;
      font-size: 6pt;
    }
    .footer .qr-item .qr-placeholder {
      width: 18mm;
      height: 18mm;
      background: var(--white);
      border-radius: 1mm;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--navy);
      font-size: 7pt;
    }
    .footer .next {
      font-size: 8pt;
      color: var(--red);
      margin-top: 2mm;
    }

    /* デジタル表示時のレスポンシブ */
    @media screen and (max-width: 600px) {
      .page { width: 100%; min-height: auto; padding: 4mm; }
      .sub-topics { grid-template-columns: 1fr; }
      .results-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <!-- 表面 -->
  <div class="page" id="front">
    <div class="header">
      <div class="issue">VOL.{issue} — {date}</div>
      <div class="catchcopy">{catchcopy}</div>
      <div class="subtitle">{subtitle}</div>
    </div>

    <div class="main-feature">
      <h2 class="headline">{main.headline}</h2>
      <img class="photo" src="{main.photo}" alt="{main.photo_caption}">
      <div class="caption">{main.photo_caption}</div>
      <p class="body">{main.body}</p>
    </div>

    <div class="sub-topics">
      <!-- repeat for each sub -->
      <div class="sub-topic">
        <img class="photo" src="{sub.photo}" alt="">
        <h3 class="headline">{sub.headline}</h3>
        <p class="body">{sub.body}</p>
      </div>
    </div>
  </div>

  <!-- 裏面 -->
  <div class="page" id="back">
    <div class="results">
      <h2 class="headline">{results.headline}</h2>
      <div class="results-grid">
        <!-- repeat for each item -->
        <div class="result-item">
          <div class="value">{item.value}</div>
          <div class="label">{item.label}</div>
        </div>
      </div>
    </div>

    <div class="column">
      <h2 class="headline">{column.headline}</h2>
      <p class="body">{column.body}</p>
    </div>

    <div class="footer">
      <div class="footer-grid">
        <div>
          <div class="profile">{profile}</div>
          <div class="next">{next_preview}</div>
        </div>
        <div class="qr-area">
          <!-- repeat for each qr_target -->
          <div class="qr-item">
            <div class="qr-placeholder">QR</div>
            <div>{qr_target}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
```

JSONの各フィールドをHTMLテンプレートに埋め込んで、完成HTMLを生成する。
写真パスが `"placeholder"` の場合は、グレーの矩形にキャプションテキストを表示する。

### Step 5: ファイル出力

出力ディレクトリ: `output/flyer/vol-{号数3桁ゼロ埋め}/`

```
output/flyer/vol-003/
├── index.html       （表面＋裏面の統合HTML）
└── digital/         （後続のスクリーンショットで生成）
```

Write tool でHTMLファイルを保存する。

### Step 6: プレビュー確認

生成したHTMLをPlaywright MCPのbrowser_navigateで開き、browser_take_screenshotでスクリーンショットを取得する。

```
1. browser_navigate → file:///出力パス/index.html
2. browser_take_screenshot → 表面のスクリーンショット
3. スクロールして裏面も撮影
4. ユーザーに表示して確認を求める
```

「デザインを修正する？」と聞く。修正があれば Step 4 に戻る。

### Step 7: デジタル出力（オプション）

ユーザーが承認したら、デジタル配信用の画像を生成:

- LINE用: 1200×848px（16:9）
- Instagram用: 1080×1350px（4:5）

Playwrightでビューポートサイズを変更してスクリーンショット。
`output/flyer/vol-XXX/digital/` に保存。

### 完了メッセージ

```
✅ 活動報告 第{issue}号 生成完了

📁 出力ファイル:
  HTML:  output/flyer/vol-{XXX}/index.html
  LINE:  output/flyer/vol-{XXX}/digital/line.png
  Insta: output/flyer/vol-{XXX}/digital/insta.png

🖨 印刷: index.html をブラウザで開いて印刷（A4, 余白なし）
📱 デジタル: digital/ フォルダの画像をそのまま配信

修正が必要なら「ここを変えて」と指示してください。
```
```

- [ ] **Step 2: 動作確認**

`/katsudou-houkoku` を実行してSkillが認識されることを確認。

- [ ] **Step 3: Commit**

```bash
git add ~/.claude/commands/katsudou-houkoku.md
git commit -m "feat: add /katsudou-houkoku skill for activity report flyer generation"
```

---

### Task 3: テスト発行

- [ ] **Step 1: テスト素材でフル実行**

```
/katsudou-houkoku 第1号
- 3/5 大阪府議会で子育て支援について一般質問を行った。児童養護施設の支援拡充と里親制度の推進を提案。
- 3/12 岸和田市の地域防災訓練に参加。住民約200名と避難経路を確認。
- 3/18 泉州地域の中小企業経営者との意見交換会を開催。5社の経営者と業務効率化について議論。
- 3/22 岸和田市立小学校で「キャリア教育」の特別授業を実施。児童養護施設出身の経験を語った。
- 毎週水曜に事務所で府民相談を実施。3月は計15件の相談に対応。
```

- [ ] **Step 2: 出力確認・スクリーンショット確認**

- HTMLが正しく生成されているか
- 文字量がA4に収まっているか
- POLITICIANプリセットのデザインが適用されているか
- 写真プレースホルダが表示されているか

- [ ] **Step 3: 修正があれば対応**
