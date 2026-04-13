// scripts/linkedin-generate.mjs
/**
 * Job1: 毎朝7時実行
 * Claude APIで投稿下書きを生成 → Notionに保存 → Discord通知
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import {
  getPillarForToday,
  getRecentTitles,
  countPendingDrafts,
  createDraft,
} from "./lib/linkedin-notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const dbId = process.env.LINKEDIN_DB_ID;
const webhook = process.env.DISCORD_WEBHOOK_URL;
const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!token || !dbId || (!authToken && !anthropicKey)) {
  console.error("必要な環境変数が未設定です: NOTION_TOKEN, LINKEDIN_DB_ID, ANTHROPIC_AUTH_TOKEN（またはANTHROPIC_API_KEY）");
  process.exit(1);
}

// 日曜は生成しない
const pillar = getPillarForToday();
if (!pillar) {
  console.log("日曜日のため生成をスキップします。");
  process.exit(0);
}

// 未投稿が3件以上あればスキップ
const pendingCount = await countPendingDrafts(dbId, token);
if (pendingCount >= 3) {
  console.log(`未投稿が${pendingCount}件あるためスキップします。`);
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `⏭️ LinkedIn投稿生成をスキップ\n未確認の下書きが${pendingCount}件あります。Notionで確認・承認してください。`,
      }),
    }).catch((e) => console.error("Discord通知失敗:", e.message));
  }
  process.exit(0);
}

// 戦略設計書を読む
const strategyDoc = readFileSync(
  resolve(root, "docs/superpowers/specs/2026-03-30-linkedin-strategy-design.md"),
  "utf8"
);

// 直近5件のタイトルを取得
const recentTitles = await getRecentTitles(dbId, token, 5);
const recentTitlesText = recentTitles.length > 0
  ? `直近の投稿タイトル（重複しないようにしてください）:\n${recentTitles.map((t) => `- ${t}`).join("\n")}`
  : "まだ投稿はありません。";

// Claude APIで生成
const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
const dayName = dayNames[new Date().getDay()];

const client = authToken
  ? new Anthropic({ authToken })
  : new Anthropic({ apiKey: anthropicKey });

let result = null;
let attempts = 0;

while (attempts < 3) {
  attempts++;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `あなたはPOST CABINETS代表・前田暢のLinkedIn投稿担当です。
以下の戦略設計書に従って投稿を作成してください。

${strategyDoc}`,
      messages: [
        {
          role: "user",
          content: `今日は${dayName}曜日です。「${pillar}」の投稿を1本作成してください。

- 文字数: 300〜600字
- トーン: 気取らない。リアル。試行錯誤も見せる
- ${recentTitlesText}
- 必ずJSON形式のみで返してください（他のテキスト不要）: {"title": "...", "body": "..."}`,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSONが見つかりません");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.title || !parsed.body) throw new Error("title/bodyが空です");
    if (parsed.body.length < 200) throw new Error(`本文が短すぎます: ${parsed.body.length}字`);

    result = parsed;
    break;
  } catch (err) {
    console.error(`生成失敗 (${attempts}回目):`, err.message);
    if (attempts >= 3) {
      if (webhook) {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `❌ LinkedIn投稿生成に失敗しました\nエラー: ${err.message}`,
          }),
        }).catch((e) => console.error("Discord通知失敗:", e.message));
      }
      process.exit(1);
    }
  }
}

// Notionに保存
let page;
try {
  page = await createDraft(dbId, token, {
    title: result.title,
    body: result.body,
    pillar,
  });
} catch (err) {
  console.error("Notion保存失敗:", err.message);
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `❌ LinkedIn投稿のNotion保存に失敗しました\nエラー: ${err.message}`,
      }),
    }).catch((e) => console.error("Discord通知失敗:", e.message));
  }
  process.exit(1);
}

console.log("下書きを作成しました:", result.title);

// Discord通知
if (webhook) {
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `📝 LinkedIn投稿下書きを作成しました\nタイトル: ${result.title}\n柱: ${pillar}\n→ Notionで確認・編集して「投稿OK」をチェックしてください\n🔗 ${page.url}`,
    }),
  }).catch((e) => console.error("Discord通知失敗:", e.message));
}
