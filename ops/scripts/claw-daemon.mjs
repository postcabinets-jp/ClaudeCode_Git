#!/usr/bin/env node
// NanoClaw v2 Daemon — persistent REPL server over UNIX socket
// Survives sleep/wake via launchd KeepAlive

import { createServer } from "node:net";
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, appendFileSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";
// .env を手動パース（ゼロ依存）
const envPath = join(process.env.HOME || homedir(), "claude for me", ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) process.env[m[1].trim()] = m[2].trim();
  }
}

// ── Config ────────────────────────────────────────────
const CLAW_DIR = join(homedir(), ".claude", "claw");
const SOCK_PATH = join(CLAW_DIR, "claw.sock");
let SESSION_NAME = process.env.CLAW_SESSION || "default";
let MODEL = process.env.CLAW_MODEL || "gemini-3-flash-preview";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

mkdirSync(CLAW_DIR, { recursive: true });

const sessionPath = () => join(CLAW_DIR, `${SESSION_NAME}.md`);
const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);
const log = (msg) => console.log(`[${now()}] ${msg}`);

// ── Clean up stale socket ─────────────────────────────
if (existsSync(SOCK_PATH)) {
  try { unlinkSync(SOCK_PATH); } catch {}
}

// ── Session persistence ───────────────────────────────
function ensureSession() {
  const p = sessionPath();
  if (!existsSync(p)) {
    writeFileSync(p, `# NanoClaw Session: ${SESSION_NAME}\n\nCreated: ${now()}\nModel: ${MODEL}\n\n---\n\n`);
  }
}

function appendTurn(role, text) {
  appendFileSync(sessionPath(), `### ${role} — ${now()}\n\n${text}\n\n`);
}

function readSession() {
  ensureSession();
  return readFileSync(sessionPath(), "utf-8");
}

// ── Metrics ───────────────────────────────────────────
function getMetrics() {
  const content = readSession();
  const userTurns = (content.match(/^### user/gm) || []).length;
  const assistantTurns = (content.match(/^### assistant/gm) || []).length;
  const bytes = Buffer.byteLength(content, "utf-8");
  return { userTurns, assistantTurns, totalTurns: userTurns + assistantTurns, bytes };
}

// ── Gemini API call (streams chunks to client socket) ─
async function callGemini(prompt, socket) {
  if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set in .env");

  // セッション履歴から直近のターンをコンテキストとして含める
  const history = buildHistory();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      ...history,
      { role: "user", parts: [{ text: prompt }] },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }

  // SSE ストリーミングをパース
  let fullText = "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let sseBuffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    sseBuffer += decoder.decode(value, { stream: true });

    // SSE行ごとに処理
    const lines = sseBuffer.split("\n");
    sseBuffer = lines.pop(); // 不完全な行をバッファに残す
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6);
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          fullText += text;
          try { socket.write(text); } catch {}
        }
      } catch {}
    }
  }
  return fullText.trim();
}

