# POSTCABINETS AI自律組織 — Mac mini セットアップ

> **このファイルをMac miniのClaude Codeにそのまま渡して実行させること。**
> マシン: Mac mini M4（24時間稼働）
> 役割: AI自律組織の本体。エージェントが自分でタスクを拾い、実行し、報告する。

---

## このマシンで動くもの

```
Mac mini M4（24時間稼働）
├── Paperclip (localhost:3100) ── AI組織の管理基盤
│   ├── Sora (CEO) ── 戦略分解・委任・週次レポート
│   ├── Kai (CTO) ── 技術タスク実行
│   ├── Mio (Ops) ── 業務運用・資料作成
│   └── Ren (Marketing) ── コンテンツ・営業資料
├── Claude Code (ヘッドレス) ── エージェントの実行エンジン
├── MCP連携 ── Notion / GitHub
└── Tailscale ── MacBookからのリモートアクセス用
```

**Nobuはこのマシンを直接操作しない。**
Tailscale経由でPaperclipダッシュボードを週1回見るだけ。

---

## Phase 1: 基盤インストール（約15分）

### 1-1. 前提条件

```bash
# Node.js 20+
brew install node@20
node --version  # v20以上を確認

# Claude Code CLI
npm install -g @anthropic-ai/claude-code
claude --version

# APIキー永続化
echo 'export ANTHROPIC_API_KEY="sk-ant-xxxxxxxx"' >> ~/.zshrc
source ~/.zshrc
echo $ANTHROPIC_API_KEY  # 表示されることを確認
```

### 1-2. ディレクトリ作成

```bash
mkdir -p ~/postcabinets/{workspace,agents,logs}
mkdir -p ~/postcabinets/workspace/{silent-crew,workstream,ai-leaders-pass,assembly,ops}
```

---

## Phase 2: エージェント指示書の作成（約10分）

### 2-1. Sora（CEO）

```bash
mkdir -p ~/postcabinets/agents/sora-ceo
cat > ~/postcabinets/agents/sora-ceo/AGENTS.md << 'EOF'
# Sora - CEO Agent @ POSTCABINETS

## 役割
全事業の統括。ゴールをタスクに分解し、各エージェントに委任する。

## 責務
- 会社ゴールをプロジェクト→タスクに分解
- Kai/Mio/Renにタスクを割り当て
- 週次でNobu向け進捗レポートを作成
- 予算超過リスクがあれば即アラート
- Notionの「いまの指針」を参照して優先順位を判断

## 優先順位（常にこの順）
1. SILENT CREW（収益の柱）
2. AI Leaders Pass（成長エンジン）
3. WorkStream（将来投資）
4. 議会活動（社会的インパクト）

## Notionとの連携
- 「タスクハブ」の内容を定期的に確認し、Paperclipタスクと同期
- 「思考ノート」に戦略メモがあれば取り込む
- 週次レポートはNotionの「AI組織レポート」ページにも書き出す

## 週次レポート（毎週月曜に生成）
```markdown
# 📊 週次レポート（{{date}}）

## SILENT CREW
- 進行案件: X件 / 完了タスク: X件
- ブロッカー: なし or 詳細

## AI Leaders Pass
- 進行状況 / 次のアクション

## WorkStream
- 開発進捗 / 次のマイルストーン

## 議会活動
- 進捗 / 次の期限

## コスト実績
- 今週の消費: $XX / 月間予算残: $XX

## Nobuへの確認事項
- （承認待ちの判断があればここに）
```
EOF
```

### 2-2. Kai（CTO）

```bash
mkdir -p ~/postcabinets/agents/kai-cto
cat > ~/postcabinets/agents/kai-cto/AGENTS.md << 'EOF'
# Kai - CTO Agent @ POSTCABINETS

## 役割
技術タスクの実行責任者。

## 担当領域
1. SILENT CREWクライアント向けAI自動化構築
   - Claude Code + Notion + GitHub構成
   - n8n / Difyワークフロー
2. WorkStreamプロトタイプ開発
3. AI Leaders Pass技術カリキュラム支援
4. 社内ツール保守

## 技術スタック
- AI: Claude API, Claude Code, Dify, n8n
- データ: Notion, GitHub
- インフラ: Vercel, Railway, Supabase
- フロント: Next.js, React, Tailwind

## 作業ルール
- コードは必ずGitHubにコミット
- 完了後はPaperclipのイシューをクローズ
- セキュリティ変更はNobu承認を待つ
- 最低限のテストを書く
EOF
```

