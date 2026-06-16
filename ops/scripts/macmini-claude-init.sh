#!/usr/bin/env bash
# macmini-claude-init.sh
# Mac mini に Claude Code 環境を初回セットアップするスクリプト。
# このスクリプト自体を Mac mini にコピーして実行するだけで完結する。
#
# 使い方（Mac mini 側）:
#   # MacBook から scp でこのスクリプトをコピー
#   scp 'apple@macbook.local:/Users/apple/claude for me/ops/scripts/macmini-claude-init.sh' ~/
#
#   # Mac mini 上で実行
#   MACBOOK_HOST=apple@macbook.local bash ~/macmini-claude-init.sh
#
# 環境変数:
#   MACBOOK_HOST  ... MacBook の SSH ホスト（例: apple@macbook.local）
#   MACBOOK_USER  ... MacBook のユーザー名（default: apple）

set -euo pipefail

MACBOOK_HOST="${MACBOOK_HOST:-}"
MACBOOK_USER="${MACBOOK_USER:-apple}"
THIS_USER="$(whoami)"
CLAUDE_DIR="$HOME/.claude"
OPS_DIR="$HOME/claude for me"

echo ""
echo "============================================"
echo "  Mac mini Claude Code 初回セットアップ"
echo "============================================"
echo ""

if [[ -z "$MACBOOK_HOST" ]]; then
  echo "Error: MACBOOK_HOST が必要です"
  echo "例: MACBOOK_HOST=apple@macbook.local bash $0"
  exit 1
fi

# MacBook の username を HOST から推測
if [[ "$MACBOOK_HOST" == *@* ]]; then
  MACBOOK_USER="${MACBOOK_HOST%%@*}"
fi
echo "MacBook ユーザー: $MACBOOK_USER"
echo "Mac mini ユーザー: $THIS_USER"
echo ""

# ── Step 1: 前提ツール確認 ────────────────────────────
echo "── [1/6] 前提ツール確認..."
check_cmd() {
  if command -v "$1" &>/dev/null; then
    echo "  ✅ $1 ($(command -v "$1"))"
  else
    echo "  ❌ $1 が見つかりません → インストールが必要"
  fi
}
check_cmd node
check_cmd git
check_cmd rsync
check_cmd ssh
echo ""

# ── Step 2: ~/.claude を MacBook から rsync ────────────
echo "── [2/6] ~/.claude を MacBook からコピー..."
mkdir -p "$CLAUDE_DIR"

rsync -av --delete \
  --exclude='history.jsonl' \
  --exclude='sessions/' \
  --exclude='cache/' \
  --exclude='statsig/' \
  --exclude='telemetry/' \
  --exclude='metrics/' \
  --exclude='stats-cache.json' \
  --exclude='ide/' \
  --exclude='paste-cache/' \
  --exclude='vercel-plugin-*' \
  --exclude='todos/' \
  --exclude='security_warnings_state_*' \
  "$MACBOOK_HOST:~/.claude/" \
  "$CLAUDE_DIR/"
echo "  ~/.claude コピー完了"
echo ""

# ── Step 3: ops/scripts を MacBook からコピー ──────────
echo "── [3/6] ops/scripts を MacBook からコピー..."
mkdir -p "$OPS_DIR"
rsync -av \
  "$MACBOOK_HOST:~/claude for me/ops/" \
  "$OPS_DIR/ops/" 2>/dev/null || echo "  ⚠️ ops スキップ（git clone 済みなら不要）"
echo ""

# ── Step 4: パス置換（/Users/apple/ → /Users/$THIS_USER/） ──
echo "── [4/6] パス置換（MacBook ユーザー名 → Mac mini ユーザー名）..."

# settings.json
if [[ -f "$CLAUDE_DIR/settings.json" ]]; then
  sed -i '' "s|/Users/${MACBOOK_USER}/|/Users/${THIS_USER}/|g" "$CLAUDE_DIR/settings.json"
  # Node パスを Mac mini 上の実際のパスに合わせる
  if command -v node &>/dev/null; then
    NODE_BIN=$(dirname $(which node))
    sed -i '' "s|/Users/${MACBOOK_USER}/.nvm/versions/node/[^/]*/bin|$NODE_BIN|g" "$CLAUDE_DIR/settings.json"
    echo "  Node パス: $NODE_BIN"
  fi
  echo "  settings.json 置換完了"
fi

# hooks
find "$CLAUDE_DIR/hooks/" -type f 2>/dev/null | \
  xargs -I{} sed -i '' "s|/Users/${MACBOOK_USER}/|/Users/${THIS_USER}/|g" {} 2>/dev/null || true
echo "  hooks 置換完了"
echo ""

# ── Step 5: Memory を Mac mini 用パスにコピー ──────────
echo "── [5/6] Memory をコピー..."
MACMINI_MEMORY_DIR="$CLAUDE_DIR/projects/-Users-${THIS_USER}/memory"
MACBOOK_MEMORY_DIR="$CLAUDE_DIR/projects/-Users-${MACBOOK_USER}/memory"
mkdir -p "$MACMINI_MEMORY_DIR"
if [[ -d "$MACBOOK_MEMORY_DIR" ]]; then
  cp -r "$MACBOOK_MEMORY_DIR/"* "$MACMINI_MEMORY_DIR/" 2>/dev/null || true
  echo "  Memory コピー完了: $MACMINI_MEMORY_DIR"
else
  echo "  ⚠️ MacBook Memory ディレクトリが見つかりません: $MACBOOK_MEMORY_DIR"
fi
echo ""

# ── Step 6: 動作確認ガイド ────────────────────────────
echo "── [6/6] セットアップ完了 ✅"
echo ""
echo "【次のステップ】"
echo ""
echo "1. Claude Code を起動:"
echo "   claude"
echo "   → SessionStart hook が走り Memory が注入されれば正常"
echo ""
echo "2. MCP 認証が必要なサービスを再認証:"
echo "   cat ~/.claude/CREDENTIALS_MAP.md"
echo "   → 各サービスの「取得方法」に従って認証"
echo ""
echo "3. Plugins を有効化:"
echo "   Claude Code UI の /install-plugin コマンド または settings.json の"
echo "   enabledPlugins をコピー元の MacBook と一致させる"
echo ""
echo "4. 定期同期の設定（オプション）:"
echo "   # MacBook が更新されたら Mac mini でこのコマンドを叩く"
echo "   MACBOOK_HOST=${MACBOOK_HOST} bash '${OPS_DIR}/ops/scripts/sync-claude-to-macmini.sh'"
echo ""
echo "詳細は: ~/note/wiki/_meta/Macmini_ClaudeCode同期ガイド.md"
