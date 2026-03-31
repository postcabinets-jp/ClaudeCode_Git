# Notion運用リファレンス

## Single Source of Truth

- 計画・決定・タスク・リスク・顧客メモの正本はNotion
- 作業前にNotion Tasks（Owner別）/ Projects（Active）/ Weeklyを確認
- シークレットは`.env`にのみ置き、絶対にコミットしない

## Notion Hub構造（v2）

| DB | 役割 |
|----|------|
| Projects | 案件・取り組みの束。1行=1案件 |
| Tasks | 日々の1アクション。Owner = Human/Claude/Either |
| Decisions | 決定ログ |
| Weekly | 週のフォーカス |
| Risks | リスク管理 |
| Triggers | 自動化のきっかけ |

## npmスクリプト

前提: Node 20+、`.env`に`NOTION_TOKEN` / `NOTION_PARENT_PAGE_ID`

| コマンド | 内容 |
|----------|------|
| `npm run notion:env` | .envにNotionトークンと親ページIDを書き込む |
| `npm run notion:verify` | Notionインテグレーション疎通 |
| `npm run notion:hub` | v2 DB作成 + `.notion-hub.json` |
| `npm run notion:reset` | 子DBを全アーカイブ → hub → seed |
| `npm run notion:seed` | 初期行投入 |
| `npm run pulse:discord` | Active Projects + オープンTasksをDiscord投稿 |
| `npm run discord:test` | Webhookテスト |
| `npm run bootstrap` | verify → hub → seed → discord:test |

## 意思決定の境界

- **Nobu（人）**: 価格、契約、公開コピー、個人情報、自動送信可否、Go/No-Go
- **エージェント**: 調査、下書き、実装、Notion更新案の提示、Discord通知

## セキュリティ

- Discord Botトークンは外部に出したらDeveloper Portalで再発行
- 本リポジトリにトークンを書かない
