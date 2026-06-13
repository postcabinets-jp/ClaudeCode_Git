---
name: mtg_prep 事前準備の障害対策（watchdog/timeout/lock）
description: 朝会事前準備が静かに失敗しないための多層防御。mtg_prep改修時に必ず参照
type: reference
---

2026-06-11、mtg_prep の `claude -p` がMCP（pencil/cursor）ロードでデッドロックし3.5h
ハング→Dailyが空のままNobuが朝6時に気づくまで誰も検知できなかった。さらに03:00のハングが
プロセスを掴んだまま居座り、launchdが04:00の確定runも丸ごとスキップして全欠落した。
その再発防止として「失敗を静かにしない」多層防御を実装。

## ⚠️ 2026-06-12 追記: ハング再発（6/10・6/11・6/12連続空欄）→ 独立した真因が【3つ】あった
MCP無効化だけでは止まらず6/12も空欄。実機の対照実験で、claude -p のハングには**独立した原因が3つ**あると判明。**1つ潰してもう1つで再発**していた（だから毎回「直した」が嘘になった）。
- **真因① stdin継承ハング（手動/watchdog経路）**: 巨大プロンプト(35KB+)を渡した claude -p を、stdinが端末/pipeのまま background起動すると、**最初のAPI応答にも到達せずCPU0%で数時間固まる**。対照実験で確定: 短プロンプト+stdin継承=完了 / 巨大+stdin継承=ハング / 巨大+`< /dev/null`=完了(52s)。
  - 対策: claude起動に **`< /dev/null`**（shell）/ **`stdin=subprocess.DEVNULL`**（python）。
  - ※launchd直実行はstdinが元々/dev/null(StandardInPath未設定)なのでこの原因は出ない。**効くのは watchdogの`bash mtg_prep.sh manual`・手動実行・nohup**。
- **真因② hookデッドロック（launchd経路）**: 無人 claude -p でも user/project の settings.json hook が発火（SessionStart: memory/credentials/obsidian inject、Stop: dreaming-reminder、continuous-learning observe 等）。無人環境で一部が永久待ち→claude硬直。**launchd(stdin=/dev/null)で今朝ハングしたのはこれ。**
  - 対策: **`--setting-sources local`**。hookを持つuser/project設定をロードしない。local層はpermissionsのみでhookなし＝安全。**OAuth認証はsetting-sourceと別系統(keychain)なので維持**（実測rc=0）。
  - ❌ `--bare`はダメ: hookは切れるが「OAuth/keychain一切読まずANTHROPIC_API_KEY必須」→サブスク認証で認証不能。
- **真因③ タイムアウト不発**: 旧 `perl alarm+exec` の SIGALRM が Node(claude) を殺せず、ハングしたclaudeが900s超でも生存→lock握りっぱなし→watchdogリトライも積み上がり永久に空欄。
  - 対策: perlをやめ **background起動＋ポーリング監視＋`kill_tree`（子孫を末端からpgrep再帰SIGKILL）**。超過時に確実に殺す。最悪ハングしても900sで必ず終了→verify→status→watchdog/通知が回る。
- **横展開（同じ無人claude -pジョブ全部に①②③を予防接種）**: `nar.sh`(exit124常態化していた) / `weekly_review.py` / `auto-dreaming.sh`(timeout無しだった)。バックアップ全て `*.bak_2026-06-12_hangfix`。

## 入れた防御（全て実機検証済み）
1. **MCP無効化**: `mtg_prep.sh` の `claude -p` に `--strict-mcp-config --mcp-config '{"mcpServers":{}}'`。無人ジョブはMCPを一切ロードしない
1b. **hook無効化（2026-06-12）**: `--setting-sources local`。無人実行でuser/project hookを発火させない（launchd経路のハング主因）
1c. **stdin遮断（2026-06-12）**: `< /dev/null`（shell）/`stdin=subprocess.DEVNULL`（python）。巨大プロンプト×stdin継承ハングの根治（手動/watchdog経路）
2. **ハードタイムアウト（2026-06-12改修）**: background+ポーリング+`kill_tree`で900s。旧perl alarmはNodeを殺せず不発だった
3. **stale-lockガード**: `mtg_prep.sh`先頭。lock=`~/.note-system/logs/mtg_prep.lock`。前instanceが20分超え＝ハング判定でkill、20分以内＝二重起動回避でexit
4. **自己検証**: `verify_daily_prep.py` が中核3セクション（📥昨日の引き継ぎ/📓昨日の詳細ログ/🗓今日の動き方）の実本文有無を判定。結果を `~/.note-system/logs/mtg_prep_status_<date>.txt`（complete/incomplete/failed-after-retry）に書く
5. **watchdog**: `mtg_prep_watchdog.sh` を launchd `com.postcabinets.mtg-prep-watchdog`（06:20）。トークン健全性チェック＋Daily未完成なら自動で1回mtg_prepリトライ→直らなければ大通知
6. **朝通知に状態反映**: `morning_brief.sh`(07:00) が status ファイルを読み、未完成なら「⚠️事前準備が未完成」と通知（以前は失敗時も「事前準備済み」と嘘通知していた）
7. **トークン再認証**: `reauth_google_token.py`（ブラウザ同意でtoken.json再発行）。refresh_token失効（invalid_grant）時に使う

## 新規ファイル/launchd（波及先）
- スクリプト: `~/.note-system/scripts/{verify_daily_prep.py, mtg_prep_watchdog.sh, reauth_google_token.py}`
- launchd: `~/Library/LaunchAgents/com.postcabinets.mtg-prep-watchdog.plist`（06:20）
- 状態ファイル: `~/.note-system/logs/mtg_prep_status_<date>.txt`（morning_brief/watchdogが読む契約）

**Why:** 静かな失敗（fail silent）がNobuの朝の時間を奪った。CLAUDE.md 0-2/1-1の「検証してないのに完了と言うな」をシステムに落とした。
**How to apply:** mtg_prep.sh を改修するときは①MCP無効②**hook無効(`--setting-sources local`)**③timeout(kill_tree)④lock⑤status契約 を壊さない。無人claude -pは**hookを必ず切る**（OAuth維持のため`--bare`は使わず`--setting-sources local`）。Dailyの中核セクション見出しを変えたら `verify_daily_prep.py` の REQUIRED も更新する。バックアップ: `mtg_prep.sh.bak_2026-06-12_hangfix`。
