# Claude Code 最強セットアップガイド

> **目的**: このファイルを Claude Code に読ませて「このファイルに従ってセットアップして」と言うだけで、最高効率 × 最高品質の環境が完成する。誰でも使える汎用版。
>
> **構成**: Part 0 = 自動セットアップ / Part 1 = ベストプラクティス / Part 2 = プロジェクト別カスタマイズ用テンプレート / Part 3 = リファレンス
>
> **出典**: Anthropic公式ドキュメント、Trail of Bits、buildingopen/claude-setup（500+セッション分析）、shanraisshan/claude-code-best-practice、affaan-m/everything-claude-code（118K+ stars）、ykdojo/claude-code-tips、その他 GitHub 高評価リポジトリから厳選・統合。

---

## Part 0: 自動セットアップ（Claude Code に実行させる）

> **使い方**: Claude Code でこのファイルを開き、「Part 0 に従って環境をセットアップして」と伝えるだけ。
> 各ステップは冪等（何度実行しても安全）に設計してある。

---

### Step 1: 前提ツールの確認・インストール

```bash
# Node.js 20+ が必要（Claude Code のプラグイン・MCP に必須）
node --version || echo "WARN: Node.js がインストールされていません。https://nodejs.org/ からインストールしてください"

# Git（バージョン管理）
git --version || echo "WARN: Git がインストールされていません"

# gh CLI（GitHub 連携で必須。PR作成、Issue操作等）
gh --version || brew install gh || echo "WARN: gh CLI をインストールしてください → https://cli.github.com/"

# jq（JSON 処理。Hook やスクリプトで使用）
jq --version || brew install jq || echo "WARN: jq をインストールしてください"

# ripgrep（高速検索。Claude Code 内部でも使用）
rg --version || brew install ripgrep || echo "WARN: ripgrep をインストールしてください"
```

### Step 2: ~/.claude/ ディレクトリ構造を作成

```bash
mkdir -p ~/.claude
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/hooks
```

### Step 3: settings.json を配置

以下の内容を `~/.claude/settings.json` に書き込む。
**既存ファイルがある場合はバックアップを取ってからマージすること。**

```bash
# バックアップ
[ -f ~/.claude/settings.json ] && cp ~/.claude/settings.json ~/.claude/settings.json.bak.$(date +%s)
```

```jsonc
// === ~/.claude/settings.json ===
{
  // ↓ autoMode.environment は自分の環境に書き換えること（自然言語でOK）
  "autoMode": {
    "environment": [
      "Organization: YOUR_ORG_NAME. Primary use: software development",
      "Source control: github.com/YOUR_ORG and all repos under it",
      "Trusted internal services: YOUR_SERVICES (例: Notion API, Vercel, AWS, Supabase 等)"
    ]
  },
  "env": {
    "DISABLE_TELEMETRY": "1",
    "DISABLE_ERROR_REPORTING": "1"
  },
  "alwaysThinkingEnabled": true,
  "cleanupPeriodDays": 365,
  "enableAllProjectMcpServers": false,
  "permissions": {
    "defaultMode": "auto",
    "allow": [
      "Bash(npm run *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(git status *)",
      "Bash(git log *)",
      "Bash(git diff *)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git checkout *)",
      "Bash(git branch *)",
      "Bash(git stash *)",
      "Bash(git pull *)",
      "Bash(git fetch *)",
      "Bash(gh *)",
      "Bash(jq *)",
      "Bash(rg *)",
      "Bash(* --version)",
      "Bash(* --help)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(wc *)",
      "Bash(mkdir *)",
      "Bash(cp *)",
      "Bash(mv *)",
      "Bash(which *)",
      "Bash(echo *)",
      "Read",
      "Edit",
      "Write"
    ],
    "deny": [
      "Bash(git push * --force *)",
      "Bash(git push --force *)",
      "Bash(rm -rf /)",
      "Bash(rm -rf ~)",
      "Bash(rm -rf /*)",
      "~/.ssh/**",
      "~/.gnupg/**",
      "~/.aws/**",
      "~/.azure/**",
      "~/.kube/**",
      "~/.docker/**",
      "~/.npmrc",
      "~/.pypirc",
      "**/.env",
      "**/.env.*",
      "**/credentials.json",
      "**/service-account*.json"
    ]
  }
}
```

### Step 4: プラグイン・マーケットプレイスをインストール

**以下は Claude Code のセッション内で実行する（`/` コマンド）:**

