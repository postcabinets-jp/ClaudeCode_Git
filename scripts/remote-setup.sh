#!/bin/bash
# remote-setup.sh — One-shot setup for Claude Code remote access on any Mac
# Idempotent: safe to run multiple times.
# Usage: bash scripts/remote-setup.sh

set -euo pipefail

# ── Detect project directory (where this script lives) ──────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CURRENT_USER="$(whoami)"
HOME_DIR="$HOME"
PLIST_DIR="$HOME_DIR/Library/LaunchAgents"

echo "============================================"
echo "  Claude Code Remote Access — Setup"
echo "============================================"
echo "Project : $PROJECT_DIR"
echo "User    : $CURRENT_USER"
echo "Home    : $HOME_DIR"
echo ""

# ── Step 1: Check / Install prerequisites ───────────────────────────

check_brew() {
  if ! command -v brew &>/dev/null; then
    echo "ERROR: Homebrew is not installed."
    echo "  Install it: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
  fi
  echo "[ok] Homebrew"
}

install_if_missing() {
  local cmd="$1"
  local pkg="${2:-$1}"
  if command -v "$cmd" &>/dev/null; then
    echo "[ok] $cmd ($(command -v "$cmd"))"
  else
    echo "[..] Installing $pkg via Homebrew..."
    brew install "$pkg"
    echo "[ok] $cmd installed"
  fi
}

check_tailscale() {
  if command -v tailscale &>/dev/null; then
    echo "[ok] Tailscale CLI"
  elif [ -d "/Applications/Tailscale.app" ]; then
    echo "[ok] Tailscale.app (CLI may be at /Applications/Tailscale.app/Contents/MacOS/Tailscale)"
    echo "     Make sure 'tailscale' is in your PATH or create a symlink."
  else
    echo "[!!] Tailscale not found."
    echo "     Install from: https://tailscale.com/download/mac"
    echo "     Or: brew install --cask tailscale"
    read -rp "     Continue anyway? (y/N) " yn
    if [[ "$yn" != [yY] ]]; then exit 1; fi
  fi

  # Verify Tailscale is connected
  if command -v tailscale &>/dev/null; then
    if tailscale ip -4 &>/dev/null; then
      echo "[ok] Tailscale connected ($(tailscale ip -4))"
    else
      echo "[!!] Tailscale is installed but not connected."
      echo "     Run: tailscale up"
    fi
  fi
}

echo "── Checking prerequisites ──"
check_brew
install_if_missing ttyd
install_if_missing tmux
install_if_missing node
check_tailscale
echo ""

# ── Step 2: Configure .env ──────────────────────────────────────────

ENV_FILE="$PROJECT_DIR/.env"

setup_env() {
  local needs_write=false

  # Read existing values if .env exists
  local existing_user="" existing_pass=""
  if [ -f "$ENV_FILE" ]; then
    existing_user=$(grep '^TTYD_USER=' "$ENV_FILE" 2>/dev/null | cut -d= -f2 || true)
    existing_pass=$(grep '^TTYD_PASS=' "$ENV_FILE" 2>/dev/null | cut -d= -f2 || true)
  fi

  if [ -n "$existing_user" ] && [ -n "$existing_pass" ]; then
    echo "[ok] .env already has TTYD_USER and TTYD_PASS"
    return
  fi

  echo "── Configuring ttyd credentials ──"
  local ttyd_user ttyd_pass

  read -rp "TTYD_USER [default: claude]: " ttyd_user
  ttyd_user="${ttyd_user:-claude}"

  read -rsp "TTYD_PASS [default: changeme]: " ttyd_pass
  echo ""
  ttyd_pass="${ttyd_pass:-changeme}"

  if [ "$ttyd_pass" = "changeme" ]; then
    echo "[!!] WARNING: Using default password. Change it later in .env"
  fi

  # Append to .env (create if needed)
  if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
    echo "# Claude Code Remote Access" >> "$ENV_FILE"
  fi

  if [ -z "$existing_user" ]; then
    echo "TTYD_USER=$ttyd_user" >> "$ENV_FILE"
  fi
  if [ -z "$existing_pass" ]; then
    echo "TTYD_PASS=$ttyd_pass" >> "$ENV_FILE"
  fi

  echo "[ok] Credentials written to .env"
}

setup_env
echo ""

# ── Step 3: Create logs directory ───────────────────────────────────

mkdir -p "$PROJECT_DIR/logs"
echo "[ok] logs/ directory"

