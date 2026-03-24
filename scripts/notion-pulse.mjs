#!/usr/bin/env node
/**
 * Discord Webhook に要約投稿。
 * v2: Active Projects + オープンな Tasks（Todo/Doing/Blocked）
 * v1: Active Projects のみ
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

if (!token) {
  console.error("NOTION_TOKEN が未設定です。");
  process.exit(1);
}
if (!webhook) {
  console.error("DISCORD_WEBHOOK_URL が未設定です。");
  process.exit(1);
}
if (!existsSync(hubPath)) {
  console.error(".notion-hub.json がありません。");
  process.exit(1);
}

const hub = JSON.parse(readFileSync(hubPath, "utf8"));
const projectsId = hub.databases?.projects?.id;
const tasksId = hub.databases?.tasks?.id;
const isV2 = (hub.version ?? 1) >= 2 && tasksId;

if (!projectsId) {
  console.error("projects データベース ID がありません。");
  process.exit(1);
}

const headers = notionHeaders(token);

async function queryDb(databaseId, body) {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

const projRes = await queryDb(projectsId, {
  filter: { property: "Status", select: { equals: "Active" } },
  page_size: 20,
});

const lines = ["**POSTCABINETS — 朝イチサマリー**", "", "### Active Projects", ""];

for (const page of projRes.results ?? []) {
  const p = page.properties;
  const name = p?.Name?.title?.map((t) => t.plain_text).join("") ?? "(無題)";
  const next = p?.["Next action"]?.rich_text?.map((t) => t.plain_text).join("") ?? "";
  const url = p?.URL?.url ?? "";
  lines.push(`• **${name}**`);
  if (next) lines.push(`  Next: ${next}`);
  if (url) lines.push(`  ${url}`);
  lines.push("");
}

if ((projRes.results?.length ?? 0) === 0) {
  lines.push("_Active な Project はありません。_", "");
}

if (isV2) {
  const taskRes = await queryDb(tasksId, {
    filter: {
      or: [
        { property: "Status", select: { equals: "Todo" } },
        { property: "Status", select: { equals: "Doing" } },
        { property: "Status", select: { equals: "Blocked" } },
        { property: "Status", select: { equals: "Inbox" } },
      ],
    },
    page_size: 30,
  });

  lines.push("### オープン Tasks（Inbox〜Blocked）", "");

  for (const page of taskRes.results ?? []) {
    const p = page.properties;
    const t = p?.Title?.title?.map((x) => x.plain_text).join("") ?? "(無題)";
    const st = p?.Status?.select?.name ?? "";
    const ow = p?.Owner?.select?.name ?? "";
    const pr = p?.Priority?.select?.name ?? "";
    lines.push(`• [${st}] **${t}** (${ow}) ${pr}`);
  }

  if ((taskRes.results?.length ?? 0) === 0) {
    lines.push("_オープンな Task はありません。_");
  }
}

let content = lines.join("\n");
if (content.length > 1900) {
  content = content.slice(0, 1900) + "\n…(truncated)";
}

const wh = await fetch(webhook, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ content }),
});

if (!wh.ok) {
  const t = await wh.text();
  console.error("Discord 投稿失敗:", wh.status, t);
  process.exit(1);
}

console.log("OK: Discord にサマリーを投稿しました。");
