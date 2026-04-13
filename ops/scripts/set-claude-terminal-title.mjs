#!/usr/bin/env node
/**
 * Claude Code SessionStart（推奨）または任意フックから呼び出し。
 * stdin の JSON から session_id / cwd を読み、ターミナルタイトルを更新する。
 * stdout には一切出力しない。
 */
import { titleFromHookData, writeTerminalOscTitle } from "./terminal-title-osc.mjs";

async function readStdinJson() {
  if (process.stdin.isTTY) return {};
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return {};
  }
}

const hookData = await readStdinJson();
const title = titleFromHookData(hookData);
if (title) writeTerminalOscTitle(title);
process.exit(0);
