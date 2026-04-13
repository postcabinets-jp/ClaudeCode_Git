# POSTCABINETS Nobuの作業環境 — MacBook Pro セットアップ

> **このファイルをMacBookのClaude Codeにそのまま渡して実行させること。**
> マシン: MacBook Pro M4
> 役割: Nobuが手動で使う作業環境。朝夕の自動ブリーフィングつき。
> 前提: Mac mini側のセットアップ（POSTCABINETS_MACMINI_SETUP.md）が完了していること。

---

## このマシンで動くもの

```
MacBook Pro M4（Nobu稼働時のみ）
├── Claude Code (手動) ── Nobuが直接指示して使う
├── MCP連携 ── Notion / GitHub
├── cron
│   ├── 毎朝9時 → 今日のブリーフィング自動生成
│   └── 毎晩21時 → 日次振り返り自動生成
└── ブラウザ
    ├── Notion ── 普段の作業管理（タスクハブ・思考ノート）
    └── Paperclip ── 週1でゴール進捗確認（Mac mini経由）
```

**このマシンでやること:**
- 普段: Notionを見る。必要なときだけClaude Codeを手動起動。
- 朝夕: 自動生成されたブリーフィングをNotionで読む。
- 週1: Mac miniのPaperclipダッシュボードでAI組織の進捗を確認。

---

## Phase 1: 基盤確認（約5分）

```bash
# Claude Code CLIが入っているか確認
claude --version
# なければ: npm install -g @anthropic-ai/claude-code

# APIキーが設定されているか確認
echo $ANTHROPIC_API_KEY
# なければ:
# echo 'export ANTHROPIC_API_KEY="sk-ant-xxxxxxxx"' >> ~/.zshrc
# source ~/.zshrc

# 作業ディレクトリ
mkdir -p ~/postcabinets/logs
```

---

## Phase 2: MCP連携（約10分）

```bash
# Notion — タスクハブ・思考ノートの読み書き
claude mcp add --transport http notion-server https://mcp.notion.com/mcp

# GitHub — コード管理
claude mcp add-json github '{"command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"], "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxx"}}'

# 認証実行
claude
/mcp
# → ブラウザが開く → 各サービスでログイン → 完了
```

---

## Phase 3: Tailscale（約5分）

```bash
# Mac miniのPaperclipダッシュボードにリモートアクセスするため
brew install tailscale
tailscale up
# → ログイン（Mac miniと同じアカウント）

# Mac miniのTailscale IPを確認して接続テスト
# ブラウザで http://<MAC_MINI_TAILSCALE_IP>:3100 を開く
# → Paperclipダッシュボードが表示されればOK
```

Mac miniのTailscale IPを控えておく:
```
MAC_MINI_IP=__________________（ここに記入: 例 100.64.0.2）
```

---

## Phase 4: cron設定（約10分）

MacBookが起動している間だけ実行される自動タスク。

### 4-1. 朝のブリーフィング（毎朝9時）

Notionのタスクハブと指針を読んで、今日やるべきことをまとめる。

### 4-2. 夜の振り返り（毎夜21時）

今日の進捗を整理し、Mac miniのAI組織の活動サマリーも含める。

### 4-3. cron登録

```bash
# claude CLIのフルパスを確認
which claude
# → 例: /usr/local/bin/claude または /opt/homebrew/bin/claude
# 以下のCLAUDE_PATHを実際のパスに置換すること

CLAUDE_PATH=$(which claude)

crontab -e
```

以下を追加（`CLAUDE_PATH`と`MAC_MINI_IP`を置換）:

```cron
# ===== POSTCABINETS MacBook 定期タスク =====

# 毎朝9時: 今日のブリーフィング
0 9 * * * cd ~/postcabinets && CLAUDE_PATH -p "以下のタスクを実行して:

1. Notionの『タスクハブ』を確認
2. Notionの『いまの指針』を確認
3. 今日Nobuがやるべきことを優先順位付きで3つ以内にまとめる
4. 議会・POSTCABINETS・Adnesの全領域を考慮する
5. まとめた内容をNotionの『タスクハブ』の今日の日付ページに書き出す

フォーマット:
# 📋 今日のブリーフィング（YYYY-MM-DD）
## 最優先
- （1つ）
## やれたら
- （1-2つ）
## AI組織から（もしあれば）
- Paperclipで承認待ちの項目" --allowedTools "Read" "Write" "Bash(curl *)" "mcp__notion-server*" >> ~/postcabinets/logs/morning-$(date +\%Y\%m\%d).log 2>&1

# 毎晩21時: 日次振り返り
0 21 * * * cd ~/postcabinets && CLAUDE_PATH -p "以下のタスクを実行して:

1. Notionの『タスクハブ』の今日の内容を確認
2. 完了したもの・未完了のものを整理
3. Mac miniのPaperclip API (http://MAC_MINI_IP:3100/api) 経由でAI組織の今日の活動サマリーを取得
4. 明日への申し送り事項をNotionに記録

フォーマット:
# 🌙 日次振り返り（YYYY-MM-DD）
## 完了
- ...
## 未完了→明日
- ...
## AI組織の活動
- ..." --allowedTools "Read" "Write" "Bash(curl *)" "mcp__notion-server*" >> ~/postcabinets/logs/evening-$(date +\%Y\%m\%d).log 2>&1
```

