#!/usr/bin/env bash
# sync-claude-to-macmini.sh
# Claude Code の設定（CLAUDE.md / Memory / hooks / commands / agents）を
# MacBook → Mac mini に同期するスクリプト。
#
# 使い方:
#   Mac mini 側で実行（MacBook が同ネットワーク上にある場合）:
#     SOURCE_HOST=apple@macbook.local bash sync-claude-to-macmini.sh
#
#   MacBook 側から push する場合:
#     bash sync-claude-to-macmini.sh --push
#     DEST_HOST=nobu@macmini.local bash sync-claude-to-macmini.sh --push
#
# 環境変数:
#   SOURCE_HOST  ... MacBook の SSH ホスト（pull モード時に使用）
#   DEST_HOST    ... Mac mini の SSH ホスト（push モード時に使用）
#   MACMINI_USER ... Mac mini のユーザー名（デフォルト: nobu）
#   MACBOOK_USER ... MacBook のユーザー名（デフォルト: apple）

set -euo pipefail

# ── 設定 ─────────────────────────────────────────────
MACMINI_USER="${MACMINI_USER:-nobu}"
MACBOOK_USER="${MACBOOK_USER:-apple}"
SOURCE_HOST="${SOURCE_HOST:-}"
DEST_HOST="${DEST_HOST:-}"
MODE_PUSH=0
MODE_CHECK=0
DRY_RUN=0

usage() {
  cat <<USAGE
Usage: $0 [options]

Options:
  --push           MacBook から Mac mini へ push する（DEST_HOST 必須 or 環境変数 DEST_HOST）
  --check          同期すべきファイルの存在確認のみ（コピーしない）
  --dry-run        rsync の --dry-run。何がコピーされるかプレビュー
  -h, --help       このヘルプ

環境変数:
  MACMINI_USER   Mac mini のユーザー名（default: nobu）
  MACBOOK_USER   MacBook のユーザー名（default: apple）
  SOURCE_HOST    pull モード: MacBook の SSH ホスト（例: apple@macbook.local）
  DEST_HOST      push モード: Mac mini の SSH ホスト（例: nobu@macmini.local）

USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --push) MODE_PUSH=1 ;;
    --check) MODE_CHECK=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
  shift
done

# ── 変数 ─────────────────────────────────────────────
THIS_USER="$(whoami)"
CLAUDE_DIR="$HOME/.claude"
RSYNC_OPTS="-av --delete"
[[ $DRY_RUN -eq 1 ]] && RSYNC_OPTS="$RSYNC_OPTS --dry-run"

EXCLUDE_OPTS=(
  "--exclude=history.jsonl"
  "--exclude=sessions/"
  "--exclude=cache/"
  "--exclude=statsig/"
  "--exclude=telemetry/"
  "--exclude=*.log"
  "--exclude=metrics/"
  "--exclude=stats-cache.json"
  "--exclude=ide/"
  "--exclude=paste-cache/"
  "--exclude=vercel-plugin-*"
  "--exclude=todos/"
  "--exclude=security_warnings_state_*"
)

