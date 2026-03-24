#!/usr/bin/env node
/**
 * POSTCABINETS / ClaudeCode 向け Notion ハブ（v2）
 * - Projects: 案件・取り組み単位（複数タスクの束）
 * - Tasks: 実行単位（Owner: Human / Claude / Either で可視化）
 * 先に Projects DB を作り、Tasks に relation で接続する。
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { normalizeNotionId, notionHeaders } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const parentId = normalizeNotionId(process.env.NOTION_PARENT_PAGE_ID ?? "");

if (!token || !parentId) {
  console.error("NOTION_TOKEN と NOTION_PARENT_PAGE_ID が必要です（.env 参照）。");
  process.exit(1);
}

const headers = notionHeaders(token);

const select = (options) => ({
  select: {
    options: options.map((name) => ({ name })),
  },
});

async function createDatabase(title, properties) {
  const res = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentId },
      title: [{ type: "text", text: { content: title } }],
      properties,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${title}: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

const hub = {
  version: 2,
  name: "POSTCABINETS-ClaudeCode",
  createdAt: new Date().toISOString(),
  parentPageId: parentId,
  databases: {},
};

console.log("POSTCABINETS ハブ（v2）を親ページに作成します…");

const projectsDb = await createDatabase("POSTCABINETS — Projects", {
  Name: { title: {} },
  Status: select(["Idea", "Active", "Paused", "Done"]),
  Area: select(["Product", "Ops", "Biz", "Tech", "Org", "Other"]),
  Brand: {
    multi_select: {
      options: [
        { name: "POSTCABINETS" },
        { name: "COPAIN" },
        { name: "Other" },
      ],
    },
  },
  Priority: { number: { format: "number" } },
  "Next action": { rich_text: {} },
  Updated: { date: {} },
  URL: { url: {} },
});

hub.databases.projects = {
  id: projectsDb.id,
  url: projectsDb.url ?? null,
  title: "POSTCABINETS — Projects",
};

const tasksDb = await createDatabase("POSTCABINETS — Tasks", {
  Title: { title: {} },
  Status: select(["Inbox", "Todo", "Doing", "Blocked", "Done"]),
  Owner: select(["Human", "Claude", "Either"]),
  Priority: select(["P0", "P1", "P2", "P3"]),
  Due: { date: {} },
  Project: {
    relation: {
      database_id: projectsDb.id,
    },
  },
  Notes: { rich_text: {} },
  Link: { url: {} },
});

hub.databases.tasks = {
  id: tasksDb.id,
  url: tasksDb.url ?? null,
  title: "POSTCABINETS — Tasks",
};

const rest = [
  [
    "POSTCABINETS — Decisions",
    "decisions",
    {
      Title: { title: {} },
      Date: { date: {} },
      Status: select(["Proposed", "Accepted", "Superseded"]),
      Context: { rich_text: {} },
    },
  ],
  [
    "POSTCABINETS — Weekly",
    "weekly",
    {
      Week: { title: {} },
      Focus: { rich_text: {} },
      "Top 3": { rich_text: {} },
      Blockers: { rich_text: {} },
    },
  ],
  [
    "POSTCABINETS — Risks",
    "risks",
    {
      Title: { title: {} },
      Severity: select(["Low", "Medium", "High"]),
      Area: select(["Legal", "Product", "Tech", "Ops", "Finance", "Other"]),
      Mitigation: { rich_text: {} },
    },
  ],
  [
    "POSTCABINETS — Triggers",
    "triggers",
    {
      Name: { title: {} },
      Type: select(["cron", "webhook", "manual", "discord"]),
      Cadence: { rich_text: {} },
      "Last run": { date: {} },
      Notes: { rich_text: {} },
    },
  ],
];

for (const [title, key, props] of rest) {
  const db = await createDatabase(title, props);
  hub.databases[key] = {
    id: db.id,
    url: db.url ?? null,
    title,
  };
  console.log("作成:", title, "→", db.url ?? db.id);
}

console.log("作成: POSTCABINETS — Projects →", projectsDb.url ?? projectsDb.id);
console.log("作成: POSTCABINETS — Tasks →", tasksDb.url ?? tasksDb.id);

const hubPath = resolve(root, ".notion-hub.json");
writeFileSync(hubPath, JSON.stringify(hub, null, 2), "utf8");
console.log("ハブ定義を保存:", hubPath);
console.log(
  "完了。既に COPAIN 名義の DB がある場合は Notion 上で併存します。新ハブだけ使うならこの親ページを「POSTCABINETS Hub」などに分けると整理しやすいです。",
);
