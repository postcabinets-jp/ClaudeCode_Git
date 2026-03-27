---
name: AI組織とNotionループの設計
description: Claude Code Agent Teamsを使ったタスク自動実行の仕組みと現在の実装状況
type: project
---

## 設計思想
Notion Projects → Tasks自動生成 → Agent Teamsが実行 → 結果をNotionに書き戻し → Discord通知 → ループ

## 実装済み
- Notion ハブv2（Projects/Tasks/Decisions/Weekly/Risks/Triggers）@ ClaudeCode DB ページ
- Tasks DB: Owner（Human/Claude/Either）/ Status（Inbox/Todo/Doing/Blocked/Done）/ Priority
- autonomous-loop.mjs（morning/sync/weeklyモード）
- notify-discord.mjs（hooks経由のDiscord通知）
- weekly-review.mjs（週次レビュー自動化）
- LINE Bot server.mjs（コード完成・未接続）
- .notion-hub.json（DB IDマップ）

## 未実装（次のアクション）
- autonomous-loopのlaunchd有効化（最優先）
- Tasks DBを読んでエージェント割り振りするスクリプト
- LINE Bot本番接続（LINE Developers設定）

## Agent Team 役割分担
| エージェント | 担当 | Notionタスク |
|------------|------|------------|
| architect | 事業設計・仕組み設計 | Area=Biz/Product |
| planner | タスク分解・計画立案 | 新プロジェクト初期タスク化 |
| code-reviewer/tdd-guide | コード実装・レビュー | Area=Tech |
| doc-updater | ドキュメント整備・Notion更新 | Weekly振り返り・Decision記録 |
| security-reviewer | セキュリティレビュー | 外部連携・APIタスク |

## Notionキー情報
- ClaudeCode DBページ: 32d9bf08-eefd-800b-8321-fb89b442b7c1
- Projects DS: collection://32d9bf08-eefd-8114-9449-000b215acd48
- Tasks DS: collection://32d9bf08-eefd-8153-9bc8-000bb866a17c
- 思考ログページ: 32e9bf08-eefd-8133-be04-e69631623504

**Why:** nobuの最大ボトルネック「継続実行できない」をAI組織で解決するための中核インフラ
**How to apply:** セッション開始時にTasks DBを確認し、Claude/EitherのTodo/InboxタスクをAgent Teamsに割り振る
