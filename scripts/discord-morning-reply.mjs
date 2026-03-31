// scripts/discord-morning-reply.mjs
// linear-agent-loop から呼ばれる、または単体で実行する。
// 朝ミーティングの返信を読んでClaude Codeと壁打ち → Linear起票まで行う。
//
// 動作:
// 1. .morning-session.json を読んで今日のセッション状態を確認
// 2. Discordから未処理の返信を取得
// 3. Claude Codeで壁打ち対話を実行（起票判断まで）
// 4. 起票してDiscordに完了報告

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { createLinearClient, createIssue, fetchStateMap } from "./lib/linear.mjs";
import { sendMessage, fetchMessages } from "./lib/discord-bot.mjs";

const root = projectRoot();
loadDotEnv(root);

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_MORNING_CHANNEL_ID = process.env.DISCORD_MORNING_CHANNEL_ID;
const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
const LINEAR_CLAUDE_USER_ID = process.env.LINEAR_CLAUDE_USER_ID;
const MORNING_STATE_PATH = resolve(root, ".morning-session.json");

if (!DISCORD_BOT_TOKEN || !DISCORD_MORNING_CHANNEL_ID) {
  console.log("[morning-reply] Discord未設定。スキップ。");
  process.exit(0);
}

// ── セッション状態確認 ────────────────────────────────────
if (!existsSync(MORNING_STATE_PATH)) {
  console.log("[morning-reply] 朝ミーティングセッションなし。スキップ。");
  process.exit(0);
}

const state = JSON.parse(readFileSync(MORNING_STATE_PATH, "utf8"));
const today = new Date().toISOString().slice(0, 10);

if (state.date !== today) {
  console.log("[morning-reply] 今日のセッションではありません。スキップ。");
  process.exit(0);
}

if (state.status === "done") {
  console.log("[morning-reply] 今日のセッションは完了済み。スキップ。");
  process.exit(0);
}

// ── 未処理の返信を取得 ────────────────────────────────────
const allMessages = await fetchMessages(
  DISCORD_BOT_TOKEN,
  DISCORD_MORNING_CHANNEL_ID,
  { limit: 20, after: state.lastProcessedMessageId }
);

// 古い順に並べ直す（fetchMessagesは新しい順で返る）
const newMessages = allMessages.reverse().filter(m => !m.author?.bot);

if (newMessages.length === 0) {
  console.log("[morning-reply] 新しい返信なし。スキップ。");
  process.exit(0);
}

console.log(`[morning-reply] ${newMessages.length}件の新しいメッセージを処理します`);

// ── Claude Codeで壁打ち実行 ─────────────────────────────
const userInput = newMessages.map(m => m.content).join("\n");

const prompt = [
  `# 朝ミーティング 壁打ちセッション`,
  ``,
  `あなたはPOST CABINETSのClaude Codeです。代表のnobuと朝ミーティングをしています。`,
  `nobuから以下のメッセージが届きました：`,
  ``,
  `---`,
  userInput,
  `---`,
  ``,
  `以下の形式でJSONのみ出力してください（他のテキストは不要）：`,
  `{`,
  `  "reply": "Discordに返す返信メッセージ（壁打ち継続 or 起票確認）",`,
  `  "readyToCreate": true or false,`,
  `  "issues": [`,
  `    {`,
  `      "title": "Issueタイトル（簡潔に）",`,
  `      "description": "詳細説明",`,
  `      "priority": 1〜4の数値（1=Urgent, 2=High, 3=Medium, 4=Low）`,
  `    }`,
  `  ]`,
  `}`,
  ``,
  `ルール:`,
  `- nobuの話がまだ途中・曖昧なら readyToCreate: false にして、replyで掘り下げ質問をする`,
  `- 具体的なタスクが確定したら readyToCreate: true にして issues に起票内容を入れる`,
  `- issuesは最大5件まで`,
  `- replyは日本語・フレンドリーな口調で200字以内`,
].join("\n");

let claudeOutput;
try {
  claudeOutput = execFileSync("claude", ["--print", prompt], {
    cwd: root,
    timeout: 3 * 60 * 1000,
    encoding: "utf8",
  }).trim();
} catch (err) {
  console.error("[morning-reply] Claude実行エラー:", err.message);
  await sendMessage(DISCORD_BOT_TOKEN, DISCORD_MORNING_CHANNEL_ID,
    "⚠️ 壁打ち処理中にエラーが発生しました。もう一度話しかけてください。",
    newMessages[newMessages.length - 1].id
  );
  process.exit(1);
}

// ── JSON パース ───────────────────────────────────────────
let parsed;
try {
  // claudeの出力からJSONブロックを抽出
  const jsonMatch = claudeOutput.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSONが見つかりません");
  parsed = JSON.parse(jsonMatch[0]);
} catch (e) {
  console.error("[morning-reply] JSONパースエラー:", e.message);
  console.error("Claude出力:", claudeOutput.slice(0, 500));
  await sendMessage(DISCORD_BOT_TOKEN, DISCORD_MORNING_CHANNEL_ID,
    "⚠️ 応答の解析に失敗しました。もう一度試します。",
    newMessages[newMessages.length - 1].id
  );
  process.exit(1);
}

const lastMessageId = newMessages[newMessages.length - 1].id;

// ── 起票する場合 ──────────────────────────────────────────
if (parsed.readyToCreate && parsed.issues?.length > 0 && LINEAR_API_KEY) {
  const linearClient = createLinearClient(LINEAR_API_KEY);
  const createdUrls = [];

  for (const issue of parsed.issues) {
    try {
      const created = await createIssue(linearClient, {
        teamId: LINEAR_TEAM_ID,
        title: issue.title,
        description: issue.description,
        claudeUserId: LINEAR_CLAUDE_USER_ID,
        priority: issue.priority ?? 3,
      });
      const issueObj = await created;
      // createIssueはissueオブジェクト（Promiseの場合あり）を返す
      const url = issueObj?.url ?? `https://linear.app/postcabinets`;
      createdUrls.push(`• **${issue.title}** → ${url}`);
      console.log(`[morning-reply] 起票: ${issue.title}`);
    } catch (e) {
      console.error(`[morning-reply] 起票失敗: ${issue.title}`, e.message);
      createdUrls.push(`• **${issue.title}** → ⚠️ 起票失敗`);
    }
  }

  const doneMessage = [
    parsed.reply,
    ``,
    `✅ **Linearに起票しました：**`,
    ...createdUrls,
  ].join("\n");

  await sendMessage(DISCORD_BOT_TOKEN, DISCORD_MORNING_CHANNEL_ID, doneMessage, lastMessageId);

  // セッション完了
  state.status = "done";
  state.lastProcessedMessageId = lastMessageId;
  writeFileSync(MORNING_STATE_PATH, JSON.stringify(state, null, 2));
  console.log("[morning-reply] セッション完了");

} else {
  // 壁打ち継続
  await sendMessage(DISCORD_BOT_TOKEN, DISCORD_MORNING_CHANNEL_ID, parsed.reply, lastMessageId);

  // 最後に処理したメッセージIDを更新
  state.status = "active";
  state.lastProcessedMessageId = lastMessageId;
  writeFileSync(MORNING_STATE_PATH, JSON.stringify(state, null, 2));
  console.log("[morning-reply] 返信送信。壁打ち継続中。");
}
