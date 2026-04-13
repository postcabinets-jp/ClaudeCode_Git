# Tanuki — ローカル自律エージェント

変幻自在に何でもこなすローカルAIエージェント。Ollama + Qwen3:8b + MCP対応。

## セットアップ

```bash
brew install ollama
ollama serve          # 別ターミナル
ollama pull qwen3:8b

cd projects/tanuki
python3 -m venv venv
source venv/bin/activate
pip install requests
```

## 使い方

```bash
source venv/bin/activate
python3 agent.py
```

## 設定: tanuki.json

```json
{
  "model": "qwen3:8b",
  "ollamaUrl": "http://localhost:11434/api/chat",
  "maxToolSteps": 10,
  "maxHistory": 50,
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/apple"],
      "env": {}
    }
  }
}
```

MCPサーバーは `mcpServers` に追加するだけで接続される。Claude Codeと同じ形式。

## ビルトインツール

| ツール | 機能 |
|--------|------|
| `run_shell` | シェルコマンド実行 |
| `read_file` | ファイル読み込み |
| `write_file` | ファイル書き込み |
| `list_files` | ディレクトリ一覧 |
| `web_search` | Web検索 |

## MCPサーバーの追加例

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/apple"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": { "BRAVE_API_KEY": "your-key-here" }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token" }
    }
  }
}
```

## コマンド

| コマンド | 機能 |
|----------|------|
| `/clear` | 会話履歴を削除 |
| `/history` | 会話ターン数を表示 |
| `/tools` | 接続中のツール一覧 |
| `/quit` | 保存して終了 |

## アーキテクチャ

```
You: やりたいこと
     ↓
[会話履歴 + システムプロンプト] → Qwen3:8b (Ollama)
     ↓
  会話なら → そのまま応答
  ツールが必要なら ↓
     ↓
  ビルトインツール → Python直接実行
  MCPツール → JSON-RPC over stdio → MCPサーバー
     ↓
  結果をLLMに返す → 繰り返し（最大10回）
     ↓
Tanuki: 結果報告
```

## ファイル構成

```
tanuki/
├── agent.py        # メインのエージェント（チャットループ + ツール実行）
├── mcp_client.py   # MCPクライアント（サーバー起動・通信・ツール管理）
├── tanuki.json     # 設定ファイル（モデル・MCPサーバー定義）
├── history.json    # 会話履歴（自動保存）
├── venv/           # Python仮想環境
└── README.md
```
