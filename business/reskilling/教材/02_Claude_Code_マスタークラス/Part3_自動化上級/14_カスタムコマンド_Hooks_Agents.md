# Module 14: カスタムコマンド・Hooks・Agents
**Claude Code マスタークラス — Part 3: 自動化・上級**
**POST CABINETS Inc.**
**Module 14 / 全24モジュール**

---

## モジュール概要

| 項目 | 内容 |
|------|------|
| 想定時間 | 30分（講義20分＋ハンズオン10分） |
| 対象者 | Claude Codeを日常的に使っている方 |
| ゴール | Claude Codeの3つのカスタマイズ機能を使いこなせるようになる |
| 前提知識 | Module 12-13の内容 |

---

## スライド構成（25枚）

### スライド 1: タイトル
**カスタムコマンド・Hooks・Agents**
— Claude Codeを自分仕様に鍛える3本柱 —

### スライド 2: 3本柱の全体像
### スライド 3-9: カスタムコマンド
### スライド 10-16: Hooks
### スライド 17-23: Agents（サブエージェント）
### スライド 24: Agent Teams
### スライド 25: まとめ

---

## 台本

### 1. イントロダクション（2分）

皆さん、こんにちは。Module 14です。

Module 12でClaude Codeの基本操作、Module 13でMCPによる外部連携を学びました。今日は、Claude Codeを**自分の業務に最適化する**ための3つのカスタマイズ機能を学びます。

| 機能 | 一言で言うと | 例 |
|------|------------|-----|
| **カスタムコマンド** | よく使う指示をショートカット化 | `/weekly-report` で週次レポート生成 |
| **Hooks** | イベントに応じて自動処理 | コミット前に自動テスト実行 |
| **Agents** | 専門家AIを定義 | コードレビュー専門エージェント |

この3つを組み合わせると、Claude Codeが「汎用的なAIアシスタント」から「あなた専属の業務パートナー」に変わります。

---

### 2. カスタムコマンド（8分）

#### カスタムコマンドとは

カスタムコマンドは、よく使う指示を **スラッシュコマンド** として定義する機能です。

たとえば毎回「NotionのTasksから今週完了分を取得して週次レポートを作って...」と長い指示を打つ代わりに、`/weekly-report` と打つだけで同じことができるようにします。

#### ファイル構造

カスタムコマンドは以下のディレクトリに `.md` ファイルとして配置します。

```
~/.claude/commands/          ← グローバル（全プロジェクト共通）
  weekly-report.md
  code-review.md
  plan.md

my-project/.claude/commands/ ← プロジェクト固有
  deploy-check.md
  db-migrate.md
```

ファイル名がそのままコマンド名になります。`weekly-report.md` → `/weekly-report`

#### コマンドの書き方

コマンドファイルの中身は、Claude Codeへの指示をMarkdownで書くだけです。

**例1: 週次レポートコマンド**

ファイル: `~/.claude/commands/weekly-report.md`

```markdown
NotionのTasksデータベースから以下の情報を取得してください：

1. 今週Statusが「Done」に変わったタスク
2. 現在「In Progress」のタスク
3. 「Blocked」のタスク

取得した情報を以下のフォーマットで weekly_report_YYYYMMDD.md として保存してください：

# 週次レポート（{today}）

## 今週の成果
- [ 完了タスクをリスト ]

## 来週の予定
- [ In Progressのタスクをリスト ]

## ブロッカー
- [ Blockedがあれば記載、なければ「なし」 ]

## 所感
（ここは空欄で。手動で記入する）
```

使い方:
```
> /weekly-report
```

これだけで、Notionからデータを取得してレポートファイルが生成されます。

**例2: コードレビューコマンド**

ファイル: `~/.claude/commands/code-review.md`

```markdown
以下の手順でコードレビューを行ってください：

1. `git diff HEAD~1` で最新コミットの差分を取得
2. 以下の観点でレビュー：
   - バグの可能性がある箇所
   - セキュリティリスク（SQLインジェクション、XSS等）
   - パフォーマンスの問題
   - コーディング規約違反（CLAUDE.mdを参照）
   - テストの不足
3. 問題があれば重要度（高・中・低）をつけて報告
4. 問題がなければ「LGTM」と報告

出力フォーマット:
## コードレビュー結果

### 🔴 重要度: 高
- [問題の説明と修正案]

### 🟡 重要度: 中
- [問題の説明と修正案]

### 🟢 重要度: 低
- [問題の説明と修正案]

### 総評
[全体的な評価]
```

