#!/usr/bin/env node
/**
 * POSTCABINETS — 3ターンごとのNotion自動要約更新
 *
 * Claude Code の Stop フックから呼ばれる（Claudeが1回答を完了するたびに実行）。
 * - ターン数をカウントし、3の倍数でNotionページを要約で更新する
 * - 会話ログは ~/.claude/session-state.json の logLines に蓄積する
 * - Stopフックのstdin JSONに assistant_response が含まれる場合は蓄積に使う
 *
 * フック設定例（settings.json）:
 *   "Stop": [{
 *     "hooks": [{ "type": "command", "command": "node /path/to/session-update.mjs" }]
 *   }]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { sanitizeTitle, writeTerminalOscTitle } from "./terminal-title-osc.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");

// .env 読み込み
function loadDotEnv() {
  const p = resolve(projectRoot, ".env");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadDotEnv();

const statePath = resolve(homedir(), ".claude", "session-state.json");

function loadState() {
  try { return JSON.parse(readFileSync(statePath, "utf8")); } catch { return null; }
}
function saveState(state) {
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

// ────────────────────────────────────────────
// フック入力を読む
// ────────────────────────────────────────────
async function readHookInput() {
  if (process.stdin.isTTY) return {};
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return {}; }
}

const hookData = await readHookInput();

const state = loadState();
if (!state?.notionPageId) process.exit(0); // セッション未開始はスキップ

// ターン数インクリメント
state.turnCount = (state.turnCount ?? 0) + 1;

// assistant_response があればログに追記
if (hookData?.assistant_response) {
  state.logLines = state.logLines ?? [];
  state.logLines.push(`[Turn ${state.turnCount}] ${hookData.assistant_response.slice(0, 500)}`);
  // 直近30ターン分だけ保持
  if (state.logLines.length > 30) state.logLines = state.logLines.slice(-30);
}

saveState(state);

// 3の倍数ターンでなければ終了
const UPDATE_EVERY = 3;
if (state.turnCount % UPDATE_EVERY !== 0) process.exit(0);

// ────────────────────────────────────────────
// Claude CLI（サブスクリプション枠）で要約生成
// ────────────────────────────────────────────
import { spawn } from "node:child_process";

function claudeAsk(prompt, systemPrompt, model = "haiku") {
  const claudeBin = process.env.CLAUDE_BIN ?? (process.env.HOME + "/.nvm/versions/node/v20.19.5/bin/claude");
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

const token = process.env.NOTION_TOKEN;
if (!token) process.exit(0);

const SYSTEM_PROMPT = "あなたはビジネス会議の議事録作成の専門家です。指示されたJSONフォーマットのみを返してください。説明文・コードブロック・マークダウン装飾は一切不要です。";

const PROMPT = `以下の会話ログを分析し、JSONのみを返してください（コードブロック不要）。

{
  "title": "セッションタイトル（15字以内）",
  "conclusionType": "決定 または 暫定 または 保留",
  "conclusion": "現時点の結論・意思決定（2〜3行）",
  "summary": ["要約1", "要約2", "要約3"],
  "nextTopics": ["論点1", "論点2"]
}

結論がまだない場合は conclusionType="暫定"、conclusion="（検討中）" とする。
脱線・雑談は無視し、重要な決定・論点のみ抽出すること。

## 会話ログ
`;

const logText = (state.logLines ?? []).join("\n");
if (!logText.trim()) process.exit(0);

let structured;
try {
  const text = await claudeAsk(PROMPT + logText, SYSTEM_PROMPT);
  try {
    structured = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) structured = JSON.parse(match[0]);
    else throw new Error("JSON parse failed: " + text.slice(0, 200));
  }
} catch (e) {
  console.error("[session-update] 要約失敗:", e.message);
  process.exit(0);
}

const dirLabel = hookData?.cwd ? basename(hookData.cwd) : "cc";
const summaryTitle = sanitizeTitle(structured.title ?? "");
if (summaryTitle) {
  writeTerminalOscTitle(`${dirLabel} · ${summaryTitle}`);
}

// ────────────────────────────────────────────
// Notion ページを更新
// プロパティ更新 + 本文の最初のcalloutブロックを差し替える
// ────────────────────────────────────────────
const headers = {
  Authorization: `Bearer ${token}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

const pageId = state.notionPageId;
const validTypes = ["決定", "暫定", "保留"];
const conclusionType = validTypes.includes(structured.conclusionType) ? structured.conclusionType : "暫定";
const emoji = conclusionType === "決定" ? "✅" : conclusionType === "暫定" ? "🟡" : "⏸️";
const title = structured.title ?? `Session ${new Date().toISOString().slice(0, 10)}`;

try {
  // 1. プロパティ更新
  await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      properties: {
        Title:          { title: [{ type: "text", text: { content: title } }] },
        ConclusionType: { select: { name: conclusionType } },
        Conclusion:     { rich_text: [{ type: "text", text: { content: structured.conclusion.slice(0, 2000) } }] },
        NextTopics:     { rich_text: [{ type: "text", text: { content: (structured.nextTopics ?? []).join(" / ").slice(0, 2000) } }] },
      },
    }),
  });

  // 2. 既存の本文ブロックを取得して最初のcalloutを見つける
  const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=10`, { headers });
  const blocksData = await blocksRes.json();
  const calloutBlock = blocksData.results?.find((b) => b.type === "callout");

  if (calloutBlock) {
    // calloutブロックを更新
    await fetch(`https://api.notion.com/v1/blocks/${calloutBlock.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        callout: {
          icon: { type: "emoji", emoji },
          rich_text: [{ type: "text", text: { content: `[${conclusionType}] ${structured.conclusion}` } }],
        },
      }),
    });
  }

  // 3. 要約セクションを追記（毎回追記ではなく「最新の要約」ブロックを探して更新）
  //    シンプルにするため: turn数が記録されたheading3を探して後ろのbulletを置換する代わりに
  //    新しい要約ブロックを追記する（最大10回分 = 30ターンまで保持）
  const summaryText = (structured.summary ?? []).map((s) => `• ${s}`).join("\n");
  const nextText = (structured.nextTopics ?? []).map((t, i) => `${i + 1}. ${t}`).join("\n");

  await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      children: [
        {
          object: "block", type: "heading_3",
          heading_3: { rich_text: [{ type: "text", text: { content: `Turn ${state.turnCount} 時点の要約` } }] },
        },
        {
          object: "block", type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: summaryText } }] },
        },
        ...(nextText ? [{
          object: "block", type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: `次の論点:\n${nextText}` } }] },
        }] : []),
        { object: "block", type: "divider", divider: {} },
      ],
    }),
  });

  console.error(`[session-update] Turn ${state.turnCount}: Notion updated → ${state.notionUrl}`);
} catch (e) {
  console.error("[session-update] Notion更新失敗:", e.message);
  process.exit(0);
}
