#!/usr/bin/env node
// scripts/granola-sync.mjs
/**
 * Granola会議ノートをNotion Meeting Notes DBに同期する
 *
 * 使い方:
 *   # Claude CodeがGranola MCPで取得してJSONに保存 → このスクリプトで同期
 *   node scripts/granola-sync.mjs [input.json]
 *
 *   # 引数なし: .granola-cache.json を読む
 *   node scripts/granola-sync.mjs
 *
 *   # stdinからJSONを受け取る（パイプ用）
 *   echo '[...]' | node scripts/granola-sync.mjs --stdin
 */

import { readFileSync } from "node:fs";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { upsertMeeting } from "./lib/granola-notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DB_ID = process.env.GRANOLA_MEETING_NOTES_DB_ID;

if (!NOTION_TOKEN) {
  console.error("エラー: NOTION_TOKEN が未設定です");
  process.exit(1);
}
if (!DB_ID) {
  console.error("エラー: GRANOLA_MEETING_NOTES_DB_ID が未設定です");
  console.error("  .env に GRANOLA_MEETING_NOTES_DB_ID=33a9bf08eefd80a3aaeae72bf6fc4554 を追加してください");
  process.exit(1);
}

// --- データ読み込み ---
let meetings;

if (process.argv.includes("--stdin")) {
  // stdinから読む
  const raw = readFileSync("/dev/stdin", "utf8");
  meetings = JSON.parse(raw);
} else {
  const inputFile = process.argv[2] ?? `${root}/.granola-cache.json`;
  try {
    meetings = JSON.parse(readFileSync(inputFile, "utf8"));
  } catch (e) {
    console.error(`エラー: ${inputFile} が読めません`);
    console.error("  Claude CodeでGranola MCPを使って会議データを取得し、.granola-cache.jsonに保存してください");
    console.error("  または: echo '[...]' | node scripts/granola-sync.mjs --stdin");
    process.exit(1);
  }
}

// 配列でない場合（単一オブジェクト）は配列に変換
if (!Array.isArray(meetings)) {
  meetings = [meetings];
}

console.log(`同期開始: ${meetings.length}件の会議データ`);

let created = 0;
let updated = 0;
let failed = 0;

for (const meeting of meetings) {
  try {
    const pageId = await upsertMeeting(meeting, NOTION_TOKEN);
    if (pageId) {
      // ログに作成/更新を区別するためのカウント（upsertMeeting内のconsole.logが出力）
    }
  } catch (e) {
    console.error(`失敗: ${meeting.title ?? meeting.id} — ${e.message}`);
    failed++;
  }
}

console.log(`\n完了: 失敗=${failed}件`);
if (failed > 0) process.exit(1);