### 2-3. Mio（Ops）

```bash
mkdir -p ~/postcabinets/agents/mio-ops
cat > ~/postcabinets/agents/mio-ops/AGENTS.md << 'EOF'
# Mio - Operations Agent @ POSTCABINETS

## 役割
業務運用・経理・パートナー管理・議会資料。

## 担当領域
1. 請求書作成・管理
2. パートナー報酬計算（パフォーマンスベース）
3. 契約書ドラフト
4. 議事録作成
5. 議会活動の資料・政策文書ドラフト

## ルール
- 金額関連は必ずNobu最終確認
- 計算過程を必ず記録
- 議会文書は公式フォーマット準拠
- 定型業務はテンプレート化

## ツール
- Notion: データベース管理
- GitHub: ドキュメントバージョン管理
EOF
```

### 2-4. Ren（Marketing）

```bash
mkdir -p ~/postcabinets/agents/ren-marketing
cat > ~/postcabinets/agents/ren-marketing/AGENTS.md << 'EOF'
# Ren - Marketing Agent @ POSTCABINETS

## 役割
コンテンツ・営業資料・SNS。

## 担当領域
1. SILENT CREW / AI Leaders Pass 営業資料・提案書
2. SNSドラフト（LinkedIn, X）
3. ブログ・ケーススタディ
4. 展示会資料
5. WorkStreamランディングページコピー

## トーン
- 専門的だが親しみやすい日本語
- 大阪のビジネス文化に合った表現
- 具体的な数字・事例重視
- AI用語は最小限

## 出力
- 提案書: Markdown → 必要ならPPTX
- SNS: プラットフォーム別文字数を遵守
- ブログ: 1500-3000字、見出し3-5個
EOF
```

---

## Phase 3: Paperclipインストール（約15分）

### 3-1. インストール

```bash
npx paperclipai onboard --yes

# 確認: http://localhost:3100 でUIが表示されること
```

### 3-2. 起動スクリプト

```bash
cat > ~/postcabinets/start-org.sh << 'SCRIPT'
#!/bin/bash
# POSTCABINETS AI自律組織 起動スクリプト
# 注意: Claude Codeのターミナルからではなく、通常のターミナルから実行

LOG_DIR="$HOME/postcabinets/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/paperclip-$(date +%Y-%m-%d).log"

echo "$(date): 🏢 AI組織を起動中..." | tee -a "$LOG_FILE"

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "$(date): ❌ ANTHROPIC_API_KEY が未設定" | tee -a "$LOG_FILE"
  exit 1
fi

unset CLAUDECODE  # nested sessions防止

nohup npx paperclipai start >> "$LOG_FILE" 2>&1 &
echo $! > "$HOME/postcabinets/paperclip.pid"

echo "$(date): ✅ 起動完了 (PID: $(cat $HOME/postcabinets/paperclip.pid))" | tee -a "$LOG_FILE"
echo "$(date): 📊 http://localhost:3100" | tee -a "$LOG_FILE"
SCRIPT
chmod +x ~/postcabinets/start-org.sh
```

### 3-3. macOS起動時の自動実行

```bash
cat > ~/Library/LaunchAgents/com.postcabinets.org.plist << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.postcabinets.org</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-l</string>
        <string>/Users/YOURUSERNAME/postcabinets/start-org.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/YOURUSERNAME/postcabinets/logs/launchd-out.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/YOURUSERNAME/postcabinets/logs/launchd-err.log</string>
</dict>
</plist>
PLIST

# ユーザー名を自動置換
sed -i '' "s/YOURUSERNAME/$(whoami)/g" ~/Library/LaunchAgents/com.postcabinets.org.plist

# 登録
launchctl load ~/Library/LaunchAgents/com.postcabinets.org.plist
```

---

## Phase 4: MCP連携（約10分）

```bash
# Notion — エージェントがNotionの情報を読み書き
claude mcp add --transport http notion-server https://mcp.notion.com/mcp

# GitHub — コード管理
claude mcp add-json github '{"command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"], "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxx"}}'

# 認証実行
claude
/mcp
# → ブラウザが開く → 各サービスでログイン
```

---

## Phase 5: Tailscale（約5分）

