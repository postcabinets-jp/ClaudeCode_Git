---
name: launchd-background-child
description: "launchdジョブ内の `( sleep; retry ) &` は親終了時に殺され一度も実行されない。リトライは同一プロセス内で行う"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 0bd5ddc5-4482-41bd-8d71-dd3d9a43aac1
---

launchd配下のシェルスクリプトで `( sleep 300; 再実行 ) &` のようにバックグラウンド起動した子プロセスは、**親が終了した時点でlaunchdに殺される**（AbandonProcessGroup未設定のデフォルト挙動）。limitless_syncの0件時リトライがこのパターンで、設計以来一度も実行されていなかった（リトライ結果ログが皆無なことで確認・2026-07-10）。

修正: 同一プロセス内で `sleep 300` → `exec bash "$0"` に変更（ジョブが5分延びるだけ）。

**Why:** サイレントに機能停止していて、ログを時系列で読むまで誰も気づかなかった。
**How to apply:** launchdスクリプトで遅延リトライ・後処理を書くときは `&` で切り離さない。同期実行するか、別のlaunchdジョブ（watchdog）に任せる。関連: [[limitless-timezone-fix]] [[feedback_single_writer_principle]]
