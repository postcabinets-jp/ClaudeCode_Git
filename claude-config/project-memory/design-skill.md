---
name: design-skill
description: /designコマンドの存在と主要スペック。デザイン関連の依頼時に参照。
type: project
---

`/design` コマンドが `/Users/apple/.claude/commands/design.md` に作成済み。

**Why:** LP・名刺・SNS・スライド・ブランドガイドラインを統合的に扱うプロレベルのデザインSkillが必要だったため。

**How to apply:** デザイン関連の依頼（LP作成・名刺・SNSビジュアル等）には `/design` コマンドを案内する。

## 主要仕様
- 対応タイプ: lp / card(91mm×55mm) / sns / slides / brand / ui
- 12スタイルプリセット: LUXURY, EDITORIAL, CORPORATE_JP, POLITICIAN, POST_CABINETS, BRUTALIST, MINIMAL_ZEN, TECH_DARK, SNS_WARM, SNS_COOL, GRADIENT_MODERN, PRINT_CARD
- 日本語フォント: Noto Sans JP, Zen Old Mincho, Shippori Mincho B1, M PLUS 1p 等
- WCAG 2.1 AA準拠・アニメーション（prefers-reduced-motion対応）・Tailwind対応
- Pencil.dev MCP統合（.penファイル出力対応）
- アンチパターン禁止: Inter禁止・紫グラデ禁止・outline:none禁止等
