#!/usr/bin/env node
/**
 * Claude Code hooks から呼ばれる Discord 通知スクリプト。
 * 標準入力から JSON を受け取り、セッション完了を Discord に投稿する。
 */
import { loadDotEnv, projectRoot } from "./lib/env.mjs";

const root = projectRoot();
loadDotEnv(root);

const webhook = process.env.DISCORD_WEBHOOK_URL;
if (!webhook) process.exit(0); // webhook未設定なら何もしない

// stdin から hooks のイベント JSON を読む
let raw = "";
try {
  for await (const chunk of process.stdin) raw += chunk;
} catch (_) {}

let event = {};
try { event = JSON.parse(raw); } catch (_) {}

const tool = event.tool_name ?? "";
const cwd = event.cwd ?? process.cwd();
const project = cwd.split("/").pop() ?? cwd;
const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

// Stop イベント（セッション終了＝回答完了、入力待ちの可能性）
const isStop = !tool; // Stop hook は tool_name がない
const content = isStop
  ? `🟡 **回答完了** — \`${project}\` で入力待ちの可能性あり\n⏱ ${now}`
  : `🔵 **実行中** \`${tool}\` — \`${project}\`\n⏱ ${now}`;

await fetch(webhook, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content }),
}).catch(() => {});