**例3: 引数付きコマンド**

コマンドは `$ARGUMENTS` プレースホルダで引数を受け取れます。

ファイル: `~/.claude/commands/explain.md`

```markdown
$ARGUMENTS について、以下の3段階で説明してください：

1. **一言で**: 小学生にもわかる一言説明
2. **詳細**: 技術的な詳細説明
3. **実例**: 実際のコード例または業務での使い方

専門用語は日本語で補足してください。
```

使い方:
```
> /explain MCP
> /explain Docker
> /explain REST API
```

---

### 3. Hooks（8分）

#### Hooksとは

Hooksは、Claude Codeの特定のイベントに応じて**自動的にスクリプトを実行する**仕組みです。

「セッションが始まったら○○する」「ファイルを保存したら○○する」「コミットする前に○○する」といった自動化ができます。

#### 4つのライフサイクルイベント

| イベント | 発火タイミング | 用途例 |
|---------|-------------|--------|
| **PreToolUse** | ツール実行前 | 特定のコマンドをブロック |
| **PostToolUse** | ツール実行後 | 結果のログ記録 |
| **Notification** | 通知発生時 | Slack/Discord通知 |
| **Stop** | セッション終了時 | 作業ログの保存 |

#### 設定方法

Hooksは `~/.claude/settings.json` の `hooks` セクションで定義します。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/you/scripts/pre-bash-check.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/you/scripts/post-commit-notify.sh"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/Users/you/scripts/notify-slack.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/Users/you/scripts/session-end-log.sh"
          }
        ]
      }
    ]
  }
}
```

#### 実演1: セッション終了時にSlack通知を送るHook

セッション終了時に「今日Claude Codeで何をやったか」をSlackに自動投稿するHookを作ります。

通知スクリプト:

```bash
#!/bin/bash
# scripts/notify-slack.sh
# Claude Code の通知をSlackに転送する

# 環境変数から読み取り（.envから読み込み済み前提）
WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-$SLACK_WEBHOOK_URL}"

if [ -z "$WEBHOOK_URL" ]; then
  exit 0
fi

# 標準入力からHookのペイロードを読み取る
INPUT=$(cat -)

# メッセージを抽出（JSON形式で渡される）
MESSAGE=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('message', 'Claude Code通知'))
" 2>/dev/null || echo "Claude Code通知")

# Slack Webhook に投稿
curl -s -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "{\"text\": \"🤖 Claude Code: ${MESSAGE}\"}" \
  > /dev/null 2>&1
```

```bash
chmod +x ~/scripts/notify-slack.sh
```

settings.json への追記:

```json
{
  "hooks": {
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/Users/you/scripts/notify-slack.sh"
          }
        ]
      }
    ]
  }
}
```

これで、Claude Codeが通知を出すたびに（長時間処理の完了など）、自動的にSlackにも通知が飛びます。

---

#### 実演2: コミット前に自動テストを走らせるHook

Gitコミット前にテストを自動実行して、テストが落ちたらコミットをブロックするHookです。

```bash
#!/bin/bash
# scripts/pre-commit-test.sh
# コミット前にテストを実行し、失敗したらブロック

INPUT=$(cat -)

# Bashツールでgit commitが実行されようとしているか確認
COMMAND=$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(data.get('input', {}).get('command', ''))
" 2>/dev/null)

# git commit を含むコマンドの場合のみ
if echo "$COMMAND" | grep -q "git commit"; then
  echo "テストを実行中..." >&2

  # プロジェクトルートでテスト実行
  if ! npm test 2>&1; then
    # テスト失敗 → ブロック
    echo '{"decision": "block", "reason": "テストが失敗しました。修正してから再度コミットしてください。"}'
    exit 0
  fi
fi

# 許可（何も出力しない = 許可）
exit 0
```

settings.json:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(git commit*)",
        "hooks": [
          {
            "type": "command",
            "command": "/Users/you/scripts/pre-commit-test.sh"
          }
        ]
      }
    ]
  }
}
```