```
# ── マーケットプレイス追加（カタログをダウンロード） ──
/plugin marketplace add affaan-m/everything-claude-code
/plugin marketplace add feiskyer/claude-code-settings
/plugin marketplace add trailofbits/skills

# ── 主要プラグインをインストール ──
/plugin install everything-claude-code@everything-claude-code
```

**npx skills CLI でも追加できる（ターミナルから）:**

```bash
# feiskyer の全スキルを一括インストール
npx -y skills add --all feiskyer/claude-code-settings

# または対話的に選択
npx -y skills add feiskyer/claude-code-settings
```

### Step 5: MCP サーバーを追加

```bash
# Context7 — ライブラリ最新ドキュメント取得（API キー不要、超便利）
claude mcp add context7 -- npx -y @context7/mcp
```

### Step 6: サブエージェントを配置

以下のファイルを作成する:

**`.claude/agents/security-reviewer.md`**:
```markdown
---
name: security-reviewer
description: コードのセキュリティ脆弱性をレビュー
tools: Read, Grep, Glob, Bash
model: opus
---
シニアセキュリティエンジニアとしてレビュー:
- インジェクション（SQL, XSS, コマンド）
- 認証・認可の欠陥
- コード内のシークレット・認証情報
- 安全でないデータ処理
具体的な行番号と修正案を提示すること。
```

**`.claude/agents/code-reviewer.md`**:
```markdown
---
name: code-reviewer
description: コード品質とベストプラクティスをレビュー
tools: Read, Grep, Glob
model: sonnet
---
以下の観点でレビュー:
- エッジケースと例外処理
- パフォーマンスのボトルネック
- 既存パターンとの一貫性
- テストカバレッジの漏れ
```

**`.claude/agents/planner.md`**:
```markdown
---
name: planner
description: 実装計画を立案する。複数ファイルにまたがる変更や不慣れなコードベースで使用
tools: Read, Grep, Glob
model: opus
permissionMode: plan
---
あなたはシニアアーキテクト。以下の手順で実装計画を作成:
1. 関連コードを徹底的に読み、現在の設計を理解
2. 変更が必要なファイルを全て特定
3. 依存関係と影響範囲を分析
4. ステップバイステップの実装計画を作成
5. リスクと代替案を明示
```

### Step 7: Hooks を配置

**プロジェクトの `.claude/settings.json`**（リポジトリごと）に追加:

```jsonc
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "bash -c 'if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE \"rm -rf [/~]\"; then echo \"BLOCK: 危険な削除コマンドです。trash を使ってください\" >&2; exit 2; fi'"
      },
      {
        "matcher": "Bash",
        "command": "bash -c 'if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE \"git push.*(main|master)\"; then echo \"BLOCK: main/master への直接 push は禁止。feature ブランチから PR を作ってください\" >&2; exit 2; fi'"
      }
    ]
  }
}
```

### Step 8: シェルエイリアスを追加（任意）

```bash
# ~/.zshrc or ~/.bashrc に追加
cat >> ~/.zshrc << 'ALIASES'

# Claude Code ショートカット
alias cc="claude"
alias cca="claude --permission-mode auto"
alias ccp="claude --permission-mode plan"
alias ccr="claude --continue"
alias ccs="claude --resume"

# sandbox 環境専用（コンテナ/VM 内のみ。本番マシンでは非推奨）
alias claude-yolo="claude --dangerously-skip-permissions"
ALIASES
```

### Step 9: セットアップ検証

```bash
# settings.json が正しいか確認
cat ~/.claude/settings.json | jq . > /dev/null && echo "✅ settings.json: valid JSON" || echo "❌ settings.json: JSON parse error"

# auto モード設定を確認
claude auto-mode config 2>/dev/null && echo "✅ auto-mode: configured" || echo "⚠️ auto-mode: 確認できず（Claude Code セッション内で実行してください）"

# ディレクトリ構造を確認
echo "=== ~/.claude/ 構造 ==="
ls -la ~/.claude/
echo "=== agents ==="
ls ~/.claude/agents/ 2>/dev/null || echo "(なし)"
echo "=== skills ==="
ls ~/.claude/skills/ 2>/dev/null || echo "(なし)"

echo ""
echo "🎉 セットアップ完了！"
echo "次のステップ:"
echo "  1. Claude Code を起動して /plugin でプラグインを確認"
echo "  2. auto-mode が有効か Shift+Tab で確認"
echo "  3. /insights を実行して現在の状態を分析"
```

---

## Part 1: 全員共通 — Claude Code ベストプラクティス

---

### 1. CLAUDE.md の書き方ルール（最重要）

CLAUDE.md は**毎セッション自動読込**される。つまりトークンを常に消費する。以下を守ること:

