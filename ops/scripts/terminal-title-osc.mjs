/**
 * 統合ターミナル / tmux のウィンドウタイトルを OSC で更新する。
 * フック子プロセスでは stdout に触れない（SessionStart の stdout は Claude に渡る）。
 */
import { basename } from "node:path";
import { openSync, writeSync, closeSync } from "node:fs";

const MAX = 56;

export function sanitizeTitle(s) {
  return String(s)
    .replace(/[\x00-\x1f\x7f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX);
}

/** @param {string} title */
export function writeTerminalOscTitle(title) {
  const t = sanitizeTitle(title);
  if (!t) return;
  const seq = `\x1b]0;${t}\x07\x1b]2;${t}\x07`;
  let fd;
  try {
    fd = openSync("/dev/tty", "w");
    writeSync(fd, seq);
  } catch {
    // フックが TTY なしで動く環境では無視
  } finally {
    if (fd !== undefined) {
      try {
        closeSync(fd);
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * @param {{ session_id?: string; cwd?: string }} hookData
 * @param {{ short?: boolean }} [opts]
 */
export function titleFromHookData(hookData, opts = {}) {
  const sid = hookData?.session_id ?? "";
  const cwd = hookData?.cwd ?? "";
  const proj = cwd ? basename(cwd) : "cc";
  const shortSid =
    opts.short !== false && sid.length > 14 ? `${sid.slice(0, 10)}…` : sid;
  return sanitizeTitle(`${proj} · ${shortSid}`);
}
