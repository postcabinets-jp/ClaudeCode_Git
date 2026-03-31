// scripts/discord-bot-daemon.mjs
// Discord Gateway WebSocket 常駐Bot
// Mac mini の launchd で常時起動する。
// メッセージを受信したら即座に discord-morning-reply.mjs を呼び出す。
//
// 起動: node scripts/discord-bot-daemon.mjs
// launchd: scripts/launchd/com.postcabinets.discord-bot-daemon.plist.example

import { spawnSync } from "node:child_process";
import { resolve, existsSync } from "node:path";
import { createRequire } from "node:module";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { sendMessage } from "./lib/discord-bot.mjs";

const require = createRequire(import.meta.url);
const WebSocket = require("ws");

const root = projectRoot();
loadDotEnv(root);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_MORNING_CHANNEL_ID = process.env.DISCORD_MORNING_CHANNEL_ID;

if (!DISCORD_BOT_TOKEN) {
  console.error("[bot-daemon] DISCORD_BOT_TOKEN が未設定です");
  process.exit(1);
}

const GATEWAY_URL = "wss://gateway.discord.gg/?v=10&encoding=json";
const INTENTS = (1 << 9) | (1 << 15); // GUILD_MESSAGES + MESSAGE_CONTENT

let heartbeatInterval = null;
let lastSequence = null;
let ws;

function log(msg) {
  const ts = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  console.log(`[${ts}] [bot-daemon] ${msg}`);
}

function connect() {
  log("Discord Gateway に接続中...");
  ws = new WebSocket(GATEWAY_URL);

  ws.on("open", () => {
    log("WebSocket接続完了");
  });

  ws.on("message", (data) => {
    const payload = JSON.parse(data.toString());
    const { op, d, s, t } = payload;

    if (s) lastSequence = s;

    // Op 10: Hello → Heartbeat開始 + Identify
    if (op === 10) {
      const interval = d.heartbeat_interval;
      log(`Heartbeat interval: ${interval}ms`);

      // 最初のHeartbeatをランダム遅延で送る（Discord推奨）
      setTimeout(() => sendHeartbeat(), Math.random() * interval);
      heartbeatInterval = setInterval(() => sendHeartbeat(), interval);

      // Identify（ログイン）
      ws.send(JSON.stringify({
        op: 2,
        d: {
          token: DISCORD_BOT_TOKEN,
          intents: INTENTS,
          properties: { os: "darwin", browser: "postcabinets-bot", device: "mac-mini" },
        },
      }));
    }

    // Op 11: Heartbeat ACK
    if (op === 11) {
      // 正常
    }

    // Op 0: Dispatch イベント
    if (op === 0) {
      if (t === "READY") {
        log(`Bot ready: ${d.user.username}#${d.user.discriminator}`);
      }

      if (t === "MESSAGE_CREATE") {
        handleMessage(d);
      }
    }

    // Op 7: Reconnect
    if (op === 7) {
      log("Reconnect要求。再接続します...");
      reconnect();
    }

    // Op 9: Invalid Session
    if (op === 9) {
      log("Invalid Session。3秒後に再接続します...");
      setTimeout(() => reconnect(), 3000);
    }
  });

  ws.on("close", (code) => {
    log(`接続が切れました (code: ${code})。5秒後に再接続します...`);
    clearInterval(heartbeatInterval);
    setTimeout(() => reconnect(), 5000);
  });

  ws.on("error", (err) => {
    log(`WebSocketエラー: ${err.message}`);
  });
}

function sendHeartbeat() {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ op: 1, d: lastSequence }));
  }
}

function reconnect() {
  clearInterval(heartbeatInterval);
  try { ws.terminate(); } catch (_) {}
  connect();
}

async function handleMessage(msg) {
  // Botのメッセージは無視
  if (msg.author?.bot) return;

  // 対象チャンネル以外は無視
  if (msg.channel_id !== DISCORD_MORNING_CHANNEL_ID) return;

  log(`メッセージ受信: ${msg.author.username}: ${msg.content.slice(0, 50)}`);

  // セッションファイルがなければ今日分を作成してから返信スクリプトを呼ぶ
  const morningStatePath = resolve(root, ".morning-session.json");
  if (!existsSync(morningStatePath)) {
    const today = new Date().toISOString().slice(0, 10);
    const { writeFileSync } = await import("node:fs");
    writeFileSync(morningStatePath, JSON.stringify({
      date: today,
      messageId: msg.id,
      channelId: DISCORD_MORNING_CHANNEL_ID,
      status: "active",
      lastProcessedMessageId: null,
    }, null, 2));
    log(`セッションファイルを新規作成: ${today}`);
  }

  // 朝ミーティング返信スクリプトを実行
  const result = spawnSync(
    process.execPath,
    [resolve(root, "scripts/discord-morning-reply.mjs")],
    { cwd: root, stdio: "pipe", timeout: 3 * 60 * 1000, encoding: "utf8" }
  );

  if (result.status !== 0) {
    log(`返信スクリプトエラー: ${result.stderr?.slice(0, 200)}`);
    await sendMessage(
      DISCORD_BOT_TOKEN,
      DISCORD_MORNING_CHANNEL_ID,
      "⚠️ 処理中にエラーが発生しました。しばらく待ってもう一度試してください。"
    ).catch(() => {});
  } else {
    log(`返信完了: ${result.stdout?.slice(0, 100)}`);
  }
}

// プロセス終了時のクリーンアップ
process.on("SIGTERM", () => {
  log("SIGTERM受信。終了します。");
  clearInterval(heartbeatInterval);
  ws?.terminate();
  process.exit(0);
});

process.on("SIGINT", () => {
  log("SIGINT受信。終了します。");
  clearInterval(heartbeatInterval);
  ws?.terminate();
  process.exit(0);
});

log("Discord Bot Daemon 起動");
connect();
