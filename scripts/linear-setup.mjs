// scripts/linear-setup.mjs
import { createInterface } from "node:readline/promises";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { createLinearClient } from "./lib/linear.mjs";

const root = projectRoot();
const envPath = resolve(root, ".env");

const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log("=== Linear セットアップ ===\n");
console.log("Linear の Settings > API で Personal API Key を発行してください。\n");

const apiKey = await rl.question("LINEAR_API_KEY: ");
const teamId = await rl.question("LINEAR_TEAM_ID (Settings > Workspace > Teams の URL末尾): ");
const claudeUserId = await rl.question("LINEAR_CLAUDE_USER_ID (ClaudeメンバーのユーザーID): ");

rl.close();

function upsertEnvVar(envContent, key, value) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  return regex.test(envContent) ? envContent.replace(regex, line) : `${envContent}\n${line}`;
}

let envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
envContent = upsertEnvVar(envContent, "LINEAR_API_KEY", apiKey);
envContent = upsertEnvVar(envContent, "LINEAR_TEAM_ID", teamId);
envContent = upsertEnvVar(envContent, "LINEAR_CLAUDE_USER_ID", claudeUserId);
writeFileSync(envPath, envContent.trimStart());

console.log("\n.env に書き込みました。疎通確認中...");

try {
  const client = createLinearClient(apiKey);
  const viewer = await client.viewer;
  console.log(`✅ Linear API 接続OK: ログイン中のユーザー = ${viewer.name}`);

  const team = await client.team(teamId);
  console.log(`✅ チーム確認OK: ${team.name}`);

  const user = await client.user(claudeUserId);
  console.log(`✅ Claudeユーザー確認OK: ${user.name}`);

  console.log("\n🎉 セットアップ完了！\n次のステップ: npm run linear:loop を実行してテストしてください。");
} catch (err) {
  console.error("❌ 接続エラー:", err.message);
  console.error("APIキー・TeamID・UserIDを確認してください。");
  process.exit(1);
}
