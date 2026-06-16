#!/usr/bin/env bash
# Mac mini routine migration setup
# このMacで動いている定期実行ルーティンを、Mac mini側で完結させるためのセットアップスクリプト。
# 詳細: /Users/apple/note/wiki/_meta/Macmini定期実行移管指示書.md
#
# 使い方（実行する側＝移行先）:
#   bash "$HOME/claude for me/ops/scripts/macmini-routine-migration-setup.sh" --check
#   bash "$HOME/claude for me/ops/scripts/macmini-routine-migration-setup.sh" --install
#
# 任意: 別マシン(SOURCE)から同期もまとめて実行する場合
#   SOURCE_HOST=user@host.local bash ... --sync --install
#
# 環境変数で全パス上書き可能（移行先のユーザー名・vault名が違っても動く）:
#   VAULT_DIR="$HOME/note"            # 例: Mac miniで vault が "My note" なら VAULT_DIR="$HOME/My note"
#   OPS_DIR="$HOME/claude for me"
#   NOTE_SYSTEM="$HOME/.note-system"
#   SOURCE_HOST="user@host.local"
#   SOURCE_VAULT_DIR="/Users/<user>/My note"   # 同期元(SOURCE)側の実パス
#   SOURCE_OPS_DIR="/Users/<user>/claude for me"
#   SOURCE_NOTE_SYSTEM="/Users/<user>/.note-system"

set -euo pipefail
IFS=$'\n\t'

VAULT_DIR="${VAULT_DIR:-$HOME/note}"
OPS_DIR="${OPS_DIR:-$HOME/claude for me}"
NOTE_SYSTEM="${NOTE_SYSTEM:-$HOME/.note-system}"
SOURCE_VAULT_DIR="${SOURCE_VAULT_DIR:-$VAULT_DIR}"
SOURCE_OPS_DIR="${SOURCE_OPS_DIR:-$OPS_DIR}"
SOURCE_NOTE_SYSTEM="${SOURCE_NOTE_SYSTEM:-$NOTE_SYSTEM}"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"
LOG_DIR="$HOME/Library/Logs/postcabinets"
LOCAL_LOG_DIR="$HOME/.local/var/log"
MODE_CHECK=0
MODE_INSTALL=0
MODE_GENERATE=0
MODE_SYNC=0
MODE_DISABLE_LOCAL=0

usage() {
  cat <<USAGE
Mac mini routine migration setup

Options:
  --check          前提ファイル・依存関係・認証らしき配置を確認するだけ
  --sync           SOURCE_HOST から note / .note-system / claude for me を rsync
  --install        launchd plist を生成・登録する
  --generate-only  plist生成だけ行う（launchd登録はしない）
  --disable-old    廃止/旧パス系ジョブを unload する
  -h, --help       ヘルプ

Examples:
  bash "$0" --check
  bash "$0" --install
  SOURCE_HOST=nobu@macbook.local SOURCE_VAULT_DIR="/Users/nobu/My note" bash "$0" --sync --install

Current paths:
  VAULT_DIR=$VAULT_DIR
  OPS_DIR=$OPS_DIR
  NOTE_SYSTEM=$NOTE_SYSTEM
  SOURCE_HOST=${SOURCE_HOST:-未指定}
  SOURCE_VAULT_DIR=$SOURCE_VAULT_DIR
  SOURCE_OPS_DIR=$SOURCE_OPS_DIR
  SOURCE_NOTE_SYSTEM=$SOURCE_NOTE_SYSTEM
USAGE
}

for arg in "$@"; do
  case "$arg" in
    --check) MODE_CHECK=1 ;;
    --install) MODE_INSTALL=1 ;;
    --generate-only) MODE_GENERATE=1 ;;
    --sync) MODE_SYNC=1 ;;
    --disable-old) MODE_DISABLE_LOCAL=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $arg" >&2; usage; exit 2 ;;
  esac
done

