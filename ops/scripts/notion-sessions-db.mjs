#!/usr/bin/env node
/**
 * POSTCABINETS — Sessions DB 作成スクリプト
 * 既存ハブに「Sessions」DBを追加し、.notion-hub.json を更新する。
 * 使い方: npm run notion:sessions:init
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { normalizeNotionId, notionHeaders } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const hubPath = resolve(root, ".notion-hub.json");

if (!token) {
  console.error("NOTION_TOKEN が必要です（.env 参照）。");
  process.exit(1);
}

// ハブ定義を読み込んで親ページIDと既存DBを確認
let hub;
try {
  hub = JSON.parse(readFileSync(hubPath, "utf8"));
} catch {
  console.error(".notion-hub.json が見つかりません。先に npm run notion:hub を実行してください。");
  process.exit(1);
}

if (hub.databases?.sessions) {
  console.log("Sessions DB は既に存在します:", hub.databases.sessions.url);
  process.exit(0);
}

const parentId = hub.parentPageId;
const projectsDbId = hub.databases?.projects?.id;
const headers = notionHeaders(token);

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

console.log("POSTCABINETS — Sessions DB を作成します…");

const properties = {
  Title: { title: {} },
  SessionID: { rich_text: {} },
  Date: { date: {} },
  Conclusion: { rich_text: {} },
  ConclusionType: {
    select: {
      options: [
        { name: "決定", color: "green" },
        { name: "暫定", color: "yellow" },
        { name: "保留", color: "red" },
      ],
    },
  },
  NextTopics: { rich_text: {} },
  PrevSessionID: { rich_text: {} },
};

// Projects DB が存在する場合のみ relation を追加
if (projectsDbId) {
  properties.Project = {
    relation: {
      database_id: projectsDbId,
      type: "single_property",
      single_property: {},
    },
  };
}

const db = await createDatabase("POSTCABINETS — Sessions", properties);

hub.databases.sessions = {
  id: db.id,
  url: db.url ?? null,
  title: "POSTCABINETS — Sessions",
};

writeFileSync(hubPath, JSON.stringify(hub, null, 2), "utf8");
console.log("Sessions DB 作成完了:", db.url ?? db.id);
console.log(".notion-hub.json を更新しました。");
