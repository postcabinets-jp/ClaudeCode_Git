#!/usr/bin/env node
/**
 * 週次レビュー自動化スクリプト
 * - COPAIN — Weekly の今週エントリを集計
 * - COPAIN — Projects の状況を取得
 * - Discordに週次サマリーを投稿
 * - 翌週エントリをWeekly DBに作成
 *
 * 実行: npm run weekly:review
 * 推奨: 毎週金曜 21:00 に launchd で自動実行
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionHeaders } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const webhook = process.env.DISCORD_WEBHOOK_URL;
const hubPath = resolve(root, ".notion-hub.json");

if (!token) { console.error("NOTION_TOKEN未設定"); process.exit(1); }
if (!webhook) { console.error("DISCORD_WEBHOOK_URL未設定"); process.exit(1); }
if (!existsSync(hubPath)) { console.error(".notion-hub.json がありません"); process.exit(1); }

const hub = JSON.parse(readFileSync(hubPath, "utf8"));
const projectsId = hub.databases?.projects?.id;
const weeklyId = hub.databases?.weekly?.id;
const headers = notionHeaders(token);

// 日付ユーティリティ
const today = new Date();
const jst = (d) => new Date(d.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
const todayJST = jst(today);
const dayOfWeek = todayJST.getDay(); // 0=日, 5=金
const isoDate = todayJST.toISOString().slice(0, 10);

// 今週の月曜を計算
const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
const monday = new Date(todayJST);
monday.setDate(todayJST.getDate() + mondayOffset);
const mondayStr = monday.toISOString().slice(0, 10);

// 来週月曜
const nextMonday = new Date(monday);
nextMonday.setDate(monday.getDate() + 7);
const nextMondayStr = nextMonday.toISOString().slice(0, 10);
const nextFriday = new Date(nextMonday);
nextFriday.setDate(nextMonday.getDate() + 4);
const nextFridayStr = nextFriday.toISOString().slice(0, 10);

// 今週番号（簡易）
const weekNum = Math.ceil(todayJST.getDate() / 7);
const weekLabel = `Week ${todayJST.getFullYear()}-${String(todayJST.getMonth()+1).padStart(2,"0")}-W${weekNum}`;
const nextWeekLabel = `Week ${nextMonday.getFullYear()}-${String(nextMonday.getMonth()+1).padStart(2,"0")}-W${Math.ceil(nextMonday.getDate()/7)}`;

// --- Projects 取得 ---
const projRes = await fetch(`https://api.notion.com/v1/databases/${projectsId}/query`, {
  method: "POST", headers,
  body: JSON.stringify({ page_size: 20 }),
});
const projData = await projRes.json();
const projects = projData.results ?? [];

const active = projects.filter(p => p.properties?.Status?.select?.name === "Active");
const blocked = projects.filter(p => p.properties?.Status?.select?.name === "Blocked");
const done = projects.filter(p => p.properties?.Status?.select?.name === "Done");

const pName = (p) => p.properties?.Name?.title?.map(t => t.plain_text).join("") ?? "(無題)";
const pNext = (p) => p.properties?.["Next action"]?.rich_text?.map(t => t.plain_text).join("") ?? "";

// --- Weekly DB 今週エントリ取得 ---
let weeklyEntry = null;
if (weeklyId) {
  const wRes = await fetch(`https://api.notion.com/v1/databases/${weeklyId}/query`, {
    method: "POST", headers,
    body: JSON.stringify({ page_size: 10 }),
  });
  const wData = await wRes.json();
  // 今週のエントリを探す
  weeklyEntry = wData.results?.find(r => {
    const title = r.properties?.Week?.title?.map(t => t.plain_text).join("") ?? "";
    return title.includes(weekLabel) || title.includes(mondayStr);
  });
}

// --- Discord 投稿メッセージ構築 ---
const lines = [
  `## 週次レビュー ${isoDate} （${weekLabel}）`,
  "",
  `**Active: ${active.length}件 / Blocked: ${blocked.length}件 / Done: ${done.length}件**`,
  "",
];

if (active.length) {
  lines.push("### 進行中プロジェクト");
  for (const p of active) {
    lines.push(`• **${pName(p)}**`);
    const next = pNext(p);
    if (next) lines.push(`  → ${next}`);
  }
  lines.push("");
}

if (blocked.length) {
  lines.push("### ブロック中");
  for (const p of blocked) lines.push(`• **${pName(p)}**`);
  lines.push("");
}

lines.push(`### 来週フォーカス（${nextMondayStr} 〜 ${nextFridayStr}）`);
lines.push("_Notionの Weekly DBに来週エントリを作成しました。Focus/Top3を記入してください。_");

let content = lines.join("\n");
if (content.length > 1900) content = content.slice(0, 1900) + "\n…(truncated)";

// Discord投稿
const wh = await fetch(webhook, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content }),
});
if (!wh.ok) {
  console.error("Discord投稿失敗:", wh.status, await wh.text());
  process.exit(1);
}
console.log("OK: 週次レビューをDiscordに投稿しました。");

// --- 来週エントリを Weekly DB に作成 ---
if (weeklyId) {
  const rt = (s) => ({ rich_text: [{ type: "text", text: { content: s } }] });
  const title = (s) => ({ title: [{ type: "text", text: { content: s } }] });

  const createRes = await fetch("https://api.notion.com/v1/pages", {
    method: "POST", headers,
    body: JSON.stringify({
      parent: { database_id: weeklyId },
      properties: {
        Week: title(nextWeekLabel),
        Focus: rt("（来週のフォーカスをここに記入）"),
        "Top 3": rt("1) \n2) \n3) "),
        Blockers: rt("なし"),
      },
    }),
  });
  const created = await createRes.json();
  if (createRes.ok) {
    console.log("OK: 来週のWeeklyエントリを作成しました →", created.url);
  } else {
    console.error("Weekly作成失敗:", created);
  }
}
