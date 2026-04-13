# Claude Code セットアップ用プロンプト

> このファイルの中から、該当するプロンプトを Claude Code にコピペするだけ。
> 上から順番に実行していく。

---

## PROMPT 0: Dev Kit の展開と初期設定

```
以下の手順を実行してください：

1. ~/Downloads/ または ~/Desktop/ に postcabinets-dev-kit.zip があるか確認して、
   まだ展開されていなければ展開して ~/postcabinets-dev-kit/ に配置してください。
   すでに ~/postcabinets-dev-kit/ が存在する場合はスキップ。

2. ~/postcabinets-dev-kit/ の中身を確認して、以下のファイルが存在するか確認：
   - setup.sh
   - shared/CLAUDE.md
   - shared/.mcp.json
   - shared/templates/design.md
   - shared/templates/prd.md
   - shared/templates/schema.sql
   - shared/prompts/phase-prompts.md
   - web-saas/CLAUDE.md, .mcp.json, scaffold.sh
   - ios/CLAUDE.md, .mcp.json, scaffold.sh
   - android/CLAUDE.md, .mcp.json, scaffold.sh

3. 全ての .sh ファイルに実行権限を付与：
   chmod +x ~/postcabinets-dev-kit/setup.sh
   chmod +x ~/postcabinets-dev-kit/web-saas/scaffold.sh
   chmod +x ~/postcabinets-dev-kit/ios/scaffold.sh
   chmod +x ~/postcabinets-dev-kit/android/scaffold.sh

4. 結果を報告してください。
```

---

## PROMPT 1: MCP サーバーの一括インストール

```
以下のMCPサーバーをClaude Codeに登録してください。
すでに登録済みのものはスキップしてください。

1. GitHub MCP:
   claude mcp add github -s user -- npx -y @modelcontextprotocol/server-github
   ※ GITHUB_PERSONAL_ACCESS_TOKEN の入力を求められたら、いったんスキップして後で設定と伝えてください

2. Supabase MCP:
   claude mcp add supabase -s user -- npx -y mcp-remote https://mcp.supabase.com/mcp

3. Playwright MCP:
   claude mcp add playwright -s user -- npx -y @playwright/mcp@latest

4. Context7 MCP:
   claude mcp add context7 -s user -- npx -y @upstash/context7-mcp@latest

5. Sequential Thinking MCP:
   claude mcp add thinking -s user -- npx -y @modelcontextprotocol/server-sequential-thinking

完了したら claude mcp list で登録状況を表示してください。

※ -s user はグローバル（ユーザーレベル）登録。
  全プロジェクトで使えるようになる。
```

---

## PROMPT 2A: Web SaaS プロジェクトを作る場合

```
以下の手順でWeb SaaSプロジェクトを新規作成してください。

プロジェクト名: {{PROJECT_NAME}}
（例: workstream, silent-crew-dashboard, ai-leaders-pass）

手順:

1. プロジェクト作成:
   cd ~
   npx create-next-app@latest {{PROJECT_NAME}} \
     --typescript --tailwind --eslint --app --src-dir \
     --import-alias "@/*" --use-npm

2. ディレクトリ移動:
   cd ~/{{PROJECT_NAME}}

3. 依存関係インストール:
   npm install @clerk/nextjs @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js
   npm install -D vitest @testing-library/react playwright @playwright/test

4. shadcn/ui 初期化:
   npx shadcn@latest init -y

5. CLAUDE.md をコピー（共通 + Web SaaS を結合）:
   cat ~/postcabinets-dev-kit/shared/CLAUDE.md > ./CLAUDE.md
   echo "" >> ./CLAUDE.md
   echo "---" >> ./CLAUDE.md
   echo "" >> ./CLAUDE.md
   cat ~/postcabinets-dev-kit/web-saas/CLAUDE.md >> ./CLAUDE.md

6. MCP設定をコピー:
   cp ~/postcabinets-dev-kit/web-saas/.mcp.json ./.mcp.json

7. テンプレートをコピー:
   mkdir -p docs supabase/migrations
   cp ~/postcabinets-dev-kit/shared/templates/design.md ./docs/design.md
   cp ~/postcabinets-dev-kit/shared/templates/prd.md ./docs/prd.md
   cp ~/postcabinets-dev-kit/shared/templates/schema.sql ./supabase/migrations/00001_initial_schema.sql
   cp ~/postcabinets-dev-kit/shared/prompts/phase-prompts.md ./docs/phase-prompts.md

8. ディレクトリ構造を作成:
   mkdir -p src/components/{ui,features}
   mkdir -p src/lib/{supabase,stripe}
   mkdir -p src/hooks src/types

9. .env.example を作成（以下の内容で）:
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   CLERK_WEBHOOK_SECRET=
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   # Stripe
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000

10. .env.example を .env.local にコピー:
    cp .env.example .env.local

11. src/lib/utils.ts を作成（cn ヘルパー）:
    import { type ClassValue, clsx } from "clsx";
    import { twMerge } from "tailwind-merge";
    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs));
    }

12. Gitの初期コミット:
    git add -A
    git commit -m "feat: initial scaffold from POSTCABINETS Dev Kit"

13. 最終的なファイルツリーを表示してください。

全ステップ完了後、次に何をすべきか教えてください。
```

