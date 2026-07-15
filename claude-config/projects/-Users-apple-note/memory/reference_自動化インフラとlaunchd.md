---
name: fathom-limitless-launchd
description: 対面=Limitless/オンライン=Fathomの役割分担・Calendar Bridge・自動取込スクリプト。ルール変更/リネーム時に確認すべきスクリプト・コマンド・launchd一覧
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1ffa0ab0-707d-45ca-9c1c-f6356fc7f90c
---

# 自動化インフラ ＆ ルール変更波及先

## 🎤 Fathom / Limitless（議事録・ライフログ）

### Limitless 設計（2026-05-28 整理）
- **正本: `raw/Limitless/YYYY-MM-DD.md`**（外部システムが夜に生成）
- MTG Phase 0-i でこのファイルを直接読み、昨日の引き継ぎ・Wn.mdサマリに反映
- ~~`limitless_to_weekly.py`~~ → **廃止**（APIから取得してW4.md autoブロックに書く仕組みは停止）
- W4.md の `<!-- limitless:auto -->` ブロックは今後使わない（既存分はそのまま残置）

- **対面=Limitless Pendant** / **オンライン=Fathom** で役割分担
- Fathom アカウント: bachikanshikoku@gmail.com（Premium Free Preview 30日）
- Fathom 自動取込: `_system/scripts/fathom_to_weekly.py` が毎時:15に launchd で実行
- Fathom 出力先: `wiki/sessions/Fathom/YYYY-MM-DD_タイトル.md`
- 週次自動リンク: 当日のWn.md曜日セクションに `![[ファイル名]]` 自動追記
- 認証: macOS Keychain（`FATHOM_API_KEY` / `FATHOM_WEBHOOK_SECRET`）
- launchd: `~/Library/LaunchAgents/com.postcabinets.fathom-to-weekly.plist`
- MCP: Claude Code に `fathom` 登録済み（Claude Code再起動で有効化）

### Calendar Bridge（Fathomのprimary-only制約を回避）
- Fathomは bachikanshikoku の **primary カレンダー** しか読まない
- 解決策: Google Apps Scriptで他カレンダーのオンラインMTGをprimaryへミラーリング
- ソースカレンダー: `maeda.nobumi@gmail.com` / `postcabinets@gmail.com` / `hikaeshitsu@oneosaka.jp`
- フィルタ: 会議URL（Zoom/Meet/Teams/Webex）を持つ予定のみコピー → プライベート予定は漏れない
- バックアップコード: `_system/scripts/calendar_bridge.gs`
- 実行場所: https://script.google.com (bachikanshikoku アカウント配下)
- トリガー: 5分ごと自動実行
- エラー時通知: postcabinets@gmail.com へメール

## ⚠️ ルール変更時の波及先（移動・リネーム時に必ず確認）

- スクリプト: `_system/_ai/{mentor,mentor_context,new_week}.py`, `_system/scripts/**`（特に `discord_daily_*.py`, `fathom_to_weekly.py`, `morning_brief.sh`）
- ⚠️ `limitless_to_weekly.py`（launchd: `com.postcabinets.limitless-to-weekly`）は**廃止・停止済み（2026-05-28）**。Limitless正本は `raw/Limitless/YYYY-MM-DD.md` を直接読む
- コマンド定義: `.claude/commands/mentor.md`, `~/.claude/commands/MTG.md`
- launchd:
  - `~/Library/LaunchAgents/com.postcabinets.note.morning.plist`（毎朝7:00 朝会通知）
  - `~/Library/LaunchAgents/com.postcabinets.mtg-prep.plist`（**毎朝03:00予備/04:00確定**・朝会事前準備ジョブ）
    - スクリプト: `~/.note-system/scripts/mtg_prep.sh` / プロンプト: `~/.note-system/prompts/mtg_prep_prompt.md`
    - カレンダー7口は `~/.note-system/scripts/fetch_calendars.py`（**Calendar API直叩き**・token.jsonに`calendar.events`スコープ有）で取得。⚠️無人MCPは`EVENTS=0`を返すため使わない
    - 役割: Limitless/ToDo/やりたいこと/週次/カレンダーを確認→今日のDailyのAI管理エリアに「昨日の引き継ぎ＋今日の予定提案」を事前生成（✍️メモ=Nobu記入エリアは触らない・各AIセクションに`<!-- mtg_prep 事前生成 -->`印）。/MTGはこの下準備を微修正する前提
    - ログ: `~/.note-system/logs/mtg_prep_<date>.log`（2026-06-01構築・Nobu要望「先回りで4時には準備完了→朝会を最小手数に」）
  - `~/Library/LaunchAgents/com.note.dailysync.plist`
  - `~/Library/LaunchAgents/com.postcabinets.limitless-to-weekly.plist`
  - `~/Library/LaunchAgents/com.postcabinets.todo-gtasks-sync.plist`
  - `~/Library/LaunchAgents/com.postcabinets.fathom-to-weekly.plist`

## Strategy自動更新（2026-07-11追加）
- `com.postcabinets.strategy-refresh` … 毎日06:00/13:00に `~/.note-system/scripts/refresh_strategy.py` 実行。`note/Strategy.md` の動的ゾーン（`<!--AUTO:today-->` と `<!--r:pol/pc/me-->`）だけをカレンダー7口(fetch_calendars.py)から上書き。`次の一手`・折り畳み詳細は人間所有で不可侵。ログ: `~/.note-system/logs/strategy-refresh.*`
- 目的: Strategy.mdを「人が書かず読むだけで毎日生きてる」状態に。Limitlessは現状プレースホルダーで未使用（復旧したら直近に発話要約を足す）。
