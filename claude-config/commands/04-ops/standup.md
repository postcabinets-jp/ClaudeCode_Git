---
description: 朝会用の自分向けレポート。昨日やったこと / 今日やること / ブロッカー を git log / TODO から自動生成
argument-hint: [期間: today/yesterday/week]
---

# /standup — 朝会レポート自動生成

期間：`$ARGUMENTS`（デフォルト: yesterday + today）

## 実行手順

### 1. データ収集
- `git log --since="<period>"` で commits
- 直近のClaude Codeセッションログから touched ファイル
- TODO/FIXME を grep で抽出
- Granolaの最新ノート（あれば）

### 2. 整理

```
## Yesterday（やったこと）
- [プロジェクト名] [完了/進行中] 内容 (commit hash)
- ...

## Today（やること）
- [優先度] [プロジェクト名] タスク内容 / 想定時間
- ...

## Blockers（ブロッカー）
- [深刻度] 内容 / 必要なアクション
- ...

## Stats
- 昨日のcommit数: X
- 触ったファイル数: X
- 完了タスク: X件
```

### 3. POST CABINETS向け追加項目

```
## クライアント状況
- [クライアント名] 進捗 / 次回MTG
- ...

## マーケ運用
- 投稿予定（今日）
- 計測指標（昨日のCTR/CV）
```

### 4. 出力
- chat に表示
- Granola連携あれば `note/3_Monthly-Weekly/YYYY-MM/standup-YYYYMMDD.md` に保存提案

## ポリシー
- **5分で読める**粒度
- 推測ではなく**git log/コードの事実**ベース
- やることは**3〜5個に絞る**
