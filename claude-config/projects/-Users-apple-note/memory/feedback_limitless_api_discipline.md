---
name: LimitlessAPIエラーは「必ず取れる」前提で根本解決
description: LimitlessAPIがエラーになってもNobuは「絶対取れる」と確信している。諦め報告禁止
type: feedback
---

## ルール

LimitlessAPIがエラーになっても「取れません」「APIが応答しません」で諦めるのは禁止。
Nobuは「**必ずとれる。Errorになる理由がない**」と明言（2026-06-30）。

## 対応手順

1. エラーログを確認して原因を特定（API鍵切れ / URL変更 / レスポンス形式変更 / ネットワーク等）
2. `~/.note-system/logs/` の最新ログを読む
3. curlで直接APIを叩いてレスポンスを確認する
4. 原因特定後に修正 → 動作確認してから報告

## Why

2026-06-30セッションでLimitlessデータがDailyページに取得できていない問題が発生。
エラーが複数回発生していたにもかかわらず根本解決されていなかった。
Nobuは「必ずとれる」と確信しており、Claude側が諦めると信頼を失う。

**How to apply:**
- limitless-sync.sh / limitless-daily-digest.sh がエラーを返した場合、即座にログを確認
- 「LimitlessAPIが一時的に不調」扱いで迂回せず、必ず根本原因を突き止める
- 取得できたデータは必ずDailyのログとして残す設計にする（データ欠損を後から追えるように）