if [[ $# -eq 0 ]]; then
  usage
  exit 2
fi

say() { printf '\n\033[1;36m%s\033[0m\n' "$*"; }
ok() { printf '  ✅ %s\n' "$*"; }
warn() { printf '  ⚠️  %s\n' "$*"; }
fail() { printf '  ❌ %s\n' "$*"; }

need_cmd() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    ok "$cmd: $(command -v "$cmd")"
  else
    warn "$cmd が見つかりません"
    return 1
  fi
}

first_existing() {
  local p
  for p in "$@"; do
    [[ -e "$p" ]] && { printf '%s' "$p"; return 0; }
  done
  return 1
}

NODE_BIN="$(command -v node || true)"
NPM_BIN="$(command -v npm || true)"
PYTHON_BIN="$(first_existing "$VAULT_DIR/_system/.venv/bin/python" "$VAULT_DIR/_system/.venv/bin/python3" "$(command -v python3 || true)" || true)"
BASH_BIN="/bin/bash"

sync_from_source() {
  say "SOURCE_HOST から同期"
  if [[ -z "${SOURCE_HOST:-}" ]]; then
    fail "--sync には SOURCE_HOST=apple@macbook.local の指定が必要です"
    exit 1
  fi
  mkdir -p "$VAULT_DIR" "$NOTE_SYSTEM" "$OPS_DIR"
  echo "  source vault: $SOURCE_HOST:$SOURCE_VAULT_DIR -> $VAULT_DIR"
  echo "  source note-system: $SOURCE_HOST:$SOURCE_NOTE_SYSTEM -> $NOTE_SYSTEM"
  echo "  source ops: $SOURCE_HOST:$SOURCE_OPS_DIR -> $OPS_DIR"
  rsync -av --delete --exclude '.git/index.lock' "$SOURCE_HOST:$SOURCE_VAULT_DIR/" "$VAULT_DIR/"
  rsync -av --delete "$SOURCE_HOST:$SOURCE_NOTE_SYSTEM/" "$NOTE_SYSTEM/"
  rsync -av --delete "$SOURCE_HOST:$SOURCE_OPS_DIR/" "$OPS_DIR/"
  rsync -av "$SOURCE_HOST:$HOME/.config/calendar-sync/" "$HOME/.config/calendar-sync/" || warn "calendar-sync の同期は失敗/未存在"
  ok "同期完了"
}

check_environment() {
  say "前提確認"
  echo "  HOME=$HOME"
  echo "  VAULT_DIR=$VAULT_DIR"
  echo "  OPS_DIR=$OPS_DIR"
  echo "  NOTE_SYSTEM=$NOTE_SYSTEM"

  need_cmd git || true
  need_cmd rsync || true
  need_cmd launchctl || true
  need_cmd plutil || true
  need_cmd node || true
  need_cmd npm || true
  need_cmd python3 || true
  need_cmd osascript || true

  say "ディレクトリ確認"
  [[ -d "$VAULT_DIR" ]] && ok "vaultあり: $VAULT_DIR" || warn "vaultなし: $VAULT_DIR"
  [[ -d "$NOTE_SYSTEM" ]] && ok ".note-systemあり: $NOTE_SYSTEM" || warn ".note-systemなし: $NOTE_SYSTEM"
  [[ -d "$OPS_DIR" ]] && ok "opsあり: $OPS_DIR" || warn "opsなし: $OPS_DIR"

  say "中核スクリプト確認"
  local paths=(
    "$NOTE_SYSTEM/scripts/mtg_prep.sh"
    "$NOTE_SYSTEM/scripts/morning_brief.sh"
    "$NOTE_SYSTEM/scripts/fetch_calendars.py"
    "$NOTE_SYSTEM/scripts/collect_limitless_context.py"
    "$NOTE_SYSTEM/scripts/collect_notion_updates.py"
    "$NOTE_SYSTEM/scripts/nar.sh"
    "$NOTE_SYSTEM/scripts/weekly_review.py"
    "$OPS_DIR/ops/scripts/limitless-sync.mjs"
    "$OPS_DIR/ops/scripts/kokkai-fetch.mjs"
    "$OPS_DIR/ops/scripts/kokkai-sync.mjs"
    "$OPS_DIR/ops/scripts/notion-nightly-scan.mjs"
  )
  local p
  for p in "${paths[@]}"; do
    [[ -e "$p" ]] && ok "$p" || warn "未検出: $p"
  done

  say "認証ファイル/環境の存在確認（値は表示しない）"
  [[ -f "$OPS_DIR/.env" ]] && ok "$OPS_DIR/.env あり" || warn "$OPS_DIR/.env なし"
  [[ -d "$HOME/.config/calendar-sync" ]] && ok "calendar-sync設定あり" || warn "calendar-sync設定なし"
  security find-generic-password -s LIMITLESS_API_KEY >/dev/null 2>&1 && ok "Keychain: LIMITLESS_API_KEY あり" || warn "Keychain: LIMITLESS_API_KEY 未確認"
}

plist_header() {
  cat <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
PLIST
}

write_plist() {
  local label="$1"
  local body="$2"
  local dst="$LAUNCHD_DIR/$label.plist"
  mkdir -p "$LAUNCHD_DIR" "$LOG_DIR" "$LOCAL_LOG_DIR/limitless" "$NOTE_SYSTEM/logs"
  {
    plist_header
    printf '%s\n' "$body"
    printf '</plist>\n'
  } > "$dst"
  plutil -lint "$dst" >/dev/null
  ok "plist生成: $dst"
}

xml_escape() {
  sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' <<<"$1"
}

install_or_reload() {
  local label="$1"
  local plist="$LAUNCHD_DIR/$label.plist"
  launchctl bootout "gui/$(id -u)/$label" >/dev/null 2>&1 || true
  launchctl unload "$plist" >/dev/null 2>&1 || true
  launchctl bootstrap "gui/$(id -u)" "$plist" >/dev/null 2>&1 || launchctl load "$plist"
  ok "launchd登録: $label"
}

make_plists() {
  say "launchd plist生成"
  local PATH_VALUE
  PATH_VALUE="$(dirname "${NODE_BIN:-/usr/bin/node}"):/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
  local env_block="<key>EnvironmentVariables</key><dict><key>HOME</key><string>$(xml_escape "$HOME")</string><key>PATH</key><string>$(xml_escape "$PATH_VALUE")</string></dict>"

  # 1. SUM事前準備
  if [[ -x "$NOTE_SYSTEM/scripts/mtg_prep.sh" || -f "$NOTE_SYSTEM/scripts/mtg_prep.sh" ]]; then
    write_plist "com.postcabinets.mtg-prep" "<dict>
<key>Label</key><string>com.postcabinets.mtg-prep</string>
$env_block
<key>ProgramArguments</key><array><string>$BASH_BIN</string><string>$(xml_escape "$NOTE_SYSTEM/scripts/mtg_prep.sh")</string><string>auto</string></array>
<key>RunAtLoad</key><false/>
<key>StartCalendarInterval</key><array><dict><key>Hour</key><integer>3</integer><key>Minute</key><integer>0</integer></dict><dict><key>Hour</key><integer>4</integer><key>Minute</key><integer>0</integer></dict></array>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/mtg_prep.launchd.out.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/mtg_prep.launchd.err.log")</string>
</dict>"
  else warn "mtg_prep.sh がないためスキップ"; fi

  # 2. 朝通知/Daily生成
  if [[ -x "$NOTE_SYSTEM/scripts/morning_brief.sh" || -f "$NOTE_SYSTEM/scripts/morning_brief.sh" ]]; then
    write_plist "com.postcabinets.note.morning" "<dict>
<key>Label</key><string>com.postcabinets.note.morning</string>
$env_block
<key>ProgramArguments</key><array><string>$BASH_BIN</string><string>$(xml_escape "$NOTE_SYSTEM/scripts/morning_brief.sh")</string></array>
<key>RunAtLoad</key><true/>
<key>StartCalendarInterval</key><dict><key>Hour</key><integer>7</integer><key>Minute</key><integer>0</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/launchd.out.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/launchd.err.log")</string>
</dict>"
  else warn "morning_brief.sh がないためスキップ"; fi

  # 3. Limitless sync
  if [[ -n "$NODE_BIN" && -f "$OPS_DIR/ops/scripts/limitless-sync.mjs" ]]; then
    write_plist "com.postcabinets.limitless-sync" "<dict>
<key>Label</key><string>com.postcabinets.limitless-sync</string>
$env_block
<key>WorkingDirectory</key><string>$(xml_escape "$OPS_DIR")</string>
<key>ProgramArguments</key><array><string>$(xml_escape "$NODE_BIN")</string><string>$(xml_escape "$OPS_DIR/ops/scripts/limitless-sync.mjs")</string></array>
<key>StartCalendarInterval</key><array><dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>30</integer></dict><dict><key>Hour</key><integer>22</integer><key>Minute</key><integer>0</integer></dict></array>
<key>StandardOutPath</key><string>$(xml_escape "$LOG_DIR/limitless-sync.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$LOG_DIR/limitless-sync.err")</string>
</dict>"
  else warn "limitless-sync.mjs または node がないためスキップ"; fi

  # 4. Kokkai fetch/sync
  for job in kokkai-fetch kokkai-sync; do
    local interval script
    script="$OPS_DIR/ops/scripts/$job.mjs"
    [[ "$job" == "kokkai-fetch" ]] && interval=21600 || interval=14400
    if [[ -n "$NODE_BIN" && -f "$script" ]]; then
      write_plist "com.postcabinets.$job" "<dict>
<key>Label</key><string>com.postcabinets.$job</string>
$env_block
<key>WorkingDirectory</key><string>$(xml_escape "$OPS_DIR")</string>
<key>ProgramArguments</key><array><string>$(xml_escape "$NODE_BIN")</string><string>$(xml_escape "$script")</string></array>
<key>RunAtLoad</key><true/>
<key>StartInterval</key><integer>$interval</integer>
<key>StandardOutPath</key><string>$(xml_escape "$LOG_DIR/$job.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$LOG_DIR/$job.err")</string>
</dict>"
    else warn "$job.mjs または node がないためスキップ"; fi
  done

  # 5. NAR
  if [[ -f "$NOTE_SYSTEM/scripts/nar.sh" ]]; then
    write_plist "com.postcabinets.nar" "<dict>
<key>Label</key><string>com.postcabinets.nar</string>
$env_block
<key>ProgramArguments</key><array><string>$BASH_BIN</string><string>$(xml_escape "$NOTE_SYSTEM/scripts/nar.sh")</string><string>0230</string></array>
<key>RunAtLoad</key><false/>
<key>StartCalendarInterval</key><dict><key>Hour</key><integer>2</integer><key>Minute</key><integer>30</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/nar_launchd.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/nar_launchd.err")</string>
</dict>"
  else warn "nar.sh がないためスキップ"; fi

  # 6. Weekly review
  if [[ -n "$PYTHON_BIN" && -f "$NOTE_SYSTEM/scripts/weekly_review.py" ]]; then
    write_plist "com.postcabinets.weekly-review" "<dict>
<key>Label</key><string>com.postcabinets.weekly-review</string>
$env_block
<key>WorkingDirectory</key><string>$(xml_escape "$NOTE_SYSTEM")</string>
<key>ProgramArguments</key><array><string>$(xml_escape "$PYTHON_BIN")</string><string>$(xml_escape "$NOTE_SYSTEM/scripts/weekly_review.py")</string></array>
<key>RunAtLoad</key><false/>
<key>StartCalendarInterval</key><dict><key>Weekday</key><integer>0</integer><key>Hour</key><integer>20</integer><key>Minute</key><integer>0</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$LOG_DIR/weekly-review.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$LOG_DIR/weekly-review.err")</string>
</dict>"
  else warn "weekly_review.py または python がないためスキップ"; fi

  # 7. Notion nightly scan
  if [[ -n "$NODE_BIN" && -f "$OPS_DIR/ops/scripts/notion-nightly-scan.mjs" ]]; then
    write_plist "com.postcabinets.nightly-scan" "<dict>
<key>Label</key><string>com.postcabinets.nightly-scan</string>
$env_block
<key>WorkingDirectory</key><string>$(xml_escape "$OPS_DIR")</string>
<key>ProgramArguments</key><array><string>$(xml_escape "$NODE_BIN")</string><string>$(xml_escape "$OPS_DIR/ops/scripts/notion-nightly-scan.mjs")</string></array>
<key>StartCalendarInterval</key><dict><key>Hour</key><integer>7</integer><key>Minute</key><integer>0</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$LOG_DIR/nightly-scan.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$LOG_DIR/nightly-scan.err")</string>
</dict>"
  else warn "notion-nightly-scan.mjs または node がないためスキップ"; fi

  # 8. mtg-prep-watchdog（prep障害の検知・復旧）06:20
  if [[ -f "$NOTE_SYSTEM/scripts/mtg_prep_watchdog.sh" ]]; then
    write_plist "com.postcabinets.mtg-prep-watchdog" "<dict>
<key>Label</key><string>com.postcabinets.mtg-prep-watchdog</string>
$env_block
<key>ProgramArguments</key><array><string>$BASH_BIN</string><string>$(xml_escape "$NOTE_SYSTEM/scripts/mtg_prep_watchdog.sh")</string></array>
<key>RunAtLoad</key><false/>
<key>StartCalendarInterval</key><dict><key>Hour</key><integer>6</integer><key>Minute</key><integer>20</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/mtg_prep_watchdog.out.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/mtg_prep_watchdog.err.log")</string>
</dict>"
  else warn "mtg_prep_watchdog.sh がないためスキップ"; fi

  # 9. auto-dreaming（dreaming自動保存）01:00
  if [[ -f "$NOTE_SYSTEM/scripts/auto-dreaming.sh" ]]; then
    write_plist "com.postcabinets.auto-dreaming" "<dict>
<key>Label</key><string>com.postcabinets.auto-dreaming</string>
$env_block
<key>ProgramArguments</key><array><string>$BASH_BIN</string><string>$(xml_escape "$NOTE_SYSTEM/scripts/auto-dreaming.sh")</string></array>
<key>RunAtLoad</key><false/>
<key>StartCalendarInterval</key><dict><key>Hour</key><integer>1</integer><key>Minute</key><integer>0</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/auto-dreaming.out.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/auto-dreaming.err.log")</string>
</dict>"
  else warn "auto-dreaming.sh がないためスキップ"; fi

  # 10. graph-autolink（グラフ自動リンク）月曜 08:30 ※実体は graph_weekly.sh ラッパー
  if [[ -f "$VAULT_DIR/_system/scripts/graph_weekly.sh" ]]; then
    write_plist "com.postcabinets.graph-autolink" "<dict>
<key>Label</key><string>com.postcabinets.graph-autolink</string>
$env_block
<key>ProgramArguments</key><array><string>/bin/sh</string><string>$(xml_escape "$VAULT_DIR/_system/scripts/graph_weekly.sh")</string></array>
<key>RunAtLoad</key><false/>
<key>StartCalendarInterval</key><dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>8</integer><key>Minute</key><integer>30</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/graph-autolink.out.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/graph-autolink.err.log")</string>
</dict>"
  else warn "graph_weekly.sh がないためスキップ"; fi

  # 11. youtube-digest（YouTube要約取込）02:30 ※vault venv python
  if [[ -n "$PYTHON_BIN" && -f "$VAULT_DIR/_system/scripts/youtube_digest.py" ]]; then
    write_plist "com.postcabinets.youtube-digest" "<dict>
<key>Label</key><string>com.postcabinets.youtube-digest</string>
$env_block
<key>WorkingDirectory</key><string>$(xml_escape "$VAULT_DIR")</string>
<key>ProgramArguments</key><array><string>$(xml_escape "$PYTHON_BIN")</string><string>$(xml_escape "$VAULT_DIR/_system/scripts/youtube_digest.py")</string></array>
<key>RunAtLoad</key><false/>
<key>StartCalendarInterval</key><dict><key>Hour</key><integer>2</integer><key>Minute</key><integer>30</integer></dict>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/youtube-digest.out.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/youtube-digest.err.log")</string>
</dict>"
  else warn "youtube_digest.py または python がないためスキップ"; fi

  # 12. ironlog-ingest（筋トレログ取込）1時間ごと ※~/dev 依存・専用pythonが要る場合あり
  local IRONLOG_PY
  IRONLOG_PY="$(first_existing /usr/local/bin/python3 /opt/homebrew/bin/python3 "$(command -v python3 || true)" || true)"
  if [[ -n "$IRONLOG_PY" && -f "$HOME/dev/ironlog_to_note.py" ]]; then
    write_plist "com.postcabinets.ironlog-ingest" "<dict>
<key>Label</key><string>com.postcabinets.ironlog-ingest</string>
$env_block
<key>ProgramArguments</key><array><string>$(xml_escape "$IRONLOG_PY")</string><string>$(xml_escape "$HOME/dev/ironlog_to_note.py")</string></array>
<key>RunAtLoad</key><false/>
<key>StartInterval</key><integer>3600</integer>
<key>StandardOutPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/ironlog-ingest.out.log")</string>
<key>StandardErrorPath</key><string>$(xml_escape "$NOTE_SYSTEM/logs/ironlog-ingest.err.log")</string>
</dict>"
  else warn "ironlog_to_note.py（~/dev）または python3 がないためスキップ"; fi

}

install_plists() {
  say "launchd登録"
  local labels=(
    com.postcabinets.mtg-prep
    com.postcabinets.note.morning
    com.postcabinets.limitless-sync
    com.postcabinets.kokkai-fetch
    com.postcabinets.kokkai-sync
    com.postcabinets.nar
    com.postcabinets.weekly-review
    com.postcabinets.nightly-scan
    com.postcabinets.mtg-prep-watchdog
    com.postcabinets.auto-dreaming
    com.postcabinets.graph-autolink
    com.postcabinets.youtube-digest
    com.postcabinets.ironlog-ingest
  )
  local label
  for label in "${labels[@]}"; do
    [[ -f "$LAUNCHD_DIR/$label.plist" ]] && install_or_reload "$label" || warn "plistなし: $label"
  done
}

disable_old_jobs() {
  say "廃止/旧パス系ジョブの停止"
  local labels=(
    com.postcabinets.todo-gtasks-sync
    com.postcabinets.limitless-to-weekly
    com.postcabinets.fathom-to-weekly
    com.postcabinets.linear-agent-loop
    com.postcabinets.notion-meetings-to-obsidian
    com.postcabinets.recording-to-wiki
  )
  local label
  for label in "${labels[@]}"; do
    launchctl bootout "gui/$(id -u)/$label" >/dev/null 2>&1 || true
    launchctl unload "$LAUNCHD_DIR/$label.plist" >/dev/null 2>&1 || true
    ok "停止試行: $label"
  done
}

manual_test_hint() {
  say "手動テスト"
  cat <<TEST
以下をMac mini側で実行して確認してください。

  bash "$NOTE_SYSTEM/scripts/morning_brief.sh"
  bash "$NOTE_SYSTEM/scripts/mtg_prep.sh" manual
  tail -80 "$NOTE_SYSTEM/logs/mtg_prep_$(date +%Y-%m-%d).log"
  launchctl list | grep postcabinets

成功判定:
  - $VAULT_DIR/Daily/$(date +%Y-%m)/$(date +%Y-%m-%d).md が存在/更新される
  - $NOTE_SYSTEM/logs/mtg_cal_$(date +%Y-%m-%d).md が生成される
  - $NOTE_SYSTEM/logs/mtg_prep_$(date +%Y-%m-%d).log に致命的エラーがない
TEST
}

[[ $MODE_SYNC -eq 1 ]] && sync_from_source
[[ $MODE_CHECK -eq 1 ]] && check_environment
if [[ $MODE_GENERATE -eq 1 ]]; then
  check_environment
  make_plists
fi
if [[ $MODE_INSTALL -eq 1 ]]; then
  check_environment
  make_plists
  install_plists
fi
[[ $MODE_DISABLE_LOCAL -eq 1 ]] && disable_old_jobs
manual_test_hint
