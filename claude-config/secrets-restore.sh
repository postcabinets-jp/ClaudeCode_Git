#!/bin/bash
# secrets-restore.sh — Keychain バックアップから認証ファイルを復旧
#
# 使い方:
#   ./secrets-restore.sh --list            登録済みバックアップのパス一覧
#   ./secrets-restore.sh <絶対パス>         指定ファイルを Keychain から書き戻し（権限 600）
#   ./secrets-restore.sh --all             全ファイルを書き戻し（既存は上書き・要注意）
#
# secrets-backup.sh と対。鍵の値は表示しない。

set -u
SERVICE="claude-cred-backup"

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

restore_one() {
  local f="$1"
  local b64
  b64=$(security find-generic-password -s "$SERVICE" -a "$f" -w 2>/dev/null)
  if [ -z "$b64" ]; then
    echo "  NG Keychainに無し: $f"; return 1
  fi
  mkdir -p "$(dirname "$f")"
  if echo "$b64" | base64 -d > "$f"; then
    chmod 600 "$f"; echo "  OK restored (600): $f"
  else
    echo "  NG 書込失敗: $f"; return 1
  fi
}

case "${1:-}" in
  --list)
    echo "=== Keychain バックアップ済みパス ==="
    for f in "${FILES[@]}"; do
      if security find-generic-password -s "$SERVICE" -a "$f" -w >/dev/null 2>&1; then
        echo "  [x] $f"
      else
        echo "  [ ] $f"
      fi
    done
    ;;
  --all)
    echo "全ファイルを Keychain の内容で上書きします。"
    for f in "${FILES[@]}"; do restore_one "$f"; done
    ;;
  "" )
    echo "使い方: $0 --list | <絶対パス> | --all"; exit 1
    ;;
  * )
    restore_one "$1"
    ;;
esac