# ── Step 4: Install tmux.conf if not present ────────────────────────

TMUX_CONF_SRC="$PROJECT_DIR/config/tmux.conf"
TMUX_CONF_DST="$HOME_DIR/.tmux.conf"

if [ -f "$TMUX_CONF_SRC" ]; then
  if [ -f "$TMUX_CONF_DST" ]; then
    echo "[ok] ~/.tmux.conf already exists (not overwriting)"
  else
    cp "$TMUX_CONF_SRC" "$TMUX_CONF_DST"
    echo "[ok] Installed tmux.conf → ~/.tmux.conf"
  fi
else
  echo "[!!] config/tmux.conf not found in project — skipping"
fi

# ── Step 5: Generate and install launchd plists ─────────────────────

echo ""
echo "── Installing launchd services ──"

mkdir -p "$PLIST_DIR"

# Template path placeholder (from the existing plist files)
TEMPLATE_PATH="/Users/apple/claude for me"

generate_plist() {
  local src="$1"
  local label="$2"
  local dst="$PLIST_DIR/${label}.plist"

  if [ ! -f "$src" ]; then
    echo "[!!] Template not found: $src — skipping"
    return 1
  fi

  # Unload existing service if loaded
  if launchctl list "$label" &>/dev/null 2>&1; then
    launchctl unload "$dst" 2>/dev/null || true
  fi

  # Replace template path with actual project path
  sed "s|${TEMPLATE_PATH}|${PROJECT_DIR}|g" "$src" > "$dst"

  # Also fix node path if homebrew is in a non-standard location
  local node_path
  node_path="$(command -v node)"
  if [ -n "$node_path" ] && [ "$node_path" != "/opt/homebrew/bin/node" ]; then
    sed -i '' "s|/opt/homebrew/bin/node|${node_path}|g" "$dst"
  fi

  # Ensure the PATH includes the actual homebrew prefix
  local brew_prefix
  brew_prefix="$(brew --prefix 2>/dev/null || echo "/opt/homebrew")"
  if [ "$brew_prefix" != "/opt/homebrew" ]; then
    sed -i '' "s|/opt/homebrew/bin|${brew_prefix}/bin|g" "$dst"
  fi

  echo "[ok] Generated $dst"

  # Load the service
  launchctl load "$dst" 2>/dev/null && echo "[ok] Loaded $label" || echo "[!!] Failed to load $label"
}

generate_plist \
  "$PROJECT_DIR/scripts/launchd/com.postcabinets.ttyd-claude.plist" \
  "com.postcabinets.ttyd-claude"

generate_plist \
  "$PROJECT_DIR/scripts/launchd/com.postcabinets.claude-launcher.plist" \
  "com.postcabinets.claude-launcher"

# ── Step 6: Verify services ────────────────────────────────────────

echo ""
echo "── Verifying services ──"

sleep 2  # Give launchd a moment to start

check_service() {
  local label="$1"
  local port="$2"
  local name="$3"

  if launchctl list "$label" &>/dev/null 2>&1; then
    echo "[ok] $name ($label) is loaded"
  else
    echo "[!!] $name ($label) is NOT loaded"
  fi
}

check_service "com.postcabinets.ttyd-claude" 7681 "ttyd (terminal)"
check_service "com.postcabinets.claude-launcher" 7680 "PWA launcher"

# ── Step 7: Print access URLs ──────────────────────────────────────

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"

if command -v tailscale &>/dev/null && tailscale ip -4 &>/dev/null; then
  TS_IP="$(tailscale ip -4)"
  echo ""
  echo "  PWA Launcher : http://${TS_IP}:7680"
  echo "  Terminal      : http://${TS_IP}:7681"
  echo ""
  echo "  Open the Launcher URL on your iPhone and"
  echo "  tap 'Add to Home Screen' for a native-like app."
else
  echo ""
  echo "  Tailscale is not connected."
  echo "  Once connected, access via:"
  echo "    http://<tailscale-ip>:7680  (PWA Launcher)"
  echo "    http://<tailscale-ip>:7681  (Terminal)"
fi

echo ""
echo "  To change password:"
echo "    1. Edit .env (TTYD_USER / TTYD_PASS)"
echo "    2. npm run ttyd:stop && npm run ttyd:start"
echo "    3. Update CRED in remote-app/index.html"
echo ""
echo "  Docs: docs/remote-access.md"
echo "============================================"
