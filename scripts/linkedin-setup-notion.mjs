import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionFetch } from "./lib/notion.mjs";

loadDotEnv(projectRoot());
const token = process.env.NOTION_TOKEN;
const LINKEDIN_PAGE_ID = "3339bf08-eefd-8165-9638-fcd36a6fee37";

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

console.log("DB作成完了:", res.id);
console.log("LINKEDIN_DB_ID=" + res.id);