### 4-4. テスト実行

```bash
# 朝ブリーフィングの手動テスト
cd ~/postcabinets && claude -p "Notionの『タスクハブ』を確認して、今日やるべきことを3つ以内にまとめて。" --allowedTools "Read" "Write" "mcp__notion-server*"

# ログ確認
ls -la ~/postcabinets/logs/
```

---

## Phase 5: Notion構造の追加（約5分）

既存のページに加えて、AI組織との連携用ページを作成する。
Claude Codeで以下を実行:

```
Notionに以下の2つの新規データベースページを作成してください:

1. 「AI組織レポート」
   - プロパティ:
     - 日付 (Date)
     - レポート種別 (Select: 週次 / 月次 / 臨時)
     - 本文 (Rich Text)
     - 承認待ち (Checkbox)

2. 「AI組織コストログ」
   - プロパティ:
     - 月 (Date)
     - エージェント (Select: Sora / Kai / Mio / Ren)
     - 消費額 (Number, 円)
     - 備考 (Text)

既存の「思考ノート」「タスクハブ」「いまの指針」はそのまま維持。
```

---

## Phase 6: 完了確認チェックリスト

```
□ Claude Code CLI動作確認
□ Notion MCP接続済み
□ GitHub MCP接続済み
□ Tailscaleログイン済み
□ Mac miniのPaperclipにブラウザからアクセスできる
□ cron登録済み（crontab -l で確認）
□ 朝ブリーフィングのテスト実行成功
□ Notionに「AI組織レポート」ページ作成済み
□ Notionに「AI組織コストログ」ページ作成済み
```

---

## 日常の運用リズム

```
┌─────────────────────────────────────────────────────┐
│ 平日                                                │
│   09:00  Notion開く → ブリーフィング確認（2分）        │
│   日中   必要なときだけClaude Code手動起動             │
│          「この提案書作って」「このコード書いて」        │
│   21:00  Notion振り返り確認（2分）                    │
│                                                     │
│ 週1回（月曜）                                        │
│   Paperclipダッシュボード確認（10分）                  │
│   → http://<MAC_MINI_IP>:3100                       │
│   → Soraの週次レポート読む                            │
│   → 承認待ち事項を処理                               │
│   → 来週の方針をPaperclipにタスクとして追加            │
│                                                     │
│ 月1回（月初）                                        │
│   NotionのAI組織コストログ確認                        │
│   → 予算配分の調整が必要か判断                        │
└─────────────────────────────────────────────────────┘
```

## やらなくていいこと

- Mac miniにSSHして操作する（Paperclipのダッシュボードだけで十分）
- 各エージェントへの直接指示（Soraに委任）
- LinearやTrelloなど別のタスク管理ツール
- cronの細かいチューニング（まず1週間回してから調整）

---

## トラブルシューティング

| 問題 | 対処法 |
|------|--------|
| cronが動かない | `crontab -l`で登録確認 + claudeのフルパス確認 |
| Notion認証切れ | Claude Codeで`/mcp`再実行 |
| Mac miniに繋がらない | 両方で`tailscale status`確認 |
| ブリーフィングが空 | `~/postcabinets/logs/morning-*.log`でエラー確認 |
| Claude Codeが見つからない | `which claude`でパス確認、cronに絶対パスを使う |

---

## Claude Codeへの実行指示

```
このドキュメントに従ってPhase 1から順番にセットアップを進めてください。

注意:
- Mac mini側のセットアップが完了していることを前提とする
- APIキーは対話的に確認
- cronのCLAUDE_PATHとMAC_MINI_IPは実際の値に置換
- 各Phase完了後に状況報告
- Notionのページ作成はMCP経由で自動化
```
