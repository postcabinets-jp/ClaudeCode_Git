---
description: 維新PRESSを一気通貫で生成する。素材投入→コンテンツ構成→A4両面HTMLデザイン→印刷用/デジタル用出力。
---

# /katsudou-houkoku — 維新PRESS 生成

大阪府議会議員 前田将臣の活動報告ビラ「維新PRESS」を生成する。

## 基本情報（毎号固定）

- 紙名：維新PRESS
- 発行：大阪府議会議員 前田将臣事務所
- 住所：〒596-0825 大阪府岸和田市土生町4-4-6 新川第一ビル402
- 電話：070-2313-4792
- カラー：深緑 #1B6B3A / 赤 #C41E3A / 黄 #FFD700

## 写真サイズ（固定フォーマット）

| 位置 | サイズ |
|------|--------|
| 顔写真（ヒーロー） | 38mm × 50mm |
| メイン記事写真 | 194mm × 55mm（横幅全面） |
| サブ記事写真 ×2 | 各93mm × 32mm |

提供された写真は上記サイズ枠に `object-fit: cover` で配置する。写真のアスペクト比に応じてトリミング位置を調整（人物写真は顔が中央上寄りに来るよう `object-position` を設定）。

## テンプレート

`output/flyer/template/template.html` に `{{変数名}}` 形式のテンプレートがある。
flyer-composerのJSON出力をこのテンプレートに埋め込んでHTMLを生成する。
テンプレート末尾のコメントに全変数の一覧と埋め込み方法が記載されている。

## ワークフロー

### Step 1: 入力パース

ユーザーの入力から抽出：
- **号数**：「第○号」「vol.○」「#○」。なければ聞く
- **テーマ**：引用符内の文字列、または素材から推定
- **写真**：ファイルパスを抽出
- **素材テキスト**：上記以外のテキスト全て

確認表示：
```
維新PRESS 入力確認
  号数：Vol.X
  テーマ：○○
  写真：X枚
  素材：X項目
```

### Step 2: flyer-composer Agent でコンテンツ構成

Agent tool で `general-purpose` エージェントを起動し、`flyer-composer.md` の指示内容をプロンプトに埋め込んで実行する。

返却されたJSONを整形して表示。

### Step 3: ユーザー確認

構成案を表示：
```
維新PRESS Vol.X「テーマ」構成案

【表面】
  キャッチ：「○○」
  メイン：○○ [写真: filename.jpg → 194×55mm]
  サブ1：○○ [写真: filename.jpg → 93×32mm]
  サブ2：○○ [写真: filename.jpg → 93×32mm]

【裏面】
  Q&A：X本
  実績：X項目
  コラム：「○○」
```

「この内容でデザインに進む？」と聞く。修正ならStep 2に戻る。

### Step 4: HTML生成

テンプレートHTML（`output/flyer/vol-001/index.html` を参照）をベースに、JSONの内容を埋め込む。

#### 写真の扱い
- パスが指定されている：`<img src="パス" style="width:100%;height:100%;object-fit:cover;">`
- `"placeholder"`：グレー矩形 `background:#D8D8D4` にサイズ表示

#### CSS設計ルール
- 全ブロックの高さをmm単位で固定し、余白が出ないようにする
- フォントサイズは本文7.5-8.5pt、見出し9.5-13pt、名前28pt
- border-radius は使わない（紙面感）
- グラデーション不使用
- 色は3色（緑・赤・黄）＋白黒のみ

### Step 5: ファイル出力

`output/flyer/vol-{3桁ゼロ埋め}/index.html` に保存。

### Step 6: プレビュー

Playwright MCP 利用可能時：
1. ローカルHTTPサーバー起動（`python3 -m http.server`）
2. `browser_navigate` → `browser_take_screenshot`（fullPage）
3. ユーザーに表示して確認

利用不可時：
- 「ブラウザで output/flyer/vol-XXX/index.html を開いて確認してください」と案内

### Step 7: デジタル出力（承認後）

Playwright でビューポートを変えてスクリーンショット：
- LINE用：1200×848px
- Instagram用：1080×1350px

`output/flyer/vol-XXX/digital/` に保存。

### 完了メッセージ

```
維新PRESS Vol.X 生成完了

出力：
  HTML：output/flyer/vol-XXX/index.html
  LINE：output/flyer/vol-XXX/digital/line.png
  Insta：output/flyer/vol-XXX/digital/insta.png

印刷：ブラウザで開いて印刷（A4・余白なし）
修正：「ここを変えて」と指示してください。
```
