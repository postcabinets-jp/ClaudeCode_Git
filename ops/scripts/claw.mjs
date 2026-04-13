#!/usr/bin/env node
// NanoClaw v2 Client — connects to claw-daemon via UNIX socket
// Falls back to direct mode if daemon is not running

import { createConnection } from "node:net";
import { createInterface } from "node:readline";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const SOCK_PATH = join(homedir(), ".claude", "claw", "claw.sock");
const EOT = "\x04";

function startClient() {
  const socket = createConnection(SOCK_PATH);
  let responseBuffer = "";

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "🦀 > ",
  });

  console.log("\n🦀 NanoClaw v2 — connected to daemon");
  console.log('   Type /help for commands, "exit" to quit.\n');

  socket.on("connect", () => {
    // Request status on connect
    socket.write("/status\n");
  });

  socket.on("data", (data) => {
    const text = data.toString();
    const parts = text.split(EOT);

    for (let i = 0; i < parts.length; i++) {
      const chunk = parts[i];
      if (chunk) {
        process.stdout.write(chunk);
      }
      // EOT boundary found (not the last split part)
      if (i < parts.length - 1) {
        process.stdout.write("\n");
        rl.prompt();
      }
    }
  });

  socket.on("end", () => {
    console.log("\nDisconnected from daemon.");
    process.exit(0);
  });

  socket.on("error", (err) => {
    if (err.code === "ECONNREFUSED" || err.code === "ENOENT") {
      console.error("Daemon is not running. Start it with: npm run claw:daemon");
      console.error("Or load the launchd plist for auto-start.");
    } else {
      console.error(`Connection error: ${err.message}`);
    }
    process.exit(1);
  });

  rl.on("line", (line) => {
    const input = line.trim();
    if (!input) return rl.prompt();

    if (input === "exit" || input === "quit") {
      socket.write("exit\n");
      console.log("👋 Bye!");
      rl.close();
      socket.end();
      process.exit(0);
    }

    socket.write(input + "\n");
  });

  rl.on("close", () => {
    socket.end();
    process.exit(0);
  });
}

// ── Entry ─────────────────────────────────────────────
if (existsSync(SOCK_PATH)) {
  startClient();
} else {
  console.error("🦀 Daemon is not running.");
  console.error("   Start with: npm run claw:daemon");
  console.error("   Or load the launchd plist for auto-start.");
  process.exit(1);
}
