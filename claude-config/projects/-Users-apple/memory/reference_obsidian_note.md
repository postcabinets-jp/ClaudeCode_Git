---
name: Obsidian noteの構造と差分読み取りルール
description: ~/noteの主要フォルダと、Dreaming時にどこを差分チェックするかのルール
type: reference
originSessionId: e2a7e6d4-e4da-4fbd-8e05-983829555e57
---
## noteの主要フォルダ構成（2026-05-28 更新）

正本は `~/note/CLAUDE.md`。

| フォルダ | 内容 | 優先度 |
|---|---|---|
| `Daily/YYYY-MM-DD.md` | 毎日の朝会・思考・気づき | 最高（毎回読む） |
| `raw/Limitless/YYYY-MM-DD.md` | Limitless正本（外部生成・夜） | 高（MTG Phase 0で読む） |
| `raw/政治家/` | 政治活動の生メモ・現場記録 | 中（追加時） |
| `raw/POSTCABINETS/` | 事業の生メモ・打合せメモ | 中（追加時） |
| `wiki/goals/2026.md` | 2026年ゴール・思考のクセ | 中（月1更新） |
| `wiki/life/Mission.md` | ミッションステートメント | 低（更新時のみ） |
| `wiki/life/LifeDesign.md` | 人生年表・30年ロードマップ | 低（更新時のみ） |
| `wiki/政治/` | 政治活動ナレッジ | 中（追加時） |
| `wiki/POSTCABINETS/` | 事業ナレッジ | 中（追加時） |
| `wiki/Mentors/` | メンター・学び | 低（追加時） |
| `wiki/weekly/YYYY-MM/Wn.md` | 週次ログ | 高（週次レビュー時） |

## Dreaming時の差分チェック手順

```bash
# 直近24時間以内に更新されたnoteファイルを取得
find ~/note -name "*.md" -newer ~/.claude/projects/-Users-apple/memory/.last_dreaming \
  -not -path "*/.git/*" \
  -not -path "*/.obsidian/*" \
  -not -path "*/ai-radar/*" \
  | sort
```

## 差分からメモリ更新する判断基準

**即メモリ更新すべきもの**
- LifeDesign・Missionの変更（人生の方向性が変わった）
- 2026年ゴールの大きな変更（目標値・優先順位）
- 政治活動の重大な変化（役職変更・方針転換）
- 思考のクセ・行動原則の追記

**Daily（毎日）から拾うべきもの**
- 重要な意思決定・方針転換
- 強い感情・こだわりが見えた発言
- 繰り返し出てくるテーマ（3回以上 → メモリ化）

**スキップしてよいもの**
- その日限りのスケジュール・タスク
- 出力コンテンツ（outputs/）の中身
- ai-radar（X収集）の内容

## タッチポイントの管理
- `.last_dreaming` タイムスタンプファイルでDreaming実行時刻を記録
- Dreaming実行後に `touch ~/.claude/projects/-Users-apple/memory/.last_dreaming` で更新
