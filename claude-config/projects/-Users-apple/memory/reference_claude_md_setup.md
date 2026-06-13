---
name: ~/.claude セットアップ構成（CLAUDE.md / commands / agents）
description: 2026-05-15にCoworkセッションで設計したグローバル設定の配置場所と設計意図
type: reference
originSessionId: 6edc0b7b-c899-4557-99ff-fa4446c78e62
---
`~/.claude/` に以下の構成で配置済み（2026-05-15）。

```
~/.claude/
├── CLAUDE.md                       ← Nobu's Operating Manual（4大原則+詳細）
├── CLAUDE.md.backup-YYYYMMDD-HHMMSS  ← 旧版バックアップ
├── commands/
│   ├── verify.md                   ← 既存・CI検証用（build/test/lint）
│   ├── verify-output.md            ← 新規・成果物の自己検証プロトコル
│   ├── think.md                    ← 新規・着手前プロトコル（真の目的整理）
│   └── design-research.md          ← 新規・参考イメージ先出しプロトコル
└── agents/
    └── quality-reviewer.md         ← 新規・厳しい品質ゲートキーパー
```

設計の元ネタ：Coworkセッション `local_132a3515-4af6-4831-9ee9-634c818c461e`
パス: `~/Library/Application Support/Claude/local-agent-mode-sessions/0a1555b8-8bfb-4ea4-b8be-cb1ebaf0680f/fcdee689-9429-46f0-91c7-aa524b709c86/local_132a3515-4af6-4831-9ee9-634c818c461e/outputs/dot-claude/`

CLAUDE.md の4大原則（0-1〜0-4）：
1. 99%完成の成果物をぽん出し
2. 「できません」を簡単に言うな（代替3つ試す）
3. 自己修正ループ必須（2周）
4. ビジュアル成果物は参考イメージ先出し

## 2026-05-15 第2段拡張（GitHubリサーチ反映）

VoltAgent / wshobson / qdhenry / disler / trailofbits 等の高評価リポジトリを調査して以下を追加：

**新規agents（9本）**
- 01-core/api-designer.md
- 03-quality/debugger.md, performance-engineer.md
- 04-devex/dx-optimizer.md, dependency-manager.md
- 06-marketing/seo-specialist.md, landing-page-builder.md, content-marketer.md
- 07-meta/context-manager.md

**新規commands（5本）**
- 02-quality/smart-fix.md, tech-debt.md
- 04-ops/handoff.md, standup.md
- 06-learn/memory-cleanup.md

**新規hooks（2本配置済）**
- pre-tool-use/block-dangerous-bash.sh（rm -rf, force push, curl|sh等ブロック）
- pre-tool-use/block-secret-files.sh（.env等の書込ブロック）
- stop/README.md（anti-give-up / self-review の設計案。Nobuが判断して配置）

**フォルダ整理**
- agents/ に 01-core ~ 99-business のカテゴリ作成（既存ファイル移動は未実施）
- commands/ に 01-workflow ~ 99-business のカテゴリ作成
- INDEX.md 作成（全体マップ）

settings.json への PreToolUse hook 登録はNobu判断待ち。

## 2026-05-31 SessionStart hook 拡張

**SessionStart hookで自動注入されるもの（設定済み）**
1. `memory-context-inject.mjs` — MEMORY.mdからの過去セッション記憶
2. `credentials-map-inject.mjs` — `~/.claude/CREDENTIALS_MAP.md`（API/認証地図）
3. `obsidian-context-inject.mjs` — Obsidianの2026年ゴール（wiki/goals/2026.md）★NEW
4. currentTime echo — 現在時刻

**CREDENTIALS_MAP.md**（`~/.claude/CREDENTIALS_MAP.md`）に集約済みの情報：
- Google API / Supabase / Firebase / Fathom 等18サービス（パスのみ、生の鍵なし）
- Section 7: プロジェクト別 `.env.local` マップ（fieldnote 等）
- fieldnote: `/Users/apple/政治活動/政治活動アプリ/fieldnote/.env.local`、Supabase project ID = `yocifbtqagbwwufuujzp`

**効果**: Google Maps APIやSupabaseの鍵を毎回手動提供しなくてよくなった。
