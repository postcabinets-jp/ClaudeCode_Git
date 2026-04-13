#!/usr/bin/env node
/**
 * COPAIN LINE Bot — 最小バックエンド
 *
 * フロー:
 *   ユーザーがLINEでメッセージ送信
 *   → LINE Platform → Webhook (このサーバー)
 *   → Claude API でレスポンス生成
 *   → LINE Reply API でユーザーに返信
 *
 * 起動: node server.mjs
 * 外部公開: ngrok http 3000
 */
import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// .envを読み込む（lib/env.mjsを流用）
function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] ??= m[2].trim();
  }
}
loadEnv();

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT ?? 3000;

// 起動チェック
const missing = [];
if (!LINE_CHANNEL_SECRET) missing.push("LINE_CHANNEL_SECRET");
if (!LINE_CHANNEL_ACCESS_TOKEN) missing.push("LINE_CHANNEL_ACCESS_TOKEN");
if (!ANTHROPIC_API_KEY) missing.push("ANTHROPIC_API_KEY");
if (missing.length) {
  console.error("❌ 未設定の環境変数:", missing.join(", "));
  console.error("   .envに追加してください");
  process.exit(1);
}

// LINE署名検証
function verifySignature(body, signature) {
  const hash = createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");
  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
}

// Claude APIでレスポンス生成
async function generateReply(userMessage, userId) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: `あなたはCOPAINというAIアシスタントです。
nobu（POST CABINETS代表）のLINE公式アカウントに来たメッセージに返信します。
以下の原則で動いてください：
- 簡潔に、でも温かみのある返信
- 質問には具体的に答える
- わからないことは正直に「わかりません」と言う
- 返信は日本語、200文字以内を目安に`,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Claude API error: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

// LINE Reply API
async function replyToLine(replyToken, message) {
  const res = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text: message }],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`LINE Reply error: ${JSON.stringify(err)}`);
  }
}

// HTTPサーバー
const server = createServer(async (req, res) => {
  // ヘルスチェック
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "COPAIN LINE Bot" }));
    return;
  }

  // Webhook エンドポイント
  if (req.method === "POST" && req.url === "/webhook") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks);
    const bodyStr = body.toString("utf8");

    // 署名検証
    const signature = req.headers["x-line-signature"];
    if (!signature || !verifySignature(body, signature)) {
      console.warn("⚠️  署名検証失敗");
      res.writeHead(401);
      res.end("Unauthorized");
      return;
    }

    // 即座に200を返す（LINEの要件）
    res.writeHead(200);
    res.end("OK");

    // イベント処理（非同期）
    let payload;
    try {
      payload = JSON.parse(bodyStr);
    } catch {
      console.error("JSON parseエラー");
      return;
    }

    for (const event of payload.events ?? []) {
      if (event.type !== "message" || event.message?.type !== "text") continue;

      const userMessage = event.message.text;
      const replyToken = event.replyToken;
      const userId = event.source?.userId ?? "unknown";

      console.log(`[${new Date().toLocaleString("ja-JP")}] userId=${userId} message="${userMessage}"`);

      try {
        const reply = await generateReply(userMessage, userId);
        await replyToLine(replyToken, reply);
        console.log(`→ 返信完了: "${reply.slice(0, 50)}..."`);
      } catch (err) {
        console.error("エラー:", err.message);
        // エラー時はシンプルなメッセージを返す
        try {
          await replyToLine(replyToken, "申し訳ありません、エラーが発生しました。少し後でもう一度お試しください。");
        } catch {}
      }
    }
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`🤖 COPAIN LINE Bot 起動中 → http://localhost:${PORT}`);
  console.log(`   Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`   HealthCheck: http://localhost:${PORT}/health`);
  console.log(`   外部公開:    ngrok http ${PORT}`);
});
