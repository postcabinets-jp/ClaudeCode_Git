"""
Tanuki — ローカル自律エージェント
Ollama + Qwen3:8b / 対話型チャット + 自律ツール実行 + MCP対応

使い方:
  1. ollama serve（別ターミナル）
  2. source venv/bin/activate
  3. python3 agent.py

設定: tanuki.json（モデル、MCPサーバーなど）
会話履歴: history.json に自動保存
"""

import json
import subprocess
import sys
import os
import re
import datetime
import requests
from pathlib import Path
from mcp_client import MCPManager

# ─── 設定読み込み ───
CONFIG_FILE = Path(__file__).parent / "tanuki.json"
HISTORY_FILE = Path(__file__).parent / "history.json"

def load_config() -> dict:
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}

CONFIG = load_config()
OLLAMA_URL = CONFIG.get("ollamaUrl", "http://localhost:11434/api/chat")
MODEL = CONFIG.get("model", "qwen3:8b")
MAX_TOOL_STEPS = CONFIG.get("maxToolSteps", 10)
MAX_HISTORY = CONFIG.get("maxHistory", 50)

# ─── カラー出力 ───
class C:
    CYAN    = "\033[36m"
    GREEN   = "\033[32m"
    YELLOW  = "\033[33m"
    MAGENTA = "\033[35m"
    DIM     = "\033[2m"
    BOLD    = "\033[1m"
    RESET   = "\033[0m"

# ─── ビルトインツール定義 ───

BUILTIN_TOOLS = {
    "run_shell": {
        "description": "シェルコマンドを実行する。結果を文字列で返す。",
        "parameters": {"command": "実行するシェルコマンド（文字列）"},
    },
    "read_file": {
        "description": "ファイルを読み込んで内容を返す。",
        "parameters": {"path": "読み込むファイルのパス"},
    },
    "write_file": {
        "description": "ファイルに内容を書き込む。既存ファイルは上書きされる。",
        "parameters": {"path": "書き込むファイルのパス", "content": "書き込む内容"},
    },
    "list_files": {
        "description": "指定ディレクトリのファイル一覧を返す。",
        "parameters": {"directory": "一覧を取得するディレクトリパス（デフォルト: カレント）"},
    },
    "web_search": {
        "description": "Webで検索して結果を返す（curl経由）。",
        "parameters": {"query": "検索クエリ"},
    },
}

# ─── MCPマネージャー（グローバル） ───
mcp = MCPManager()


def all_tool_descriptions_for_prompt() -> str:
    """ビルトイン + MCPツールの説明を統合してプロンプト用テキストを生成"""
    lines = []

    # ビルトインツール
    lines.append("### ビルトインツール")
    for name, info in BUILTIN_TOOLS.items():
        params = ", ".join(f'"{k}": {v}' for k, v in info["parameters"].items())
        lines.append(f"- {name}: {info['description']}\n  パラメータ: {{{params}}}")

    # MCPツール
    mcp_tools = mcp.get_all_tools()
    if mcp_tools:
        lines.append("\n### MCPツール（外部サーバー経由）")
        for tool in mcp_tools:
            params_desc = []
            for k, v in tool["parameters"].items():
                desc = v.get("description", "") if isinstance(v, dict) else str(v)
                params_desc.append(f'"{k}": {desc}')
            params_str = ", ".join(params_desc)
            lines.append(f"- {tool['name']}: {tool['description']}\n  パラメータ: {{{params_str}}}  [{tool['source']}]")

    return "\n".join(lines)


# ─── ビルトインツール実行 ───

def execute_builtin_tool(name: str, args: dict) -> str:
    try:
        if name == "run_shell":
            result = subprocess.run(
                args["command"], shell=True,
                capture_output=True, text=True, timeout=30,
            )
            output = result.stdout or result.stderr or "(出力なし)"
            return output[:2000]

        elif name == "read_file":
            path = Path(args["path"]).expanduser()
            if not path.exists():
                return f"エラー: ファイルが見つかりません: {path}"
            return path.read_text(encoding="utf-8")[:3000]

        elif name == "write_file":
            path = Path(args["path"]).expanduser()
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(args["content"], encoding="utf-8")
            return f"OK: {path} に書き込みました（{len(args['content'])}文字）"

        elif name == "list_files":
            directory = Path(args.get("directory", ".")).expanduser()
            if not directory.exists():
                return f"エラー: ディレクトリが見つかりません: {directory}"
            files = sorted(directory.iterdir())
            return "\n".join(
                f"{'[DIR]' if f.is_dir() else '     '} {f.name}"
                for f in files[:50]
            )

        elif name == "web_search":
            query = args["query"]
            result = subprocess.run(
                ["curl", "-s", f"https://lite.duckduckgo.com/lite/?q={query}"],
                capture_output=True, text=True, timeout=10,
            )
            text = re.sub(r"<[^>]+>", " ", result.stdout)
            text = re.sub(r"\s+", " ", text).strip()
            return text[:2000] if text else "検索結果を取得できませんでした"

        else:
            return f"エラー: 不明なビルトインツール: {name}"

    except Exception as e:
        return f"エラー: {e}"


