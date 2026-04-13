#!/usr/bin/env node
/**
 * POSTCABINETS — セッション開始時の自動Notionページ作成
 *
 * Claude Code の UserPromptSubmit フックから呼ばれる。
 * 初回のみ Notion Sessions DB にページを作成し、
 * ~/.claude/session-state.json にセッション状態を保存する。
 *
 * フック設定例（settings.json）:
 *   "UserPromptSubmit": [{
 *     "hooks": [{ "type": "command", "command": "node /path/to/session-start.mjs" }]
 *   }]
 *
 * フックからは CLAUDE_SESSION_ID 環境変数が渡される（Claude Code v1.x）。
 * 未設定時はプロセス起動時刻ベースのIDを生成する。
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { titleFromHookData, writeTerminalOscTitle } from "./terminal-title-osc.mjs";

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

// ────────────────────────────────────────────
// セッション状態ファイル（~/.claude/session-state.json）
// hookはどのプロジェクトからも呼ばれるため homeベースに置く
// ────────────────────────────────────────────
const stateDir  = resolve(homedir(), ".claude");
const statePath = resolve(stateDir, "session-state.json");

function loadState() {
  try { return JSON.parse(readFileSync(statePath, "utf8")); } catch { return {}; }
}

function saveState(state) {
  if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

// ────────────────────────────────────────────
// Claude Code フック入力（stdin JSON）
// ────────────────────────────────────────────
async function readHookInput() {
  if (process.stdin.isTTY) return {};
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return {}; }
}

const hookData = await readHookInput();

// セッションIDの決定：フック入力 > 環境変数 > 時刻ベース生成
const claudeSessionId =
  hookData?.session_id ??
  process.env.CLAUDE_SESSION_ID ??
  `S-${new Date().toISOString().slice(0, 10)}-${Date.now().toString(36).slice(-4)}`;

// 統合ターミナル / tmux のタブ名（stdout は使わない）
writeTerminalOscTitle(titleFromHookData(hookData));

const state = loadState();

// 既にこのセッションIDで作成済みなら何もしない（冪等）
if (state.sessionId === claudeSessionId && state.notionPageId) {
  process.exit(0);
}

// ────────────────────────────────────────────
// Notion に新しいセッションページを作成
// ────────────────────────────────────────────
const token = process.env.NOTION_TOKEN;
if (!token) {
  // Notion未設定は無音でスキップ（hookエラーにしない）
  process.exit(0);
}

let sessionsDbId;
try {
  const hub = JSON.parse(readFileSync(resolve(projectRoot, ".notion-hub.json"), "utf8"));
  sessionsDbId = hub.databases?.sessions?.id;
} catch {
  process.exit(0); // hub未設定はスキップ
}
if (!sessionsDbId) process.exit(0);

const date  = new Date().toISOString().slice(0, 10);
const title = `Session ${date}`;

const headers = {
  Authorization: `Bearer ${token}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

try {
  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { database_id: sessionsDbId },
      properties: {
        Title:     { title: [{ type: "text", text: { content: title } }] },
        SessionID: { rich_text: [{ type: "text", text: { content: claudeSessionId } }] },
        Date:      { date: { start: date } },
        ConclusionType: { select: { name: "暫定" } },
        Conclusion: { rich_text: [{ type: "text", text: { content: "（セッション進行中）" } }] },
        NextTopics: { rich_text: [{ type: "text", text: { content: "" } }] },
      },
      children: [
        {
          object: "block", type: "callout",
          callout: {
            icon: { type: "emoji", emoji: "🟡" },
            rich_text: [{ type: "text", text: { content: "[暫定] セッション進行中…" } }],
          },
        },
        {
          object: "block", type: "paragraph",
          paragraph: { rich_text: [{ type: "text", text: { content: "このページは会話中に自動更新されます。" } }] },
        },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${JSON.stringify(data)}`);

  // 状態を保存（ターン数リセット）
  saveState({
    sessionId: claudeSessionId,
    notionPageId: data.id,
    notionUrl: data.url,
    turnCount: 0,
    startedAt: new Date().toISOString(),
    logLines: [],
  });

  // 標準出力にURLを出す（デバッグ用、hookでは無視される）
  console.error(`[session-start] Notion page created: ${data.url}`);
} catch (e) {
  // hookがエラーになるとClaude Codeが止まるので必ず0で終了
  console.error("[session-start] Error:", e.message);
  process.exit(0);
}