Hookの `decision` フィールドで `"block"` を返すと、その操作がブロックされます。テストが通れば何も返さない（= 許可）なので、コミットが正常に実行されます。

---

### 4. Agents — サブエージェント（8分）

#### Agentsとは

Agentsは、**特定の専門性を持ったAIペルソナ**を定義する機能です。

通常のClaude Codeは汎用的ですが、「コードレビューだけに特化したAI」「セキュリティチェックだけに特化したAI」を定義することで、より高品質な結果が得られます。

#### ファイル構造

```
~/.claude/agents/
  code-reviewer.md       ← コードレビュー専門
  security-reviewer.md   ← セキュリティレビュー専門
  doc-updater.md         ← ドキュメント更新専門
  architect.md           ← 設計レビュー専門
  tdd-guide.md           ← TDD推進専門
```

#### エージェントの書き方

エージェントファイルには、そのエージェントの「専門性」「行動原則」「出力フォーマット」を定義します。

**実演: コードレビューエージェント**

ファイル: `~/.claude/agents/code-reviewer.md`

```markdown
# Code Reviewer Agent

あなたは経験豊富なシニアエンジニアとして、コードレビューを行います。

## あなたの専門性
- 10年以上のソフトウェア開発経験
- セキュリティ、パフォーマンス、保守性に精通
- OWASP Top 10 を熟知

## レビューの観点（優先度順）
1. **セキュリティ**: SQLインジェクション、XSS、認証バイパス、秘密情報の露出
2. **正確性**: ロジックの誤り、エッジケースの未処理、型の不整合
3. **パフォーマンス**: N+1クエリ、不要なループ、メモリリーク
4. **保守性**: 命名規則、関数の責務分離、コメントの適切さ
5. **テスト**: テストカバレッジ、テストの品質

## 行動原則
- 問題を指摘するだけでなく、必ず**修正案（コード）**を提示する
- 良い点も必ず1つ以上コメントする（モチベーション維持）
- 「なぜそれが問題なのか」を簡潔に説明する
- 重箱の隅をつつかない。ビジネスインパクトのある問題に集中する

## 出力フォーマット

### レビュー結果

**対象**: [ファイル名 or PR番号]
**評価**: ⭐⭐⭐⭐☆（5段階）

#### 良い点
- [具体的な良い点]

#### 要修正（高）
| 箇所 | 問題 | 修正案 |
|------|------|--------|

#### 要修正（中）
| 箇所 | 問題 | 修正案 |
|------|------|--------|

#### 提案（低）
| 箇所 | 提案 |
|------|------|

### 総評
[2-3行の総合評価]
```

使い方:

```
> @code-reviewer 最新のコミットをレビューして
```

`@エージェント名` で、そのエージェントを呼び出せます。

---

**もう一つの例: セキュリティレビューエージェント**

ファイル: `~/.claude/agents/security-reviewer.md`

```markdown
# Security Reviewer Agent

あなたはセキュリティ専門のレビュアーです。

## 専門領域
- Webアプリケーションセキュリティ（OWASP Top 10）
- 認証・認可の設計
- 暗号化とデータ保護
- サプライチェーンセキュリティ（依存パッケージの脆弱性）

## チェックリスト
1. [ ] ハードコードされた秘密情報（APIキー、パスワード等）がないか
2. [ ] SQLインジェクション対策（パラメータ化クエリ）
3. [ ] XSS対策（出力エスケープ）
4. [ ] CSRF対策
5. [ ] 認証バイパスの可能性
6. [ ] 権限昇格の可能性
7. [ ] 依存パッケージの既知脆弱性
8. [ ] ログに個人情報が含まれていないか
9. [ ] HTTPS / TLSの適切な使用
10. [ ] エラーメッセージに内部情報が露出していないか

## 出力
脆弱性が見つかった場合はCVSSスコア（目安）と修正の緊急度を付記する。
見つからなかった場合も「検出なし」と明記する。
```

---

#### Agent Teams（エージェントチームの協調実行）

2026年に追加された新機能 **Agent Teams** を紹介します。

Agent Teamsは、複数のエージェントを**並列に起動して協調作業**させる仕組みです。

例えば、大きな機能を実装するとき：

```
> @team-feature "ユーザー認証機能を実装"
```

これで以下のエージェントが並列に動きます：

