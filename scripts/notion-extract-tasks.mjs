#!/usr/bin/env node
/**
 * 即時レーン: 今日の思考ノートから Claude Tasks を抽出して TasksDB に登録する
 * 実行: npm run notion:extract-tasks
 * 実行: npm run notion:extract-tasks -- --date 2026/03/30
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { extractTasks } from "./lib/task-extractor.mjs";
import { findThoughtNotePage, getClaudeTasksToggleText, registerTask } from "./lib/notion-tasks.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const hubPath = resolve(root, ".notion-hub.json");

if (!token) { console.error("NOTION_TOKEN が未設定です"); process.exit(1); }
if (!existsSync(hubPath)) { console.error(".notion-hub.json がありません"); process.exit(1); }

const hub = JSON.parse(readFileSync(hubPath, "utf8"));
const tasksDbId = hub.databases?.tasks?.id;
if (!tasksDbId) { console.error("tasks DB ID が .notion-hub.json にありません"); process.exit(1); }

// 日付引数（デフォルト: 今日のJST）
const args = process.argv.slice(2);
const dateArgIdx = args.indexOf("--date");
let targetDate;
if (dateArgIdx !== -1 && args[dateArgIdx + 1]) {
  targetDate = args[dateArgIdx + 1];
} else {
  const jst = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  targetDate = `${jst.getFullYear()}/${String(jst.getMonth() + 1).padStart(2, "0")}/${String(jst.getDate()).padStart(2, "0")}`;
}

console.log(`\n📋 思考ノートを検索中: ${targetDate}`);

const page = await findThoughtNotePage(token, targetDate);
if (!page) {
  console.log(`⚠️  思考ノートが見つかりません: ${targetDate}`);
  process.exit(0);
}
console.log(`✅ ページ発見: ${page.url}`);

const toggleText = await getClaudeTasksToggleText(token, page.id);
if (!toggleText.trim()) {
  console.log("ℹ️  「📋 Claude Tasks」トグルが空か見つかりません。");
  process.exit(0);
}

console.log(`\n📝 トグル内容:\n${toggleText}\n`);
console.log("🤖 LLMでタスクを解釈中...");

const tasks = await extractTasks(toggleText);
if (tasks.length === 0) {
  console.log("ℹ️  抽出できるタスクがありませんでした。");
  process.exit(0);
}

console.log(`\n${tasks.length}件のタスクを検出:\n`);
for (const t of tasks) {
  console.log(`  [${t.priority}] ${t.title} (${t.owner})`);
  if (t.notes) console.log(`         → ${t.notes}`);
}

console.log("\nTasksDB に登録中...");
let created = 0, skipped = 0;
for (const task of tasks) {
  const result = await registerTask(token, tasksDbId, task, page.id);
  if (result.created) { console.log(`  ✅ 登録: ${task.title}`); created++; }
  else { console.log(`  ⏭️  スキップ（重複）: ${task.title}`); skipped++; }
}

console.log(`\n完了: ${created}件登録, ${skipped}件スキップ`);
