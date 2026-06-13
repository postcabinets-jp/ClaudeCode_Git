#!/usr/bin/env node
// Stop hook: capture Nobu's genuine typed instructions from the session transcript
// into the vault ledger wiki/_meta/指示ログ.md (raw layer of the self-improvement loop).
// Idempotent per session via a uuid cursor. Always exits 0 (never breaks the session).

import fs from 'node:fs';
import path from 'node:path';

const LEDGER = '/Users/apple/note/wiki/_meta/指示ログ.md';
const STATE_DIR = '/Users/apple/.claude/hooks/stop/.state';

function safeExit() { process.exit(0); }
process.on('uncaughtException', safeExit);

let raw = '';
try { raw = fs.readFileSync(0, 'utf8'); } catch { safeExit(); }

let data = {};
try { data = JSON.parse(raw || '{}'); } catch { safeExit(); }

const transcriptPath = data.transcript_path;
const sessionId = data.session_id || 'unknown';
const cwd = data.cwd || '';
if (!transcriptPath || !fs.existsSync(transcriptPath)) safeExit();

// project label from cwd (note vault → "note", else basename)
let label = '?';
if (cwd) label = cwd.includes('/note') ? 'note' : (cwd.split('/').filter(Boolean).pop() || '?');

// load cursor (set of processed user-message uuids for this session)
fs.mkdirSync(STATE_DIR, { recursive: true });
const statePath = path.join(STATE_DIR, `instr_${sessionId}.json`);
let processed = new Set();
try { processed = new Set(JSON.parse(fs.readFileSync(statePath, 'utf8')).uuids || []); } catch {}

let lines = [];
try { lines = fs.readFileSync(transcriptPath, 'utf8').split('\n'); } catch { safeExit(); }

// noise filters: injected context, command invocations, interrupts
const SKIP = /^(<|caveat:|\[request interrupted|this session is being continued)/i;
const NOISE = /<system-reminder>|<command-name>|<command-message>|<local-command|local-command-stdout|tool_use_id/i;
const TRIVIAL = new Set(['ok', 'okay', 'はい', 'うん', '了解', '進めて', 'それで', 'それでいいよ', '続けて', 'どうぞ', 'yes', 'no']);

const newEntries = [];
const seenUuids = [];

for (const ln of lines) {
  const s = ln.trim();
  if (!s) continue;
  let o;
  try { o = JSON.parse(s); } catch { continue; }
  if (o.type !== 'user') continue;
  const m = o.message;
  if (!m || m.role !== 'user') continue;
  const c = m.content;
  if (typeof c !== 'string') continue;          // tool_result is an array → excluded
  const uuid = o.uuid;
  if (!uuid || processed.has(uuid)) continue;
  seenUuids.push(uuid);

  const text = c.trim();
  if (!text || SKIP.test(text) || NOISE.test(text)) continue;
  const norm = text.replace(/\s+/g, ' ').trim();
  if (norm.length < 5) continue;
  if (TRIVIAL.has(norm.toLowerCase())) continue;

  const ts = String(o.timestamp || '').slice(0, 16).replace('T', ' ');
  const oneline = norm.length > 240 ? norm.slice(0, 237) + '…' : norm;
  newEntries.push(`- ${ts} | [${label}] ${oneline}`);
}

// persist cursor (cap to avoid unbounded growth)
if (seenUuids.length) {
  const all = [...processed, ...seenUuids].slice(-3000);
  try { fs.writeFileSync(statePath, JSON.stringify({ uuids: all })); } catch {}
}

if (newEntries.length) {
  try {
    if (!fs.existsSync(LEDGER)) {
      fs.writeFileSync(LEDGER, '# 指示ログ\n\n## ログ（自動追記）\n');
    }
    fs.appendFileSync(LEDGER, '\n' + newEntries.join('\n'));
  } catch {}
}

safeExit();