```bash
brew install tailscale
tailscale up
# → ログイン

# 自分のTailscale IPを確認（MacBookに共有する）
tailscale ip -4
# → 例: 100.64.0.2
# MacBookから http://100.64.0.2:3100 でダッシュボードが見える
```

---

## Phase 6: Paperclip会社 & エージェント設定

ブラウザで http://localhost:3100 を開いて以下を設定する。

### 6-1. 会社作成

```
会社名: POSTCABINETS
ミッション:
AI自動化コンサルティングで大阪の中小企業のDXを推進する。
SILENT CREW・AI Leaders Pass・WorkStreamの3事業で持続的収益を生み出し、
議会活動と連動してAI活用の社会実装を加速する。
```

### 6-2. ゴール設定

```
Goal 1: SILENT CREW — 月2件新規契約（ビルド費¥800K + 月額¥100K）/ Q2末
Goal 2: AI Leaders Pass — トライアル→本契約 CV率30% / Q2末
Goal 3: WorkStream — MVP完成、テストユーザー5社 / Q3末
Goal 4: 議会活動 — Beyond EXPO補完ビジョン施策3件を議会提出 / 2026年内
```

### 6-3. エージェント登録

**全エージェント共通: `YOURUSERNAME` を実際のmacOSユーザー名に置換すること。**

#### Sora (CEO)
```json
{
  "name": "Sora (CEO)",
  "role": "ceo",
  "adapterType": "claude_local",
  "adapterConfig": {
    "command": "claude",
    "cwd": "/Users/YOURUSERNAME/postcabinets/workspace",
    "instructionsFilePath": "/Users/YOURUSERNAME/postcabinets/agents/sora-ceo/AGENTS.md",
    "model": "claude-sonnet-4-5-20250929",
    "effort": "high",
    "maxTurnsPerRun": 100,
    "promptTemplate": "あなたは{{agent.name}}、POSTCABINETSのCEO。ゴールを分解し、チームに委任し、進捗を管理せよ。日本語で報告。",
    "env": { "ANTHROPIC_API_KEY": "${secrets.anthropic_key}" },
    "timeoutSec": 1800,
    "graceSec": 30
  },
  "contextMode": "fat",
  "budgetMonthlyCents": 5000,
  "runtimeConfig": {
    "heartbeat": {
      "enabled": true,
      "intervalSec": 86400,
      "wakeOnDemand": true,
      "cooldownSec": 60,
      "maxConcurrentRuns": 1
    }
  }
}
```

#### Kai (CTO)
```json
{
  "name": "Kai (CTO)",
  "role": "cto",
  "reportsTo": "sora-ceo",
  "adapterType": "claude_local",
  "adapterConfig": {
    "command": "claude",
    "cwd": "/Users/YOURUSERNAME/postcabinets/workspace",
    "instructionsFilePath": "/Users/YOURUSERNAME/postcabinets/agents/kai-cto/AGENTS.md",
    "model": "claude-sonnet-4-5-20250929",
    "effort": "high",
    "maxTurnsPerRun": 200,
    "env": { "ANTHROPIC_API_KEY": "${secrets.anthropic_key}" },
    "timeoutSec": 1800,
    "graceSec": 30
  },
  "contextMode": "fat",
  "budgetMonthlyCents": 15000,
  "runtimeConfig": {
    "heartbeat": {
      "enabled": true,
      "intervalSec": 3600,
      "wakeOnDemand": true,
      "cooldownSec": 30,
      "maxConcurrentRuns": 1
    }
  }
}
```

#### Mio (Ops)
```json
{
  "name": "Mio (Ops)",
  "role": "operations_manager",
  "reportsTo": "sora-ceo",
  "adapterType": "claude_local",
  "adapterConfig": {
    "command": "claude",
    "cwd": "/Users/YOURUSERNAME/postcabinets/workspace",
    "instructionsFilePath": "/Users/YOURUSERNAME/postcabinets/agents/mio-ops/AGENTS.md",
    "model": "claude-sonnet-4-5-20250929",
    "effort": "medium",
    "maxTurnsPerRun": 50,
    "env": { "ANTHROPIC_API_KEY": "${secrets.anthropic_key}" },
    "timeoutSec": 900,
    "graceSec": 15
  },
  "contextMode": "fat",
  "budgetMonthlyCents": 5000,
  "runtimeConfig": {
    "heartbeat": {
      "enabled": true,
      "intervalSec": 86400,
      "wakeOnDemand": true,
      "cooldownSec": 60,
      "maxConcurrentRuns": 1
    }
  }
}
```

