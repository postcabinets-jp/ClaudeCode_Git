import { appendFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionFetch, normalizeNotionId } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error("NOTION_TOKEN が未設定です。.env を確認してください。");
  process.exit(1);
}

const LINKEDIN_PAGE_ID = normalizeNotionId(
  process.env.LINKEDIN_PARENT_PAGE_ID ?? "3339bf08-eefd-8165-9638-fcd36a6fee37"
);

const res = await notionFetch("/v1/databases", token, {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: LINKEDIN_PAGE_ID },
    title: [{ text: { content: "LinkedIn投稿" } }],
    properties: {
      タイトル: { title: {} },
      本文: { rich_text: {} },
      柱: {
        select: {
          options: [
            { name: "経営の実践ログ", color: "blue" },
            { name: "仕組みの設計思想", color: "green" },
            { name: "社会・地域への視点", color: "orange" },
          ],
        },
      },
      投稿OK: { checkbox: {} },
      ステータス: {
        select: {
          options: [
            { name: "下書き", color: "gray" },
            { name: "投稿済", color: "green" },
            { name: "エラー", color: "red" },
            { name: "要再ログイン", color: "yellow" },
          ],
        },
      },
      生成日: { date: {} },
      投稿日時: { date: {} },
      投稿URL: { url: {} },
    },
  }),
});

// .envに LINKEDIN_DB_ID を追記（既に存在する場合はスキップ）
const envPath = resolve(root, ".env");
const envContent = readFileSync(envPath, "utf8");
if (!envContent.includes("LINKEDIN_DB_ID=")) {
  appendFileSync(envPath, `\nLINKEDIN_DB_ID=${res.id}\n`);
  console.log(".envにLINKEDIN_DB_IDを追記しました");
} else {
  console.log("LINKEDIN_DB_IDは既に.envに存在します");
}

console.log("DB作成完了:", res.id);
console.log("LINKEDIN_DB_ID=" + res.id);
