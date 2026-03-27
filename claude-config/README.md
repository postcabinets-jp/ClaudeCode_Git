# Claude Code 設定バックアップ

この `claude-config/` には `~/.claude/` のカスタム設定一式が含まれています。
新しいマシンに移行する際は `restore.sh` を実行してください。

## 構成

```
claude-config/
├── CLAUDE.md                    # グローバル指示 (~/.claude/CLAUDE.md)
├── settings.json                # メイン設定 (APIキーはマスク済み)
├── settings.local.json.example  # ローカル設定テンプレート (シークレット空欄)
├── agents/                      # カスタムエージェント定義
├── commands/                    # スラッシュコマンド定義
├── skills/                      # スキル定義
├── channels/discord/            # Discordチャネル設定
├── homunculus/                  # プロジェクトレジストリ
├── project-memory/              # プロジェクト固有メモリ
├── installed_plugins.json       # 有効プラグイン一覧
├── known_marketplaces.json      # マーケットプレイス設定
└── plugins-blocklist.json       # プラグインブロックリスト
```

## リストア手順

```bash
cd "claude for me"
bash claude-config/restore.sh
```

リストア後に手動で必要なもの:
1. `~/.claude/settings.local.json` にAPIキーを記入
2. `~/.claude/settings.json` の `BRAVE_API_KEY` を記入
3. MCPサーバーの再インストール (`npm install` in each)
4. プラグインの再インストール (Claude Code内で自動)
