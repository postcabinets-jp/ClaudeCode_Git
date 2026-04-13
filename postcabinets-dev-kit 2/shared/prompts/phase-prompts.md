# Phase Prompts for Claude Code

> 各フェーズでClaude Codeにコピペして使うプロンプト集。
> `{{PLACEHOLDER}}` 部分を実際の値に置き換えて使用する。

---

## Phase 1: Design → Structure

### 1A. PRDからdesign.mdを生成

```
docs/prd.md を読んで、docs/design.md を生成してください。
以下を含めてください：
- 全画面のワイヤーフレーム記述（コンポーネント単位）
- デザイントークン（色、フォント、スペーシング）
- レスポンシブ対応方針
- shadcn/ui で使うコンポーネントの一覧

プロダクトのターゲットは日本の{{TARGET_USER}}です。
UIテキストは日本語で。
```

### 1B. design.mdからDBスキーマを生成

```
docs/prd.md と docs/design.md を読んで、
supabase/migrations/00001_initial_schema.sql を生成してください。

要件：
- 全テーブルにRLSを有効化
- Clerk webhook同期用のusersテーブル
- Stripe連携用のsubscriptionsテーブル
- updated_atトリガー
- 適切なインデックス
```

### 1C. Figmaからデザインを取得（Figma MCP使用時）

```
Figma MCPを使って、以下のFigmaフレームのデザイン情報を取得してください：
{{FIGMA_URL}}

取得したデザイントークンとコンポーネント構造を
docs/design.md に反映してください。
```

---

## Phase 2: Scaffold → Boilerplate

### 2A. プロジェクト初期構築

```
CLAUDE.md のルールに従って、以下のプロジェクトをセットアップしてください：

1. package.json の依存関係をインストール
2. docs/design.md のデザイントークンを tailwind.config.ts に反映
3. src/components/ui/ に shadcn/ui の基本コンポーネントを追加：
   Button, Card, Input, Label, Dialog, DropdownMenu, Avatar, Badge, Separator, Skeleton
4. src/lib/supabase/client.ts にSupabaseクライアントを設定
5. src/lib/supabase/types.ts にDB型定義を追加
6. src/app/layout.tsx にClerkProvider + フォント + メタデータを設定

各ステップ完了後にファイル一覧を表示してください。
```

### 2B. 認証フロー構築

```
Clerkの認証フローを実装してください：

1. src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
2. src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
3. src/middleware.ts（Clerk認証ミドルウェア）
4. src/app/api/webhooks/clerk/route.ts（Clerk → Supabase同期）

Playwright MCPでsign-inページのスクリーンショットを撮って確認してください。
```

---

## Phase 3: Build → Iterate

### 3A. 機能実装（テンプレート）

```
次の機能を実装してください：「{{FEATURE_NAME}}」

要件：
{{REQUIREMENTS}}

実装手順：
1. 必要なDBマイグレーションがあればSupabase MCPで作成・適用
2. APIルート（src/app/api/）
3. UIコンポーネント（src/components/features/）
4. ページ（src/app/）
5. テスト（同じディレクトリに.test.tsxとして）

完了後、Playwright MCPでスクリーンショットを撮って
docs/design.md のデザインと照らし合わせて微調整してください。
```

### 3B. Stripe決済の実装

```
Stripeの決済フローを実装してください：

1. src/app/api/webhooks/stripe/route.ts（Stripe webhook handler）
2. src/lib/stripe/client.ts（Stripe初期化）
3. src/lib/stripe/plans.ts（プラン定義、docs/prd.md の料金テーブル参照）
4. src/app/api/stripe/checkout/route.ts（Checkout Session作成）
5. src/app/api/stripe/portal/route.ts（Customer Portal）
6. src/components/features/pricing-table.tsx

webhook handlerでは以下のイベントを処理：
- checkout.session.completed → subscriptions テーブル更新
- customer.subscription.updated → status更新
- customer.subscription.deleted → status = canceled
```

---

## Phase 4: Test → Validate

### 4A. E2Eテスト生成

```
Playwright MCPを使って以下のE2Eテストを実行してください：

1. トップページにアクセスしてスクリーンショット
2. サインインページに遷移
3. ダッシュボードの主要機能を操作
4. レスポンシブ（モバイルビューポート 375x812）でもスクリーンショット

各スクリーンショットを確認して、
デザインとの差異があれば自動修正してください。
```

### 4B. モバイルテスト（iOS）

```
XcodeBuildMCPを使ってiOSアプリをテストしてください：

1. Debug構成でビルド
2. iPhone 16 Pro シミュレータで起動
3. メイン画面のスクリーンショット
4. 主要な操作フロー（タップ、スワイプ）を実行
5. 問題があれば修正して再ビルド
```

---

## Phase 5: Deploy → Ship

### 5A. デプロイ前チェック

```
デプロイ前の最終チェックを実行してください：

1. TypeScriptコンパイルエラーがないか確認（npx tsc --noEmit）
2. Lintエラーがないか確認（npx eslint .）
3. 全テスト実行（npm test）
4. 環境変数の確認（.env.local vs .env.example の差分）
5. セキュリティチェック（CLAUDE.md のセキュリティチェックリスト）
6. 結果を報告

問題があれば修正してください。
```

### 5B. GitHub PRの作成

```
GitHub MCPを使って以下のPRを作成してください：

- Branch: feat/{{FEATURE_NAME}}
- Title: feat: {{FEATURE_DESCRIPTION}}
- Body: 実装内容、テスト結果のサマリー、スクリーンショット
- Labels: enhancement
- Reviewers: （必要に応じて）

PRの作成前に、差分を確認させてください。
```
