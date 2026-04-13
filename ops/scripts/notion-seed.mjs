#!/usr/bin/env node
/**
 * .notion-hub.json に基づき初期行を投入。
 * v2: Projects + Tasks（relation）。既に Projects に行があればスキップ（NOTION_SEED_FORCE=1 で再投入）。
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionHeaders } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const hubPath = resolve(root, ".notion-hub.json");
if (!existsSync(hubPath)) {
  console.error("先に npm run notion:hub を実行して .notion-hub.json を生成してください。");
  process.exit(1);
}

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error("NOTION_TOKEN が未設定です。");
  process.exit(1);
}

const hub = JSON.parse(readFileSync(hubPath, "utf8"));
const projectsId = hub.databases?.projects?.id;
const tasksId = hub.databases?.tasks?.id;
const decisionsId = hub.databases?.decisions?.id;
const weeklyId = hub.databases?.weekly?.id;
const triggersId = hub.databases?.triggers?.id;
const isV2 = (hub.version ?? 1) >= 2 && tasksId;

if ((hub.version ?? 1) >= 2 && !tasksId) {
  console.error("v2 の .notion-hub.json に tasks ID がありません。npm run notion:hub をやり直してください。");
  process.exit(1);
}

if (!projectsId || !decisionsId) {
  console.error(".notion-hub.json に projects / decisions ID がありません。");
  process.exit(1);
}

const headers = notionHeaders(token);

const rt = (s) => ({ rich_text: [{ type: "text", text: { content: s } }] });
const title = (s) => ({ title: [{ type: "text", text: { content: s } }] });
const today = new Date().toISOString().slice(0, 10);

async function hasAnyRow(databaseId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers,
    body: JSON.stringify({ page_size: 1 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return (data.results?.length ?? 0) > 0;
}

async function createPage(databaseId, properties) {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
}

const force = process.env.NOTION_SEED_FORCE === "1";
if (!force && (await hasAnyRow(projectsId))) {
  console.log("Projects に既に行があります。上書きする場合は NOTION_SEED_FORCE=1 を付けて再実行。");
  process.exit(0);
}

console.log("シードを投入します…");

const projectProps = isV2
  ? {
      Name: title("POSTCABINETS / ClaudeCode workspace"),
      Status: { select: { name: "Active" } },
      Area: { select: { name: "Tech" } },
      Brand: { multi_select: [{ name: "POSTCABINETS" }] },
      Priority: { number: 1 },
      "Next action": rt("Tasks の Owner を見て、Human は今日やる1件に絞る。Claude は Inbox→Todo に移す。"),
      Updated: { date: { start: today } },
    }
  : {
      Name: title("POSTCABINETS / ClaudeCode workspace"),
      Status: { select: { name: "Active" } },
      Phase: { select: { name: "Discovery" } },
      Priority: { number: 1 },
      "Next action": rt("レガシーハブ用。notion-hub v2 推奨。"),
      "LINE/OpenClaw": { checkbox: false },
      Updated: { date: { start: today } },
    };

const projectPage = await createPage(projectsId, projectProps);
const projectPageId = projectPage.id;

if (isV2 && tasksId) {
  await createPage(tasksId, {
    Title: title("今日の Human タスクを1件選ぶ（Tasks を開く）"),
    Status: { select: { name: "Todo" } },
    Owner: { select: { name: "Human" } },
    Priority: { select: { name: "P1" } },
    Due: { date: { start: today } },
    Project: { relation: [{ id: projectPageId }] },
    Notes: rt("ダッシュボードは Tasks を Status でボード表示、Owner でフィルタ。"),
  });

  await createPage(tasksId, {
    Title: title("セッション終了時: Notion Tasks を更新する下書きをユーザーに渡す"),
    Status: { select: { name: "Todo" } },
    Owner: { select: { name: "Claude" } },
    Priority: { select: { name: "P2" } },
    Project: { relation: [{ id: projectPageId }] },
    Notes: rt("CLAUDE.md の運用に合わせる。"),
  });

  await createPage(tasksId, {
    Title: title("COPAIN: LINE / 課金の Decisions を1件追加"),
    Status: { select: { name: "Inbox" } },
    Owner: { select: { name: "Either" } },
    Priority: { select: { name: "P2" } },
    Project: { relation: [{ id: projectPageId }] },
    Notes: rt("案件が COPAIN に限らない。Brand=COPAIN の Project を別行で切ってもよい。"),
  });
}

await createPage(decisionsId, {
  Title: title("正本は Notion。リポジトリは実装と CLAUDE.md"),
  Date: { date: { start: today } },
  Status: { select: { name: "Accepted" } },
  Context: rt("POSTCABINETS 全体の計画・タスクは Notion。シークレットは .env のみ。"),
});

await createPage(decisionsId, {
  Title: title("実行は Tasks、束ねるのは Projects"),
  Date: { date: { start: today } },
  Status: { select: { name: "Accepted" } },
  Context: rt("Claude は Owner=Claude/Either を優先。人は Human/Either。境界は Decisions で固定。"),
});

if (weeklyId) {
  await createPage(weeklyId, {
    Week: title(`Week ${today}`),
    Focus: rt("POSTCABINETS の優先テーマを1行で"),
    "Top 3": rt("1) Tasks の Inbox ゼロ化 2) Active Projects の次アクション 3) リスクの1件"),
    Blockers: rt("なければ「なし」"),
  });
}

if (triggersId) {
  await createPage(triggersId, {
    Name: title("notion-pulse（Discord 朝イチ）"),
    Type: { select: { name: "cron" } },
    Cadence: rt("毎日 — npm run pulse:discord"),
    Notes: rt("Active Projects + オープン Tasks を要約"),
  });
}

hub.seededAt = new Date().toISOString();
writeFileSync(hubPath, JSON.stringify(hub, null, 2), "utf8");
console.log("シード完了。.notion-hub.json を更新しました。");
