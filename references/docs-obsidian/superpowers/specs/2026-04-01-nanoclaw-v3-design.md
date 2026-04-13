# NanoClaw v3 設計仕様書

**日付**: 2026-04-01
**ステータス**: 承認済み
**目的**: NanoClawを軽量常駐REPLから、ツール実行可能なエージェントに進化させる

---

## 1. ポジショニング

NanoClaw v3は**軽量・常駐型のローカルエージェント**。Claude Codeが重量級のフルスタックエージェントなのに対し、NanoClawは日常の小タスク（調べもの、ファイル操作、ブラウザチェック）をサッと済ませる。

- **主用途**: 対話型エージェント（REPL）
- **将来拡張**: 自律ループ、特化ジョブ実行
- **モデル**: gemini-3-flash-preview（デフォルト）、ランタイム切替可能
- **設計原則**: デーモン本体はゼロ依存維持、プラグインは依存あり許容

## 2. アーキテクチャ

```
┌──────────────────────────────────────────────┐
│  NanoClaw Daemon (claw-daemon.mjs)           │
│                                               │
│  ┌───────────┐  ┌──────────────────────────┐ │
│  │ REPL      │  │ Plugin Manager           │ │
│  │ Protocol  │  │  - discover(pluginsDir)  │ │
│  │ (UNIX     │  │  - load(name)            │ │
│  │  socket)  │  │  - unload(name)          │ │
│  └─────┬─────┘  │  - config.json 管理      │ │
│        │        └──────────┬───────────────┘ │
│        │                   │                  │
│  ┌─────▼───────────────────▼────────────────┐│
│  │ Tool Registry                             ││
│  │  tools: Map<name, {schema, fn}>           ││
│  │  toGeminiFunctionDeclarations()           ││
│  └──────────────┬───────────────────────────┘│
│                 │                              │
│  ┌──────────────▼───────────────────────────┐│
│  │ Gemini Engine                             ││
│  │  - Function Calling 対応                  ││
│  │  - Tool Execution Loop (max 10)          ││
│  │  - Streaming response                    ││
│  └──────────────────────────────────────────┘│
└──────────────────────────────────────────────┘
```

### コンポーネント

| コンポーネント | 責務 |
|--------------|------|
| **REPL Protocol** | UNIX socket通信、EOT区切り、クライアント接続管理 |
| **Plugin Manager** | プラグインディレクトリ走査、動的import、ライフサイクル管理 |
| **Tool Registry** | ツール登録・検索、Gemini Function Calling定義への変換 |
| **Gemini Engine** | API呼び出し、Function Callingループ、ストリーミング |

## 3. Plugin System

### 3.1 ディレクトリ構造

```
~/.claude/claw/
├── claw.sock              # UNIX socket
├── config.json            # プラグイン設定
├── default.md             # セッションファイル
└── plugins/
    ├── bash/
    │   └── index.mjs
    ├── fs/
    │   └── index.mjs
    ├── browser/
    │   ├── index.mjs
    │   └── package.json   # playwright依存
    ├── fetch/
    │   └── index.mjs
    └── mcp-bridge/
        └── index.mjs
```

### 3.2 プラグインAPI

各プラグインは `index.mjs` から以下をexportする:

```js
// 必須
export const meta = {
  name: "plugin-name",
  version: "1.0.0",
  description: "What this plugin does"
};

// 必須: ツール定義の配列
export const tools = [
  {
    name: "tool_name",
    description: "Human-readable description for Gemini",
    parameters: {
      type: "object",
      properties: {
        param1: { type: "string", description: "..." }
      },
      required: ["param1"]
    },
    execute: async (args, context) => {
      // context: { session, config, log }
      return { result: "..." };
    }
  }
];

// 任意: 初期化（ブラウザ起動など）
export async function init(config) {}

// 任意: 破棄（リソース解放）
export async function destroy() {}
```

### 3.3 config.json

