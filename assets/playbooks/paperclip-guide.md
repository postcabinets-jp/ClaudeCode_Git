# Paperclip 使い方メモ & 推奨設定

## Paperclipとは

AIエージェントのチームを「会社」として運営するためのオーケストレーションツール。
Node.jsサーバー + React UIで構成。組織図・予算・ガバナンス・タスク管理を提供し、
複数のAIエージェント（Claude Code, OpenClaw, Codex, Cursor等）を一元管理できる。

OSSでセルフホスト。MITライセンス。

---

## クイックスタート

### 方法1: npx（最速）

```bash
npx paperclipai onboard --yes
```

### 方法2: 手動セットアップ

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm dev
```

→ `http://localhost:3100` でAPIサーバー起動。組み込みPostgreSQLが自動作成される。

### 要件

- Node.js 20+
- pnpm 9.15+

---

## デプロイモード

| モード | 説明 | 認証 | 用途 |
|--------|------|------|------|
| `local_trusted` | ローカルのみ（127.0.0.1バインド） | なし | 個人開発・テスト |
| `authenticated` + `private` | LAN/VPN内公開 | Better Authログイン | Tailscale経由でモバイルアクセス等 |
| `authenticated` + `public` | インターネット公開 | Better Authログイン | 本番運用 |

### 環境変数

```bash
# 基本
HOST=127.0.0.1           # バインドアドレス
PORT=3100                 # サーバーポート
DATABASE_URL=             # 未設定なら組み込みPostgres
SERVE_UI=true             # UIをAPIサーバーから配信

# デプロイ設定
PAPERCLIP_DEPLOYMENT_MODE=local_trusted   # or authenticated
PAPERCLIP_DEPLOYMENT_EXPOSURE=private     # or public
PAPERCLIP_PUBLIC_URL=http://localhost:3100 # 外部URL（authenticated時必須）

# データ
PAPERCLIP_HOME=~/.paperclip     # データディレクトリ
PAPERCLIP_INSTANCE_ID=default   # インスタンスID

# 認証（authenticatedモード時）
BETTER_AUTH_SECRET=xxxxx        # 必須。ランダムなシークレット

# LLM APIキー（エージェントが使用）
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

---

## データベース設定

3つのモードから選択：

| モード | 説明 | 設定 |
|--------|------|------|
| `embedded` | 組み込みPostgres（デフォルト） | `DATABASE_URL`未設定でOK |
| `local-docker` | Docker上のPostgres | `DATABASE_URL=postgres://paperclip:paperclip@localhost:5432/paperclip` |
| `supabase` | Supabase | 接続文字列を指定 |

### 自動バックアップ

組み込みPostgresでは自動バックアップが有効（デフォルト1時間ごと）。
手動: `pnpm paperclipai db:backup`

---

## 対応アダプター（エージェントランタイム）

| アダプター | 説明 | 主要設定 |
|-----------|------|---------|
| `claude-local` | Claude Code CLI | `command`, `model`, `cwd` |
| `codex-local` | OpenAI Codex CLI | `command`, `model`, `cwd` |
| `cursor-local` | Cursor IDE CLI | `command`, `model`, `cwd` |
| `gemini-local` | Google Gemini CLI | `command`, `model`, `cwd` |
| `opencode-local` | OpenCode CLI | `command`, `model`, `cwd` |
| `pi-local` | Pi CLI | `command`, `model`, `cwd` |
| `openclaw-gateway` | OpenClaw（WebSocket経由） | ゲートウェイURL |
| `process` | 汎用シェルコマンド | 任意コマンド |
| `http` | Webhook/外部エージェント | エンドポイントURL |

各エージェントの設定に含まれるもの：
- `adapterConfig.command` … 実行コマンド
- `adapterConfig.model` … 使用モデル
- `adapterConfig.cwd` … 作業ディレクトリ
- `adapterConfig.env` … 環境変数
- `adapterConfig.timeoutSec` … タイムアウト

---

## 主要コンセプト

### 会社（Company）
- 1デプロイで複数会社を運営可能（データ完全分離）
- 会社ごとにゴール・プロジェクト・エージェント・予算を設定

