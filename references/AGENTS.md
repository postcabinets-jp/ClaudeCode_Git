# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

---

## 言語・コミュニケーション

- **日本語**で対応する（英語指示がある場合を除く）
- 絵文字は使わない
- 確信のないことは「未確認」「要確認」と明示する。推測で埋めない

---

## セッションワークフロー

Notion が唯一の正本（Single Source of Truth）。

- **セッション開始時**: Notion Tasks（Owner = Claude / Either）と Active Projects を確認する
- **セッション終了時**: Tasks / Decisions の更新案を箇条書きで提示する
- 方針変更は `CLAUDE.md` と Notion Decisions の両方を更新する

意思決定の境界:
- **Nobu（人）が判断**: 価格・契約・公開コピー・個人情報・自動送信可否・Go/No-Go
- **エージェントが実行**: 調査・下書き・実装・Notion 更新案の提示・Discord 通知

---

## コマンド集

### ルートワークスペース（Node.js ESM）

前提: Node 20+、`.env` に `NOTION_TOKEN` / `NOTION_PARENT_PAGE_ID`

```bash
npm run bootstrap          # 初回セットアップ: notion:verify → hub → seed → discord:test
npm run notion:verify      # Notion 疎通確認
npm run notion:hub         # Hub DB 作成 + .notion-hub.json 生成
npm run notion:reset       # Hub を全リセット（子 DB アーカイブ → 再作成 → seed）
npm run pulse:discord      # Active Projects + オープン Tasks を Discord 投稿
npm run session:log        # セッションログを Notion に記録
npm run weekly:review      # 週次レビュー生成
npm run linkedin:generate  # LinkedIn 投稿下書き生成
npm run linkedin:post      # LinkedIn に投稿（Playwright）
npm run linear:loop        # Linear Agent Loop 起動
npm run morning:post       # Discord 朝の投稿
npm run claw               # Claw 自動化スクリプト
npm run line:dev           # LINE bot 開発サーバー（watch モード）
npm run ttyd:start         # リモートターミナル起動（ttyd + Tailscale）
npm run remote:start       # リモートアクセス Web アプリ起動
```

### ai-crowdsourcing/frontend（Next.js 16 + React 19）

```bash
cd ai-crowdsourcing/frontend
npm run dev        # 開発サーバー起動（http://localhost:3000）
npm run build      # プロダクションビルド
npm run lint       # ESLint 実行
npx tsc --noEmit   # 型チェック
```

### ai-crowdsourcing/backend（FastAPI + Python）

```bash
cd ai-crowdsourcing/backend
source venv/bin/activate
uvicorn main:app --reload --port 8000  # 開発サーバー
pytest                                  # 全テスト実行
pytest tests/test_matching.py          # 単一テストファイル実行
pytest tests/test_matching.py::test_compute_similarity  # 単一テスト実行
```

---

## アーキテクチャ概要

このリポジトリは Nobu（POST CABINETS 代表）の**個人 AI 駆動ワークスペース**。複数のサブプロジェクトが共存する。

### ルートスクリプト群（`scripts/`）

Node.js ESM モジュール。`scripts/lib/` に共通ライブラリあり。

- **Notion 連携** (`lib/notion.mjs`, `lib/notion-tasks.mjs`): タスク・プロジェクト・決定の CRUD
- **自律ループ** (`autonomous-loop.mjs`): morning/sync/weekly の 3 モードで定期実行
- **Linear エージェントループ** (`linear-agent-loop.mjs`): Linear Issue を Claude が自動処理
- **LinkedIn 自動化** (`linkedin-generate.mjs` → `linkedin-post.mjs`): Notion から下書き生成 → Playwright で投稿
- **Discord Bot** (`lib/discord-bot.mjs`): 通知・朝の投稿・返信
- **リモートアクセス** (`remote-app/server.mjs` + `ttyd`): Tailscale 経由のモバイルアクセス
- **launchd** (`scripts/launchd/`): macOS での常駐サービス設定（.example → 実際のファイルにコピーして使用）

