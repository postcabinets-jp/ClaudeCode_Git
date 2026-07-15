---
name: claude-obsidian-obsidian
description: 設定の操作盤はwiki/_meta/Claude設定マップ.md。~/.claude物理移動は禁止。毎セッション注入されるObsidian文脈を能動的に使う
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1ffa0ab0-707d-45ca-9c1c-f6356fc7f90c
---

# Claude設定の一元化 ＆ Obsidian起点運用（2026-06-28 Nobu合意）

Nobuの指示：「Claude Codeの動きを全部Obsidianの設定に置きたい／何かにつけてObsidian＝自分の考えをベースに動く／設定を一元化／基本それで動いてほしい」。

## 確定した運用
1. **Obsidian起点で動く**。目標・判断軸・運用ルールは [[CLAUDE.md]] / [[wiki/goals/2026.md]] / Memory にある。これらは SessionStart hook（`obsidian-context-inject` / `memory-context-inject` / `credentials-map-inject`）で**毎セッション自動注入済み**。受け取るだけで無視せず、タスク方針に織り込んでから着手する。一般論・AI的無難さでなくNobuの文脈で動く。
2. **設定の操作盤＝ [[wiki/_meta/Claude設定マップ.md]]**。「Claudeの挙動を変えたい」時は、まずこのマップで「どの設定ファイルが何を制御してるか」を特定してから触る。逆引き表もそこにある。
3. **❌ `~/.claude/` をObsidian内へ物理移動するのは禁止・提案もしない**。Claude Code本体が `~/.claude/` をハード参照＋launchd13ジョブが実パス依存で全壊する。一元化は「保管の一本化」でなく「Obsidianから見る・直す入口の一本化」で達成する。
4. **設定の同期は cc-sync（Git）で成立済み**。`~/.claude/` の頭脳は `~/claude for me/claude-config/` 経由でGit一元管理。詳細 [[wiki/_meta/Macmini_ClaudeCode同期ガイド.md]]。
5. スナップショット `wiki/_meta/claude設定_*_snapshot_2026-06-15.*` は静的（凍結）。実ルールの正本は常に `~/.claude/` 側。古い値を信じない。

**Why:** 「全部Obsidianに置く＝物理移動」は本体・自動化を壊す。raw/wiki/Dailyを動かさなかったのと同じ判断。Nobuの本意は「自分の思考を基点に、設定を散らからせず一箇所から見て動かす」こと。
**How to apply:** 設定・挙動変更の依頼が来たら→Claude設定マップで対象ファイル特定→`~/.claude/`の実体を直す→cc-syncで同期。Obsidianのゴール/思考/ルールは常に前提として効かせ、毎回前提説明を求めない。物理移動の話が出たら本ルールで止める。
