# Stop hooks（要・手動配置）

Stop hookは「Claude自身の応答を制御する」性質があるため、エージェントが勝手に設置するとSelf-Modificationになる。
Nobuが内容を確認した上で配置するため、ここには**設計案だけ**置いておく。

## 1. anti-give-up.sh（「できません」検出してブロック）

直前のassistantメッセージに「できません」「不可能です」等が含まれていて、かつ「代替案」「物理的に」などの根拠が無い場合、ブロックして代替手段を試させる。

### 配置方法
1. 下記スクリプトを `~/.claude/hooks/stop/anti-give-up.sh` として保存
2. `chmod +x` する
3. `~/.claude/settings.json` の `hooks.Stop` に追加：
```json
{
  "hooks": {
    "Stop": [
      {"hooks": [{"type": "command", "command": "$HOME/.claude/hooks/stop/anti-give-up.sh"}]}
    ]
  }
}
```

### スクリプト本体（コピペ用）

```bash
#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
transcript=$(echo "$input" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('transcript_path',''))" 2>/dev/null || echo "")
stop_active=$(echo "$input" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('stop_hook_active',False))" 2>/dev/null || echo "False")

if [ "$stop_active" = "True" ]; then exit 0; fi
if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then exit 0; fi

last_assistant=$(tail -100 "$transcript" 2>/dev/null | /usr/bin/python3 -c "
import sys, json
last_text = ''
for line in sys.stdin:
    try:
        d = json.loads(line)
        if d.get('type') == 'assistant':
            msg = d.get('message', {})
            content = msg.get('content', [])
            if isinstance(content, list):
                for c in content:
                    if isinstance(c, dict) and c.get('type') == 'text':
                        last_text = c.get('text', '')
            elif isinstance(content, str):
                last_text = content
    except: pass
print(last_text[-2000:])
" 2>/dev/null || echo "")

[ -z "$last_assistant" ] && exit 0

give_up='できません|できませんでした|不可能です|無理です|対応できません|実装できません|アクセスできません|権限がありません|サポートされていません'

if echo "$last_assistant" | grep -qE "$give_up" ; then
  if echo "$last_assistant" | grep -qE '代替案|別の方法|別ルート|fallback|ここまでは|ここから先は|物理的に' ; then
    exit 0
  fi
  cat <<'JSON'
{
  "decision": "block",
  "reason": "「できません」で終わらせるのは禁止（CLAUDE.md 0-2違反）。\n\n以下を必ず実行してください：\n1. 代替手段を最低3つ試したか自問する\n2. ブラウザ操作なら Chrome MCP → computer-use → Playwright の順で試したか\n3. データ取得なら MCP → API → WebFetch → ユーザーに鍵要求 の順で試したか\n4. それでも無理なら「ここまではできた／ここから先は物理的に絶対無理／代替案A・B」の形式で報告\n\nもう一度、代替手段を試してから報告してください。"
}
JSON
fi
exit 0
```

## 2. self-review-reminder.sh（5件以上編集したら自己レビュー強制）

セッション中に Write/Edit を5回以上使ったのに quality-reviewer エージェントも /verify-output も呼んでいない場合、自己レビューを促してブロック。

### スクリプト本体

```bash
#!/usr/bin/env bash
set -euo pipefail

input=$(cat)
transcript=$(echo "$input" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('transcript_path',''))" 2>/dev/null || echo "")
stop_active=$(echo "$input" | /usr/bin/python3 -c "import sys,json; print(json.load(sys.stdin).get('stop_hook_active',False))" 2>/dev/null || echo "False")

[ "$stop_active" = "True" ] && exit 0
[ -z "$transcript" ] || [ ! -f "$transcript" ] && exit 0

counts=$(/usr/bin/python3 - <<PYEOF
import json
edits = 0
reviewed = False
try:
    with open("$transcript") as f:
        for line in f:
            try:
                d = json.loads(line)
                if d.get('type') == 'assistant':
                    content = d.get('message', {}).get('content', [])
                    if isinstance(content, list):
                        for c in content:
                            if isinstance(c, dict) and c.get('type') == 'tool_use':
                                name = c.get('name', '')
                                if name in ('Write', 'Edit', 'NotebookEdit'):
                                    edits += 1
                                if name in ('Task', 'Skill'):
                                    inp_str = str(c.get('input', {})).lower()
                                    if 'quality-reviewer' in inp_str or 'verify' in inp_str or 'review' in inp_str:
                                        reviewed = True
            except: pass
except: pass
print(f"{edits}|{reviewed}")
PYEOF
)

edits=$(echo "$counts" | cut -d'|' -f1)
reviewed=$(echo "$counts" | cut -d'|' -f2)

if [ "$edits" -ge 5 ] && [ "$reviewed" = "False" ]; then
  cat <<'JSON'
{
  "decision": "block",
  "reason": "5件以上のファイル編集を行いましたが、自己レビューが行われていません（CLAUDE.md 0-3違反）。\n\n以下のいずれかを実行してから完了報告：\n- quality-reviewer エージェントを呼ぶ\n- /verify-output で自己検証\n- 主要成果物を Read で読み返し\n\n1周で出すのは禁止。最低1回は自己レビューを回してください。"
}
JSON
fi
exit 0
```

## 配置するかどうかの判断材料

- **メリット**: 「面倒くさい」が物理的にゼロになる。Claudeが諦め報告したら即座に止まり、5件編集後の自己レビューも強制される
- **デメリット**: 偽陽性が出る（正当な「権限ありません」報告でもblock）、Stopが効くと最大3往復程度ループする
- **チューニング**: 偽陽性が出たら正規表現 `give_up` から該当パターンを削るか、`代替案` の許可ワードを追加

## settings.json への追加例

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {"type": "command", "command": "$HOME/.claude/hooks/stop/anti-give-up.sh"},
          {"type": "command", "command": "$HOME/.claude/hooks/stop/self-review-reminder.sh"}
        ]
      }
    ]
  }
}
```
