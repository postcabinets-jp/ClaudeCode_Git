---
name: YouTubeダイジェストはAI/政治/ビジネスに厳格限定
description: youtube_digestの抽出ジャンルはNobuの3本柱だけ。スポーツ・エンタメ・健康等は除外
type: feedback
---

YouTubeダイジェスト（`_system/scripts/youtube_digest.py`、launchd `com.postcabinets.youtube-digest` 02:30）が抽出する動画は **AI・政治・ビジネスの3本柱のみ**。サッカー等スポーツ、エンタメ、健康・グルメ等のジャンル外は**いくらバズっていても載せない**。

**真因（2026-06-17修正）が2つ:**
1. **ジャンルフィルタが無かった**: ミッション(MISSION_KEYWORDS=🏛政治/🏢POSTCABINETS/🤖AI・発信)は弱い加点(+0.3)なだけで、ランキングは `base = 再生数 ÷ チャンネル平均`（バズ度）が支配。→ バズったスポーツ動画(W杯3.5x)がAI動画(2.1x)を常に押しのけていた。
2. **`"ai"` が部分一致**: `"ai" in haystack` が `tr**ai**ning` / `av**ai**lable` 等に誤爆。英語説明文の動画が軒並み🤖タグを得て紛れ込む。

**修正内容（実装済み）:**
- ミッションを**加点→ハードフィルタ化**: `mission_tags_of()` が空（3本柱に1ヒットも無い）動画は `skipped_offtopic` で除外。`select_top_videos` のスコア計算前に挿入。
- ASCIIキーワードは**語境界一致** `_kw_hit()`（`(?<![a-z0-9])kw(?![a-z0-9])`）。日本語は部分一致のまま。
- フィルタログに `ジャンル外除外=N` を追加（静かな切り捨て禁止）。
- 検証: W杯/健康/ラーメン/Premier League("ai"誤爆狙い)=全除外、Claude/ChatGPT自動化=🤖、維新議会=🏛、SNSマーケ=🏢。意図通り。

**Why:** Nobuが「最近YouTube要約がジャンル外ばかり」と指摘（2026-06-17）。スポーツはどうでもいい、AI/政治/ビジネスに完全に絞れ、と明言。
**How to apply:** youtube_digest.py を触るとき①ハードフィルタ(mission_tags空=除外)②語境界一致 を壊さない。新ジャンルを足したい時は MISSION_KEYWORDS に柱/語を追加（ASCII短語は語境界で誤爆しないか確認）。再選定は重い(API+NotebookLMスライド)ので翌02:30の自動実行に任せる。
