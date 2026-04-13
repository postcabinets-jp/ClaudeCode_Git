#!/usr/bin/env node
/**
 * COPAIN 自律ループ — Claude Code 無人実行エントリポイント
 *
 * 使い方:
 *   node scripts/autonomous-loop.mjs [mode]
 *
 * モード:
 *   morning   毎朝の状況確認・タスク整理・Discord投稿（デフォルト）
 *   weekly    週次レビュー（weekly-review.mjs に委譲）
 *   sync      Notionの未完了タスクをチェックしてDiscordに投稿
 *
 * launchd から呼ぶか、Claude Code を --dangerously-skip-permissions で
 * 無人実行するラッパーとして使う。
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionHeaders } from "./lib/notion.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = projectRoot();
loadDotEnv(root);

const mode = process.argv[2] ?? "morning";
const token = process.env.NOTION_TOKEN;
const webhook = process.env.DISCORD_WEBHOOK_URL;
const hubPath = resolve(root, ".notion-hub.json");
const headers = notionHeaders(token);

async function postDiscord(content) {
  if (!webhook) return;
  if (content.length > 1900) content = content.slice(0, 1900) + "\n…(truncated)";
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  }).catch(e => console.error("Discord投稿失敗:", e.message));
}

// ---- morning モード ----
async function morningBriefing() {
  if (!existsSync(hubPath)) {
    await postDiscord("⚠️ .notion-hub.json が見つかりません。`npm run notion:hub` を実行してください。");
    return;
  }
  const hub = JSON.parse(readFileSync(hubPath, "utf8"));
  const projectsId = hub.databases?.projects?.id;
  if (!projectsId) { console.error("projects IDなし"); return; }

  const res = await fetch(`https://api.notion.com/v1/databases/${projectsId}/query`, {
    method: "POST", headers,
    body: JSON.stringify({
      filter: { property: "Status", select: { equals: "Active" } },
      sorts: [{ property: "Priority", direction: "ascending" }],
      page_size: 10,
    }),
  });
  const data = await res.json();
  const projects = data.results ?? [];

  const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const lines = [`**おはようございます、nobu さん** ☀️ ${now}`, ""];

  if (projects.length === 0) {
    lines.push("_Activeなプロジェクトはありません。Notionを確認してください。_");
  } else {
    lines.push(`**今日フォーカスする ${projects.length} 件:**`, "");
    for (const p of projects) {
      const name = p.properties?.Name?.title?.map(t => t.plain_text).join("") ?? "(無題)";
      const next = p.properties?.["Next action"]?.rich_text?.map(t => t.plain_text).join("") ?? "（Next actionを設定してください）";
      const priority = p.properties?.Priority?.number ?? "-";
      lines.push(`**#${priority} ${name}**`);
      lines.push(`→ ${next}`);
      lines.push("");
    }
  }

  lines.push("_Notionで更新 → `npm run pulse:discord` でいつでも再送信_");
  await postDiscord(lines.join("\n"));
  console.log("OK: 朝のブリーフィングをDiscordに投稿しました。");
}

// ---- sync モード ----
async function syncTasks() {
  if (!existsSync(hubPath)) return;
  const hub = JSON.parse(readFileSync(hubPath, "utf8"));
  const projectsId = hub.databases?.projects?.id;
  if (!projectsId) return;

  const res = await fetch(`https://api.notion.com/v1/databases/${projectsId}/query`, {
    method: "POST", headers,
    body: JSON.stringify({ page_size: 20 }),
  });
  const data = await res.json();
  const all = data.results ?? [];
  const byStatus = {};
  for (const p of all) {
    const s = p.properties?.Status?.select?.name ?? "Unknown";
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }

  const lines = ["**プロジェクト同期レポート**", ""];
  for (const [s, count] of Object.entries(byStatus)) {
    lines.push(`• ${s}: ${count}件`);
  }
  await postDiscord(lines.join("\n"));
  console.log("OK: 同期レポートをDiscordに投稿しました。");
}

// ---- weekly モード ----
async function weeklyReview() {
  execSync(`node ${resolve(__dirname, "weekly-review.mjs")}`, { stdio: "inherit" });
}

// ---- 実行 ----
console.log(`[autonomous-loop] mode=${mode}`);
switch (mode) {
  case "morning": await morningBriefing(); break;
  case "weekly":  await weeklyReview(); break;
  case "sync":    await syncTasks(); break;
  default:
    console.error("不明なモード:", mode);
    process.exit(1);
}