### エージェント（Agent）
- 組織図上の「社員」。役職・上司・レポートラインあり
- アダプター経由で各種AIランタイムに接続
- 月次予算でコスト制御（上限到達で停止）

### ハートビート（Heartbeat）
- エージェントを定期的に起動するスケジューラ
- タスクチェック → 作業 → レポートの自動サイクル
- イベントトリガー（タスク割当、@メンション）にも対応

### チケット/イシュー（Issue）
- タスク管理。会話スレッド付き
- ゴール → プロジェクト → イシューの階層で文脈が伝播
- エージェントは「なぜこのタスクをやるのか」を常に把握

### ガバナンス
- ボード（人間）が承認ゲートを設定
- 採用・戦略変更・一時停止をいつでも制御可能
- 設定変更はリビジョン管理付き

---

## CLIコマンド

### セットアップ系

```bash
paperclipai onboard      # 初回セットアップウィザード
paperclipai doctor       # 診断チェック（自動修復付き）
paperclipai configure    # 設定更新（llm, database, server等）
paperclipai run          # 起動（bootstrap + diagnose + start）
paperclipai env          # 環境変数を表示
paperclipai db:backup    # 手動バックアップ
```

### 運用系

```bash
paperclipai company list       # 会社一覧
paperclipai agent list         # エージェント一覧
paperclipai issue list         # イシュー一覧
paperclipai issue create       # イシュー作成
paperclipai approval list      # 承認待ち一覧
paperclipai activity list      # 監査ログ
paperclipai plugin list        # プラグイン一覧
```

---

## 開発コマンド

```bash
pnpm dev              # フル開発（API + UI、watchモード）
pnpm dev:once         # watchなし
pnpm dev:server       # サーバーのみ
pnpm build            # 全ビルド
pnpm typecheck        # 型チェック
pnpm test:run         # テスト実行
pnpm db:generate      # DBマイグレーション生成
pnpm db:migrate       # マイグレーション適用
```

---

## Docker運用

### クイックスタート（組み込みDB）

```bash
docker compose -f docker-compose.quickstart.yml up --build
```

`BETTER_AUTH_SECRET`の設定が必要。

### フル構成（外部Postgres）

```bash
# .env に設定
BETTER_AUTH_SECRET=<ランダム文字列>
PAPERCLIP_PUBLIC_URL=http://localhost:3100

docker compose up
```

Postgres 17 Alpine + Paperclipサーバーの構成。データは`pgdata`と`paperclip-data`ボリュームに永続化。

### Dockerfileのポイント
- Node 20 LTS ベース
- `claude`, `codex`, `opencode-ai` のCLIがプリインストール
- `/paperclip` をボリュームマウントして永続化
- ポート: 3100

---

## 推奨設定パターン

### 個人利用（ローカル）

最小構成。一番手軽。

```bash
npx paperclipai onboard --yes
# → local_trusted モード、組み込みPostgres
```

- Tailscaleを入れればモバイルからもアクセス可能
- 予算設定を忘れずに（暴走防止）

### チーム/本番利用

```bash
# docker-compose.yml を使用
PAPERCLIP_DEPLOYMENT_MODE=authenticated
PAPERCLIP_DEPLOYMENT_EXPOSURE=private   # VPN内ならprivate、公開ならpublic
BETTER_AUTH_SECRET=$(openssl rand -base64 32)
PAPERCLIP_PUBLIC_URL=https://paperclip.example.com
```

- 外部Postgres推奨
- バックアップ設定を確認
- S3ストレージも検討

---

## ストレージ設定

| プロバイダ | 説明 |
|-----------|------|
| `local-disk` | デフォルト。`~/.paperclip/instances/default/data/storage` |
| `s3` | S3互換ストレージ（AWS S3, MinIO等） |

---

## プラグインシステム

Plugin SDKで拡張可能。ナレッジベース、カスタムトレーシング、キューなどを追加できる。

```bash
paperclipai plugin list     # 一覧
paperclipai plugin install  # インストール
```

---

## 参考リンク

- ドキュメント: https://paperclip.ing/docs
- GitHub: https://github.com/paperclipai/paperclip
- Discord: https://discord.gg/m4HZY7xNG3
