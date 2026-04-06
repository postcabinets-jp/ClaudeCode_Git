# Claude Code 環境移行ガイド（MacBook → 別Mac）

現在のMacBook（apple / 2026-04-06時点）の Claude Code 環境を別のMacへ移行する手順。

---

## 移行元の環境スペック

| 項目 | 値 |
|------|-----|
| Claude Code | 2.1.92 |
| Node.js | v24.14.1 |
| npm | 11.11.0 |
| Bun | 1.3.11 |
| macOS ユーザー名 | apple |
| プロジェクトパス | /Users/apple/claude for me |

---

## 移行の全体像（3層）

```
① リポジトリ      git clone → npm install（自動）
② ~/.claude/      agents / commands / skills を手動コピー
③ シークレット    .env + settings.local.json を手動コピー
```

---

## STEP 1: 基本ツールのインストール（移行先Mac）

```bash
# Homebrew（Apple Silicon）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Git
brew install git
git config --global user.name "postcabinets"
git config --global user.email "bachikanshikoku@gmail.com"

# nvm + Node.js 24
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.zshrc
nvm install 24 && nvm alias default 24

# Bun
curl -fsSL https://bun.sh/install | bash && source ~/.zshrc

# Claude Code
npm install -g @anthropic-ai/claude-code
claude --version
```

---

## STEP 2: リポジトリのクローン

SSH鍵が未設定なら付録を先に実施。

```bash
cd ~
git clone git@github.com:postcabinets-jp/ClaudeCode_Git.git "claude for me"
cd "claude for me"
npm install
```

---

## STEP 3: シークレット（.env）の移行

**MacBook 側で実行（移行先のIPを確認してから）:**

```bash
NEW_MAC_IP="192.168.x.x"   # ← 移行先のIPに変更
NEW_MAC_USER="nobu"         # ← 移行先のユーザー名に変更

scp "/Users/apple/claude for me/.env" "${NEW_MAC_USER}@${NEW_MAC_IP}:/Users/${NEW_MAC_USER}/claude for me/.env"
```

`.env` に含まれる主要キー:
```
NOTION_TOKEN
NOTION_PARENT_PAGE_ID
DISCORD_BOT_TOKEN
DISCORD_WEBHOOK_URL
ANTHROPIC_API_KEY
ANTHROPIC_AUTH_TOKEN
GITHUB_PERSONAL_ACCESS_TOKEN
BRAVE_API_KEY
```

---

## STEP 4: Claude Code 設定（~/.claude/）の移行

### 4-1. ディレクトリ作成（移行先）

```bash
mkdir -p ~/.claude/agents ~/.claude/commands ~/.claude/skills ~/.claude/mcp-servers
```

### 4-2. settings.json の配置

```bash
# リポジトリのものをコピー
cp ~/claude\ for\ me/claude-config/settings.json ~/.claude/settings.json

# パスをこのMacのユーザー名に書き換え（例: nobuの場合）
sed -i '' 's|/Users/apple|/Users/nobu|g' ~/.claude/settings.json
```

`settings.json` の主な設定内容:
- Permissions: Read/Write/Edit/Bash/Glob/mcp__pencil, bypassPermissions
- Hooks (Stop): macOS通知 + 効果音 + Discord通知
- Plugins: everything-claude-code, github, context7, discord, slack, supabase, firebase 他多数

### 4-3. settings.local.json の作成（シークレット含む）

```bash
# テンプレート（キーの値を .env の値で埋める）
cat > ~/.claude/settings.local.json << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"
      }
    },
    "brave-search": {
      "command": "node",
      "args": ["/Users/nobu/.claude/mcp-servers/brave-search-mcp-server/dist/index.js"],
      "env": {
        "BRAVE_API_KEY": "xxx"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "memory": {
      "command": "node",
      "args": ["/Users/nobu/.claude/mcp-servers/mcp-official-servers/src/memory/dist/index.js"]
    }
  }
}
EOF
```

### 4-4. CLAUDE.md の移行

```bash
# MacBook 側で実行
scp ~/.claude/CLAUDE.md "${NEW_MAC_USER}@${NEW_MAC_IP}:~/.claude/CLAUDE.md"
```

---