```json
{
  "model": "gemini-3-flash-preview",
  "maxToolCalls": 10,
  "plugins": {
    "bash": {
      "enabled": true,
      "allowList": []
    },
    "fs": {
      "enabled": true,
      "rootDir": "~"
    },
    "browser": {
      "enabled": true,
      "headless": true
    },
    "fetch": {
      "enabled": true
    },
    "mcp-bridge": {
      "enabled": false,
      "servers": {}
    }
  }
}
```

- `plugins/`ディレクトリに存在するがconfig.jsonに記載がないプラグインは、デフォルトで`enabled: true`
- config.jsonで`enabled: false`にすると読み込まない
- プラグイン固有の設定値は`init(config)`で渡される

### 3.4 Plugin Manager

```
discover()
  → pluginsDir内のディレクトリを走査
  → 各ディレクトリのindex.mjsをチェック
  → config.jsonのenabled状態と照合
  → 有効なプラグインリストを返す

load(name)
  → dynamic import(`plugins/${name}/index.mjs`)
  → meta, tools をバリデーション
  → init(config)を呼び出し
  → Tool Registryに登録

unload(name)
  → destroy()を呼び出し
  → Tool Registryから削除

reload(name)
  → unload → load
```

## 4. Gemini Function Calling統合

### 4.1 リクエスト形式

```js
{
  contents: [...history, { role: "user", parts: [{ text: prompt }] }],
  tools: [{
    functionDeclarations: [
      // Tool Registryから自動生成
      {
        name: "run_command",
        description: "Run a shell command and return output",
        parameters: {
          type: "OBJECT",
          properties: {
            command: { type: "STRING", description: "Shell command to run" }
          },
          required: ["command"]
        }
      }
    ]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 8192
  }
}
```

### 4.2 ツール実行ループ

```
1. ユーザー入力 → Gemini API送信（ツール定義付き）
2. レスポンス解析:
   a. テキスト応答 → ストリーム表示して終了
   b. functionCall → ステップ3へ
3. ツール実行:
   a. Tool Registryから該当ツールを取得
   b. execute(args, context) を呼び出し
   c. 実行中の表示: "[tool] run_command({command: 'ls'})"
   d. 結果をfunctionResponseとしてGeminiに返す
4. ステップ2に戻る（最大10回）
5. 10回超えたら強制テキスト応答を要求
```

### 4.3 ストリーミング

- テキスト応答: チャンクごとにソケットに書き出し（現行v2通り）
- ツール呼び出し: 非ストリーミング（`generateContent`エンドポイント使用）
- ツール実行中の状態表示: `\n⚙ [tool_name] executing...\n` をソケットに書き出し

## 5. 組み込みプラグイン

### 5.1 bash

| ツール | 引数 | 説明 |
|--------|------|------|
| `run_command` | `command: string` | シェルコマンド実行、stdout/stderrを返す |

- `child_process.execFile('/bin/sh', ['-c', command])`を使用
- タイムアウト: 30秒
- `allowList`が空の場合は全コマンド許可（ローカル環境前提）
- `allowList`にコマンド名がある場合はプレフィクスチェック

### 5.2 fs

| ツール | 引数 | 説明 |
|--------|------|------|
| `read_file` | `path: string` | ファイル内容を読む |
| `write_file` | `path: string, content: string` | ファイルに書き込む |
| `list_dir` | `path: string` | ディレクトリ一覧 |

- `rootDir`からの相対パスに正規化
- `realpath()`でシンボリックリンク解決後にrootDir内かチェック
- パストラバーサル防止

### 5.3 browser

| ツール | 引数 | 説明 |
|--------|------|------|
| `browser_navigate` | `url: string` | URLに遷移、テキスト内容を返す |
| `browser_click` | `selector: string` | 要素をクリック |
| `browser_type` | `selector: string, text: string` | テキスト入力 |
| `browser_screenshot` | `path?: string` | スクリーンショット撮影 |
| `browser_extract` | `selector: string` | 要素のテキスト抽出 |

- Playwright（chromium）を使用
- `init()`でブラウザインスタンス起動、`destroy()`で終了
- 1つのブラウザコンテキストを共有、タブは必要に応じて作成
- `headless: true`がデフォルト

### 5.4 fetch

