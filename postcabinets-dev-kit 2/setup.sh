#!/bin/bash
# ============================================================
# POSTCABINETS Dev Kit - Master Setup Script
# Usage: bash setup.sh [web-saas|ios|android|all]
# ============================================================

set -e

PLATFORM="${1:-all}"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err() { echo -e "${RED}[✗]${NC} $1"; }

# ── Prerequisites ──────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  POSTCABINETS Dev Kit Installer"
echo "  Platform: $PLATFORM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    err "Node.js not found. Install via: brew install node"
    exit 1
fi
log "Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    err "npm not found."
    exit 1
fi
log "npm $(npm -v)"

# Check Claude Code
if ! command -v claude &> /dev/null; then
    warn "Claude Code CLI not found. Install: npm install -g @anthropic-ai/claude-code"
    read -p "Install now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g @anthropic-ai/claude-code
    fi
fi

# ── Core MCP Servers (all platforms) ───────────────────────
echo ""
echo "── Installing Core MCP Servers ──"

# GitHub MCP (official)
log "Adding GitHub MCP Server..."
claude mcp add github \
    -e GITHUB_PERSONAL_ACCESS_TOKEN="${GITHUB_TOKEN:-YOUR_GITHUB_TOKEN}" \
    -- npx -y @modelcontextprotocol/server-github 2>/dev/null || warn "GitHub MCP: add manually"

# Supabase MCP (official remote)
log "Adding Supabase MCP Server..."
claude mcp add supabase \
    -- npx -y mcp-remote "https://mcp.supabase.com/mcp?project_ref=${SUPABASE_PROJECT_REF:-YOUR_PROJECT_REF}" 2>/dev/null || warn "Supabase MCP: add manually"

# Playwright MCP (browser automation / E2E)
log "Adding Playwright MCP Server..."
claude mcp add playwright \
    -- npx -y @playwright/mcp@latest 2>/dev/null || warn "Playwright MCP: add manually"

# Context7 (up-to-date library docs)
log "Adding Context7 MCP Server..."
claude mcp add context7 \
    -- npx -y @upstash/context7-mcp@latest 2>/dev/null || warn "Context7 MCP: add manually"

# Sequential Thinking (complex reasoning)
log "Adding Sequential Thinking MCP Server..."
claude mcp add thinking \
    -- npx -y @modelcontextprotocol/server-sequential-thinking 2>/dev/null || warn "Sequential Thinking MCP: add manually"

# ── Platform-Specific MCP Servers ──────────────────────────

if [[ "$PLATFORM" == "web-saas" || "$PLATFORM" == "all" ]]; then
    echo ""
    echo "── Installing Web/SaaS MCP Servers ──"

    # Figma MCP (design-to-code)
    log "Adding Figma MCP Server..."
    claude mcp add figma \
        -- npx -y figma-developer-mcp \
        --figma-api-key="${FIGMA_API_KEY:-YOUR_FIGMA_KEY}" \
        --stdio 2>/dev/null || warn "Figma MCP: add manually"

    log "Web/SaaS MCP setup complete"
fi

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
    echo ""
    echo "── Installing iOS MCP Servers ──"

    # Check Xcode
    if ! command -v xcodebuild &> /dev/null; then
        warn "Xcode not found. Install from App Store."
    else
        log "Xcode $(xcodebuild -version | head -1)"
    fi

    # XcodeBuildMCP (Sentry - comprehensive iOS tooling)
    log "Adding XcodeBuildMCP Server..."
    claude mcp add xcode \
        -- npx -y xcodebuildmcp@latest mcp 2>/dev/null || warn "XcodeBuildMCP: add manually"

    # iOS Simulator MCP
    log "Adding iOS Simulator MCP Server..."
    claude mcp add ios-sim \
        -- npx -y ios-simulator-mcp 2>/dev/null || warn "iOS Simulator MCP: add manually"

    log "iOS MCP setup complete"
fi

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
    echo ""
    echo "── Installing Android MCP Servers ──"

    # Check Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        warn "ANDROID_HOME not set. Set it to your Android SDK path."
    else
        log "Android SDK: $ANDROID_HOME"
    fi

    # MCP Mobile Server (Android + Flutter)
    log "Adding MCP Mobile Server..."
    npm install -g @cristianoaredes/mcp-mobile-server 2>/dev/null || warn "MCP Mobile: install manually"
    claude mcp add android \
        -- npx -y @cristianoaredes/mcp-mobile-server 2>/dev/null || warn "Android MCP: add manually"

    log "Android MCP setup complete"
fi

# ── Copy Project Templates ─────────────────────────────────
echo ""
echo "── Setting Up Project Templates ──"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create global Claude Code settings if not exists
CLAUDE_SETTINGS="$HOME/.claude/settings.json"
if [ ! -f "$CLAUDE_SETTINGS" ]; then
    mkdir -p "$HOME/.claude"
    echo '{}' > "$CLAUDE_SETTINGS"
    log "Created Claude Code settings"
fi

log "Templates available in: $SCRIPT_DIR/shared/templates/"
log "Prompts available in: $SCRIPT_DIR/shared/prompts/"

# ── Summary ────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Set environment variables in .env or export them:"
echo "     export GITHUB_TOKEN=ghp_xxxxx"
echo "     export SUPABASE_PROJECT_REF=xxxxx"
echo "     export FIGMA_API_KEY=figd_xxxxx"
echo ""
echo "  2. Start a new project:"
echo "     bash $SCRIPT_DIR/web-saas/scaffold.sh my-saas-app"
echo "     bash $SCRIPT_DIR/ios/scaffold.sh my-ios-app"
echo "     bash $SCRIPT_DIR/android/scaffold.sh my-android-app"
echo ""
echo "  3. Open in Claude Code:"
echo "     cd my-saas-app && claude"
echo ""
