#!/bin/bash
# browser-auth-setup.sh — ブラウザ自動認証用の認証情報を macOS Keychain に登録する
#
# 方式: Keychain generic-password に保存。
#   service(-s) = claude-browser-auth
#   account(-a) = google-email / google-password
# 値は read -s で受け取り画面・履歴・ログに残さない。Claude はこの値を見ない。
#
# 使い方:  bash ~/.claude/browser-auth-setup.sh
#   既存の値を上書きする場合も同じコマンドでOK（-U で上書き）。
#
# 確認:    bash ~/.claude/browser-auth-setup.sh --check   （在否だけ表示・値は出さない）

set -u
SERVICE="claude-browser-auth"

mask_check() {
  local acct="$1"
  if security find-generic-password -s "$SERVICE" -a "$acct" >/dev/null 2>&1; then
    echo "  ✅ $acct : 登録済み"
  else
    echo "  ⛔ $acct : 未登録"
  fi
}

if [ "${1:-}" = "--check" ]; then
  echo "=== claude-browser-auth 登録状況 ==="
  mask_check "google-email"
  mask_check "google-password"
  exit 0
fi

echo "=== ブラウザ自動認証 セットアップ（Google）==="
echo "値は画面に表示されません。Claude もこの値を受け取りません。"
echo

printf "Google メールアドレス: "
read -r EMAIL
if [ -z "$EMAIL" ]; then echo "メールが空です。中止。"; exit 1; fi

printf "Google パスワード（非表示）: "
read -rs PASSWORD
echo
if [ -z "$PASSWORD" ]; then echo "パスワードが空です。中止。"; exit 1; fi

err=0
if security add-generic-password -U -s "$SERVICE" -a "google-email" -w "$EMAIL" 2>/dev/null; then
  echo "  OK: google-email を保存"
else echo "  FAILED: google-email"; err=1; fi

if security add-generic-password -U -s "$SERVICE" -a "google-password" -w "$PASSWORD" 2>/dev/null; then
  echo "  OK: google-password を保存"
else echo "  FAILED: google-password"; err=1; fi

# シェル変数を消す
unset EMAIL PASSWORD

echo
if [ "$err" -eq 0 ]; then
  echo "完了。これらは Keychain ネイティブ保存（= 正本）。ファイル化しないので漏洩面が最小。"
  echo "動作確認: bash ~/.claude/browser-auth-setup.sh --check"
else
  echo "一部失敗しました。Keychain のアクセスを確認して再実行してください。"
  exit 1
fi