---

## PROMPT 2B: iOS プロジェクトを作る場合

```
以下の手順でiOSプロジェクトを新規作成してください。

プロジェクト名: {{PROJECT_NAME}}
Organization Identifier: com.postcabinets

手順:

1. プロジェクトディレクトリ作成:
   mkdir -p ~/{{PROJECT_NAME}}
   cd ~/{{PROJECT_NAME}}

2. CLAUDE.md をコピー（共通 + iOS を結合）:
   cat ~/postcabinets-dev-kit/shared/CLAUDE.md > ./CLAUDE.md
   echo "" >> ./CLAUDE.md
   echo "---" >> ./CLAUDE.md
   echo "" >> ./CLAUDE.md
   cat ~/postcabinets-dev-kit/ios/CLAUDE.md >> ./CLAUDE.md

3. MCP設定をコピー:
   cp ~/postcabinets-dev-kit/ios/.mcp.json ./.mcp.json

4. テンプレートをコピー:
   mkdir -p docs
   cp ~/postcabinets-dev-kit/shared/templates/design.md ./docs/design.md
   cp ~/postcabinets-dev-kit/shared/templates/prd.md ./docs/prd.md
   cp ~/postcabinets-dev-kit/shared/prompts/phase-prompts.md ./docs/phase-prompts.md

5. Swiftプロジェクト構造を作成:
   mkdir -p {{PROJECT_NAME}}/{App,Features/{Auth/{Views,ViewModels,Models},Dashboard/{Views,ViewModels,Models},Settings/{Views,ViewModels,Models}},Core/{Network,Storage,Extensions},Design/Components,Resources}
   mkdir -p Tests/{UnitTests,UITests}

6. XcodeBuildMCPがインストール済みか確認:
   claude mcp list でxcodeが登録されていなければ追加:
   claude mcp add xcode -s user -- npx -y xcodebuildmcp@latest mcp

7. iOS Simulator MCPも確認:
   claude mcp add ios-sim -s user -- npx -y ios-simulator-mcp

8. Git初期化:
   git init
   git add -A
   git commit -m "feat: initial iOS scaffold from POSTCABINETS Dev Kit"

9. 最終的なファイルツリーを表示してください。

※ Xcodeプロジェクトファイル（.xcodeproj）の生成は
  XcodeBuildMCPを使って次のステップで行います。
```

---

## PROMPT 2C: Android / クロスプラットフォーム（Expo）プロジェクトを作る場合

