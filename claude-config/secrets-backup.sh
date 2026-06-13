#!/bin/bash
# secrets-backup.sh — 全認証ファイルを macOS Keychain に暗号化バックアップ
#
# 方式: 各ファイルの中身を base64 化し、Keychain の generic-password に丸ごと保存。
#   service(-s) = claude-cred-backup
#   account(-a) = ファイルの絶対パス
# 復旧は secrets-restore.sh。鍵の値は一切表示しない。
#
# 運用: 鍵を更新したら再実行（-U で上書き）。.env は 600 のまま運用継続、Keychain は正本/復旧用。

set -u
SERVICE="claude-cred-backup"

# バックアップ対象（存在するものだけ処理）
FILES=(
  "/Users/apple/claude for me/.env"
  "/Users/apple/claude for me/projects/openshorts/.env"
  "$HOME/.config/x-radar/.env"
  "$HOME/.config/sns-post/postiz.json"
  "$HOME/.config/sns-post/gphotos_token.json"
  "$HOME/.config/sns-post/gphotos_client_secret.json"
  "$HOME/.config/higgsfield/credentials.json"
  "$HOME/.config/gcloud/application_default_credentials.json"
  "$HOME/.config/configstore/firebase-tools.json"
  "$HOME/note/wiki/_meta/secrets/token.json"
  "$HOME/note/wiki/_meta/secrets/credentials.json"
  "$HOME/.claude/channels/discord/.env"
)

ok=0; skip=0; fail=0
echo "=== Keychain バックアップ開始（service=$SERVICE）==="
for f in "${FILES[@]}"; do
  if [ ! -e "$f" ]; then
    echo "  skip （なし）: $f"; skip=$((skip+1)); continue
  fi
  b64=$(base64 < "$f" | tr -d '\n')
  if security add-generic-password -U -s "$SERVICE" -a "$f" -w "$b64" 2>/dev/null; then
    bytes=$(wc -c < "$f" | tr -d ' ')
    echo "  OK backed up: $f (${bytes} bytes)"
    ok=$((ok+1))
  else
    echo "  FAILED: $f"; fail=$((fail+1))
  fi
done
echo "=== 完了: 成功 $ok / スキップ $skip / 失敗 $fail ==="
