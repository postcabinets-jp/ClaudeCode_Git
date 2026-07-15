---
name: limitless-timezone-fix
description: Limitless APIはtimezone=Asia/Tokyo必須。未指定だとUTC日付境界でJSTの朝が前日に流れ0件になる
metadata: 
  node_type: memory
  type: reference
  originSessionId: 0bd5ddc5-4482-41bd-8d71-dd3d9a43aac1
---

Limitless API（`/v1/lifelogs?date=YYYY-MM-DD`）は **`timezone=Asia/Tokyo` を必ず付ける**。未指定だとUTC境界で日付が切られ、JST 00:00〜09:00のデータが前日側に流れる。

**実測（2026-07-10）:** `date=2026-07-09` がtz無しで0件、`timezone=Asia/Tokyo` で2件。2026-07-10に `~/.openclaw/scripts/limitless-daily-digest.sh` のfetchパラメータへ恒久追加済み。

**切り分け手順:** 0件のときは①`direction=desc`で日付指定なし取得→APIが持つ最新データの時刻を見る（ペンダント同期停止の検知）②`timezone=Asia/Tokyo`を付けて再取得（tz問題の検知）。2026-07-09はペンダント側が08:55 JST以降アップロード停止していたのが実データ欠損の主因（[[feedback_limitless_api_discipline]]）。

**Why:** 「必ずとれる。Errorになる理由がない」とNobuが明言していたのに0件が続き、prepの✅やったことが空になった。
**How to apply:** Limitless API を叩くスクリプトを書く/直すときは常にtimezoneパラメータを確認。0件即「データなし」と結論しない。
