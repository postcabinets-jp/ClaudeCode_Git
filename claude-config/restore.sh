#!/bin/bash
# Claude Code 設定リストアスクリプト
# Usage: bash claude-config/restore.sh

set -euo pipefail

CLAUDE_DIR="$HOME/.claude"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Claude Code 設定リストア ==="
echo "Source: $SCRIPT_DIR"
echo "Target: $CLAUDE_DIR"
echo ""

# バックアップ既存設定
if [ -d "$CLAUDE_DIR" ]; then
  echo "既存の ~/.claude/ をバックアップ中..."
  BACKUP="$CLAUDE_DIR.backup.$(date +%Y%m%d-%H%M%S)"
  cp -r "$CLAUDE_DIR" "$BACKUP"
  echo "  → $BACKUP"
fi

# ディレクトリ作成
mkdir -p "$CLAUDE_DIR"/{agents,commands,channels/discord,homunculus,mcp-servers}
mkdir -p "$CLAUDE_DIR/projects/-Users-apple-claude-for-me/memory"

# CLAUDE.md
cp "$SCRIPT_DIR/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
echo "✓ CLAUDE.md"

# settings.json (APIキーは手動記入)
cp "$SCRIPT_DIR/settings.json" "$CLAUDE_DIR/settings.json"
echo "✓ settings.json (APIキーを手動で記入してください)"

# settings.local.json テンプレート
if [ ! -f "$CLAUDE_DIR/settings.local.json" ]; then
  cp "$SCRIPT_DIR/settings.local.json.example" "$CLAUDE_DIR/settings.local.json"
  echo "✓ settings.local.json (テンプレートからコピー — APIキーを記入)"
else
  echo "⏭ settings.local.json は既存のため上書きしません"
fi

# Agents
cp "$SCRIPT_DIR"/agents/*.md "$CLAUDE_DIR/agents/"
echo "✓ agents/ ($(ls "$SCRIPT_DIR"/agents/*.md | wc -l | tr -d ' ') files)"

# Commands
cp "$SCRIPT_DIR"/commands/*.md "$CLAUDE_DIR/commands/"
echo "✓ commands/ ($(ls "$SCRIPT_DIR"/commands/*.md | wc -l | tr -d ' ') files)"

# Skills
if [ -d "$SCRIPT_DIR/skills" ]; then
  cp -r "$SCRIPT_DIR"/skills/* "$CLAUDE_DIR/skills/" 2>/dev/null || true
  echo "✓ skills/"
fi

# Channels
cp "$SCRIPT_DIR/channels/discord/access.json" "$CLAUDE_DIR/channels/discord/access.json" 2>/dev/null || true
echo "✓ channels/discord/"

# Homunculus
cp "$SCRIPT_DIR/homunculus/projects.json" "$CLAUDE_DIR/homunculus/projects.json" 2>/dev/null || true
echo "✓ homunculus/"

# Plugin metadata
cp "$SCRIPT_DIR/installed_plugins.json" "$CLAUDE_DIR/plugins/installed_plugins.json" 2>/dev/null || true
cp "$SCRIPT_DIR/known_marketplaces.json" "$CLAUDE_DIR/plugins/known_marketplaces.json" 2>/dev/null || true
cp "$SCRIPT_DIR/plugins-blocklist.json" "$CLAUDE_DIR/plugins/blocklist.json" 2>/dev/null || true
echo "✓ plugin metadata"

# Project memory
cp "$SCRIPT_DIR"/project-memory/* "$CLAUDE_DIR/projects/-Users-apple-claude-for-me/memory/" 2>/dev/null || true
echo "✓ project-memory/"

echo ""
echo "=== リストア完了 ==="
echo ""
echo "残りの手動作業:"
echo "  1. ~/.claude/settings.json の BRAVE_API_KEY を記入"
echo "  2. ~/.claude/settings.local.json のAPIキーを記入"
echo "  3. MCP サーバーを再インストール"
echo "  4. Claude Code 起動でプラグイン自動インストール"
