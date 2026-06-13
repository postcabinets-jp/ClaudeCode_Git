#!/bin/bash
# Claude Code ステータスライン表示スクリプト
# 現在のプロジェクト名・ディレクトリ・モデルをセッションごとに日本語で表示する

input=$(cat)

# 現在のディレクトリを取得
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')

# ディレクトリ名をプロジェクト名として使用（最後のパス要素）
project=$(basename "$cwd")

# モデル表示名を取得
model=$(echo "$input" | jq -r '.model.display_name // empty')

# セッション名（/rename で設定されている場合）
session_name=$(echo "$input" | jq -r '.session_name // empty')

# コンテキスト使用率
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

# --- 表示ラベルのマッピング（よく使うディレクトリに日本語名をつける） ---
case "$cwd" in
  "/Users/apple/claude for me")       label="Claude運用ハブ" ;;
  /Users/apple/claude\ for\ me)       label="Claude運用ハブ" ;;
  *"claude for me"*)                  label="Claude運用ハブ" ;;
  *"line-bot"*)                       label="LINEボット" ;;
  *"notchy"*)                         label="Notchy" ;;
  *"reskilling"*)                     label="リスキリング" ;;
  *"prototypes"*)                     label="プロトタイプ" ;;
  *)                                  label="$project" ;;
esac

# --- 出力組み立て ---
parts=()

# プロジェクト名
if [ -n "$session_name" ]; then
  parts+=("セッション:${session_name}")
else
  parts+=("プロジェクト:${label}")
fi

# ディレクトリ（短縮表示）
if [ -n "$cwd" ]; then
  short_cwd="${cwd/#\/Users\/apple\//~\/}"
  parts+=("📁 ${short_cwd}")
fi

# モデル
if [ -n "$model" ]; then
  parts+=("🤖 ${model}")
fi

# コンテキスト使用率
if [ -n "$used" ]; then
  used_int=$(printf '%.0f' "$used")
  parts+=("文脈:${used_int}%")
fi

# スペース区切りで結合して出力
printf '%s' "$(IFS=' | '; echo "${parts[*]}")"
