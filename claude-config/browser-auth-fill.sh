#!/bin/bash
# browser-auth-fill.sh — Keychain の認証情報をクリップボード経由で入力欄へ渡す
#
# 方式（既定: clipboard）:
#   Keychain値 → pbcopy（クリップボード）→ 呼び出し側が Chrome MCP の Cmd+V で貼付 → clear で即消去
#   - 秘密の値は標準出力に出さない／argv にも載せない（env 経由）
#   - 貼付は Chrome MCP のキーイベントで行うため「OS最前面」問題を受けない（確実にタブの欄へ入る）
#   - 唯一の残留面=クリップボード。貼付直後に必ず `clear` を呼ぶこと。
#
# 使い方:
#   bash ~/.claude/browser-auth-fill.sh email      # メールをクリップボードへ → 呼び出し側でCmd+V
#   bash ~/.claude/browser-auth-fill.sh password   # パスワードをクリップボードへ → 呼び出し側でCmd+V
#   bash ~/.claude/browser-auth-fill.sh clear       # クリップボードを空にする（貼付後すぐ実行）
#
# 代替（keystroke方式・フォールバック）: METHOD=keystroke を付けるとOSキーストロークでタイプ。
#   ※ Chrome を最前面にし、対象欄にOSフォーカスが要る。MCP操作と併用しづらいので非推奨。

set -u
SERVICE="claude-browser-auth"
FIELD="${1:-}"
METHOD="${METHOD:-clipboard}"

if [ "$FIELD" = "clear" ]; then
  printf '' | pbcopy
  echo "OK: クリップボードを消去しました。"
  exit 0
fi

case "$FIELD" in
  email)    ACCT="google-email" ;;
  password) ACCT="google-password" ;;
  *)
    echo "ERROR: 第1引数は email / password / clear のいずれか。" >&2
    exit 2 ;;
esac

VAL="$(security find-generic-password -w -s "$SERVICE" -a "$ACCT" 2>/dev/null)"
if [ -z "$VAL" ]; then
  echo "ERROR: '$ACCT' が Keychain にありません。先に browser-auth-setup.sh を実行してください。" >&2
  exit 3
fi

if [ "$METHOD" = "keystroke" ]; then
  BROWSER_APP="${BROWSER_APP:-Google Chrome}"
  osascript -e "tell application \"$BROWSER_APP\" to activate" >/dev/null 2>&1
  sleep 0.5
  if ! AUTHVAL="$VAL" osascript >/dev/null 2>&1 <<'APPLESCRIPT'
tell application "System Events"
    keystroke (system attribute "AUTHVAL")
end tell
APPLESCRIPT
  then
    echo "ERROR: keystroke 失敗。アクセシビリティ許可を確認してください。" >&2
    unset VAL; exit 4
  fi
  unset VAL
  echo "OK: $FIELD をタイプしました（keystroke）。"
  exit 0
fi

# 既定: clipboard 方式
if printf '%s' "$VAL" | pbcopy; then
  unset VAL
  echo "OK: $FIELD をクリップボードへ。次に Chrome MCP で Cmd+V → 貼付後に 'clear' を実行。"
else
  unset VAL
  echo "ERROR: pbcopy 失敗。" >&2
  exit 5
fi
