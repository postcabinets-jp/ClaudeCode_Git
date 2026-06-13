#!/usr/bin/env bash
# PreToolUse hook: 機密ファイルへの読み書きをブロック
set -euo pipefail

input=$(cat)
tool_name=$(echo "$input" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_name',''))" 2>/dev/null || echo "")
path=$(echo "$input" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); ti=d.get('tool_input',{}); print(ti.get('file_path') or ti.get('path') or '')" 2>/dev/null || echo "")

if [ -z "$path" ]; then
  exit 0
fi

block() {
  echo "BLOCKED: 機密ファイルへのアクセス: $path" >&2
  echo "理由: $1" >&2
  echo "本当に必要ならユーザーに明示確認してください。" >&2
  exit 2
}

# Write/Edit は強くブロック、Readは警告のみ
case "$path" in
  *.env|*.env.*|*credentials*|*secret*|*.pem|*.key|*token*|*.p12|*.pfx)
    if [ "$tool_name" = "Write" ] || [ "$tool_name" = "Edit" ]; then
      block "認証情報・鍵ファイルの書き換えは禁止"
    fi
    ;;
esac

exit 0