- **200行以内**に収める（長すぎると Claude が指示を無視し始める）
- 各行に対して「これを消したら Claude がミスするか？」を問う。No なら消す
- Claude が既にコードから推測できることは書かない
- 頻繁に変わる情報は書かない（リンクで代替）
- 特定ドメイン知識は **Skills**（`.claude/skills/`）に分離する（オンデマンド読込でトークン節約）
- 重要度の高い指示には `IMPORTANT:` や `YOU MUST` をつける（遵守率が上がる）

```
✅ 書くべき内容                        ❌ 書かないべき内容
─────────────────────────────────      ─────────────────────────────────
Claude が推測できない Bash コマンド      コードを読めばわかること
デフォルトと異なるコードスタイル         言語の標準的な慣習
テストの実行方法・推奨テストランナー     詳細な API ドキュメント（リンクで十分）
リポジトリ作法（ブランチ命名、PR規約）   頻繁に変わる情報
アーキテクチャ上の意思決定               長い説明やチュートリアル
開発環境の癖（必須 env 変数など）        ファイルごとのコードベース解説
非自明な落とし穴・ gotcha               「きれいなコードを書け」等の自明な指示
```

### 2. コンテキストウィンドウ管理（最大のボトルネック）

**Claude のパフォーマンスはコンテキストが埋まるほど劣化する。** これが最も重要な制約。

- **`/clear`**: 無関係なタスクに切り替えるたびに実行。最も効果的な習慣
- **`/compact <指示>`**: コンテキストを圧縮。例: `/compact API変更に集中`
- **`/btw`**: 一時的な質問に使う。会話履歴に残らない
- **Esc**: 途中で方向がずれたら即停止。コンテキストは保持される
- **Esc×2 / `/rewind`**: 過去のチェックポイントに巻き戻し
- 同じ修正を **2回以上** やり直したら → `/clear` して最初から良いプロンプトを書き直す
- **サブエージェント**に調査を委任すれば、メインコンテキストを汚さない

### 3. ワークフロー: 探索 → 計画 → 実装 → 検証

**いきなりコードを書かせない。** 以下の4フェーズを徹底する:

```
① 探索（Plan Mode）    → コードベースを読ませて理解させる
② 計画（Plan Mode）    → 実装計画を作らせる。Ctrl+G でエディタ編集可
③ 実装（Normal Mode）  → 計画に沿ってコーディング＋テスト実行
④ コミット             → 説明的なメッセージで commit → PR
```

**例外**: スコープが明確で1文で差分を説明できるタスク（typo修正、変数リネーム等）は計画不要。

### 4. 検証手段を必ず与える（最もレバレッジが高い）

Claude は**自分の出力を検証できるとき**に劇的に良い結果を出す。

- テストケースを書かせて実行させる
- スクリーンショットを貼って視覚的に比較させる
- lint / type-check を通させる
- 「根本原因を直せ。エラーを抑制するな」と明示する

```
❌ "メール検証関数を実装して"
✅ "validateEmail 関数を書いて。テストケース: user@example.com → true,
    invalid → false, user@.com → false。実装後にテストを実行して"
```

### 5. プロンプトの書き方

- **スコープを絞る**: どのファイル、どのシナリオ、テスト方針まで指定
- **既存パターンを指す**: 「HotDogWidget.php のパターンに倣って」
- **症状を具体的に**: 「ログインバグを直して」→「セッションタイムアウト後にログイン失敗。src/auth/ のトークンリフレッシュを確認」
- **`@`でファイル参照**: ファイルパスを説明するより `@src/auth/login.ts` で直接渡す
- **画像を貼る**: UI の問題はスクショをドラッグ&ドロップ
- **URL を渡す**: ドキュメントや API リファレンスのリンクを直接渡す
- **大きな機能はインタビュー**から始める:
  ```
  [簡潔な説明] を作りたい。AskUserQuestion ツールで詳しくインタビューして。
  技術実装、UX、エッジケース、トレードオフを掘り下げて。
  カバーしたら SPEC.md に仕様をまとめて。
  ```

### 6. セッション管理

- **`claude --continue`**: 前回のセッションを再開
- **`claude --resume`**: 過去セッション一覧から選択
- **`/rename`**: セッションに名前をつける（例: `oauth-migration`）
- **チェックポイント**: Claude の各操作は自動チェックポイント。失敗したら巻き戻せる

### 7. 並列化・スケーリング

