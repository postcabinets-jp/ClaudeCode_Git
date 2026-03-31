// scripts/linear-morning-summary.mjs
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { createLinearClient, fetchStateMap } from "./lib/linear.mjs";
import { Client } from "@notionhq/client";

const root = projectRoot();
loadDotEnv(root);

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
const LINEAR_CLAUDE_USER_ID = process.env.LINEAR_CLAUDE_USER_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
console.log(`\n${"=".repeat(60)}`);
console.log(`🌅 おはようございます！  ${now}`);
console.log(`${"=".repeat(60)}\n`);

if (LINEAR_API_KEY && LINEAR_TEAM_ID && LINEAR_CLAUDE_USER_ID) {
  const client = createLinearClient(LINEAR_API_KEY);
  const stateMap = await fetchStateMap(client, LINEAR_TEAM_ID);

  const inProgressId = stateMap.get("In Progress");
  const todoId = stateMap.get("Todo");

  const issues = await client.issues({
    filter: {
      team: { id: { eq: LINEAR_TEAM_ID } },
      assignee: { id: { eq: LINEAR_CLAUDE_USER_ID } },
      state: { id: { in: [inProgressId, todoId].filter(Boolean) } },
    },
    orderBy: "priority",
  });

  console.log(`📋 Linear（AI担当 Issue）`);
  if (issues.nodes.length === 0) {
    console.log("  （積みタスクなし）");
  } else {
    for (const issue of issues.nodes) {
      const stateLabel = issue.state?.name ?? "?";
      const priorityLabel = ["", "🔴 Urgent", "🟠 High", "🟡 Medium", "⚪ Low"][issue.priority] ?? "?";
      console.log(`  [${stateLabel}] ${priorityLabel} ${issue.title}`);
      console.log(`    ${issue.url}`);
    }
  }
  console.log();
} else {
  console.log("⚠️  Linear未設定（npm run linear:setup を実行してください）\n");
}

const hubPath = resolve(root, ".notion-hub.json");
if (NOTION_TOKEN && existsSync(hubPath)) {
  const hub = JSON.parse(readFileSync(hubPath, "utf8"));
  const tasksDbId = hub.databases?.tasks?.id;

  if (tasksDbId) {
    const notion = new Client({ auth: NOTION_TOKEN });

    const response = await notion.databases.query({
      database_id: tasksDbId,
      filter: {
        and: [
          { property: "Owner", select: { equals: "Claude" } },
          { property: "Status", select: { does_not_equal: "Done" } },
        ],
      },
      sorts: [{ property: "Due", direction: "ascending" }],
      page_size: 10,
    }).catch(() => ({ results: [] }));

    console.log(`📝 Notion（Claude向けタスク）`);
    if (response.results.length === 0) {
      console.log("  （タスクなし）");
    } else {
      for (const page of response.results) {
        const title = page.properties?.Title?.title?.[0]?.plain_text ?? "(無題)";
        const status = page.properties?.Status?.select?.name ?? "?";
        const due = page.properties?.Due?.date?.start ?? "";
        const dueLabel = due ? ` [Due: ${due}]` : "";
        console.log(`  [${status}]${dueLabel} ${title}`);
      }
    }
    console.log();
  }
}

console.log(`${"=".repeat(60)}`);
console.log(`💬 今日の方針を話してください。タスクをLinearに起票します。`);
console.log(`${"=".repeat(60)}\n`);