```
以下の手順でExpo（React Native）プロジェクトを新規作成してください。

プロジェクト名: {{PROJECT_NAME}}

手順:

1. Expoプロジェクト作成:
   cd ~
   npx create-expo-app@latest {{PROJECT_NAME}} --template tabs

2. ディレクトリ移動:
   cd ~/{{PROJECT_NAME}}

3. 依存関係インストール:
   npm install @supabase/supabase-js expo-secure-store expo-image
   npm install nativewind tailwindcss react-native-reanimated

4. CLAUDE.md をコピー（共通 + Android を結合）:
   cat ~/postcabinets-dev-kit/shared/CLAUDE.md > ./CLAUDE.md
   echo "" >> ./CLAUDE.md
   echo "---" >> ./CLAUDE.md
   echo "" >> ./CLAUDE.md
   cat ~/postcabinets-dev-kit/android/CLAUDE.md >> ./CLAUDE.md

5. MCP設定をコピー:
   cp ~/postcabinets-dev-kit/android/.mcp.json ./.mcp.json

6. テンプレートをコピー:
   mkdir -p docs
   cp ~/postcabinets-dev-kit/shared/templates/design.md ./docs/design.md
   cp ~/postcabinets-dev-kit/shared/templates/prd.md ./docs/prd.md
   cp ~/postcabinets-dev-kit/shared/prompts/phase-prompts.md ./docs/phase-prompts.md

7. ディレクトリ構造を作成:
   mkdir -p src/{components/{ui,features},lib,hooks,types,constants,assets/{fonts,images}}

8. .env を作成:
   EXPO_PUBLIC_SUPABASE_URL=
   EXPO_PUBLIC_SUPABASE_ANON_KEY=

9. Git初期コミット:
   git add -A
   git commit -m "feat: initial Expo scaffold from POSTCABINETS Dev Kit"

10. 最終的なファイルツリーを表示してください。
```

---

## PROMPT 3: PRD を埋める（プロジェクト作成後）

```
docs/prd.md を開いてください。

以下の情報をもとにPRDを埋めてください：

プロダクト名: {{PRODUCT_NAME}}
概要: {{ONE_LINE_DESCRIPTION}}
ターゲットユーザー: {{TARGET_USER}}
解決する課題: {{PROBLEM}}
主要機能（v1.0）:
- {{FEATURE_1}}
- {{FEATURE_2}}
- {{FEATURE_3}}
料金プラン:
- Free: {{FREE_FEATURES}}
- Pro: ¥{{PRICE}}/月: {{PRO_FEATURES}}

PRDを埋めたら、その内容に基づいて docs/design.md も生成してください。
デザインは日本語UIで、モダンでクリーンなスタイルで。
```

---

## PROMPT 4: 設計 → 実装を一気に進める（PRD記入後）

```
CLAUDE.md のルールに従って、以下を順番に実行してください。

1. docs/prd.md と docs/design.md を読む

2. supabase/migrations/00001_initial_schema.sql を
   PRDの要件に合わせて更新する（RLS付き）

3. 以下のshadcn/uiコンポーネントを追加:
   npx shadcn@latest add button card input label dialog
   npx shadcn@latest add dropdown-menu avatar badge separator skeleton
   npx shadcn@latest add table tabs toast

4. src/app/layout.tsx を設定:
   - ClerkProvider でラップ
   - Inter + Noto Sans JP フォント
   - メタデータ（日本語）

5. 認証ページを作成:
   - src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
   - src/app/(auth)/sign-up/[[...sign-up]]/page.tsx

6. ダッシュボードレイアウトを作成:
   - src/app/(dashboard)/layout.tsx（サイドバー + ヘッダー）
   - src/app/(dashboard)/dashboard/page.tsx

7. ランディングページを作成:
   - src/app/(marketing)/page.tsx（Hero + Features + Pricing）

8. 各ページ作成後、Playwright MCPでスクリーンショットを撮って
   design.md と照合し、差異があれば修正してください。

9. 完了後、実装したファイルの一覧と
   次に実装すべき機能のリストを提示してください。
```

---

## PROMPT 5: 個別機能の追加（繰り返し使う）

```
次の機能を実装してください：「{{FEATURE_NAME}}」

要件:
{{REQUIREMENTS}}

実装ルール（CLAUDE.md準拠）:
- 必要なDBマイグレーションがあればファイル作成
- Server Components優先、"use client"は必要な場合のみ
- shadcn/ui のコンポーネントをベースに
- TypeScript strict、anyは使わない

完了後:
1. Playwright MCPでスクリーンショット確認
2. テストを1つ以上書く
3. git commit -m "feat: {{FEATURE_NAME}}"
```

---

## PROMPT 6: デプロイ前の最終チェック

```
デプロイ前の最終チェックを実行してください：

1. npx tsc --noEmit（型エラー確認）
2. npx eslint .（Lintチェック）
3. npm test（テスト実行）
4. .env.example と .env.local の差分確認（漏れがないか）
5. CLAUDE.md のセキュリティチェックリストを全項目確認
6. package.json の不要な依存関係がないか確認

問題があれば修正して、
全てパスしたら「デプロイ準備完了」と報告してください。
```