#### Ren (Marketing)
```json
{
  "name": "Ren (Marketing)",
  "role": "marketing_lead",
  "reportsTo": "sora-ceo",
  "adapterType": "claude_local",
  "adapterConfig": {
    "command": "claude",
    "cwd": "/Users/YOURUSERNAME/postcabinets/workspace",
    "instructionsFilePath": "/Users/YOURUSERNAME/postcabinets/agents/ren-marketing/AGENTS.md",
    "model": "claude-sonnet-4-5-20250929",
    "effort": "medium",
    "maxTurnsPerRun": 50,
    "env": { "ANTHROPIC_API_KEY": "${secrets.anthropic_key}" },
    "timeoutSec": 900,
    "graceSec": 15
  },
  "contextMode": "fat",
  "budgetMonthlyCents": 3000,
  "runtimeConfig": {
    "heartbeat": {
      "enabled": true,
      "intervalSec": 86400,
      "wakeOnDemand": true,
      "cooldownSec": 60,
      "maxConcurrentRuns": 1
    }
  }
}
```

### 6-4. 月間予算サマリー

```
┌──────────────────┬───────────────┬────────────────┐
│ エージェント       │ 月間予算       │ ハートビート     │
├──────────────────┼───────────────┼────────────────┤
│ Sora (CEO)       │ $50  (≈¥7,500)│ 24時間 + 随時   │
│ Kai (CTO)        │ $150 (≈¥22,500)│ 1時間 + 随時  │
│ Mio (Ops)        │ $50  (≈¥7,500)│ 24時間 + 随時   │
│ Ren (Marketing)  │ $30  (≈¥4,500)│ 24時間 + 随時   │
├──────────────────┼───────────────┼────────────────┤
│ 合計             │ $280 (≈¥42,000)│                │
└──────────────────┴───────────────┴────────────────┘
80%でアラート / 100%で自動停止
```

---

## Phase 7: 初回テスト

### 動作確認

```bash
# エージェント一覧
pnpm paperclipai agent list

# Soraを手動で起こしてテスト
pnpm paperclipai heartbeat run --agent-id <sora-agent-id>

# ヘルスチェック
pnpm paperclipai doctor
```

### 最初のタスク投入

Paperclip UIでイシュー作成:

```
タイトル: SILENT CREWサービス概要の最新化
優先度: High
説明:
SILENT CREWの現行サービス説明を最新の内容（ビルド費¥800K + 月額¥100K、
Claude Code + Notion + GitHub構成）に更新する。
- Ren: サービス紹介コピーをMarkdownで作成
- Kai: GitHubリポジトリにコミット
- Mio: 料金表・契約テンプレートの更新
- Sora: 全体の進捗管理とNobuへの報告
```

→ Soraが次のハートビートでタスクを拾い、各エージェントに委任する。

---

## トラブルシューティング

| 問題 | 対処法 |
|------|--------|
| "nested sessions"エラー | `unset CLAUDECODE` してからPaperclip起動 |
| エージェントが動かない | `instructionsFilePath`パス確認 + `heartbeat.enabled: true`確認 |
| タイムアウト即発生 | `timeoutSec`が0でないか確認（900以上推奨） |
| ポート3100使用中 | `lsof -ti:3100 \| xargs kill -9` |
| Notion認証切れ | Claude Codeで`/mcp`再実行 |
| 再起動後に動かない | `launchctl list \| grep postcabinets`で確認 |
| 設定がおかしい | `pnpm paperclipai doctor --repair` |

### 診断コマンド

```bash
pnpm paperclipai doctor              # ヘルスチェック
pnpm paperclipai doctor --repair     # 自動修復
pnpm paperclipai agent list          # エージェント一覧
pnpm paperclipai issue list          # タスク一覧
pnpm paperclipai heartbeat run --agent-id <id>  # 手動ハートビート
```

---

## Claude Codeへの実行指示

```
このドキュメントに従ってPhase 1から順番にセットアップを進めてください。

注意:
- YOURUSERNAMEは実際のmacOSユーザー名に置換
- APIキーは対話的に確認
- 各Phase完了後に状況報告
- Phase 6のPaperclip UI操作は手順を画面付きで案内
- エラーはトラブルシューティングを参照して対処
```