// 直近のセッション履歴をGemini形式に変換
function buildHistory() {
  const content = readSession();
  const blocks = content.split(/(?=^### )/m).filter(s => s.startsWith("### "));
  const turns = [];
  for (const b of blocks) {
    const match = b.match(/^### (user|assistant) — .+\n\n([\s\S]*)/);
    if (match) {
      turns.push({ role: match[1] === "assistant" ? "model" : "user", parts: [{ text: match[2].trim() }] });
    }
  }
  // 直近20ターンだけ送る（コンテキスト節約）
  return turns.slice(-20);
}

// ── Commands ──────────────────────────────────────────
function handleCommand(cmd, arg) {
  switch (cmd) {
    case "/help":
      return `NanoClaw v2 Commands:
  /help                          Show this help
  /clear                         Clear current session
  /history                       Print full session history
  /sessions                      List saved sessions
  /session <name>                Switch session
  /model [name]                  Show/set model
  /branch <session-name>         Branch current session
  /search <query>                Search across sessions
  /compact                       Compact old turns
  /export <md|json|txt> [path]   Export session
  /metrics                       Show session metrics
  /status                        Daemon status
  exit                           Disconnect`;

    case "/clear":
      writeFileSync(sessionPath(), `# NanoClaw Session: ${SESSION_NAME}\n\nCleared: ${now()}\nModel: ${MODEL}\n\n---\n\n`);
      return "Session cleared.";

    case "/history":
      return readSession();

    case "/sessions": {
      const files = readdirSync(CLAW_DIR).filter(f => f.endsWith(".md"));
      if (!files.length) return "No sessions found.";
      return "Sessions:\n" + files.map(f => {
        const name = f.replace(".md", "");
        return `  ${name}${name === SESSION_NAME ? " <- current" : ""}`;
      }).join("\n");
    }

    case "/session":
      if (!arg) return `Current session: ${SESSION_NAME}`;
      SESSION_NAME = arg.trim().replace(/[^a-zA-Z0-9-]/g, "");
      ensureSession();
      return `Switched to session: ${SESSION_NAME}`;

    case "/model":
      if (!arg) return `Current model: ${MODEL}`;
      MODEL = arg.trim();
      return `Model set to: ${MODEL}`;

    case "/branch": {
      if (!arg) return "Usage: /branch <session-name>";
      const newName = arg.trim().replace(/[^a-zA-Z0-9-]/g, "");
      const dest = join(CLAW_DIR, `${newName}.md`);
      if (existsSync(dest)) return `Session "${newName}" already exists.`;
      const content = readSession().replace(
        `# NanoClaw Session: ${SESSION_NAME}`,
        `# NanoClaw Session: ${newName}\n\nBranched from: ${SESSION_NAME} at ${now()}`
      );
      writeFileSync(dest, content);
      return `Branched to "${newName}". Use /session ${newName} to switch.`;
    }

    case "/search": {
      if (!arg) return "Usage: /search <query>";
      const query = arg.trim().toLowerCase();
      const files = readdirSync(CLAW_DIR).filter(f => f.endsWith(".md"));
      const results = [];
      for (const f of files) {
        const content = readFileSync(join(CLAW_DIR, f), "utf-8");
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(query)) {
            results.push(`  ${f}:${i + 1}: ${lines[i].slice(0, 120)}`);
          }
        }
      }
      return results.length ? results.join("\n") : "No matches found.";
    }

    case "/compact": {
      const content = readSession();
      const sections = content.split(/(?=^### )/m);
      const header = sections.filter(s => !s.startsWith("### ")).join("");
      const turns = sections.filter(s => s.startsWith("### "));
      const KEEP = 10;
      if (turns.length <= KEEP) return "Nothing to compact.";
      const compacted = turns.slice(0, -KEEP);
      const kept = turns.slice(-KEEP);
      const summary = `### [compacted] — ${now()}\n\n_${compacted.length} turns compacted._\n\n`;
      writeFileSync(sessionPath(), header + summary + kept.join(""));
      return `Compacted ${compacted.length} turns.`;
    }

    case "/export": {
      const parts = (arg || "").trim().split(/\s+/);
      const fmt = parts[0] || "md";
      const ext = fmt === "json" ? "json" : fmt === "txt" ? "txt" : "md";
      const outPath = parts[1] || join(CLAW_DIR, `export-${SESSION_NAME}-${Date.now()}.${ext}`);
      const content = readSession();

      if (fmt === "json") {
        const turns = [];
        const blocks = content.split(/(?=^### )/m).filter(s => s.startsWith("### "));
        for (const b of blocks) {
          const match = b.match(/^### (\w+) — (.+)\n\n([\s\S]*)/);
          if (match) turns.push({ role: match[1], time: match[2], text: match[3].trim() });
        }
        writeFileSync(outPath, JSON.stringify(turns, null, 2));
      } else if (fmt === "txt") {
        writeFileSync(outPath, content.replace(/^###\s*/gm, "").replace(/^---$/gm, ""));
      } else {
        writeFileSync(outPath, content);
      }
      return `Exported to ${resolve(outPath)}`;
    }

    case "/metrics": {
      const m = getMetrics();
      return `Session: ${SESSION_NAME}\n  User turns:      ${m.userTurns}\n  Assistant turns:  ${m.assistantTurns}\n  Total turns:      ${m.totalTurns}\n  Size:             ${(m.bytes / 1024).toFixed(1)} KB\n  Model:            ${MODEL}`;
    }

    case "/status": {
      const uptime = process.uptime();
      const h = Math.floor(uptime / 3600);
      const m = Math.floor((uptime % 3600) / 60);
      return `Daemon uptime: ${h}h ${m}m\nSession: ${SESSION_NAME}\nModel: ${MODEL}\nPID: ${process.pid}\nSocket: ${SOCK_PATH}`;
    }

    default:
      return `Unknown command: ${cmd}. Try /help`;
  }
}

// ── Protocol ──────────────────────────────────────────
// Client sends lines. Daemon responds with:
//   - For commands: result text + \x04 (EOT)
//   - For prompts: streamed claude response + \x04 (EOT)
const EOT = "\x04";

// ── Queue for serializing requests ────────────────────
let busy = false;
const queue = [];

async function processQueue() {
  if (busy || queue.length === 0) return;
  busy = true;
  const { input, socket } = queue.shift();
  try {
    await handleInput(input, socket);
  } catch (err) {
    try { socket.write(`Error: ${err.message}${EOT}`); } catch {}
  }
  busy = false;
  processQueue();
}

async function handleInput(input, socket) {
  if (!input) return;

  // slash commands
  if (input.startsWith("/")) {
    const spaceIdx = input.indexOf(" ");
    const cmd = spaceIdx === -1 ? input : input.slice(0, spaceIdx);
    const arg = spaceIdx === -1 ? null : input.slice(spaceIdx + 1);
    const result = handleCommand(cmd, arg);
    socket.write(result + EOT);
    return;
  }

  // normal prompt → claude
  ensureSession();
  appendTurn("user", input);
  try {
    const response = await callGemini(input, socket);
    appendTurn("assistant", response);
    socket.write(EOT);
  } catch (err) {
    socket.write(`\nError: ${err.message}${EOT}`);
  }
}

// ── Server ────────────────────────────────────────────
const server = createServer((socket) => {
  log("Client connected");
  let buffer = "";

  socket.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line in buffer
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "exit" || trimmed === "quit") {
        socket.write("Disconnected." + EOT);
        socket.end();
        return;
      }
      if (trimmed) {
        queue.push({ input: trimmed, socket });
        processQueue();
      }
    }
  });

  socket.on("end", () => log("Client disconnected"));
  socket.on("error", (err) => log(`Socket error: ${err.message}`));
});

server.listen(SOCK_PATH, () => {
  log(`NanoClaw daemon listening on ${SOCK_PATH}`);
  log(`Session: ${SESSION_NAME} | Model: ${MODEL} | PID: ${process.pid}`);
});

// ── Graceful shutdown ─────────────────────────────────
function shutdown(signal) {
  log(`Received ${signal}, shutting down...`);
  server.close();
  try { unlinkSync(SOCK_PATH); } catch {}
  process.exit(0);
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