def execute_tool(name: str, args: dict) -> str:
    """ビルトインかMCPかを判定してツール実行"""
    if name in BUILTIN_TOOLS:
        return execute_builtin_tool(name, args)
    elif mcp.has_tool(name):
        return mcp.call_tool(name, args)
    else:
        return f"エラー: 不明なツール: {name}"


# ─── LLM呼び出し ───

def chat_llm(messages: list[dict]) -> str:
    try:
        resp = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "messages": messages, "stream": False},
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()["message"]["content"]
    except requests.ConnectionError:
        print(f"\n{C.YELLOW}[エラー] Ollamaに接続できません。ollama serve を実行してください{C.RESET}")
        sys.exit(1)
    except Exception as e:
        return f"[LLMエラー] {e}"


# ─── JSON抽出 ───

def extract_json_block(text: str) -> str | None:
    start = text.find('{"tool"')
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    return None


def extract_tool_call(response: str) -> dict | None:
    match = re.search(r"```json\s*(.*?)\s*```", response, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    block = extract_json_block(response)
    if block:
        try:
            return json.loads(block)
        except json.JSONDecodeError:
            pass
    return None


# ─── 会話履歴の保存/読み込み ───

def save_history(messages: list[dict]):
    to_save = [m for m in messages if m["role"] != "system"]
    HISTORY_FILE.write_text(json.dumps(to_save, ensure_ascii=False, indent=2), encoding="utf-8")


def load_history() -> list[dict]:
    if HISTORY_FILE.exists():
        try:
            data = json.loads(HISTORY_FILE.read_text(encoding="utf-8"))
            if isinstance(data, list):
                return data
        except (json.JSONDecodeError, Exception):
            pass
    return []


# ─── システムプロンプト ───

def build_system_prompt() -> str:
    return f"""あなたは「Tanuki」というローカル自律エージェントです。変幻自在に何でもこなす。ユーザーと会話しながら、必要に応じてツールを使ってタスクを実行します。

## 利用可能なツール
{all_tool_descriptions_for_prompt()}

## 動作モード

### 会話モード（ツール不要の場合）
普通に日本語で応答する。そのまま自然に返す。

### 実行モード（ツールが必要な場合）
1. ツールを使う場合は、以下のJSON形式「のみ」を出力する:
   {{"tool": "ツール名", "args": {{"パラメータ名": "値"}}}}
2. ツールの結果を受け取ったら、次のステップに進むか、結果を報告する
3. 全てのタスクが完了したら、結果を自然な日本語で報告する

## ルール
- 1回の応答では1つのツール呼び出し、または会話応答のどちらか
- ツール呼び出しのときはJSON以外のテキストを混ぜない
- 危険なコマンド（rm -rf / など）は絶対に実行しない
- ユーザーとの会話の文脈を踏まえて応答する
- 現在時刻: {datetime.datetime.now().strftime("%Y-%m-%d %H:%M")}
"""


# ─── メインの対話ループ ───

def process_turn(user_input: str, messages: list[dict]) -> str:
    """ユーザーの1発言を処理し、最終応答を返す"""
    messages.append({"role": "user", "content": user_input})

    for step in range(MAX_TOOL_STEPS):
        response = chat_llm(messages)
        tool_call = extract_tool_call(response)

        if tool_call and "tool" in tool_call and "args" in tool_call:
            tool_name = tool_call["tool"]
            tool_args = tool_call["args"]

            # MCPツールかビルトインかを表示で区別
            if mcp.has_tool(tool_name):
                print(f"  {C.MAGENTA}[MCP] {tool_name}({json.dumps(tool_args, ensure_ascii=False)}){C.RESET}")
            else:
                print(f"  {C.DIM}[ツール] {tool_name}({json.dumps(tool_args, ensure_ascii=False)}){C.RESET}")

            result = execute_tool(tool_name, tool_args)
            print(f"  {C.DIM}[結果] {result[:150]}{C.RESET}")

            messages.append({"role": "assistant", "content": response})
            messages.append({
                "role": "user",
                "content": f"ツール実行結果:\n{result}\n\n結果を踏まえて、次のステップに進むか、完了なら結果を報告してください。"
            })
        else:
            messages.append({"role": "assistant", "content": response})
            return response

    return "[最大ステップ数に達しました]"


def trim_history(messages: list[dict]):
    """system以外のメッセージがMAX_HISTORYを超えたら古いものを削除"""
    non_system = [m for m in messages if m["role"] != "system"]
    if len(non_system) > MAX_HISTORY * 2:
        system = [m for m in messages if m["role"] == "system"]
        keep = non_system[-(MAX_HISTORY * 2):]
        messages.clear()
        messages.extend(system + keep)


def main():
    BANNER = f"""
{C.BOLD}  _____ _   _  _ _   _ _  ___
 |_   _/_\\ | \\| | | | | |/ /_ _|
   | |/ _ \\| .` | |_| |   < | |
   |_/_/ \\_\\_|\\_|\\___/|_|\\_\\___|{C.RESET}
{C.DIM}  Local Autonomous Agent — {MODEL}{C.RESET}
"""
    print(BANNER)

    # MCPサーバー起動
    mcp_config = CONFIG.get("mcpServers", {})
    if mcp_config:
        print(f"{C.DIM}  MCPサーバーを起動中...{C.RESET}")
        mcp.start_servers(mcp_config)
        print()

    # ツール一覧表示
    builtin_names = list(BUILTIN_TOOLS.keys())
    mcp_tool_names = [t["name"] for t in mcp.get_all_tools()]
    all_names = builtin_names + mcp_tool_names
    print(f"{C.DIM}  ツール({len(all_names)}): {', '.join(all_names)}")
    print(f"  /clear（履歴削除） /history（履歴表示） /tools（ツール一覧） /quit（終了）{C.RESET}")
    print()

    # 会話履歴を復元
    messages = [{"role": "system", "content": build_system_prompt()}]
    past = load_history()
    if past:
        messages.extend(past)
        print(f"{C.DIM}  [前回の会話を復元しました（{len(past)}メッセージ）]{C.RESET}\n")

    try:
        while True:
            try:
                user_input = input(f"{C.CYAN}You:{C.RESET} ").strip()
            except (EOFError, KeyboardInterrupt):
                print(f"\n{C.DIM}[終了]{C.RESET}")
                save_history(messages)
                break

            if not user_input:
                continue

            # コマンド処理
            if user_input in ("/quit", "/exit"):
                save_history(messages)
                print(f"{C.DIM}[保存して終了]{C.RESET}")
                break
            elif user_input == "/clear":
                messages = [{"role": "system", "content": build_system_prompt()}]
                if HISTORY_FILE.exists():
                    HISTORY_FILE.unlink()
                print(f"{C.DIM}[会話履歴をクリアしました]{C.RESET}")
                continue
            elif user_input == "/history":
                count = len([m for m in messages if m["role"] == "user"])
                print(f"{C.DIM}[会話ターン数: {count}]{C.RESET}")
                continue
            elif user_input == "/tools":
                print(f"\n{C.BOLD}ビルトインツール:{C.RESET}")
                for name, info in BUILTIN_TOOLS.items():
                    print(f"  {name}: {info['description']}")
                mcp_tools = mcp.get_all_tools()
                if mcp_tools:
                    print(f"\n{C.BOLD}MCPツール:{C.RESET}")
                    for tool in mcp_tools:
                        print(f"  {C.MAGENTA}{tool['name']}{C.RESET}: {tool['description']}  [{tool['source']}]")
                print()
                continue

            # エージェント処理
            response = process_turn(user_input, messages)
            print(f"{C.GREEN}Tanuki:{C.RESET} {response}\n")

            # 履歴管理
            trim_history(messages)
            save_history(messages)

    finally:
        # MCPサーバー停止
        mcp.stop_all()


if __name__ == "__main__":
    main()