## STEP 5: agents / commands / skills の移行

**MacBook 側で実行:**

```bash
NEW_MAC_IP="192.168.x.x"
NEW_MAC_USER="nobu"

scp -r ~/.claude/agents   "${NEW_MAC_USER}@${NEW_MAC_IP}:~/.claude/"
scp -r ~/.claude/commands "${NEW_MAC_USER}@${NEW_MAC_IP}:~/.claude/"
scp -r ~/.claude/skills   "${NEW_MAC_USER}@${NEW_MAC_IP}:~/.claude/"
```

**エージェント一覧（21個）:**
architect, automation-builder, build-error-resolver, case-researcher,
chief-of-staff, code-reviewer, database-reviewer, doc-updater, e2e-runner,
flyer-composer, go-build-resolver, go-reviewer, harness-optimizer,
loop-operator, planner, python-reviewer, refactor-cleaner, sales-writer,
security-reviewer, tdd-guide, training-designer

**コマンド一覧（36個）:**
build-fix, checkpoint, claw, code-review, design, e2e, eval, evolve,
go-build/review/test, harness-audit, instinct-export/import/status,
katsudou-houkoku, learn/learn-eval, loop-start/status, model-route,
multi-backend/execute/frontend/plan/workflow, orchestrate, plan, pm2,
projects, promote, python-review, quality-gate, refactor-clean,
sessions, skill-create, tdd, test-coverage, update-codemaps/docs, verify

---

## STEP 6: brave-search MCP サーバーのビルド（任意）

`settings.json` でローカルバイナリを使う場合:

```bash
mkdir -p ~/.claude/mcp-servers
cd ~/.claude/mcp-servers
git clone https://github.com/anthropics/brave-search-mcp-server.git
cd brave-search-mcp-server
npm install && npm run build
```

---

## STEP 7: launchd デーモンの登録（Mac mini の場合のみ）

```bash
cd ~/claude\ for\ me
bash scripts/macmini-setup.sh
```

登録されるデーモン:

| ラベル | 役割 | 間隔 |
|--------|------|------|
| com.postcabinets.discord-bot-daemon | Discord Bot 常駐 | 常時 |
| com.postcabinets.discord-morning | 朝の Discord 通知 | 定時 |
| com.postcabinets.linear-agent-loop | Linear 自律ループ | 15分 |
| com.postcabinets.git-autopull | git pull 自動同期 | 5分 |

確認: `launchctl list | grep postcabinets`

---

## STEP 8: Claude Code ログイン

```bash
claude
# 初回起動でブラウザが開く → bachikanshikoku@gmail.com でログイン
```

---

## STEP 9: 動作確認

```bash
claude --version                    # 2.1.x
cd ~/claude\ for\ me
npm run notion:verify               # Notion 疎通
npm run discord:test                # Discord 疎通
claude                              # 起動
# > /model   → Sonnet 4.6 確認
```

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| `claude: command not found` | `npm install -g @anthropic-ai/claude-code` 再実行 |
| plugins が読み込まれない | `settings.json` の `/Users/apple` パスを sed で書き換え |
| MCP が接続されない | `settings.local.json` のパス・トークンを確認 |
| 通知音が鳴らない | `settings.json` の音声ファイルパスを確認 |
| launchd が起動しない | `launchctl list \| grep postcabinets` でステータス確認 |
| Notion 疎通失敗 | `.env` の `NOTION_TOKEN` を確認 |

---

## 付録: SSH 鍵の設定

```bash
ssh-keygen -t ed25519 -C "bachikanshikoku@gmail.com" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# → GitHub > Settings > SSH and GPG keys > New SSH key に貼り付け
ssh -T git@github.com   # 接続確認
```

---

## 環境差分メモ

| 項目 | MacBook（移行元） | 移行先 |
|------|-----------------|--------|
| ユーザー名 | apple | 要確認（例: nobu） |
| ホームパス | /Users/apple | /Users/nobu |
| プロジェクトパス | /Users/apple/claude for me | /Users/nobu/claude for me |
| everything-claude-code | /Users/apple/everything-claude-code | パス変更必要 |
| Node | v24.14.1 | v24.x（最新） |
| Bun | 1.3.11 | 1.x（最新） |
