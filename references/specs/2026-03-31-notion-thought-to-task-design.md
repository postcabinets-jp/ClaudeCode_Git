# 設計書: Notion思考ノート → TasksDB 自動タスク化

**作成日**: 2026-03-31
**ステータス**: Draft
**担当**: Claude Code

---

## 1. 概要

毎日作成するNotionの思考ノートから、Claude向けタスクを自動的に拾い上げてTasksDBに登録し、Claudeが実行する仕組みを構築する。

### ゴール

- 思考ノートに書いた「やってほしいこと」を、明示的に指示しなくても自動でタスク化できる
- Claudeセッション中の即時実行と、夜間の自動スキャンを両立する
- nobu自身のチェックボックスタスクとClaude向けタスクを混在させたまま書けるUXを維持する

---

## 2. アーキテクチャ

```
思考ノート（1日1ページ・手動作成）
  └── 📋 Claude Tasks トグル（任意）
        └── 自由記述（箇条書き・文章）
              │
        ┌─────┴────────────────────────┐
        │ 即時レーン                    │ 非同期レーン
        │ セッション中に手動トリガー    │ launchd が毎朝自動実行
        ↓                              ↓
notion-extract-tasks.mjs         notion-nightly-scan.mjs
        │                              │
        └──────────────┬───────────────┘
                       ↓
              Claude API（LLM）でタスク解釈
              ・タスクタイトル生成
              ・Owner判定（Claude / Human / Either）
              ・Projectへの紐付け推定
              ・Priority推定（High / Medium / Low）
                       ↓
              TasksDB に登録
              Status=Inbox, Owner=Claude
                       ↓
        即時レーン: その場で確認→実行可否を聞く
        非同期レーン: 次回Claudeセッション開始時に処理
```

---

## 3. 思考ノートのテンプレート

毎日ページを作成する際に使うテンプレート。`📋 Claude Tasks` トグルが規約。

```
# 思考ノート - {{date}}

## 今日の思考・メモ
（自由記述）

## チェックリスト（自分タスク）
- [ ]
- [ ]

▶ 📋 Claude Tasks
  （ここにClaude向けタスクを自由記述。箇条書きでも文章でも可）
  例:
  - AI研修の資料構成を考えて叩き台を作っておいて
  - 先週のDiscord通知が届かなかった原因を調べて
  - LINEボットのフロー設計をもう一度整理して
```

### テンプレートのルール

| 要素 | 意味 |
|------|------|
| `▶ 📋 Claude Tasks` トグル | Claudeが読み取る対象。ここ以外は読まない |
| チェックボックス付き行 | nobu自身が実行する（Claudeはスキップ） |
| チェックボックスなし行 | Claude向けタスク候補として解釈する |
| 文章形式も可 | LLMが文脈を読んでタスクに変換する |

---

## 4. LLMによるタスク解釈

### プロンプト設計

```
以下はNotionの思考ノートから抽出したClaude向けメモです。
このテキストを読み、実行可能なタスクのリストに変換してください。

【ルール】
- チェックボックス付きの行（- [ ]）はnobu自身のタスクなので無視する
- 1つの文章が複数タスクを含む場合は分割する
- 曖昧すぎて実行不可能なものは除外する（例:「なんとかする」）
- 各タスクに以下を付与する:
  - title: 30字以内の日本語タスク名
  - owner: "Claude" / "Human" / "Either"
  - priority: "High" / "Medium" / "Low"
  - project_hint: 関連しそうなプロジェクト名（不明なら空文字）
  - notes: 補足・文脈（元テキストの要約）

【出力形式】JSON配列

【入力テキスト】
{text}
```

### 判定例

| 入力 | 解釈 |
|------|------|
| `AI研修の資料構成を考えて叩き台を作っておいて` | Claude / Medium / AI研修プロジェクト |
| `Discord通知が届かなかった原因を調べて` | Claude / High / インフラ |
| `息子の学校の締め切り確認しないと` | Human / High / 除外 or Human-only |
| `なんかやっておいて` | 曖昧 → 除外 |

---

## 5. スクリプト設計

### 5-1. `scripts/notion-extract-tasks.mjs`（即時レーン）

**トリガー**: Claudeセッション中に手動実行（`npm run notion:extract-tasks`）または Claude Codeが呼び出す

**処理フロー**:
1. `.notion-hub.json` から Tasks DB ID を取得
2. 今日の思考ノートページを検索（タイトルに今日の日付を含むページ）
3. `📋 Claude Tasks` トグルブロックの中身を取得
4. Claude API にテキストを送信してタスクリストを生成
5. TasksDB に登録（重複チェック付き）
6. 登録結果をコンソール出力 → Claudeが確認して実行判断

### 5-2. `scripts/notion-nightly-scan.mjs`（非同期レーン）

**トリガー**: launchd で毎朝07:00に自動実行

**処理フロー**:
1. 昨日の思考ノートページを検索
2. `📋 Claude Tasks` トグルを取得
3. Claude API でタスク解釈
4. TasksDB に登録（`Status=Inbox, Owner=Claude`）
5. 新規登録があればDiscord Webhookで通知
6. 処理済みフラグをページのプロパティに書き込む（重複防止）

### 5-3. 重複登録の防止

- TasksDB の `Notes` フィールドにソースページIDを記録
- 登録前に同じソースページIDのタスクが存在しないか確認
- 思考ノートページに `claude_scanned: true` プロパティを付与（オプション）

---

## 6. TasksDB の登録スキーマ

既存のTasksDBに以下の形式で登録する:

| フィールド | 値 |
|------------|-----|
| Title | LLMが生成したタスク名 |
| Status | Inbox |
| Owner | Claude |
| Priority | High / Medium / Low |
| Project | プロジェクトへのリレーション（推定） |
| Notes | 元テキストの文脈・補足 |

---

## 7. launchd 設定

`scripts/launchd/com.postcabinets.nightly-scan.plist.example` を新規作成。

```xml
<!-- 毎朝07:00に notion-nightly-scan.mjs を実行 -->
<key>StartCalendarInterval</key>
<dict>
  <key>Hour</key><integer>7</integer>
  <key>Minute</key><integer>0</integer>
</dict>
```

---

## 8. 実装スコープ（MVP）

### Phase 1（コアフロー）
- [ ] `notion-extract-tasks.mjs` — 即時レーン
- [ ] `notion-nightly-scan.mjs` — 非同期レーン
- [ ] `package.json` に `notion:extract-tasks` スクリプト追加
- [ ] Notionテンプレートボタンのセットアップ手順書（`docs/notion-template-setup.md`）

### Phase 2（改善）
- [ ] launchd plist の追加
- [ ] Discord通知（新規タスク登録時）
- [ ] 重複検出の精度向上
- [ ] Claude Codeセッション開始時の自動チェック（hooks連携）

### スコープ外
- Notion Webhook（Public Beta、安定性未確認）
- GUIダッシュボード
- タスクの自動実行（登録のみ。実行はClaudeが判断する）

---

## 9. 前提・制約

- Notion APIトークン: `.env` の `NOTION_TOKEN`
- Claude API: `ANTHROPIC_API_KEY`（LLMタスク解釈に使用）
- 思考ノートのページタイトル形式: `2026/03/31`（スラッシュ区切り）
- TasksDBは既存の `.notion-hub.json` の `tasks.id` を使用
