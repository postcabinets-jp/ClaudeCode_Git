# POSTCABINETS Dev Kit

Claude Code でアプリ・SaaS開発を爆速で進めるためのテンプレート集。
MCP設定、プロジェクトルール、設計テンプレート、フェーズ別プロンプトを含む。

## ファイル構成

```
postcabinets-dev-kit/
├── setup.sh                          # MCP一括インストール
├── README.md                         # このファイル
│
├── shared/                           # 全プラットフォーム共通
│   ├── CLAUDE.md                     # コーディングルール（コア）
│   ├── .mcp.json                     # 共通MCP設定
│   ├── templates/
│   │   ├── design.md                 # UI設計テンプレート
│   │   ├── prd.md                    # PRDテンプレート
│   │   └── schema.sql               # DBスキーマテンプレート（RLS付き）
│   └── prompts/
│       └── phase-prompts.md          # 各フェーズのClaude Code用プロンプト
│
├── web-saas/                         # Web SaaS用
│   ├── CLAUDE.md                     # Next.js + Clerk + Stripe ルール
│   ├── .mcp.json                     # Figma MCP追加
│   └── scaffold.sh                   # プロジェクト自動生成
│
├── ios/                              # iOS用
│   ├── CLAUDE.md                     # SwiftUI + Supabase ルール
│   ├── .mcp.json                     # XcodeBuildMCP + iOS Simulator追加
│   └── scaffold.sh                   # プロジェクト自動生成
│
└── android/                          # Android / クロスプラットフォーム用
    ├── CLAUDE.md                     # Expo + NativeWind ルール
    ├── .mcp.json                     # Mobile MCP追加
    └── scaffold.sh                   # プロジェクト自動生成
```

## クイックスタート

### 1. 環境変数を設定

```bash
export GITHUB_TOKEN=ghp_xxxxx
export SUPABASE_PROJECT_REF=xxxxx
export FIGMA_API_KEY=figd_xxxxx      # Web SaaSの場合
```

### 2. MCPサーバーをインストール

```bash
# 全プラットフォーム
bash setup.sh all

# または特定のプラットフォームだけ
bash setup.sh web-saas
bash setup.sh ios
bash setup.sh android
```

### 3. プロジェクトを生成

```bash
# Web SaaS
bash web-saas/scaffold.sh my-saas-app

# iOS
bash ios/scaffold.sh MyiOSApp com.postcabinets

# Android / Cross-Platform (Expo)
bash android/scaffold.sh my-mobile-app
```

### 4. 開発開始

```bash
cd my-saas-app
# .env.local にAPIキーを設定
# docs/prd.md にプロダクト要件を記入

claude    # Claude Codeを起動
```

Claude Codeが起動したら、`docs/phase-prompts.md` の Phase 1 プロンプトをコピペ。

## 開発フロー

```
Phase 1: Design → Structure
  PRD記入 → design.md生成 → DBスキーマ生成
  ↓
Phase 2: Scaffold → Boilerplate
  scaffold.sh → 初期コード生成 → 認証フロー構築
  ↓
Phase 3: Build → Iterate
  機能単位でClaude Codeに指示 → MCP自動検証ループ
  ↓
Phase 4: Test → Validate
  Playwright / XcodeBuildMCP → E2E自動テスト
  ↓
Phase 5: Deploy → Ship
  Vercel / EAS Build → ストア提出
```

## MCP サーバー一覧

| MCP | Platform | Purpose |
|-----|----------|---------|
| GitHub | All | Issue, PR, code management |
| Supabase | All | DB, auth, edge functions |
| Playwright | Web, Android | Browser automation, E2E |
| Context7 | All | Library docs lookup |
| Sequential Thinking | All | Complex reasoning |
| Figma | Web | Design-to-code |
| XcodeBuildMCP | iOS | Build, test, deploy |
| iOS Simulator | iOS | Screenshot, UI interaction |
| MCP Mobile | Android | Emulator interaction |

## プラットフォーム選択ガイド

| ユースケース | 推奨 |
|-------------|------|
| SaaS（B2B、管理画面中心） | `web-saas` |
| コンシューマーアプリ（iOS優先） | `ios` |
| コンシューマーアプリ（両OS同時） | `android`（Expo） |
| SaaS + モバイルアプリ | `web-saas` + `android`（バックエンド共有） |

## トラブルシューティング

### MCP接続できない
```bash
claude mcp list          # 登録済みMCP一覧
claude mcp remove <name> # 削除して再登録
```

### Supabase MCPのOAuth
初回接続時にブラウザが開いてログインを求められる。
対象プロジェクトが含まれるOrganizationを選択すること。

### XcodeBuildMCPが動かない
Xcode Command Line Toolsが必要：
```bash
xcode-select --install
```

## ライセンス

POSTCABINETS internal use. Modify freely for client projects.
