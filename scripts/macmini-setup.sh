#!/bin/bash
# scripts/macmini-setup.sh
# Mac mini 初回セットアップ（1コマンドで完結）
# 使い方: bash <(curl -fsSL https://raw.githubusercontent.com/postcabinets-jp/ClaudeCode_Git/main/scripts/macmini-setup.sh)
# または: git clone後に bash scripts/macmini-setup.sh

set -e

REPO_DIR="/Users/apple/claude for me"
REPO_URL="git@github.com:postcabinets-jp/ClaudeCode_Git.git"
NODE_VERSION="v20.19.5"
NODE_BIN="/Users/apple/.nvm/versions/node/${NODE_VERSION}/bin"
LAUNCHD_DIR="$HOME/Library/LaunchAgents"

echo ""
echo "=================================================="
echo "  POST CABINETS Mac mini セットアップ"
echo "=================================================="
echo ""

# ── 1. リポジトリ ─────────────────────────────────────
if [ -d "$REPO_DIR/.git" ]; then
  echo "✅ リポジトリ既存。git pull します..."
  cd "$REPO_DIR"
  git pull origin main
else
  echo "📦 リポジトリをクローン中..."
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

# ── 2. npm install ────────────────────────────────────
echo ""
echo "📦 npm install 中..."
"$NODE_BIN/node" "$NODE_BIN/npm" install

# ── 3. .env チェック ──────────────────────────────────
echo ""
if [ ! -f "$REPO_DIR/.env" ]; then
  echo "⚠️  .env が見つかりません。"
  echo "   MacBookから以下でコピーしてください："
  echo ""
  echo "   scp 'macbook-ip:/Users/apple/claude for me/.env' '$REPO_DIR/.env'"
  echo ""
  echo "   .env をコピー後、このスクリプトを再実行してください。"
  exit 1
else
  echo "✅ .env 確認済み"
fi

# ── 4. launchd 登録 ───────────────────────────────────
echo ""
echo "⚙️  launchd サービスを登録中..."

mkdir -p "$LAUNCHD_DIR"

register_plist() {
  local label="$1"
  local src="$REPO_DIR/scripts/launchd/${label}.plist.example"
  local dst="$LAUNCHD_DIR/${label}.plist"

  if [ ! -f "$src" ]; then
    echo "  ⚠️  $src が見つかりません。スキップ。"
    return
  fi

  # 既存を一度アンロード（エラーは無視）
  launchctl unload "$dst" 2>/dev/null || true

  cp "$src" "$dst"
  launchctl load "$dst"
  echo "  ✅ $label 登録完了"
}

register_plist "com.postcabinets.discord-bot-daemon"
register_plist "com.postcabinets.discord-morning"
register_plist "com.postcabinets.linear-agent-loop"

# ── 5. 自動git pull（5分ごと） ─────────────────────────
AUTO_PULL_PLIST="$LAUNCHD_DIR/com.postcabinets.git-autopull.plist"
launchctl unload "$AUTO_PULL_PLIST" 2>/dev/null || true

cat > "$AUTO_PULL_PLIST" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.postcabinets.git-autopull</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>-c</string>
    <string>cd "/Users/apple/claude for me" && git pull origin main --ff-only >> /Users/apple/Library/Logs/git-autopull.log 2>&1 && /Users/apple/.nvm/versions/node/${NODE_VERSION}/bin/npm install --silent 2>/dev/null || true</string>
  </array>
  <key>StartInterval</key>
  <integer>300</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>/Users/apple/Library/Logs/git-autopull.log</string>
  <key>StandardErrorPath</key>
  <string>/Users/apple/Library/Logs/git-autopull.error.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/Users/apple/.nvm/versions/node/${NODE_VERSION}/bin:/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    <key>HOME</key>
    <string>/Users/apple</string>
  </dict>
</dict>
</plist>
EOF

launchctl load "$AUTO_PULL_PLIST"
echo "  ✅ git-autopull（5分ごと）登録完了"

# ── 6. 動作確認 ───────────────────────────────────────
echo ""
echo "=================================================="
echo "  セットアップ完了！"
echo "=================================================="
echo ""
echo "稼働中のサービス："
launchctl list | grep postcabinets | awk '{print "  " $0}'
echo ""
echo "ログの確認："
echo "  tail -f ~/Library/Logs/discord-bot-daemon.log"
echo "  tail -f ~/Library/Logs/discord-morning.log"
echo "  tail -f ~/Library/Logs/git-autopull.log"
echo ""
echo "⚠️  Discord Bot トークンを再発行した場合は .env を更新後："
echo "  launchctl kickstart -k gui/\$(id -u)/com.postcabinets.discord-bot-daemon"
echo ""
