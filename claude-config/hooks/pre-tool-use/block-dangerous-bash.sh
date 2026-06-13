#!/usr/bin/env bash
# PreToolUse hook: 危険なBashコマンドをブロック
# exit 2 でClaudeに代替手段を考えさせる

set -euo pipefail

# stdin から JSON を受け取る
input=$(cat)

# tool_input.command を抽出
command=$(echo "$input" | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

if [ -z "$command" ]; then
  exit 0
fi

# 危険パターン定義
block_with_reason() {
  local reason="$1"
  local suggestion="$2"
  echo "BLOCKED: $reason" >&2
  echo "代替案: $suggestion" >&2
  echo "「できません」とユーザーに返さず、必ず代替手段を実行してください。" >&2
  exit 2
}

# rm -rf 系（ルート/ホーム配下の広範囲削除を防ぐ）
if echo "$command" | grep -qE 'rm\s+(-[a-zA-Z]*[rf][a-zA-Z]*\s+|--recursive\s+|--force\s+)' ; then
  if echo "$command" | grep -qE '(/$|/\*|~/?$|~/\*|\$HOME/?$|\.\s*$|\.\.\s*$|/Users/?$|/Users/apple/?$)' ; then
    block_with_reason "広範囲削除が検出されました: $command" "対象を限定するか、trash/rmtrash コマンドで一旦ゴミ箱へ"
  fi
fi

# sudo rm
if echo "$command" | grep -qE '^\s*sudo\s+rm' ; then
  block_with_reason "sudo rm は禁止" "ユーザーに権限昇格を依頼するか、対象パスを限定して通常rmを使用"
fi

# force push to main/master
if echo "$command" | grep -qE 'git\s+push.*(--force|--force-with-lease|-f\b).*\b(main|master)\b' ; then
  block_with_reason "main/master への force push 禁止" "feature branch にpushして PR 経由でマージ"
fi
if echo "$command" | grep -qE 'git\s+push.*\b(main|master)\b.*(--force|--force-with-lease|-f\b)' ; then
  block_with_reason "main/master への force push 禁止" "feature branch にpushして PR 経由でマージ"
fi

# curl | sh 系（任意コード実行）
if echo "$command" | grep -qE 'curl[^|]*\|\s*(sh|bash|zsh)' ; then
  block_with_reason "curl | sh は任意コード実行" "一旦ファイルに落として中身を確認してから実行"
fi
if echo "$command" | grep -qE 'wget[^|]*\|\s*(sh|bash|zsh)' ; then
  block_with_reason "wget | sh は任意コード実行" "一旦ファイルに落として中身を確認してから実行"
fi

# DB破壊操作
if echo "$command" | grep -qiE '(DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE\s+TABLE)' ; then
  block_with_reason "DB破壊的操作が検出されました" "本当に必要ならユーザーに確認、または--dry-run系で挙動を確認"
fi
if echo "$command" | grep -qiE 'DELETE\s+FROM\s+\w+\s*(;|$)' ; then
  block_with_reason "WHERE句なしDELETEが検出されました" "WHERE句で対象を限定するか、SELECT で件数確認してから"
fi

# git reset --hard
if echo "$command" | grep -qE 'git\s+reset\s+--hard' ; then
  block_with_reason "git reset --hard は作業を消す" "git stash で退避するか、新しいbranchで作業継続"
fi

exit 0
