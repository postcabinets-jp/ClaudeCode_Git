# ~/.claude/ 全体マップ

最終更新: 2026-05-15

## 構造

```
~/.claude/
├── CLAUDE.md              ← Nobu's Operating Manual（最重要・毎回読まれる）
├── INDEX.md               ← このファイル
├── settings.json          ← 設定（hooks/permissions/plugins）
│
├── agents/                ← サブエージェント（22既存+9新規=31本）
│   ├── 01-core/           ← 設計・計画
│   ├── 02-language/       ← 言語別
│   ├── 03-quality/        ← レビュー・デバッグ
│   ├── 04-devex/          ← 開発体験
│   ├── 05-data/           ← データ・DB
│   ├── 06-marketing/      ← POST CABINETS本業
│   ├── 07-meta/           ← agent統括・context管理
│   ├── 99-business/       ← 業務系（営業・研修等）
│   └── *.md               ← 旧フラット（移行未完）
│
├── commands/              ← スラッシュコマンド（47既存+5新規=52本）
│   ├── 01-workflow/       ← /plan /tdd /think
│   ├── 02-quality/        ← /verify /smart-fix /tech-debt
│   ├── 03-research/       ← /design-research /mentor
│   ├── 04-ops/            ← /handoff /standup /sessions
│   ├── 05-multi/          ← /multi-*
│   ├── 06-learn/          ← /learn /evolve /memory-cleanup
│   ├── 99-business/       ← /MTG /katsudou-houkoku
│   └── *.md               ← 旧フラット（移行未完）
│
├── skills/                ← SKILL.md形式の常駐知識（70本、ほぼpluginsで管理）
├── plugins/               ← プラグイン80個
│
├── hooks/                 ← 自動実行スクリプト
│   ├── pre-tool-use/      ← Bash実行前ガード
│   │   ├── block-dangerous-bash.sh   ← rm -rf, force push, curl|sh等ブロック
│   │   └── block-secret-files.sh     ← .env, *.pem等の書込ブロック
│   ├── post-tool-use/     ← Edit後format等（未実装）
│   ├── user-prompt-submit/← デザイン文脈注入等（既存：claude for me/ops/scripts/）
│   └── stop/              ← セッション終了時の追加チェック
│       └── README.md       ← anti-give-up / self-review 設計案（手動配置）
│
├── rules/                 ← 横断ルール（未実装、CLAUDE.mdから分離するかは判断保留）
│
├── memory/                ← 自動メモリ（実体は ~/.claude/projects/-Users-apple/memory/）
└── projects/              ← セッション履歴
```

## 主要ファイル

### CLAUDE.md（217行）
4大原則 + スタック規約 + 付録（役割分担/エージェント一覧/会社情報）

### settings.json
- `enabledPlugins`: 80+
- `hooks`: SessionStart/UserPromptSubmit/Stop（既存）+ PreToolUse（新規追加検討）
- `statusLine`: claude-powerline tokyo-night
- `permissions.defaultMode`: bypassPermissions

## エージェント一覧（カテゴリ別）

### 01-core（設計・計画）
- architect, planner, **api-designer**（新）

### 02-language
- go-reviewer, go-build-resolver, python-reviewer

### 03-quality（レビュー・デバッグ）
- code-reviewer, security-reviewer, tdd-guide, quality-reviewer, database-reviewer
- **debugger**（新）, **performance-engineer**（新）

### 04-devex（開発体験）
- build-error-resolver, refactor-cleaner, doc-updater, e2e-runner
- **dx-optimizer**（新）, **dependency-manager**（新）

### 05-data
- database-reviewer（上記）

### 06-marketing（POST CABINETS本業）
- **seo-specialist**（新）, **landing-page-builder**（新）, **content-marketer**（新）

### 07-meta（agent統括）
- loop-operator, harness-optimizer, chief-of-staff
- **context-manager**（新）

### 99-business
- automation-builder, case-researcher, flyer-composer, sales-writer, training-designer

## コマンド主要ピックアップ

### 必須プロトコル
- `/think` — 着手前プロトコル（真の目的整理）
- `/verify-output` — 成果物の自己検証
- `/design-research` — ビジュアル成果物の参考イメージ先出し
- `/plan` — 実装プラン作成

### 品質
- `/verify` — CI検証
- `/code-review` — コードレビュー
- `/test-coverage` — カバレッジ
- `/refactor-clean` — リファクタ
- **`/smart-fix`** — エラー文から仮説3つ立てて修正案（新）
- **`/tech-debt`** — 技術的負債計測（新）

### Ops
- `/sessions` — セッション一覧
- `/checkpoint` — 状態保存
- **`/handoff`** — 引き継ぎドキュメント生成（新）
- **`/standup`** — 朝会レポート（新）

### Multi-AI
- `/multi-workflow`, `/multi-plan`, `/multi-execute`, `/multi-backend`, `/multi-frontend`

### Learning
- `/learn`, `/evolve`, `/instinct-*`
- **`/memory-cleanup`** — メモリ整理（新）

## 今後の整理候補
1. agents/ commands/ の旧フラットファイルをカテゴリへ移動（既存slash command名は維持される）
2. Stop hooks（anti-give-up, self-review）を hooks/stop/README.md から正式配置するか判断
3. settings.json に PreToolUse hooks 登録
4. 重複の多い commands（go-* 系を `commands/02-language/go/` へ等）の整理
5. rules/ にCLAUDE.mdからスタック規約セクションを分離するか検討