# ── push モード（MacBook → Mac mini） ─────────────────
if [[ $MODE_PUSH -eq 1 ]]; then
  if [[ -z "$DEST_HOST" ]]; then
    echo "Error: --push モードは DEST_HOST が必要です"
    echo "例: DEST_HOST=nobu@macmini.local $0 --push"
    exit 1
  fi
  echo ""
  echo "======================================"
  echo "  Claude Code 設定 Push → $DEST_HOST"
  echo "======================================"
  echo ""

  echo "── ~/.claude を同期中..."
  rsync $RSYNC_OPTS "${EXCLUDE_OPTS[@]}" \
    "$CLAUDE_DIR/" \
    "$DEST_HOST:~/.claude/"

  echo ""
  echo "── settings.json のパスを Mac mini 用に置換..."
  # ssh でリモート上の settings.json を置換
  ssh "$DEST_HOST" "
    sed -i '' 's|/Users/${MACBOOK_USER}/|/Users/${MACMINI_USER}/|g' ~/.claude/settings.json
    # node パスを Mac mini 上の実際のパスに合わせる
    NODE_BIN=\$(dirname \$(which node 2>/dev/null) 2>/dev/null || echo '/Users/${MACMINI_USER}/.nvm/versions/node/v20.19.5/bin')
    sed -i '' \"s|/Users/${MACBOOK_USER}/.nvm/versions/node/[^/]*/bin|\$NODE_BIN|g\" ~/.claude/settings.json
    echo '  settings.json パス置換完了'
  "

  echo ""
  echo "── hooks のパスを Mac mini 用に置換..."
  ssh "$DEST_HOST" "
    find ~/.claude/hooks/ -type f | xargs -I{} sed -i '' 's|/Users/${MACBOOK_USER}/|/Users/${MACMINI_USER}/|g' {} 2>/dev/null || true
    echo '  hooks パス置換完了'
  "

  echo ""
  echo "── Memory を Mac mini のプロジェクトパスにコピー..."
  ssh "$DEST_HOST" "
    MACMINI_MEMORY_DIR=\"\$HOME/.claude/projects/-Users-${MACMINI_USER}/memory\"
    MACBOOK_MEMORY_DIR=\"\$HOME/.claude/projects/-Users-${MACBOOK_USER}/memory\"
    mkdir -p \"\$MACMINI_MEMORY_DIR\"
    if [ -d \"\$MACBOOK_MEMORY_DIR\" ]; then
      cp -r \"\$MACBOOK_MEMORY_DIR/\"* \"\$MACMINI_MEMORY_DIR/\" 2>/dev/null || true
      echo \"  Memory を \$MACMINI_MEMORY_DIR にコピー完了\"
    else
      echo \"  Memory ソースが見つかりません: \$MACBOOK_MEMORY_DIR\"
    fi
  "

  echo ""
  echo "✅ Push 完了。Mac mini 側で 'claude' を起動して動作確認してください。"
  echo "⚠️  MCP認証（Google Calendar / Slack等）は Mac mini 側で個別に再認証が必要です。"
  echo "   ~/.claude/CREDENTIALS_MAP.md の手順を参照してください。"
  exit 0
fi

# ── check モード ──────────────────────────────────────
if [[ $MODE_CHECK -eq 1 ]]; then
  echo ""
  echo "======================================"
  echo "  同期対象ファイル 存在確認"
  echo "======================================"
  echo ""
  check_file() {
    local path="$1"
    if [[ -e "$path" ]]; then
      echo "  ✅ $path"
    else
      echo "  ❌ $path （見つかりません）"
    fi
  }
  check_file "$CLAUDE_DIR/CLAUDE.md"
  check_file "$CLAUDE_DIR/CREDENTIALS_MAP.md"
  check_file "$CLAUDE_DIR/settings.json"
  check_file "$CLAUDE_DIR/hooks/pre-tool-use/block-dangerous-bash.sh"
  check_file "$CLAUDE_DIR/hooks/pre-tool-use/block-secret-files.sh"
  check_file "$CLAUDE_DIR/hooks/stop/capture-instructions.mjs"
  check_file "$CLAUDE_DIR/commands/"
  check_file "$CLAUDE_DIR/agents/"
  check_file "$CLAUDE_DIR/projects/-Users-${THIS_USER}/memory/MEMORY.md"
  echo ""
  echo "── ops/scripts 確認..."
  OPS_DIR="$HOME/claude for me/ops/scripts"
  check_file "$OPS_DIR/memory-context-inject.mjs"
  check_file "$OPS_DIR/credentials-map-inject.mjs"
  check_file "$OPS_DIR/obsidian-context-inject.mjs"
  check_file "$OPS_DIR/session-start.mjs"
  check_file "$OPS_DIR/design-context-inject.mjs"
  exit 0
fi

# ── pull モード（Mac mini 上で実行、MacBook から pull） ──
if [[ -z "$SOURCE_HOST" ]]; then
  echo "Error: SOURCE_HOST が未指定です"
  echo ""
  echo "Mac mini 側でこのスクリプトを実行する場合:"
  echo "  SOURCE_HOST=apple@macbook.local $0"
  echo ""
  echo "MacBook 側から push する場合:"
  echo "  DEST_HOST=nobu@macmini.local $0 --push"
  exit 1
fi

echo ""
echo "======================================"
echo "  Claude Code 設定 Pull ← $SOURCE_HOST"
echo "======================================"
echo ""

# MACBOOK_USER を SOURCE_HOST から推測（user@host 形式なら）
if [[ "$SOURCE_HOST" == *@* ]]; then
  MACBOOK_USER="${SOURCE_HOST%%@*}"
fi

echo "── ~/.claude を MacBook からコピー中..."
rsync $RSYNC_OPTS "${EXCLUDE_OPTS[@]}" \
  "$SOURCE_HOST:~/.claude/" \
  "$CLAUDE_DIR/"

echo ""
echo "── settings.json のパスを Mac mini 用に置換..."
if [[ -f "$CLAUDE_DIR/settings.json" ]]; then
  sed -i '' "s|/Users/${MACBOOK_USER}/|/Users/${THIS_USER}/|g" "$CLAUDE_DIR/settings.json"
  NODE_BIN=$(dirname $(which node 2>/dev/null) 2>/dev/null || echo "/Users/${THIS_USER}/.nvm/versions/node/v20.19.5/bin")
  sed -i '' "s|/Users/${MACBOOK_USER}/.nvm/versions/node/[^/]*/bin|$NODE_BIN|g" "$CLAUDE_DIR/settings.json"
  echo "  settings.json パス置換完了"
fi

echo ""
echo "── hooks のパスを置換..."
find "$CLAUDE_DIR/hooks/" -type f | xargs -I{} sed -i '' "s|/Users/${MACBOOK_USER}/|/Users/${THIS_USER}/|g" {} 2>/dev/null || true
echo "  hooks パス置換完了"

echo ""
echo "── Memory を Mac mini 用パスにコピー..."
MACMINI_MEMORY_DIR="$CLAUDE_DIR/projects/-Users-${THIS_USER}/memory"
MACBOOK_MEMORY_DIR="$CLAUDE_DIR/projects/-Users-${MACBOOK_USER}/memory"
mkdir -p "$MACMINI_MEMORY_DIR"
if [[ -d "$MACBOOK_MEMORY_DIR" ]]; then
  cp -r "$MACBOOK_MEMORY_DIR/"* "$MACMINI_MEMORY_DIR/" 2>/dev/null || true
  echo "  Memory を $MACMINI_MEMORY_DIR にコピー完了"
fi

echo ""
echo "── ops/scripts を MacBook からコピー..."
OPS_SRC="$SOURCE_HOST:~/claude for me/ops/"
OPS_DST="$HOME/claude for me/ops/"
mkdir -p "$OPS_DST"
rsync $RSYNC_OPTS "$OPS_SRC" "$OPS_DST" 2>/dev/null || echo "  ⚠️ ops/scripts の rsync に失敗（git clone 済みなら不要）"

echo ""
echo "✅ 同期完了。"
echo ""
echo "【次のステップ】"
echo "1. claude を起動して SessionStart hook が正常に動くか確認"
echo "2. MCP 認証が必要なサービスを再認証:"
echo "   ~/.claude/CREDENTIALS_MAP.md を参照"
echo "3. plugins（everything-claude-code 等）は Claude Code UI で手動 enable が必要な場合あり"