1. **Architect**: 設計方針を決定
2. **Frontend Dev**: フロントエンド実装
3. **Backend Dev**: バックエンド実装
4. **Tester**: テスト作成
5. **Security Reviewer**: セキュリティレビュー

各エージェントは互いの進捗を参照しながら作業し、最終的に統合された結果を返します。

Agent Teamsの設定例：

```
> /team-spawn preset=review
```

これでレビュー用のチーム（code-reviewer、security-reviewer、performance-reviewer）が一斉に起動して、同じコードベースを並列でレビューします。

---

### 5. 3つの機能の組み合わせ（2分）

最後に、今日学んだ3つの機能を組み合わせた実践例を見てみましょう。

**シナリオ: デプロイ前チェックの完全自動化**

1. **カスタムコマンド** `/deploy-check` を定義
2. その中で **@security-reviewer** エージェントを呼び出し
3. テスト実行は **Hook** で自動的にトリガー
4. 全チェック通過後、Slackに通知（Hookの Notification）

```markdown
# /deploy-check コマンド

以下の手順でデプロイ前チェックを実行してください：

1. `npm test` でユニットテストを全件実行
2. `npm run lint` でコード品質チェック
3. @security-reviewer で最新の変更をセキュリティレビュー
4. 全て問題なければ「✅ デプロイ準備完了」と報告
5. 問題があれば一覧を表示して「❌ 修正が必要」と報告
```

このように、カスタムコマンド、Hooks、Agentsは独立した機能でありながら、組み合わせることで非常に強力な自動化パイプラインを構築できます。

---

### 6. まとめ（2分）

Module 14のまとめです。

| 機能 | 場所 | 用途 |
|------|------|------|
| **カスタムコマンド** | `~/.claude/commands/*.md` | 定型指示のショートカット |
| **Hooks** | `settings.json` の `hooks` | イベント駆動の自動処理 |
| **Agents** | `~/.claude/agents/*.md` | 専門特化したAIペルソナ |

ポイント:
- カスタムコマンドは「よく使う指示をテンプレ化」
- Hooksは「特定のタイミングで自動実行」
- Agentsは「専門家の視点をAIに持たせる」
- 3つを組み合わせると、業務パイプライン全体を自動化できる

次のModule 15では、Claude APIを使って外部システムとの連携を学びます。

---

## ハンズオン演習

### 演習1: カスタムコマンドを作る（5分）

1. `~/.claude/commands/` ディレクトリを作成:
```bash
mkdir -p ~/.claude/commands
```

2. 以下のコマンドファイルを作成:

ファイル: `~/.claude/commands/summarize.md`
```markdown
$ARGUMENTS の内容を以下の3つの観点で要約してください：

1. **概要**（3行以内）
2. **重要ポイント**（箇条書き5つ以内）
3. **アクションアイテム**（次にやるべきこと）
```

3. Claude Codeで試す:
```
> /summarize README.md
```

### 演習2: 簡単なHookを設定する（3分）

1. セッション終了時にログを記録するHookを設定

```bash
#!/bin/bash
# ~/scripts/session-log.sh
echo "[$(date)] Claude Code session ended" >> ~/claude-sessions.log
```

```bash
chmod +x ~/scripts/session-log.sh
```

2. `~/.claude/settings.json` に追記（既存の設定に `hooks` を追加）

### 演習3: エージェントを作る（2分）

1. `~/.claude/agents/` ディレクトリを作成
2. 自分の業務に合ったエージェントを1つ定義
   - 例: 「メールの下書きを作成する秘書エージェント」
   - 例: 「マーケティングコピーをレビューするエージェント」

---

## 補足資料

### Hook ペイロードの構造

Hookスクリプトは標準入力でJSON形式のペイロードを受け取ります：

```json
{
  "session_id": "abc123",
  "tool_name": "Bash",
  "input": {
    "command": "git commit -m 'fix: update config'"
  },
  "timestamp": "2026-03-29T10:30:00Z"
}
```

### Hookのレスポンス形式

PreToolUse Hookは以下のJSONを返すことで操作を制御できます：

```json
{"decision": "allow"}
```
```json
{"decision": "block", "reason": "理由をここに記載"}
```
```json
{"decision": "ask", "message": "確認メッセージ"}
```

何も返さない場合は `allow` として扱われます。
