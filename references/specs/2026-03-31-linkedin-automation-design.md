# LinkedIn 自動投稿パイプライン 設計書

**作成日**: 2026-03-31
**対象**: POST CABINETS — 前田 暢 LinkedIn アカウント
**目的**: Notion下書き → 人間チェック → LinkedIn自動投稿の半自動ループ構築

---

## 1. 概要

毎日Claude APIが投稿下書きを生成してNotionに保存し、nobuが「投稿OK」チェックを入れたら自動的にLinkedInへ投稿する2ジョブ構成のパイプライン。

**方針**: LinkedIn API不使用。Playwrightブラウザ自動操作で投稿。

---

## 2. アーキテクチャ

### 2ジョブ構成（launchd）

| Job | スクリプト | 実行タイミング | 役割 |
|-----|-----------|--------------|------|
| Job1 | `scripts/linkedin-generate.mjs` | 毎朝 7:00 | Claude APIで下書き生成 → Notionに追加 → Discord通知 |
| Job2 | `scripts/linkedin-post.mjs` | 15分ごと | Notionポーリング → 投稿OK検知 → LinkedIn投稿 → Notion更新 |

### ファイル構成

```
scripts/
  ├── linkedin-generate.mjs          # Job1: 毎朝下書き生成
  ├── linkedin-post.mjs              # Job2: 投稿OK検知→投稿
  ├── linkedin-setup.mjs             # 初回のみ: ブラウザログイン→Cookie保存
  └── lib/
      └── linkedin-playwright.mjs    # Playwright操作ロジック（共通）
scripts/launchd/
  ├── com.postcabinets.linkedin-generate.plist
  └── com.postcabinets.linkedin-post.plist
.linkedin-session.json               # Cookieファイル（.gitignore必須）
```

---

## 3. Notion DB設計

**場所**: LinkedIn戦略ページ（`3339bf08-eefd-8165-9638-fcd36a6fee37`）内のインラインDB

**DB名**: LinkedIn投稿

| プロパティ名 | 型 | 説明 |
|------------|-----|------|
| タイトル | title | 投稿の見出し（Claudeが生成） |
| 本文 | rich_text | 投稿テキスト全文（300〜600字） |
| 柱 | select | 経営の実践ログ / 仕組みの設計思想 / 社会・地域への視点 |
| 投稿OK | checkbox | nobuがチェック → 自動投稿トリガー |
| ステータス | select | 下書き / 投稿済 / エラー / 要再ログイン |
| 生成日 | date | Claudeが生成した日付 |
| 投稿日時 | date | 実際にLinkedInへ投稿した日時 |
| 投稿URL | url | LinkedIn投稿のURL（投稿後に自動記録） |

---

## 4. コンテンツ生成ロジック（Job1）

### 柱ローテーション（週6本、日曜休み）

| 曜日 | 柱 | 形式 |
|------|-----|------|
| 月 | 柱1: 経営の実践ログ | テキスト |
| 火 | 柱1: 経営の実践ログ | テキスト |
| 水 | 柱2: 仕組みの設計思想 | 長文コラム |
| 木 | 柱2: 仕組みの設計思想 | テキスト |
| 金 | 柱3: 社会・地域への視点 | テキスト |
| 土 | 柱1: 経営の実践ログ | テキスト |
| 日 | 生成なし | — |

### プロンプト構造

```
[System]
あなたはPOST CABINETS代表・前田暢のLinkedIn投稿担当です。
以下の戦略設計書に従って投稿を作成してください。
{docs/superpowers/specs/2026-03-30-linkedin-strategy-design.md の全文}

[User]
今日は{曜日}です。{柱名}の投稿を1本作成してください。
- 文字数: 300〜600字
- トーン: 気取らない。リアル。試行錯誤も見せる
- 過去の投稿と重複しないよう: {直近5件のタイトル一覧}
- JSON形式で返してください: {"title": "...", "body": "..."}
```

### 生成ガード

- **未投稿が3件以上溜まっている場合**: 新規生成をスキップ（Discord通知のみ）
- **200字未満 or JSONパースエラー**: 最大2回再生成
- **再生成失敗**: ステータス=「エラー」でDiscord警告

---

## 5. Playwright投稿フロー（Job2）

### 初回セットアップ（手動・1回のみ）

```bash
node scripts/linkedin-setup.mjs
# ブラウザが開くので手動でLinkedInにログイン
# ログイン完了後、Cookieを .linkedin-session.json に保存して終了
```

### 投稿対象の条件

Notionクエリ: `投稿OK = true AND ステータス = 下書き` の行を対象とする。複数ある場合は生成日の古い順に1件ずつ処理。

### 投稿ステップ

1. `storageState: '.linkedin-session.json'` でheadlessブラウザ起動
2. `https://www.linkedin.com` を開き、ログイン状態を確認
3. 「投稿を始める」ボタンをクリック
4. テキストエリアにNotionの「本文」を入力
5. 「投稿する」ボタンをクリック
6. 投稿完了後のURLを取得
7. Notionを更新: ステータス=「投稿済」、投稿日時・投稿URLを記録
8. Discordに完了通知

### エラーハンドリング

| エラー種別 | 対処 | Discord通知 |
|-----------|------|------------|
| Cookie切れ（ログインページにリダイレクト） | ステータス=「要再ログイン」 | ⚠️ 警告（setup手順を案内） |
| ボタンが見つからない（UI変更） | 3回リトライ後にエラー | ❌ 警告 |
| ネットワークエラー | 次回ポーリングで再試行 | 3回失敗後に❌ 警告 |
| 投稿テキストが空 | スキップ・Notionにエラー記録 | ⚠️ 警告 |

---

## 6. launchd 設定

### Job1 (linkedin-generate): 毎朝7:00

```xml
<!-- com.postcabinets.linkedin-generate.plist -->
<key>StartCalendarInterval</key>
<dict>
  <key>Hour</key><integer>7</integer>
  <key>Minute</key><integer>0</integer>
</dict>
```

### Job2 (linkedin-post): 15分ごと

```xml
<!-- com.postcabinets.linkedin-post.plist -->
<key>StartInterval</key>
<integer>900</integer>
```

---

## 7. Discord通知フォーマット

### 生成完了時（Job1）

```
📝 LinkedIn投稿下書きを作成しました
タイトル: {タイトル}
柱: {柱名}
→ Notionで確認・編集して「投稿OK」をチェックしてください
🔗 {NotionページURL}
```

### 投稿完了時（Job2）

```
✅ LinkedInに投稿しました
タイトル: {タイトル}
🔗 {LinkedIn投稿URL}
```

### エラー時

```
⚠️ LinkedIn自動投稿でエラーが発生しました
エラー: {エラー内容}
対象: {投稿タイトル}
→ Notionを確認してください: {NotionページURL}
```

---

## 8. セキュリティ

- `.linkedin-session.json` は `.gitignore` に追加（認証Cookie）
- `ANTHROPIC_API_KEY` は `.env` にのみ保存
- launchd plist は `.example` 形式でコミット（パスは各自設定）

---

## 9. スコープ外（今回実装しない）

- エンゲージメント計測・分析
- 画像・動画付き投稿（テキストのみ）
- 複数アカウント対応
- LinkedIn APIへの移行
