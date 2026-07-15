#!/usr/bin/env bash
# cc-sync.sh — Claude Code 設定の Git 同期スクリプト
#
# MacBook・Mac mini どちらから実行しても同じコマンドで動く。
# ~/.claude の中身を claude-config/ に同期してから git push/pull する。
#
# 使い方:
#   bash cc-sync.sh push   # この端末の設定を Git に push
#   bash cc-sync.sh pull   # Git から設定を pull してこの端末に反映
#   bash cc-sync.sh status # 差分確認のみ
#
# 前提:
#   ~/claude for me が Git 管理されていること
#   git remote origin が設定済みであること

set -euo pipefail

REPO_DIR="$HOME/claude for me"
CLAUDE_DIR="$HOME/.claude"
CONFIG_DIR="$REPO_DIR/claude-config"
# ローカルは端末の実proj ID（-Users-<user>-note）、リポ側はリポ共通の固定正準名に集約
MEMORY_DIR="$CLAUDE_DIR/projects/-Users-$(whoami)-note/memory"
CONFIG_MEMORY_DIR="$CONFIG_DIR/projects/-Users-apple-note/memory"

# ~/.claude → claude-config/ にコピーする対象の rsync オプション
RSYNC_EXCLUDE=(
  "--exclude=mcp-servers/"
  "--exclude=plugins/"
  "--exclude=security/"
  "--exclude=projects/"
  "--exclude=sessions/"
  "--exclude=cache/"
  "--exclude=telemetry/"
  "--exclude=metrics/"
  "--exclude=shell-snapshots/"
  "--exclude=debug/"
  "--exclude=file-history/"
  "--exclude=history.jsonl"
  "--exclude=channels/"
  "--exclude=homunculus/"
  "--exclude=backups/"
  "--exclude=paste-cache/"
  "--exclude=stats-cache.json"
  "--exclude=statsig/"
  "--exclude=ide/"
  "--exclude=vercel-plugin-*"
  "--exclude=todos/"
  "--exclude=security_warnings_state_*"
  "--exclude=mcp-needs-auth-cache.json"
  "--exclude=claw/"
  "--exclude=CLAUDE.md.backup-*"
  "--exclude=settings.json.backup.*"
  "--exclude=settings.json.bak.*"
  "--exclude=session-state.json"
  "--exclude=session-env/"
  "--exclude=tasks/"
  "--exclude=hooks/stop/.state/"
  "--exclude=plans/"
  "--exclude=powerline/usage/"
  "--exclude=powerline/locks/"
  "--exclude=.last-cleanup"
  "--exclude=.last-update-result.json"
)

CMD="${1:-status}"

case "$CMD" in

# ── push: この端末の ~/.claude を git push ──────────────
push)
  echo ""
  echo "======================================="
  echo "  cc-sync push ($(whoami)@$(hostname -s))"
  echo "======================================="
  echo ""

  echo "── [1/4] ~/.claude → claude-config/ を同期..."
  rsync -a --delete "${RSYNC_EXCLUDE[@]}" \
    "$CLAUDE_DIR/" \
    "$CONFIG_DIR/"

  echo "── [2/4] Memory を claude-config/projects/ に同期..."
  mkdir -p "$CONFIG_MEMORY_DIR"
  rsync -a --delete \
    "$MEMORY_DIR/" \
    "$CONFIG_MEMORY_DIR/" 2>/dev/null || echo "  (Memory ディレクトリが空またはなし)"

  echo "── [3/4] git add & commit..."
  cd "$REPO_DIR"
  git add claude-config/ .gitignore
  if git diff --cached --quiet; then
    echo "  変更なし。push をスキップします。"
    exit 0
  fi
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
  HOSTNAME=$(hostname -s)
  git commit -m "cc-sync: ${HOSTNAME} ${TIMESTAMP}"

  echo "── [4/4] git push..."
  git push origin main
  echo ""
  echo "✅ push 完了"
  ;;

# ── pull: git pull して ~/.claude に反映 ─────────────────
pull)
  echo ""
  echo "======================================="
  echo "  cc-sync pull ($(whoami)@$(hostname -s))"
  echo "======================================="
  echo ""

  echo "── [1/3] git pull..."
  cd "$REPO_DIR"
  git pull origin main

  echo ""
  echo "── [2/3] claude-config/ → ~/.claude/ に反映..."
  rsync -a --delete "${RSYNC_EXCLUDE[@]}" \
    "$CONFIG_DIR/" \
    "$CLAUDE_DIR/"

  echo ""
  echo "── [3/3] Memory を ~/.claude/projects/ に反映..."
  mkdir -p "$MEMORY_DIR"
  rsync -a --delete \
    "$CONFIG_MEMORY_DIR/" \
    "$MEMORY_DIR/" 2>/dev/null || echo "  (Memory なし)"

  echo ""
  echo "✅ pull 完了。Claude Code を再起動すると設定が反映されます。"
  ;;

# ── status: 差分確認 ──────────────────────────────────
status)
  echo ""
  echo "======================================="
  echo "  cc-sync status"
  echo "======================================="
  echo ""

  echo "── ~/.claude と claude-config/ の差分..."
  rsync -n -av --delete "${RSYNC_EXCLUDE[@]}" \
    "$CLAUDE_DIR/" \
    "$CONFIG_DIR/" | grep -v "^sending\|^sent\|^total\|^$" || true

  echo ""
  echo "── Memory の差分..."
  rsync -n -av --delete \
    "$MEMORY_DIR/" \
    "$CONFIG_MEMORY_DIR/" 2>/dev/null | grep -v "^sending\|^sent\|^total\|^$" || true

  echo ""
  echo "── git status..."
  cd "$REPO_DIR"
  git status --short claude-config/
  ;;

*)
  echo "Usage: $0 [push|pull|status]"
  exit 1
  ;;
esac
