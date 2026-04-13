#!/usr/bin/env node
/**
 * POSTCABINETS — Session ログ → Notion 自動保存
 *
 * 使い方:
 *   npm run session:log -- --file ./my-session.txt
 *   cat session.txt | npm run session:log -- --stdin
 *   npm run session:log -- --file ./s.txt --title "COPAIN 設計検討"
 *   npm run session:log -- --file ./s.txt --prev S-2026-03-30-ab12   # 前回セッションをリンク
 *   npm run session:log -- --file ./s.txt --dry-run                  # 保存せずプレビューのみ
 *   npm run session:log -- --file ./s.txt --no-notion                # Markdownのみ出力
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY  — 要約に使用（省略時は手動入力モード）
 *   NOTION_TOKEN       — Notion への保存に使用
 */
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionHeaders } from "./lib/notion.mjs";

const claudeBin = process.env.CLAUDE_BIN ?? "/Users/apple/.nvm/versions/node/v20.19.5/bin/claude";

/** claude --print にstdinでテキストを渡してstdoutを返す */
function claudeAsk(prompt, systemPrompt, model = "haiku") {
  return new Promise((resolve, reject) => {
    const child = spawn(claudeBin, [
      "--print",
      "--model", model,
      "--system-prompt", systemPrompt,
    ], { stdio: ["pipe", "pipe", "pipe"] });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("close", (code) => {
      if (code !== 0) reject(new Error(`claude exit ${code}: ${stderr.slice(0, 300)}`));
      else resolve(stdout.trim());
    });
    child.on("error", reject);
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

const root = projectRoot();
loadDotEnv(root);

// ────────────────────────────────────────────
// CLI 引数パース
// ────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const filePath    = getArg("--file");
const useStdin    = hasFlag("--stdin");
const explicitTitle = getArg("--title");
const prevSessionId = getArg("--prev");       // 前回セッションID
const dryRun      = hasFlag("--dry-run");     // 保存せずプレビューのみ
const noNotion    = hasFlag("--no-notion");   // Markdownのみ出力
const sessionId   = getArg("--id") ??
  `S-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36).slice(-4)}`;

if (!filePath && !useStdin) {
  console.error([
    "使い方:",
    "  --file <path>    ファイルから読む",
    "  --stdin          標準入力から読む",
    "  --title <str>    タイトルを明示",
    "  --id <str>       SessionIDを明示（省略時は自動生成）",
    "  --prev <id>      前回SessionIDをリンク",
    "  --dry-run        Notion保存せずプレビューのみ",
    "  --no-notion      常にMarkdown出力（Notion保存スキップ）",
  ].join("\n"));
  process.exit(1);
}

// ────────────────────────────────────────────
// 会話ログを読み込む
// ────────────────────────────────────────────
async function readLog() {
  if (useStdin) {
    const rl = createInterface({ input: process.stdin });
    const lines = [];
    for await (const line of rl) lines.push(line);
    return lines.join("\n");
  }
  return readFileSync(resolve(filePath), "utf8");
}

// ────────────────────────────────────────────
// Claude API で要約・構造化
//
// 結論は3タイプに分類させる:
//   決定 — 明確な意思決定があった
//   暫定 — 方向性は決まったが条件付き・未確認事項あり
//   保留 — 決定できず、理由と次の確認事項を明記
// ────────────────────────────────────────────
const SUMMARIZE_PROMPT = `あなたはビジネス会議の議事録作成の専門家です。
以下の会話ログを分析し、**JSON のみ**を返してください（説明文・コードブロック・マークダウン装飾は不要）。

## 出力形式（JSONのみ、コードブロックなし）
{
  "title": "セッションタイトル（15字以内）",
  "summary": [
    "要約ポイント1（1行で簡潔に）",
    "要約ポイント2",
    "要約ポイント3"
  ],
  "conclusionType": "決定 または 暫定 または 保留",
  "conclusion": "結論の本文（2〜3行）",
  "nextTopics": [
    "次に検討すべき論点1",
    "次に検討すべき論点2",
    "次に検討すべき論点3"
  ]
}

## 結論タイプの判定基準
- **決定**: 「〇〇することにした」「〇〇は採用しない」など明確な意思決定があった
- **暫定**: 方向性は決まったが、条件・未確認事項が残っている（例：「コスト確認後に本決定」）
- **保留**: 決定できなかった。必ず「保留理由」と「次の確認事項」を conclusion に含める

## 注意事項
- summary は3〜7点。脱線・雑談・技術的な実装詳細は無視する
- 長い会話でも要点のみ抽出し、簡潔に保つ
- nextTopics は次のセッションで話すべき未解決・未検討の論点

## 会話ログ
`;

async function summarizeWithClaude(log) {
  console.log("Claude CLI で要約中…");
  // 長いログは先頭60%＋末尾40%を結合（中間の脱線を間引く）
  const maxChars = 12000;
  const truncated =
    log.length > maxChars
      ? log.slice(0, maxChars * 0.6) + "\n\n[... 中略 ...]\n\n" + log.slice(-maxChars * 0.4)
      : log;

  const systemPrompt = "あなたはビジネス会議の議事録作成の専門家です。指示されたJSONフォーマットのみを返してください。説明文・コードブロック・マークダウン装飾は一切不要です。";

  const text = await claudeAsk(SUMMARIZE_PROMPT + truncated, systemPrompt);
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Claude の応答をJSONとして解析できませんでした:\n" + text.slice(0, 300));
  }
}

// ────────────────────────────────────────────
// 手動入力モード（API キーなし時）
// ────────────────────────────────────────────
async function promptUser(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => {
    rl.question(question, (answer) => { rl.close(); res(answer.trim()); });
  });
}

async function manualInput(log) {
  console.log("\n📋 会話ログの先頭（参考）:");
  console.log(log.slice(0, 500) + (log.length > 500 ? "\n..." : ""));
  console.log("\n--- 手動入力モード ---");

  const title = await promptUser("セッションタイトル（15字以内）: ");
  const summaryRaw = await promptUser("要約ポイント（カンマ区切りで3〜7点）: ");
  const conclusionTypeRaw = await promptUser("結論タイプ（決定 / 暫定 / 保留）: ");
  const conclusion = await promptUser("結論・意思決定（1〜3行）: ");
  const nextRaw = await promptUser("次の論点（カンマ区切りで最大3点）: ");

  const validTypes = ["決定", "暫定", "保留"];
  const conclusionType = validTypes.includes(conclusionTypeRaw) ? conclusionTypeRaw : "暫定";

  return {
    title,
    summary: summaryRaw.split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
    conclusionType,
    conclusion,
    nextTopics: nextRaw.split(/[,，、]/).map((s) => s.trim()).filter(Boolean).slice(0, 3),
  };
}

// ────────────────────────────────────────────
// Markdownフォーマット出力
// ────────────────────────────────────────────
function formatMarkdown(structured, sessionId, date, title) {
  const lines = [
    `# ${title}`,
    ``,
    `**SessionID**: \`${sessionId}\`  **Date**: ${date}${prevSessionId ? `  **前回**: \`${prevSessionId}\`` : ""}`,
    ``,
    `## 会話の要約`,
    ...structured.summary.map((s) => `- ${s}`),
    ``,
    `## 結論・意思決定`,
    ``,
    `> **[${structured.conclusionType ?? "暫定"}]** ${structured.conclusion}`,
    ``,
    `## 次に検討すべき論点`,
    ``,
    ...structured.nextTopics.map((t, i) => `${i + 1}. ${t}`),
  ];
  return lines.join("\n");
}

