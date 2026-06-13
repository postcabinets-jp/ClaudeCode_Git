---
description: セッション終了時の学び保存 + 週1でAI Radar品質改善。学びをMemoryに保存して次セッションに引き継ぐ
---

# /dreaming — Dreaming Summary プロトコル

このセッションで得た知見を整理・保存し、未来の自分への引き継ぎを完了してください。

## Step 0: Obsidian note 差分チェック

以下のコマンドで前回Dreaming以降に更新されたnoteファイルを取得し、メモリ更新が必要な変化がないか確認する：

```bash
find ~/note -name "*.md" -newer ~/.claude/projects/-Users-apple/memory/.last_dreaming \
  -not -path "*/.git/*" \
  -not -path "*/.obsidian/*" \
  -not -path "*/ai-radar/*" \
  | sort
```

**読む優先度（差分ファイルに応じて）**
- `Daily/` → 必ず読む。重要な意思決定・繰り返しテーマを拾う
- `wiki/life/` → 読む。ミッション・人生計画の変化は即メモリ更新
- `wiki/goals/` → 読む。目標・思考のクセの変化を反映
- `wiki/政治/` `wiki/POSTCABINETS/` → 政治・事業の重大な変化のみ

差分から **user_nobu_profile.md** または **project_political_activity.md** を更新すべき変化があれば、Step 3で反映する。

## Step 1: セッションの棚卸し

今セッションで発生した以下を洗い出す：
- Nobuからの指摘・修正依頼（どんな小さなものでも）
- うまくいったアプローチ・ツール選択
- 詰まったポイントと解決策
- プロジェクト固有の発見（制約・構造・非自明な背景）
- 外部システム（API・認証・DB）で調べたこと

## Step 2: Memory振り分け判定

各発見を以下の基準で分類：

| 種別 | 保存する？ | 理由 |
|------|-----------|------|
| Nobuの指摘・好み | **必ず保存** (feedback) | 次回同じことを言わせない |
| うまくいった非自明な手法 | **保存** (feedback) | 再利用できる |
| プロジェクト決定事項 | **保存** (project) | コードには書いていない背景 |
| 外部システムの接続情報 | **保存** (reference) | 次回また調べるのは無駄 |
| コード規約・ファイル構造 | スキップ | コードを読めば分かる |
| 今回だけの一時情報 | スキップ | 揮発でよい |

## Step 3: Memoryファイルを作成・更新

既存ファイルの更新か新規作成かを判断してから書く。

**フォーマット厳守**（Why + How to apply なしは不合格）：
```markdown
---
name: タイトル
description: 1文（MEMORY.mdのフック）
type: feedback | user | project | reference
---

[本文：具体的なルール/事実。抽象禁止。数字・固有名詞・実例を入れる]

**Why:** [なぜこのルールが生まれたか]
**How to apply:** [いつ・どう使うか。例外は？]
```

## Step 4: MEMORY.md インデックスを更新

新規ファイルを追加したら `~/.claude/projects/-Users-apple/memory/MEMORY.md` に1行追記。
200行を超えたら古いエントリを整理してから追記。

## Step 5: Dreaming Summaryを出力

```markdown
## Dreaming Summary — {今日の日付}

### 今日の主な学び（3点まで）
1. [具体的。「〜したら〜だった。次回は〜する」形式]
2. ...
3. ...

### 更新・作成したMemoryファイル
- {ファイル名} — {何を追加/変更したか1行}

### 未来の自分へ
[次回セッション開始時に最初にやるべきこと1文]
```

## Step 6: タイムスタンプ更新

```bash
touch ~/.claude/projects/-Users-apple/memory/.last_dreaming
```

次回Dreamingの差分チェック起点を更新する。必ず実行すること。

## チェックリスト（完了判定）

- [ ] Obsidian note差分をチェックした（Step 0）
- [ ] 保存すべき学びを1つ以上Memoryに記録した（何もなければ理由を明記）
- [ ] Why + How to apply が全Memoryファイルに書かれている
- [ ] MEMORY.md インデックスが最新状態
- [ ] Dreaming Summaryを出力した
- [ ] `.last_dreaming` タイムスタンプを更新した（Step 6）
- [ ] AI Radar週次レビューを実行したか（月曜セッション終了時のみ）

---

## AI Radar 週次レビュー（月曜セッション終了時に実行）

**実行タイミング**: 月曜のセッション終了時、または Nobu から「AI Radar どう？」と聞かれた時。
それ以外の曜日はスキップ。

### R-1. 今週のダイジェストをスキャン

```bash
ls -t ~/note/wiki/ai-radar/daily/ | head -7
```

各 daily の `## 🎯 Nobuへの提案` セクションを拾い、今週の提案リストを作る。

### R-2. Nobuにフィードバックを聞く（3問）

```
【AI Radar 今週レビュー — 3問だけ】

① 今週の提案で「使えた」「面白かった」ものは？（なければ「なし」）
② 「全然関係ない・ノイズだった」と感じたジャンルは？
③ 「本当はこういう情報が欲しかった」というのはある？
```

### R-3. config.yaml を更新（承認後）

Nobu のフィードバックを基に `~/.config/x-radar/config.yaml` を修正:

| フィードバック | 変更箇所 |
|---|---|
| 「〇〇系のノイズが多い」 | `exclude_keywords` に追加、または当カテゴリ削除 |
| 「〇〇の情報が欲しい」 | 対応カテゴリの `keywords` に追加 |
| 「スコア低いのが混じる」 | `min_score_for_note` を6→7に引き上げ |

差分をNobuに見せて承認してから書き込む。

### R-4. 改善ログ記録

```bash
echo '{"date":"YYYY-MM-DD","good":["..."],"noise":["..."],"changes":["..."]}' \
  >> ~/.config/x-radar/improvement_log.jsonl
```

### R-5. Memory更新

`project_x_radar.md` に今週の改善内容を追記（2〜3行で十分）。
