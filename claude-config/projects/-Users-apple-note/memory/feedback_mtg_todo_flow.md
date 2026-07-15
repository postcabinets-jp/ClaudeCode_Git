---
name: mtg-todo
description: ルーティン惰性ToDoをやめ、Googleタスク正本確認＋ゴール起点の新規タスク生成に変える
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 5406e35f-8c31-4d6a-9ee9-f68d4ecdf3a3
---

# 朝会のToDo整理フロー変更（2026-05-29 Nobu指示）

## 1. ToDoの状態確認は「Googleタスク正本」を先に読む
- やりたいこと/ToDoの温度感を出す前に、**まずGoogleタスクの完了/未完了を読む**。
- 読み取りは `_system/.venv/bin/python` で Tasks API を直接叩く（completed含めてlist）。
  - ⚠️ `todo_sync_gtasks.py --read-only` は**未実装**（pushのみ）。MEMORY/MTG.mdの記載は誤り。
  - ⚠️ venvパスは `_system/.venv`（`.system/.venv` ではない。MTG.md/MEMORY.mdの記載は誤り）。
- 「何が終わってて何が残ってるか」をGTasks基準で確定してから整理する。

## 2. ルーティン惰性ToDoを再生成しない
- `@ToDo.md` の🔥今すぐに「SNS投稿/読書/連絡まくり/YEG論点」を毎日書く → sync が delete+recreate → 完了マークがリセット → **毎日同じルーティンを延々やる罠**に陥っていた。
- これらは完了 or 自己管理へ移行。🔥今すぐには**ゴール起点の新規タスクだけ**を置く。

## 3. 新しいやりたいこと・論点を毎日捕捉する
- 朝会・Limitless・Dailyから出た**新規のやりたいこと/論点を毎日 `wiki/やりたいこと.md` に追記**する（出典リンク付き）。
- そうしないとゴール起点のToDoが更新されず、新しいものが出てこない。
- 例: 2026-05-28に出た「地域活性化PJ（キッザニア型商店街）」を翌朝やりたいことへ反映。

## 4. GoogleTask一本化（2026-06-01改訂・@ToDo.md廃止）
- ⚠️ **@ToDo.md は廃止**（`raw/_archive/`へ退避）。**当日やる単発タスクの正本は Google Tasks のみ**。markdown中間ファイルとの二重管理（漏れの温床）をやめた。
- 旧 `todo_sync_gtasks.py`（→`.deprecated`）／ launchd `todo-gtasks-sync`（→停止）は退役。`HH:MM→カレンダー自動生成`機能も廃止（予定はカレンダー直接入力）。
- GoogleTaskはフラット運用。タイトル先頭に時間絵文字1つ（🔥今日 / 📅今週 / 📌いつか）。ステップはnotesに書く。サブタスク（親子ツリー）は作らない。
- **⚠️ AI/MTGからのGTask書込み（作成・完了・削除）は廃止（2026-06-19）。GTaskは読み取り専用。** 読み取りは Tasks API 直読（venv `_system/.venv/bin/python` / token `wiki/_meta/secrets/token.json` / scope `auth/tasks`）。タスクの作成・完了・削除・正本管理はすべて**Nobu本人が手動**で行う（スマホで消化）。MTG/prepは状況を収集して把握に使うだけ。
- 戦略・仕込み・次の一手は `wiki/プロジェクト.md`（戦略レイヤー）。「①今週やる」と決めたものだけ GoogleTask へ一方通行で降ろす（同期不要）。

## 5. SNS投稿の自動確認チェックは廃止
- SNSは自分で書いて自分で投稿する方が早い（Obsidian側のSNSコマンドも見直し予定）。
- 朝会で「SNS投稿 何日連続未着手」の自動検出・催促は**やめる**。

**Why:** Nobuが2026-05-29に「毎日同じルーティンToDoをやってるに過ぎなくなる。ゴールに基づいたToDoが更新されない」と問題指摘。
**How to apply:** /MTG Phase 0 で GTasks 読み取りを先に実施 → Phase 0-e/0-e2 のタスク棚卸しはGTasks基準。**Phase 4 でGTaskへの書込みはしない（2026-06-19廃止・読み取り専用）**、新規の作戦/論点は `wiki/プロジェクト.md` へ反映。SNS連続未着手の催促は出さない。
**更新（2026-06-01）:** @ToDo.md廃止・GoogleTask一本化。中間markdownの二重管理をやめ、漏れの温床を構造的に除去（§4参照）。