```bash
# 非対話モードで CI / スクリプトに組み込み
claude -p "このプロジェクトが何をするか説明して"

# JSON出力
claude -p "全APIエンドポイントを列挙" --output-format json

# ファイル単位のファンアウト
for file in $(cat files.txt); do
  claude -p "$file を React から Vue に移行。OK か FAIL を返して" \
    --allowedTools "Edit,Bash(git commit *)"
done
```

**Writer/Reviewer パターン**: セッションAで実装 → セッションBで（別コンテキストから）レビュー。自分が書いたコードへのバイアスがない。

### 8. よくある失敗パターンと対策

| 失敗パターン | 対策 |
|---|---|
| **キッチンシンク**: 1セッションで無関係なタスクを混ぜる | タスク切替時に `/clear` |
| **修正ループ**: 同じ修正を何度もやり直す | 2回失敗したら `/clear` + 良いプロンプトで再開 |
| **CLAUDE.md が長すぎ**: 重要な指示が埋もれる | 200行以内。Hookに移せるものは移す |
| **検証なしで信用**: 見た目は正しいがエッジケース未対応 | テスト・lint・スクショで必ず検証 |
| **無制限の探索**: 「調査して」でスコープなし→大量ファイル読込 | スコープを絞るかサブエージェントに委任 |

---

### 9. 推奨ツール・拡張機能（設定の全容は Part 0 を参照）

> **IMPORTANT**: 具体的な settings.json、Hooks、サブエージェント、プラグインのインストール手順は
> 全て **Part 0: 自動セットアップ** にまとめてある。ここでは補足情報のみ記載。

#### パーミッションモードの使い分け

| モード | 動作 | 用途 |
|---|---|---|
| `auto` | 分類器が自動判断。Deny ルールは絶対ブロック | **日常作業（デフォルト推奨）** |
| `acceptEdits` | ファイル編集は自動承認、Bash のみ確認 | auto が使えない場合の代替 |
| `plan` | 読み取り専用。変更しない | 調査・計画フェーズ |
| `default` | 全て確認 | 安全優先の作業 |
| `bypassPermissions` | 全チェックなし | **コンテナ/VM 内限定** |

```
Shift+Tab    → default → acceptEdits → plan → auto をサイクル

# 最強フロー: Plan Mode で調査 → Shift+Tab で auto に切り替えて実装
```

#### Auto Mode の注意点

- `autoMode` 設定は `~/.claude/settings.json`（個人）か `.claude/settings.local.json`（プロジェクト）に書く
- `.claude/settings.json`（Git 共有）には書けない（セキュリティ上の仕様）
- 確認コマンド: `claude auto-mode config` / `claude auto-mode defaults` / `claude auto-mode critique`

#### インストール済みプラグインで特に有用なスキル

- **fix-issue**: GitHub Issue → コード修正 → テスト → PR まで一気通貫
- **review-pr**: 多角的な PR レビュー
- **tdd**: テスト駆動開発ワークフロー
- **deep-research**: マルチエージェント調査
- **reflection**: セッション分析 → CLAUDE.md 改善提案
- **session-learn**: 過去セッションからスキルを自動生成

### 10. コーディング品質ルール（グローバル CLAUDE.md 向け）

```markdown
# ~/.claude/CLAUDE.md に追加推奨

## 開発哲学
- 推測的な機能を作らない。今必要なものだけ作る
- 早すぎる抽象化をしない
- 非推奨にするより置き換える
- 80% 読み、20% 書き — コンテキストを十分理解してから実装

## コード品質ハードリミット
- 関数は 50 行以内（超えたら分割）
- 循環的複雑度 10 以下
- 1行 100 文字以内
- ネスト 4 レベルまで

## Git ワークフロー
- IMPORTANT: main/master に直接 push しない。必ず feature ブランチ → PR
- コミットメッセージは「なぜ」を書く（「何を」は diff でわかる）
- 1 PR = 1 機能/修正。巨大 PR を作らない

## テスト
- 新機能にはテストを書く
- 全テストスイートではなく関連テストだけ実行（パフォーマンス）
- モックは最小限に。実際の動作を検証する
```

---

## Part 2: プロジェクト別カスタマイズ用テンプレート

> 以下をコピーしてプロジェクトルートの `CLAUDE.md` に貼り、自分のプロジェクトに合わせて書き換える。
> グローバル設定（`~/.claude/CLAUDE.md`）にはここは含めない。プロジェクトごとに別ファイルにする。

---

