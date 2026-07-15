---
name: ""
description: カレンダー書込み2原則—政治家活動は政治家カレンダーに書く／色は勝手に変えない
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ae7636a6-decf-4c86-b4fa-298908b0c241
---

# カレンダー書込みルール（2026-06-17 確定）

カレンダーに予定を作成・更新するときの絶対原則：

1. **政治家活動の予定は「政治家カレンダー」に書く** = `maeda.nobumi@gmail.com`（政治家メイン・スケジュール集約先）。
   - 地域活動・議会/政調マター・広報（維新PRESS等）・駅立ち・訪問などはすべてここ。
   - 個人の時間ブロック（トレ・思考整理・睡眠・朝食等）は `bachikanshikoku@gmail.com`（My Calendar）でよい。
   - POSTCABINETS事業は `postcabinets@gmail.com`。
   - 領域で書き分ける。デフォルトでbachikanshikoku（個人）に政治家予定を作らない。

2. **イベントの色（colorId）を勝手に変えない／勝手に付けない。**
   - 新規作成時も `colorId` を指定せず、カレンダー既定色のままにする。
   - 既存イベントの色を更新作業のついでに変えない。

3. **ドラフトを見るべきタイミングのイベント説明欄にObsidianリンクを入れる。**
   - 形式: `obsidian://open?vault=note&file=raw/政治家/<ファイル>.md` ＋ 素のパスも併記。
   - 例: マニフェスト確認枠→達成シート叩き台、維新PRESS枠→叩き台、駅立ち→SNS草案。

**Why:** 2026-06-17のSUMで、地域活動・マニフェスト確認・維新PRESSの3枠を個人カレンダー（bachikanshikoku）に作り、colorIdも勝手に付けた。Nobu指摘＝「政治家活動の更新は政治家カレンダーに書いて」「勝手に色は変えないで」「今後ルールとして覚えておいて」。また各ドラフトを今すぐ見ないので、見るタイミングのカレンダー説明にObsidianリンクを入れる要望も同時に出た。

**How to apply:** `/MTG` Phase 3・`mtg_prep`・あらゆるカレンダー書込みで厳守。書込み先calendarIdを領域で選ぶ。colorId引数は付けない。委任ドラフトを生成したら、それを使う時間帯のイベントdescriptionにobsidianリンクを差す。
