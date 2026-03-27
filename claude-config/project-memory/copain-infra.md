---
name: COPAIN インフラ構成
description: ClaudeCode自律運用の設定済み構成（Notion/Discord/launchd/hooks）
type: project
---

## 設定済み構成（2026-03-25時点）

### .env（/Users/apple/claude for me/.env）
- NOTION_TOKEN: 設定済み（ntn_...）
- NOTION_PARENT_PAGE_ID: `32d9bf08-eefd-800b-8321-fb89b442b7c1`（ClaudeCode DBページ）
- DISCORD_WEBHOOK_URL: 設定済み

### Notion DB（ClaudeCode DBページ配下）
| DB名 | collection URL |
|---|---|
| COPAIN — Projects | collection://32d9bf08-eefd-812c-afbd-000bd372f34d |
| COPAIN — Decisions | collection://32d9bf08-eefd-81e8-bf6f-000b313f3bf3 |
| COPAIN — Weekly | collection://32d9bf08-eefd-8102-a1fc-000b0f7056d0 |
| COPAIN — Risks | collection://32d9bf08-eefd-81ac-b749-000b9c721445 |
| COPAIN — Triggers | collection://32d9bf08-eefd-814e-95df-000bee985d8a |

※ notion:hub で POSTCABINETS名義のDBも作成済み（.notion-hub.jsonに記載）

### launchd（毎朝8時 自動Discord投稿）
- plist: `/Users/apple/Library/LaunchAgents/com.copain.notion-pulse.plist`
- 実行: `npm run pulse:discord`（Activeプロジェクト→Discord）
- ログ: `/tmp/copain-notion-pulse.log`

### Claude Code hooks（~/.claude/settings.json）
- Stop時: Mac通知音 + Discord「セッション完了」通知
- 通知スクリプト: `/Users/apple/claude for me/scripts/notify-discord.mjs`

### npm scripts（/Users/apple/claude for me）
- `npm run notion:verify` — Notion疎通確認
- `npm run pulse:discord` — ActiveプロジェクトをDiscordへ投稿
- `npm run discord:test` — Webhookテスト

### 自律ループ（autonomous-loop.mjs）
- `npm run loop:morning` — 朝のブリーフィング（Priority順でActiveプロジェクト→Discord）
- `npm run loop:sync` — 全プロジェクト状況同期レポート→Discord
- `npm run loop:weekly` — 週次レビュー委譲

### launchd 登録済み
| plist | タイミング | 内容 |
|---|---|---|
| com.copain.morning-briefing | 毎朝7:30 | 朝ブリーフィング→Discord |
| com.copain.notion-pulse | 毎朝8:00 | Activeプロジェクト要約→Discord |
| com.copain.weekly-review | 毎週金曜21:00 | 週次レビュー→Discord＋Weekly DB作成 |

### Claude Code hooks（Stop時）
1. Mac通知音（Tink）
2. Discord「セッション完了」通知（notify-discord.mjs）

**Why:** nobuの仕事進捗を自動で可視化・通知する自律運用基盤
**How to apply:** 次セッションでも設定確認不要。直接スクリプト実行やNotion操作に入れる。