### ai-crowdsourcing（フルスタック MVP）

AI クラウドソーシングプラットフォーム。

**フロントエンド** (`ai-crowdsourcing/frontend/`):
- Next.js 16 / React 19 App Router。`app/(client)/` が主要 UI ルートグループ
- `lib/api.ts`: バックエンド API の型付きクライアント（全 API 呼び出しはここ経由）
- `lib/supabase.ts`: Supabase ブラウザクライアント
- `components/client/`: `PostWizard`（案件投稿）、`ProjectBoard`（案件一覧）、`WorkerCard`（ワーカー表示）
- UI コンポーネントは `components/ui/`（shadcn + Base UI）
- Tailwind v4（PostCSS 設定。v3 とは設定ファイル形式が異なる）

**バックエンド** (`ai-crowdsourcing/backend/`):
- FastAPI。3 ルーター: `projects`、`matching`、`payments`
- `services/wizard.py`: OpenAI で案件要件を構造化（LLM 抽出）
- `services/embedding.py`: OpenAI Embeddings でベクトル生成
- `services/matching.py`: コサイン類似度でワーカーとマッチング
- `services/stripe.py`: Stripe 決済（authorize → capture の 2 段階）
- `db/supabase.py`: Supabase クライアント（環境変数から初期化）
- `venv/` は Python 3.14 の仮想環境（コミット対象外）

**案件作成フロー**:
`PostWizard` → `POST /projects` → wizard（LLM 要件構造化）+ embedding 生成 → Supabase 保存 → `GET /projects/{id}/matches` → コサイン類似度でワーカー候補取得 → `PATCH /projects/{id}/assign` → Stripe authorize → capture

**デプロイ**:
- Frontend: Vercel（`NEXT_PUBLIC_API_URL`、`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- Backend: Railway または Render（`OPENAI_API_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、`STRIPE_SECRET_KEY`、`FRONTEND_URL`）
- DB: Supabase（詳細は `ai-crowdsourcing/DEPLOY.md`）

### その他のサブプロジェクト

- **`notchy/`**: macOS SwiftUI アプリ。MacBook ノッチ領域にターミナルパネルを表示する
- **`ScreenRecorder/`**: macOS スクリーンレコーダー（Swift）
- **`voicetyping/`**: iOS/Android/Mac 音声入力アプリ（Firebase Functions + XcodeGen）
- **`line-bot/`**: LINE Bot サーバー（Node.js ESM）
- **`claude-config/`**: Claude Code のエージェント・コマンド定義と プロジェクトメモリ
- **`context/`**: Nobu のプロフィール・事業・優先事項・目標（セッション参照用）
- **`cases/`**: POST CABINETS の顧客ケース事例ドキュメント
- **`Gollira/`・`reskilling/`**: AI 研修コンテンツ

---

## 環境変数

| ファイル | 用途 |
|---|---|
| `.env`（ルート）| `NOTION_TOKEN`、`DISCORD_BOT_TOKEN`、`DISCORD_WEBHOOK_URL` |
| `ai-crowdsourcing/frontend/.env.local` | `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`NEXT_PUBLIC_API_URL` |
| `ai-crowdsourcing/backend/.env` | `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`OPENAI_API_KEY`、`STRIPE_SECRET_KEY` |

`.env.example` にプレースホルダあり。シークレットは絶対にコミットしない。

---

## 注意点

- **Next.js 16 / React 19**: トレーニングデータと API が異なる可能性あり。コード変更前に `node_modules/next/dist/docs/` を確認すること
- **Tailwind v4**: `tailwind.config.js` ではなく `postcss.config.mjs` で設定
- **ルートスクリプトは ESM のみ**: `require()` ではなく `import` を使う（`"type": "module"` は未設定だが拡張子 `.mjs`）
- **`decisions/log.md`**: 重要な決定は追記専用。フォーマット: `[YYYY-MM-DD] DECISION: ... | REASONING: ... | CONTEXT: ...`
