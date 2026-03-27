#!/bin/bash
# ttyd-claude.sh — Shell script spawned by ttyd for Claude Code remote access
# Manages tmux session: creates if missing, attaches to existing.
#
# Usage (called by ttyd, but can also be run directly):
#   ttyd-claude.sh            → attach to existing tmux session (default)
#   ttyd-claude.sh new        → create a new tmux window and run claude
#   ttyd-claude.sh sessions   → run claude sessions list

SESSION_NAME="claude"
WORK_DIR="$HOME"

MODE="${1:-resume}"

# Ensure tmux session exists
if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
    tmux new-session -d -s "$SESSION_NAME" -c "$WORK_DIR"
    tmux rename-window -t "$SESSION_NAME:0" "main"
fi

case "$MODE" in
  new)
    # Create a new window in the claude session and run claude
    tmux new-window -t "$SESSION_NAME" -n "claude-$$" -c "$WORK_DIR"
    tmux send-keys -t "$SESSION_NAME" "claude" Enter
    exec tmux attach-session -t "$SESSION_NAME"
    ;;
  sessions)
    # Show session list then drop to shell
    echo "=== Claude Code Sessions ==="
    claude sessions list 2>/dev/null || echo "(no sessions found)"
    echo ""
    echo "Type 'claude --resume' to resume a session, or 'claude' to start new."
    exec bash
    ;;
  resume|*)
    # Default: attach to existing tmux session
    exec tmux attach-session -t "$SESSION_NAME"
    ;;
esac
