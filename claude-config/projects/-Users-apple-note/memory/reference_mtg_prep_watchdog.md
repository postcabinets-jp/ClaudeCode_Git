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

## ⚠️ 2026-06-16 追記: 真因③の取りこぼし＝タイムアウトが反復数依存だった（壁時計化で根治）
2026-06-12のkill_tree化でも**ハングが永久化する穴が残っていた**。監視ループの `ELAPSED` を `sleep 1`の**反復回数**で数えていたため、ジョブ中にMacがidle/クラムシェルスリープへ落ちるとループ自体が凍結→反復が進まず、起床後も900に届かず kill_tree が永久に発火しない。**6/16実機**: 06:24watchdogリトライのclaude(PID 1687)が36分以上ハング→`claude_global.lock`を握ったまま居座り、別途03:05の401（トークン競合）と合わさってDailyが空欄のまま朝に発覚。
- 対策: 監視ループを **`date +%s` 壁時計差分**で判定（`CLAUDE_START=$(date +%s)`; ループ内 `ELAPSED=$(( $(date +%s)-CLAUDE_START ))`; `sleep 5`刻み）。スリープで一時凍結しても起床直後の最初の比較で即超過判定→確実にkill。caffeinate(L50)はフタ閉じ+バッテリーのクラムシェルスリープをそもそも止められない（Apple制約）のでココで殺すしかない。実機smoke testでPASS。
- バックアップ: `mtg_prep.sh.bak_2026-06-16_walltimeout`。
- **横展開TODO**: nar.sh / auto-dreaming.sh / weekly_review.py も同じ反復数カウントなら壁時計化が必要（未確認）。

**Why:** kill_tree化で「直した」つもりが、スリープ環境では反復カウントが凍って不発＝静かな失敗が再発。タイムアウトは必ず壁時計で測る。
**How to apply:** 無人claude -pジョブの監視ループは反復数でなく `date +%s` 差分で超過判定する。

## 2026-06-16 追記: Limitless文脈の肥大で無人claudeが本文編集を放棄する問題（C対策）
無人claude -p が rc=0 でも「creating a complete replacement due to file complexity」と言って Edit せず要約だけ吐く事故。原因は `mtg_limitless_<date>.md` が102KBに膨張（昨日フル37KB＋"⛔ Recent index"が青天井で~57KB）。対策＝`collect_limitless_context.py` に **recent index の総量上限 `DEFAULT_RECENT_MAX_CHARS=12_000`**（超過分は明示クリップ）＋ per_block_chars 220→140。昨日フルdigest(SUM最優先ソース)は無傷で維持。実測 102KB→68KB(-34%)。`mtg_prep.sh` は `--recent-max-chars` 未指定＝新デフォルトが効く（呼び出し変更不要）。さらに減らすなら `--recent-max-chars` を明示 or `--lookback-days` を縮める。

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
8. **セクション重複の正規化（2026-06-15追加・"failed-after-retry"根治）**: `dedupe_daily_sections.py` を `mtg_prep.sh` の claude実行直後・verify直前に挿入（手順5.4）。claude -pが在席編集(Edit)せず同名 `## ` セクションを二重生成すると、空スケルトンが先頭・埋まったコピーが後続に残り、verifyが先頭(空)を見て false incomplete → watchdog失敗判定する事故（6/15実測：📥昨日の引き継ぎ/📓昨日のログ等5セクションが重複）。空複製を畳んで埋まったコピーをテンプレ順に戻す。冪等・`✍️メモ/🚀MTG/✅やったこと`は保護(畳まない)。併せて `verify_daily_prep.py` の `section_has_content` を **any-occurrence**化（同名見出しのどれか1つに本文があればOK）して二重に保険。

9. **claudeトークン競合(401)の直列化ロック（2026-06-15追加）**: `claude_lock.sh`（共通部品）を `mtg_prep.sh`/`nar.sh` が source し、claude起動だけを共有ロック `~/.note-system/logs/claude_global.lock`（mkdirアトミック・20分stale奪取・最大20分待機→無理ならロック無し続行）で囲む。**真因**: Claudeサブスク認証(claudeAiOauth)は8時間TTL＋refresh tokenローテーション。複数の無人ジョブが `~/.claude/.credentials.json` を共有し、早朝に claude 呼び出しが重なるとトークン更新が競合→片方が他方を無効化し `401 Invalid authentication credentials`。6/15は nar(02:41) と mtg_prep(03:00/04:00) が同一401で同時死→04:22自己回復。ロックで同時更新を物理的に消す。横展開先: auto-dreaming/weekly-review/nightly-scan/youtube-digest も将来同様に source すべき（共通部品があるので acquire/release 2行挿入で済む）。401はrate limitでも恒久失効でもない（/login不要で自己回復）。

## 新規ファイル/launchd（波及先）
- スクリプト: `~/.note-system/scripts/{verify_daily_prep.py, mtg_prep_watchdog.sh, reauth_google_token.py}`
- launchd: `~/Library/LaunchAgents/com.postcabinets.mtg-prep-watchdog.plist`（06:20）
- 状態ファイル: `~/.note-system/logs/mtg_prep_status_<date>.txt`（morning_brief/watchdogが読む契約）

10. **起動ハング＝0バイト出力（2026-06-17 実機確定）**: 6/17 mtg_prep が auto×2 とも `claude -p` rc=142（900s超SIGKILL）。`mtg_prep_claudeout_2026-06-17.txt` が **0バイト**＝claudeは967秒間1トークンも出力せず**起動段階（最初のAPI応答到達前）でハング**。スクリプトコメントの「起動直後CPU0%で固まる」現象の再発（hook無効/`< /dev/null`/kill_tree は全部入っているのに発生）。**入力サイズは無関係と断定**: 6/16はlimitlessファイル103KBでも206sで成功、6/17は65KBでハング（大きい日が速く小さい日がハング）。`--max-chars`は文字数指定で日本語は約3B/字＝36KB digest≒12000字なので30000上限に届かず**入力トリムは無効**（試走で30000でもファイル不変を確認）。対処として **timeout 900→600s に短縮**（正常完了は実測194〜496s、ハングは900s+無限。600なら真のハングだけ殺しwatchdogが窓内で2回リトライ）。**残課題**: 起動ハングは間欠的（6/14成功・6/17失敗）でAPI初期化/トークン更新スタール由来と推測。完全には止まらない。真の保険は「watchdog連続失敗時に収集済み素材から軽量生成でDailyを必ず埋めるフォールバック」（2026-06-17時点では未実装・Nobu判断待ち。当日は Claudian が手動で素材から代理生成して朝会を救済した）。

**Why:** 静かな失敗（fail silent）がNobuの朝の時間を奪った。CLAUDE.md 0-2/1-1の「検証してないのに完了と言うな」をシステムに落とした。
**How to apply:** mtg_prep.sh を改修するときは①MCP無効②**hook無効(`--setting-sources local`)**③timeout(kill_tree)④lock⑤status契約 を壊さない。無人claude -pは**hookを必ず切る**（OAuth維持のため`--bare`は使わず`--setting-sources local`）。Dailyの中核セクション見出しを変えたら `verify_daily_prep.py` の REQUIRED も更新する。バックアップ: `mtg_prep.sh.bak_2026-06-12_hangfix`。
