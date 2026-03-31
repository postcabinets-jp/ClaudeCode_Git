// scripts/discord-morning.mjs
// 毎朝5:00 に実行。Discordに状況サマリーを投稿して壁打ちセッションを開始する。
// launchd: com.postcabinets.discord-morning.plist.example

import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { createLinearClient, fetchTodoIssues } from "./lib/linear.mjs";
import { sendMessage } from "./lib/discord-bot.mjs";
import { Client as NotionClient } from "@notionhq/client";

const root = projectRoot();
loadDotEnv(root);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_MORNING_CHANNEL_ID = process.env.DISCORD_MORNING_CHANNEL_ID;
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
const LINEAR_CLAUDE_USER_ID = process.env.LINEAR_CLAUDE_USER_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

// 朝ミーティングの状態を保存するファイル（agent-loopが参照する）
const MORNING_STATE_PATH = resolve(root, ".morning-session.json");

if (!DISCORD_BOT_TOKEN || !DISCORD_MORNING_CHANNEL_ID) {
  console.error("DISCORD_BOT_TOKEN / DISCORD_MORNING_CHANNEL_ID が未設定です");
  process.exit(1);
}

const now = new Date();
const dateLabel = now.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", month: "long", day: "numeric", weekday: "long" });

// ── Linear サマリー ──────────────────────────────────────
let linearLines = [];
if (LINEAR_API_KEY && LINEAR_TEAM_ID && LINEAR_CLAUDE_USER_ID) {
  try {
    const client = createLinearClient(LINEAR_API_KEY);
    const issues = await fetchTodoIssues(client, LINEAR_TEAM_ID, LINEAR_CLAUDE_USER_ID);
    if (issues.length === 0) {
      linearLines.push("AIタスク: なし（積みなし）");
    } else {
      const labels = ["", "🔴Urgent", "🟠High", "🟡Medium", "⚪Low"];
      linearLines = issues.slice(0, 5).map(i => {
        const p = labels[i.priority] ?? "?";
        return `• ${p} ${i.title}`;
      });
      if (issues.length > 5) linearLines.push(`…他 ${issues.length - 5} 件`);
    }
  } catch (e) {
    linearLines.push(`Linear取得エラー: ${e.message}`);
  }
}

// ── Notion サマリー ──────────────────────────────────────
let notionLines = [];
const hubPath = resolve(root, ".notion-hub.json");
if (NOTION_TOKEN && existsSync(hubPath)) {
  try {
    const hub = JSON.parse(readFileSync(hubPath, "utf8"));
    const tasksDbId = hub.databases?.tasks?.id;
    if (tasksDbId) {
      const notion = new NotionClient({ auth: NOTION_TOKEN });
      const res = await notion.databases.query({
        database_id: tasksDbId,
        filter: {
          and: [
            { property: "Owner", select: { equals: "Human" } },
            { property: "Status", select: { does_not_equal: "Done" } },
          ],
        },
        sorts: [{ property: "Due", direction: "ascending" }],
        page_size: 5,
      }).catch(() => ({ results: [] }));

      if (res.results.length === 0) {
        notionLines.push("あなたのタスク: なし");
      } else {
        notionLines = res.results.map(p => {
          const title = p.properties?.Title?.title?.[0]?.plain_text ?? "(無題)";
          const due = p.properties?.Due?.date?.start;
          return `• ${title}${due ? ` [${due}]` : ""}`;
        });
      }
    }
  } catch (e) {
    notionLines.push(`Notion取得エラー: ${e.message}`);
  }
}

// ── メッセージ組み立て ────────────────────────────────────
const lines = [
  `🌅 **おはようございます！ ${dateLabel}**`,
  ``,
  `**📋 AIタスク（Linear）**`,
  ...(linearLines.length ? linearLines : ["　なし"]),
  ``,
  `**📝 あなたのタスク（Notion）**`,
  ...(notionLines.length ? notionLines : ["　なし"]),
  ``,
  `---`,
  `💬 **今日のゴール・気になること・壁打ちしたいことを教えてください。**`,
  `決めたことはLinearに自動で起票します。`,
];

const content = lines.join("\n");

// ── Discord に投稿 ────────────────────────────────────────
const message = await sendMessage(DISCORD_BOT_TOKEN, DISCORD_MORNING_CHANNEL_ID, content);
console.log(`[discord-morning] 投稿完了: message_id=${message.id}`);

// agent-loop が返信を検知するために状態ファイルを保存
const state = {
  date: now.toISOString().slice(0, 10),
  messageId: message.id,
  channelId: DISCORD_MORNING_CHANNEL_ID,
  status: "waiting", // waiting | active | done
  lastProcessedMessageId: message.id,
};
writeFileSync(MORNING_STATE_PATH, JSON.stringify(state, null, 2));
console.log(`[discord-morning] 状態ファイル保存: ${MORNING_STATE_PATH}`);
