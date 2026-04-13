#!/usr/bin/env node
/**
 * 親ページ直下の「子データベース」をすべてアーカイブし、POSTCABINETS v2 ハブを作り直す。
 * 誤実行防止のため --yes が必須。
 *
 *   node scripts/notion-hub-reset.mjs --yes
 *   npm run notion:reset
 *
 * 注意: 親ページに手動で置いた他の DB も直下ならまとめてアーカイブされます。
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { normalizeNotionId, notionHeaders } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

if (!process.argv.includes("--yes")) {
  console.error("親ページ直下の子 DB をアーカイブしてから hub を再作成します。");
  console.error("続行する場合: npm run notion:reset");
  console.error("または: node scripts/notion-hub-reset.mjs --yes");
  process.exit(1);
}

const token = process.env.NOTION_TOKEN;
const parentId = normalizeNotionId(process.env.NOTION_PARENT_PAGE_ID ?? "");

if (!token || !parentId) {
  console.error("NOTION_TOKEN と NOTION_PARENT_PAGE_ID が必要です。");
  process.exit(1);
}

const headers = notionHeaders(token);

async function listAllBlockChildren(blockId) {
  const out = [];
  let cursor;
  for (;;) {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) url.searchParams.set("start_cursor", cursor);
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`blocks/children ${res.status}: ${JSON.stringify(data)}`);
    }
    out.push(...(data.results ?? []));
    if (!data.has_more) break;
    cursor = data.next_cursor;
  }
  return out;
}

async function archiveDatabase(databaseId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ archived: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`archive DB ${databaseId}: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

console.log("[notion-hub-reset] 親ページの子ブロックを取得:", parentId);
const children = await listAllBlockChildren(parentId);
const dbBlocks = children.filter((b) => b.type === "child_database");

if (dbBlocks.length === 0) {
  console.log("[notion-hub-reset] 直下に子データベースはありません（新規作成のみ）。");
} else {
  console.log(`[notion-hub-reset] 子データベース ${dbBlocks.length} 件をアーカイブします…`);
  for (const b of dbBlocks) {
    const title = b.child_database?.title ?? "(無題)";
    console.log("  -", b.id, title);
    await archiveDatabase(b.id);
  }
  console.log("[notion-hub-reset] アーカイブ完了。");
}

const hubPath = resolve(root, ".notion-hub.json");
if (existsSync(hubPath)) {
  const bak = `${hubPath}.bak.${Date.now()}`;
  copyFileSync(hubPath, bak);
  unlinkSync(hubPath);
  console.log("[notion-hub-reset] .notion-hub.json を退避:", bak);
}

console.log("[notion-hub-reset] notion:hub を実行…");
execSync("node scripts/notion-hub-create.mjs", { cwd: root, stdio: "inherit", env: process.env });

console.log("[notion-hub-reset] notion:seed を実行…");
execSync("node scripts/notion-seed.mjs", { cwd: root, stdio: "inherit", env: process.env });

console.log("\n[notion-hub-reset] 完了。Notion で親ページを開いて確認してください。");
