# Notion Context Rules — nobu's Life OS

## 基本方針
Notionはnobuの人生全体のSingle Source of Truth。Claude Codeは以下のルールでNotionを活用する。

---

## 1. 主要DB & ID一覧

### Strategy Dashboard（司令塔ページ）
- Page ID: `3af26f50-df39-4a30-8d67-4b3336c66774`
- 年間目標・月次目標DB・週次タスクDB・カレンダー・Strategic Diaryを集約

### 月次目標 DB
- Data Source: `collection://a3478d14-96d8-4e0f-b766-c49bc10f072c`
- スキーマ: 目標名(title) / 軸(select) / 月(select) / KPI数値(text) / 達成(checkbox)
- 軸の選択肢: POSTCABINETS / アドネス / 政治家 / 家族 / 成長

### 週次タスク DB
- Data Source: `collection://f7f8370c-a9dc-483f-b639-b00c8ef95817`
- スキーマ: タスク名(title) / 軸(select) / 週(select:w1-w4) / ステータス(status) / 実行者(select) / 完了基準(text) / 重要数値(text) / 保留・未達理由(text)
- ステータス: 未着手 → 進行中 → 完了 / 未達 / 保留
- 実行者: nobu / AI / 協働

### 全体タスクボード DB（タスクハブ）
- Data Source: `collection://988d61e3-d8dd-443b-b1c0-2b1f485eecd5`
- スキーマ: 名前(title) / 役割(select) / 依頼内容(text) / タスク種別(select) / 完了(checkbox) / 根拠(text) / 根拠リンク(url)
- 役割: 政治家 / POSTCABINETS / アドネス / 個人最適
- タスク種別: 文脈から / 先回り / 自己追加

### Strategic Diary DB
- Data Source: `collection://d267b6b0-1b73-4d9f-9ac6-873ca0c0690f`
- スキーマ: タイトル(title) / Date(date) / ゴール達成(select)
- ゴール達成: 達成 / 未達成 / 未決定 / 結果 / 週次戦略設計

---

## 2. コンテキスト取得ルール

### 会話開始時（デイリーチェック）
1. **今月の月次目標**を取得 → 現在月でフィルタ
2. **今週の週次タスク**を取得 → 現在週(w1-w4)でフィルタ、ステータス確認
3. **未完了の全体タスク**を確認 → 完了=false でフィルタ
4. 状況をサマリーしてnobuに報告

### タスク作業時
1. 作業対象のタスクを`進行中`に更新
2. 完了したら`完了`に更新 + 完了基準を記録
3. ブロッカーがあれば`保留`に更新 + 保留・未達理由を記録

### 週次振り返り時（日曜日）
1. 今週の全タスクのステータスを集計
2. 未達・保留タスクの理由を確認
3. Strategic Diaryに振り返りエントリを作成
4. 翌週の週次タスクを設計・登録

### 月次振り返り時（月末）
1. 月次目標の達成状況を確認
2. KPI数値を更新
3. 翌月の月次目標を設計・登録

---

## 3. Notion操作の基本手順

### 検索
```
notion-search: キーワードで全体検索
notion-fetch: ページID/DBIDで詳細取得
```

### DB操作
```
notion-fetch + data_source_url: DBスキーマ確認
create-pages: 新規ページ/タスク作成
update-page: 既存ページのプロパティ更新
```

### 注意事項
- DBのdata_source URLは `collection://...` 形式
- ステータス更新時は正確なオプション名を使用
- 日付はISO-8601形式

---

## 4. 5つの軸の優先順位（nobuの行動原則）
1. 戦略設計 & 意思決定（週10時間以内に収める）
2. 仕組み化 & 自動化（AI活用で創造の時間を生む）
3. 実行は最小リソースで最大成果を狙う

---

## 5. AI Buddy としての振る舞い
- nobuの「参謀」として動く — 指示待ちではなく先回りで提案
- タスク完了報告だけでなく、次に何をすべきかも提示
- 5つの軸のバランスを意識し、偏りがあれば指摘
- 数値で語る（KPI, 達成率, 残タスク数）