```markdown
# プロジェクト名

## 概要
- 一言で何をするプロジェクトか
- 技術スタック: （例: Next.js / TypeScript / Supabase / Vercel）

## ビルド・テスト・リント
- ビルド: `npm run build`
- テスト: `npm run test`（単体テスト）/ `npm run test:e2e`（E2E）
- リント: `npm run lint`
- 型チェック: `npx tsc --noEmit`

## ディレクトリ構造（主要なもの）
- `src/` — アプリケーションコード
- `src/components/` — UI コンポーネント
- `src/lib/` — ユーティリティ・ヘルパー
- `tests/` — テストファイル

## コードスタイル（デフォルトと異なるもののみ）
- （例: import は絶対パスを使う）
- （例: コンポーネントは named export）

## 環境変数
- `.env.local` に `DATABASE_URL`, `API_KEY` 等が必要
- `.env.example` にプレースホルダあり

## ブランチ規約
- `main` — プロダクション。直接 push 禁止
- `feature/*` — 機能開発
- `fix/*` — バグ修正
- PR マージ後にブランチ削除

## やってはいけないこと
- `.env` ファイルをコミット
- `node_modules/` をコミット
- main に直接 push
- テストを通さずにコミット

## Claude Code への追加指示（あれば）
- （例: セッション開始時に TODO.md を読むこと）
- （例: DB マイグレーションは人間に確認を取ること）
```

### カスタマイズのコツ

- **CLAUDE.md は 200行以内** に収める。長いと Claude が指示を無視し始める
- 「Claude がこれを知らないとミスする」情報だけ書く
- コードを読めばわかることは書かない
- 頻繁に変わる情報はリンクで代替
- チームで Git 管理して共有する

---

## Part 3: クイックリファレンス

---

### よく使うコマンド一覧

| コマンド | 用途 |
|---|---|
| `/init` | CLAUDE.md のスターター生成 |
| `/clear` | コンテキストリセット（**最重要習慣**） |
| `/compact <指示>` | コンテキスト圧縮 |
| `/btw` | 一時的な質問（履歴に残らない） |
| `/rewind` | チェックポイントに巻き戻し |
| `/rename <名前>` | セッション名変更 |
| `/model` | モデル切り替え |
| `/context` | コンテキスト使用量確認 |
| `/config` | 設定変更 |
| `/doctor` | 診断 |
| `/permissions` | 許可設定 |
| `/sandbox` | OS レベルの隔離 |
| `/hooks` | Hook 一覧 |
| `/insights` | 週1で実行。セッション分析 |
| `Esc` | 停止（コンテキスト保持） |
| `Esc×2` | 巻き戻しメニュー |
| `Ctrl+G` | 計画をエディタで編集 |

### GitHub で評価の高いリソース

| リポジトリ | Stars | 内容 |
|---|---|---|
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 公式 | Claude Code 本体 |
| [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 118K+ | 135+ Skills, 30 Agents, 60+ Commands |
| [trailofbits/claude-code-config](https://github.com/trailofbits/claude-code-config) | — | セキュリティ企業の本番設定 |
| [shanraisshan/claude-code-best-practice](https://github.com/shanraisshan/claude-code-best-practice) | — | リファレンス実装 |
| [buildingopen/claude-setup](https://github.com/buildingopen/claude-setup) | — | 500+セッション分析、12 Hooks、40+ Skills |
| [feiskyer/claude-code-settings](https://github.com/feiskyer/claude-code-settings) | — | Skills + Agents + マルチプロバイダー設定 |
| [ykdojo/claude-code-tips](https://github.com/ykdojo/claude-code-tips) | — | 45 Tips（基本〜上級） |
| [FlorianBruniaux/claude-code-ultimate-guide](https://github.com/FlorianBruniaux/claude-code-ultimate-guide) | — | 初心者→パワーユーザーガイド |
| [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | — | Skills, Hooks, Commands, Plugins 一覧 |
| [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) | — | Skills キュレーション |
| [rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit) | — | 135 Agents, 42 Commands, 150+ Plugins |

### 初回セットアップ手順

```
1. このファイル（CLAUDE-ULTIMATE.md）をダウンロードする
2. Claude Code を起動する
3. 「@CLAUDE-ULTIMATE.md の Part 0 に従って環境をセットアップして」と伝える
4. Claude が自動で全てインストール・配置する
5. 完了後、Shift+Tab で auto モードになっていることを確認
6. Part 2 のテンプレートをコピーしてプロジェクトルートの CLAUDE.md を作る
7. 以降、毎週 /insights を実行して改善ループを回す
```

> これだけ。手動で settings.json を編集したり、プラグインを個別にインストールする必要なし。
> チームメンバーにはこのファイルを渡すだけで全員同じ環境が揃う。

---

> **このファイルもコードと同じ。** 定期的に見直し、効果がない行は削り、Claude の行動が変わるか観察すること。