| ツール | 引数 | 説明 |
|--------|------|------|
| `http_request` | `url, method?, headers?, body?` | HTTPリクエスト実行 |

- Node.js組み込み`fetch`を使用（ゼロ依存）
- レスポンスボディは最大100KBで切り捨て

### 5.5 mcp-bridge

| ツール | 動的 | 説明 |
|--------|------|------|
| MCPサーバーが公開するツール | サーバーによる | MCPプロトコル経由でツール呼び出し |

- config.jsonの`servers`にMCPサーバー設定を記載
- 起動時にMCPサーバーに接続、ツール一覧を取得してTool Registryに登録
- ツール名は`mcp_{server}_{tool}`形式でプレフィックス

## 6. 新規コマンド

既存コマンドに加えて:

| コマンド | 説明 |
|----------|------|
| `/plugins` | 読み込み済みプラグイン一覧（有効/無効状態） |
| `/enable <plugin>` | プラグインを有効化してロード |
| `/disable <plugin>` | プラグインを無効化してアンロード |
| `/reload [plugin]` | プラグイン再読み込み（全体 or 指定） |
| `/tools` | 利用可能なツール一覧 |

## 7. セキュリティ

- **bash**: `allowList`でコマンド制限可能。空=全許可（ローカル環境前提）
- **fs**: `rootDir`外アクセス拒否。`realpath()`でシンボリックリンク追跡後チェック
- **browser**: `headless: true`デフォルト。`file://`URLは拒否
- **全ツール**: 実行内容をセッションMarkdownに記録（監査可能）
- **mcp-bridge**: 接続先はconfig.jsonで明示的に設定が必要

## 8. 既存コードへの変更

### claw-daemon.mjs（変更）

- `callGemini()` → Function Calling対応に拡張
  - `tools`パラメータ追加
  - レスポンスの`functionCall`判定とループ処理
  - ストリーミングとnon-streamingの使い分け
- `handleInput()` → ツール実行ステータス表示追加
- 起動時にPlugin Manager初期化、プラグイン読み込み
- 終了時にプラグインdestroy()呼び出し
- `handleCommand()` → 新規コマンド追加

### 新規ファイル

| ファイル | 役割 |
|----------|------|
| `scripts/claw/plugin-manager.mjs` | PluginManager クラス |
| `scripts/claw/tool-registry.mjs` | ToolRegistry クラス |
| `~/.claude/claw/plugins/bash/index.mjs` | bashプラグイン |
| `~/.claude/claw/plugins/fs/index.mjs` | fsプラグイン |
| `~/.claude/claw/plugins/browser/index.mjs` | browserプラグイン |
| `~/.claude/claw/plugins/fetch/index.mjs` | fetchプラグイン |
| `~/.claude/claw/plugins/mcp-bridge/index.mjs` | MCPブリッジプラグイン |
| `~/.claude/claw/config.json` | プラグイン設定 |

### claw.mjs（変更）

- ツール実行中の表示対応（`⚙`プレフィクス行の視覚的区別）

## 9. 実装順序

1. **Phase 1**: Plugin Manager + Tool Registry + config.json
2. **Phase 2**: Gemini Function Calling対応（callGemini拡張）
3. **Phase 3**: bash / fs / fetch プラグイン
4. **Phase 4**: browser プラグイン（Playwright）
5. **Phase 5**: mcp-bridge プラグイン
6. **Phase 6**: 新規コマンド（/plugins, /tools, /enable, /disable, /reload）

## 10. 設計判断

| 判断 | 理由 |
|------|------|
| デーモン本体はゼロ依存維持 | 安定性・起動速度。依存はプラグイン側に閉じ込める |
| Playwright内蔵（プロセス分離しない） | プラグインのライフサイクル管理でカバー。分離は過剰設計 |
| Function Calling使用 | テキストパースより信頼性が高い。Gemini公式サポート |
| ツール実行最大10回/ターン | 無限ループ防止。複雑なタスクには十分 |
| config.jsonで管理 | 有効/無効切替が簡単。プラグイン固有設定も集約 |
| 自動検出 + 明示設定 | 新プラグインを置くだけで動く。無効化は設定で |
