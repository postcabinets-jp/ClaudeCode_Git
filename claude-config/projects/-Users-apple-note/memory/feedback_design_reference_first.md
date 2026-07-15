---
name: ビジュアル成果物は参考イメージ先出し必須
description: スライド/LP/UI/画像生成は文字仕様だけで作り始めず、参考イメージ3〜5枚を先に提示してNobuに方向選択させる
type: feedback
originSessionId: 6edc0b7b-c899-4557-99ff-fa4446c78e62
---
ビジュアル成果物（スライド・LP・UI・ロゴ・画像）は、文字仕様だけで作り始めない。
参考イメージを3〜5枚先出し → Nobuが方向選択 → 初版作成 → ブラウザレンダリング → 自己レビュー → 修正 → 提出。

**Why:** デザインを文言で書いても完成イメージは見えない。作って出して「全然違う」修正ループが死ぬほど面倒くさい。

**How to apply:**
- `/design-research [テーマ]` を呼ぶか、相当の手順を踏む
- リサーチソース：Chrome MCPで既存サイト実測 / WebFetchでPinterest・Dribbble・Awwwards / `meigen-ai-design:gen` でラフ生成 / `pencil` MCPで類似テンプレ検索
- 3〜5枚は**明確に違う方向性**であること（微妙差異3枚は禁止）
- 既に参考が明示されている場合（「このサイトみたいに」）はChrome MCPで実測してcomputed style取得してから着手
- Claude/Anthropic配色（オレンジ茶系・claude.ai風）は絶対禁止。実在ブランドの実測値ベースで配色
- スライド系ツール優先順位：`slide-generator` → `frontend-slides` → `pencil` → `pptx` skill