// ────────────────────────────────────────────
// Notion ページ作成
// ────────────────────────────────────────────
async function saveToNotion({ sessionId, date, structured, log, title }) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.warn("NOTION_TOKEN が未設定のため、Notion への保存をスキップします。");
    return null;
  }

  let sessionsDbId;
  try {
    const hub = JSON.parse(readFileSync(resolve(root, ".notion-hub.json"), "utf8"));
    sessionsDbId = hub.databases?.sessions?.id;
  } catch {
    console.warn(".notion-hub.json が読めません。先に npm run notion:sessions:init を実行してください。");
    return null;
  }

  if (!sessionsDbId) {
    console.warn("Sessions DB が未作成です。npm run notion:sessions:init を実行してください。");
    return null;
  }

  const headers = notionHeaders(token);

  // 結論タイプを Notion select に変換（未知の値は暫定にフォールバック）
  const validTypes = ["決定", "暫定", "保留"];
  const conclusionType = validTypes.includes(structured.conclusionType)
    ? structured.conclusionType
    : "暫定";

  // ページ本文ブロック
  const children = [
    {
      object: "block",
      type: "callout",
      callout: {
        icon: { type: "emoji", emoji: conclusionType === "決定" ? "✅" : conclusionType === "暫定" ? "🟡" : "⏸️" },
        rich_text: [{ type: "text", text: { content: `[${conclusionType}] ${structured.conclusion}` } }],
      },
    },
    ...(prevSessionId ? [{
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "前回セッション: " } },
          { type: "text", text: { content: prevSessionId }, annotations: { code: true } },
        ],
      },
    }] : []),
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "会話の要約" } }] },
    },
    ...structured.summary.map((point) => ({
      object: "block",
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: [{ type: "text", text: { content: point } }] },
    })),
    {
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ type: "text", text: { content: "次に検討すべき論点" } }] },
    },
    ...structured.nextTopics.map((topic) => ({
      object: "block",
      type: "numbered_list_item",
      numbered_list_item: { rich_text: [{ type: "text", text: { content: topic } }] },
    })),
    { object: "block", type: "divider", divider: {} },
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "元の会話ログ（展開）" } }],
        children: chunkLog(log),
      },
    },
  ];

  // プロパティ
  const properties = {
    Title:         { title: [{ type: "text", text: { content: title } }] },
    SessionID:     { rich_text: [{ type: "text", text: { content: sessionId } }] },
    Date:          { date: { start: date } },
    ConclusionType:{ select: { name: conclusionType } },
    Conclusion:    { rich_text: [{ type: "text", text: { content: structured.conclusion.slice(0, 2000) } }] },
    NextTopics:    { rich_text: [{ type: "text", text: { content: structured.nextTopics.join(" / ").slice(0, 2000) } }] },
  };

  if (prevSessionId) {
    properties.PrevSessionID = { rich_text: [{ type: "text", text: { content: prevSessionId } }] };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers,
    body: JSON.stringify({ parent: { database_id: sessionsDbId }, properties, children }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Notion API エラー: ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * 長い会話ログを Notion ブロック上限（2000字）に合わせて分割する
 * toggle の children は最大100ブロックまでの制限がある
 */
function chunkLog(text) {
  const chunks = [];
  const chunkSize = 1900;
  const maxBlocks = 50;
  for (let i = 0; i < text.length && chunks.length < maxBlocks; i += chunkSize) {
    chunks.push({
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: [{ type: "text", text: { content: text.slice(i, i + chunkSize) } }] },
    });
  }
  return chunks;
}

// ────────────────────────────────────────────
// メイン
// ────────────────────────────────────────────
const log = await readLog();
if (!log.trim()) {
  console.error("会話ログが空です。");
  process.exit(1);
}

console.log(`会話ログ読み込み完了 (${log.length} 文字)`);

let structured;
try {
  structured = await summarizeWithClaude(log);
} catch (e) {
  console.warn("Claude API 要約に失敗:", e.message);
  structured = null;
}

if (!structured) {
  structured = await manualInput(log);
}

const date  = new Date().toISOString().slice(0, 10);
const title = explicitTitle ?? structured.title ?? sessionId;

// プレビュー表示（常に出力）
console.log("\n📝 保存内容プレビュー:");
console.log(`  タイトル      : ${title}`);
console.log(`  SessionID     : ${sessionId}`);
console.log(`  日付          : ${date}`);
console.log(`  結論タイプ    : ${structured.conclusionType ?? "暫定"}`);
console.log(`  結論          : ${structured.conclusion.slice(0, 80)}…`);
console.log(`  要約          : ${structured.summary.length} 点`);
console.log(`  次の論点      : ${structured.nextTopics.join(" / ")}`);
if (prevSessionId) console.log(`  前回Session   : ${prevSessionId}`);

// --dry-run / --no-notion ならMarkdown出力して終了
if (dryRun || noNotion) {
  const label = dryRun ? "DRY-RUN" : "Markdown出力（--no-notion）";
  console.log(`\n--- ${label} ---`);
  console.log(formatMarkdown(structured, sessionId, date, title));
  if (dryRun) console.log("\n（--dry-run: Notionへの保存はスキップしました）");
  process.exit(0);
}

// Notion に保存
const page = await saveToNotion({ sessionId, date, structured, log, title });

if (page) {
  console.log("\n✅ Notion に保存しました:", page.url);
} else {
  // Notion 未接続時はMarkdown出力
  console.log("\n--- Notion未接続のためMarkdown出力 ---");
  console.log(formatMarkdown(structured, sessionId, date, title));
}
