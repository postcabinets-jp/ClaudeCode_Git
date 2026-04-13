"""
Tanuki MCP Client — MCPサーバーとJSON-RPC over stdioで通信する

MCPプロトコル:
- サーバーをサブプロセスで起動（stdin/stdout通信）
- initialize → tools/list でツール取得
- tools/call でツール実行
"""

import json
import subprocess
import sys
import os
import threading
from pathlib import Path


class MCPServer:
    """1つのMCPサーバーとの接続を管理"""

    def __init__(self, name: str, command: str, args: list[str], env: dict | None = None):
        self.name = name
        self.command = command
        self.args = args
        self.env = env or {}
        self.process: subprocess.Popen | None = None
        self.tools: list[dict] = []
        self._request_id = 0
        self._lock = threading.Lock()

    def start(self) -> bool:
        """サーバープロセスを起動"""
        try:
            full_env = {**os.environ, **self.env}
            self.process = subprocess.Popen(
                [self.command] + self.args,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=full_env,
                text=False,  # バイナリモード
            )
            # initialize
            resp = self._send_request("initialize", {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "tanuki", "version": "0.1.0"}
            })
            if resp is None:
                return False

            # initialized通知
            self._send_notification("notifications/initialized", {})

            # ツール一覧取得
            tools_resp = self._send_request("tools/list", {})
            if tools_resp and "tools" in tools_resp:
                self.tools = tools_resp["tools"]

            return True

        except FileNotFoundError:
            print(f"  [MCP] {self.name}: コマンドが見つかりません: {self.command}")
            return False
        except Exception as e:
            print(f"  [MCP] {self.name}: 起動エラー: {e}")
            return False

    def call_tool(self, tool_name: str, arguments: dict) -> str:
        """MCPツールを実行"""
        resp = self._send_request("tools/call", {
            "name": tool_name,
            "arguments": arguments
        })
        if resp is None:
            return "エラー: MCPサーバーからの応答なし"

        # レスポンスからテキストを抽出
        if "content" in resp:
            parts = []
            for item in resp["content"]:
                if item.get("type") == "text":
                    parts.append(item["text"])
                elif item.get("type") == "resource":
                    parts.append(json.dumps(item, ensure_ascii=False))
            return "\n".join(parts) if parts else json.dumps(resp, ensure_ascii=False)

        return json.dumps(resp, ensure_ascii=False)

    def stop(self):
        """サーバーを停止"""
        if self.process and self.process.poll() is None:
            try:
                self.process.stdin.close()
                self.process.wait(timeout=5)
            except Exception:
                self.process.kill()

    def _next_id(self) -> int:
        with self._lock:
            self._request_id += 1
            return self._request_id

    def _send_request(self, method: str, params: dict) -> dict | None:
        """JSON-RPCリクエストを送信して応答を待つ"""
        if not self.process or self.process.poll() is not None:
            return None

        msg = {
            "jsonrpc": "2.0",
            "id": self._next_id(),
            "method": method,
            "params": params
        }
        return self._send_and_receive(msg)

    def _send_notification(self, method: str, params: dict):
        """JSON-RPC通知を送信（応答なし）"""
        if not self.process or self.process.poll() is not None:
            return

        msg = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params
        }
        self._write_message(msg)

    def _send_and_receive(self, msg: dict) -> dict | None:
        """メッセージを送信して応答を受信"""
        try:
            self._write_message(msg)

            # 応答を読む
            while True:
                line = self.process.stdout.readline()
                if not line:
                    return None

                line_str = line.decode("utf-8").strip()

                # Content-Length ヘッダーを探す
                if line_str.startswith("Content-Length:"):
                    length = int(line_str.split(":")[1].strip())
                    # 空行を読み飛ばす
                    self.process.stdout.readline()
                    # ボディを読む
                    body = self.process.stdout.read(length).decode("utf-8")
                    response = json.loads(body)

                    # 通知は無視してリクエストの応答を待つ
                    if "id" in response and response["id"] == msg.get("id"):
                        if "result" in response:
                            return response["result"]
                        elif "error" in response:
                            return {"error": response["error"]}
                    # idが違う場合は読み続ける
                    continue

                # JSON直接の場合（ヘッダーなし）
                if line_str.startswith("{"):
                    try:
                        response = json.loads(line_str)
                        if "id" in response and response["id"] == msg.get("id"):
                            if "result" in response:
                                return response["result"]
                            elif "error" in response:
                                return {"error": response["error"]}
                    except json.JSONDecodeError:
                        continue

        except Exception as e:
            print(f"  [MCP] {self.name}: 通信エラー: {e}")
            return None

    def _write_message(self, msg: dict):
        """JSON-RPCメッセージを書き込む"""
        body = json.dumps(msg)
        body_bytes = body.encode("utf-8")
        header = f"Content-Length: {len(body_bytes)}\r\n\r\n"
        self.process.stdin.write(header.encode("utf-8") + body_bytes)
        self.process.stdin.flush()


class MCPManager:
    """複数のMCPサーバーを管理"""

    def __init__(self):
        self.servers: dict[str, MCPServer] = {}
        self._tool_to_server: dict[str, str] = {}  # ツール名 → サーバー名

    def load_config(self, config_path: str | Path) -> dict:
        """tanuki.jsonからMCPサーバー設定を読み込む"""
        config_path = Path(config_path)
        if not config_path.exists():
            return {}

        with open(config_path, encoding="utf-8") as f:
            config = json.load(f)

        return config.get("mcpServers", {})

    def start_servers(self, servers_config: dict):
        """設定に基づいてMCPサーバーを起動"""
        for name, conf in servers_config.items():
            print(f"  [MCP] {name} を起動中...")
            server = MCPServer(
                name=name,
                command=conf["command"],
                args=conf.get("args", []),
                env=conf.get("env"),
            )
            if server.start():
                self.servers[name] = server
                # ツール → サーバーのマッピングを作成
                for tool in server.tools:
                    tool_name = tool["name"]
                    self._tool_to_server[tool_name] = name
                print(f"  [MCP] {name}: OK（ツール {len(server.tools)}個）")
            else:
                print(f"  [MCP] {name}: 起動失敗")

    def get_all_tools(self) -> list[dict]:
        """全サーバーのツールを統合して返す"""
        all_tools = []
        for server in self.servers.values():
            for tool in server.tools:
                all_tools.append({
                    "name": tool["name"],
                    "description": tool.get("description", ""),
                    "parameters": tool.get("inputSchema", {}).get("properties", {}),
                    "source": f"mcp:{server.name}",
                })
        return all_tools

    def call_tool(self, tool_name: str, arguments: dict) -> str:
        """ツール名からサーバーを特定して実行"""
        server_name = self._tool_to_server.get(tool_name)
        if not server_name:
            return f"エラー: MCPツール '{tool_name}' が見つかりません"

        server = self.servers.get(server_name)
        if not server:
            return f"エラー: MCPサーバー '{server_name}' に接続されていません"

        return server.call_tool(tool_name, arguments)

    def has_tool(self, tool_name: str) -> bool:
        """MCPツールかどうか判定"""
        return tool_name in self._tool_to_server

    def stop_all(self):
        """全サーバーを停止"""
        for server in self.servers.values():
            server.stop()
