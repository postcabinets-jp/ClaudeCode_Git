---
name: project-x-radar
description: XのAI情報自動収集→Obsidian保存システム（x-radar）の構成
metadata: 
  node_type: memory
  type: project
  originSessionId: 478ea3b2-6bb8-4ec2-a201-c625ce274bd2
---

X Radarシステム（2026-05-18 構築 / 2026-05-27 全面再設計）。Xのホームタイムライン＋ブックマークを2時間ごとに取得し、Nobuの3軸でHaikuが分類・スコアリングしてObsidianノートとして保存。

**Why:** 「収集するだけで読まない・使わない」状態を解消するため、収集軸をNobuの仕事に直結させ、アウトカム（提案）まで出す設計に変更。

**3軸設計（2026-05-27〜）:**
- `ai_tool`: Claude Code/Obsidian/MCPで今すぐ使える技術情報 → Nobuが試せるものを高評価
- `business`: Webマーケ/SNS/LP/集客/中小企業DX → POST CABINETSのクライアント提案に使える情報
- `seiji`: 大阪府政策/維新/副首都/議会動向 → 議会質問・政策提案に使える情報
※旧カテゴリ（claudecode/obsidian/openclaw/hermesagent/ai-general）は廃止

**アウトカム設計:**
- 日次ダイジェストに `## 🎯 Nobuへの提案` セクション追加（2件・具体的アクション形式）
- /MTG Phase 1 でこの提案を差し込む（MTG.md更新待ち）
- 週次ダイジェスト（Opus）に「今週TOP3アクション」「来週ウォッチ」「フィルタリング品質メモ」追加

**Dreaming改善ループ:**
- 月曜セッション終了時に `/dreaming` コマンドで週次レビュー実行
- Nobuの「使えた/ノイズだった」フィードバック → config.yaml の keywords を更新
- 改善ログ: `~/.config/x-radar/improvement_log.jsonl`

**構成:**
- スクリプト: `~/.config/x-radar/` (config.yaml / lib/*.py)
- Obsidian出力: `~/note/wiki/ai-radar/`
- launchd: 3本 (x-radar-fetch: 2h, x-radar-digest: 毎朝08:00, x-radar-weekly: 日曜19:00)
- Cookie切れ (約30日ごと): macOS通知 → `bin/import-cookies` で再インポート

**How to apply:** 次の /MTG から Phase 1 に「AI Radar今日の提案」を差し込む。月曜は /dreaming でレビューして config.yaml を改善する。
