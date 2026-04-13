#!/usr/bin/env node
/**
 * 非同期レーン: 昨日の思考ノートをスキャンして TasksDB に登録し Discord 通知する
 * 実行: npm run notion:nightly-scan
 * launchd: 毎朝07:00に自動実行
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { extractTasks } from "./lib/task-extractor.mjs";
import { findThoughtNotePage, getClaudeTasksToggleText, registerTask } from "./lib/notion-tasks.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const webhook = process.env.DISCORD_WEBHOOK_URL;
const hubPath = resolve(root, ".notion-hub.json");

if (!token) { console.error("NOTION_TOKEN が未設定です"); process.exit(1); }
if (!existsSync(hubPath)) { console.error(".notion-hub.json がありません"); process.exit(1); }

const hub = JSON.parse(readFileSync(hubPath, "utf8"));
const tasksDbId = hub.databases?.tasks?.id;
if (!tasksDbId) { console.error("tasks DB ID が .notion-hub.json にありません"); process.exit(1); }
const sessionsDbId = hub.databases?.sessions?.id;

/** Sessions DB に実行ログを記録する */
async function logToSessions(token, sessionsDbId, dateLabel, jstDate, summary) {
  if (!sessionsDbId) return;
  const { notionFetch } = await import("./lib/notion.mjs");
  const isoDate = new Date(jstDate).toISOString().slice(0, 10);
  try {
    await notionFetch("/v1/pages", token, {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: sessionsDbId },
        properties: {
          Title: { title: [{ type: "text", text: { content: `[nightly-scan] ${dateLabel}` } }] },
          Date: { date: { start: isoDate } },
          Conclusion: { rich_text: [{ type: "text", text: { content: summary } }] },
          ConclusionType: { select: { name: "自動実行" } },
        },
      }),
    });
    console.log("[nightly-scan] Sessions DB に記録しました");
  } catch (err) {
    console.error("[nightly-scan] Sessions DB への記録失敗:", err.message);
  }
}

// 昨日の日付（JST）
const jst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
jst.setDate(jst.getDate() - 1);
const yesterday = `${jst.getFullYear()}/${String(jst.getMonth() + 1).padStart(2, "0")}/${String(jst.getDate()).padStart(2, "0")}`;

console.log(`[nightly-scan] 対象日: ${yesterday}`);

const page = await findThoughtNotePage(token, yesterday);
if (!page) { console.log(`[nightly-scan] 思考ノートなし: ${yesterday} → スキップ`); process.exit(0); }

const toggleText = await getClaudeTasksToggleText(token, page.id);
if (!toggleText.trim()) { console.log("[nightly-scan] Claudeトグルなし → スキップ"); await logToSessions(token, sessionsDbId, yesterday, jst, "Claudeトグルなし"); process.exit(0); }

const tasks = await extractTasks(toggleText);
if (tasks.length === 0) { console.log("[nightly-scan] 抽出タスクなし → スキップ"); await logToSessions(token, sessionsDbId, yesterday, jst, "抽出タスクなし"); process.exit(0); }

let created = 0;
const createdTitles = [];
for (const task of tasks) {
  const result = await registerTask(token, tasksDbId, task, page.id);
  if (result.created) { created++; createdTitles.push(`• [${task.priority}] ${task.title}`); }
}
console.log(`[nightly-scan] 完了: ${created}件登録`);

if (created > 0 && webhook) {
  const content = [
    `**📋 思考ノートから ${created}件のタスクをInboxに追加しました（${yesterday}分）**`,
    "",
    ...createdTitles,
    "",
    "_次回Claudeセッション開始時に確認・実行されます_",
  ].join("\n").slice(0, 1900);

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  console.log(res.ok ? "[nightly-scan] Discord通知送信済み" : `[nightly-scan] Discord通知失敗: ${res.status}`);
}

// Sessions DB にログを記録
const summary = created > 0
  ? `${created}件登録: ${createdTitles.map(t => t.replace(/^• /, "")).join(" / ")}`
  : "タスクなし";
await logToSessions(token, sessionsDbId, yesterday, jst, summary);
