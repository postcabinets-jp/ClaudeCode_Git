---
name: sum-todo
description: 毎朝7:00→/MTGの5フェーズ・気力ゲージ廃止/今日の宣言方式・GTask読取専用・Dailyテンプレ。ISO木曜週採番。当日タスク正本=Google Tasks
metadata: 
  node_type: memory
  type: reference
  originSessionId: 1ffa0ab0-707d-45ca-9c1c-f6356fc7f90c
---

# 朝会SUM・週次月次・ToDo連動（運用リズム）

## 🚀 毎朝の起動シーケンス

**毎朝7:00 に通知 → ユーザーが `/MTG` を打つ → 30分で今日が確定して走り出す。**

- 通知: `~/Library/LaunchAgents/com.postcabinets.note.morning.plist`（毎日 07:00 + Mac起動時）
- 通知スクリプト: `~/.note-system/scripts/morning_brief.sh`
- 通知文言: 「☀️ 朝会の時間です — 未振分Inbox=N / ToDo=N件 → /MTG で朝会開始」
- **/MTG コマンド**: `~/.claude/commands/MTG.md` — AI秘書のスタートアップMTG（**2026-06-01 改名: 「朝会」→「スタートアップミーティング（略SUM）」**。/MTGコマンド名・モードキーワード(朝会/振り返り/週次)は不変）
  - **⚠️ 気力ゲージ(5段階)は廃止(2026-06-01)** → Phase 1は **「今日の宣言」方式**：Nobuが「今日どうしたい」を一言→秘書が即提案。混雑度はカレンダー自動算出。気力数値は当てずっぽうで判断材料にならないため廃止
  - **⚠️ 達成/持ち越しは必ず箇条書き（- ）で書く**（べた書き禁止・Nobu指定）
  - Daily/Wnの該当見出しは `## 🚀 スタートアップMTG（SUM）` / `### 🚀 SUMサマリ` / `### 今日の宣言`
  - Phase 0: 情報収集（〜5分・無言）— カレンダー7口・Daily・昨日達成判定・直近3日Daily・**GoogleTask(当日タスク正本)**・**wiki/プロジェクト.md(作戦)**・Wn・Limitless・府庁ルール・今日会う人 ※@ToDo.mdは2026-06-01廃止
  - Phase 1: **秘書ブリーフィング先出し**（〜2分）— 昨日振返り＋カレンダー(場所/移動推定)＋ToDo温度感＋会う人メモ＋最重要1件候補＋論点1個＋気力ゲージ要求
  - Phase 2: 対話で詰める（〜10分）— Nobu反応に応じてファシリテート・情報が薄ければ秘書から聞く・「同じこと繰り返し」検出も1回だけ指摘
  - Phase 3: 確定＋カレンダー枠提案（〜5分）— 最重要1件＋やらないこと→カレンダー枠提案→**Nobu承認後にGoogle Calendar書込み**（移動枠/フォーカス枠/Task枠/連絡返し枠）
  - Phase 4: Daily書込＋wiki/プロジェクト.md反映。**⚠️GTaskは読み取り専用＝書込み禁止（2026-06-19廃止）**。当日タスクのGTask自動insertはしない・正本管理はNobu手動。MTG/prepは状況収集のみ（旧todo_sync退役）
  - Phase 5: スタートサマリ（1分）
  - **チームは秘書1本化**（リサーチャー/開発との横並び廃止。システム開発の話も秘書が扱う）
  - **メンターはB案**：「呼ぶ？」と聞かない。秘書が論点検出時のみ「これメンター案件です・呼びますか？」とトリガー
  - 礼儀的反応・3枠サマリー・「過去に決めたから」論は禁止
  - **府庁/移動ルール**: [[wiki/_meta/府庁ルール.md]] を Phase 0 で読込、Phase 3 の修正フィードバックで学習追記
  - Daily テンプレ: `_system/templates/Daily.md`（**構造固定: 最上位に✍️メモ・思考=Nobu記入エリア → 区切り線 → ↓AI管理エリア(ナビ/昨日の引き継ぎ/最重要1件/ToDo/朝会/やったこと)**。すぐ書けるようメモ最上位が必須）。生成は `_system/scripts/new_daily.sh`（毎朝7:00 morning_brief.sh が未存在時のみ呼ぶ・日付/曜日/週Wn自動置換）

## 📅 月次/週次の命名・配置ルール

- パス: `wiki/weekly/YYYY-MM/Wn.md`（月次.md は当月配下に同居）
- 週の月帰属は **ISO Thursday規約**（その週の木曜が含まれる月に所属）
- `Wn` は月内のThursday順で1から採番（例：2026-05は W1=5/4週, W2=5/11週, W3=5/18週, W4=5/25週）
- frontmatter: `week: YYYY-MM-Wn` / `iso_week: YYYY-WNN`（参考保持）

## 🔗 ToDo / Weekly / Monthly 連動ルール（2026-06-01改訂・@ToDo廃止）

- **当日タスクの正本は Google Tasks**（@ToDo.md は廃止）。手で複数面を一致させる二重管理をやめた
- **戦略レイヤー＝ `wiki/プロジェクト.md`**：作戦・次の一手・仕込み。「①今週やる」と決めたものだけ Google Tasks に一方通行で降ろす（同期不要）
- 月次.md は週次への links と「今月のテーマ／主要イベント／月末レビュー」を保持
- 旧 `todo_sync_gtasks.py`／launchd `todo-gtasks-sync` は退役（`HH:MM→カレンダー自動生成`機能も廃止・予定はカレンダー直接入力）
- **/MTG で確定した「今日の最重要1件」「今日やらないこと」は当週Wn.mdの今日の曜日セクションに「☀️ 朝会」サブセクションとして自動追記**
- テンプレート: `_system/templates/週次.md`, `_system/templates/月次.md`
- 生成スクリプト: `_system/_ai/new_week.py`（月次.md も同時に作成する）
