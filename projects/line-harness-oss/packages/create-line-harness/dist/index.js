#!/usr/bin/env node

// src/index.ts
import { resolve } from "path";

// src/commands/setup.ts
import * as p9 from "@clack/prompts";
import pc from "picocolors";
import { readFileSync as readFileSync3, writeFileSync as writeFileSync4, existsSync as existsSync3 } from "fs";
import { join as join5 } from "path";

// src/steps/check-deps.ts
import * as p from "@clack/prompts";
import { execa } from "execa";
async function checkDeps() {
  const s = p.spinner();
  s.start("\u74B0\u5883\u30C1\u30A7\u30C3\u30AF\u4E2D...");
  const nodeVersion = process.versions.node;
  const major = parseInt(nodeVersion.split(".")[0], 10);
  if (major < 20) {
    s.stop("\u74B0\u5883\u30C1\u30A7\u30C3\u30AF\u5931\u6557");
    p.cancel(`Node.js 20 \u4EE5\u4E0A\u304C\u5FC5\u8981\u3067\u3059\uFF08\u73FE\u5728: ${nodeVersion}\uFF09`);
    process.exit(1);
  }
  try {
    await execa("npx", ["--version"]);
  } catch {
    s.stop("\u74B0\u5883\u30C1\u30A7\u30C3\u30AF\u5931\u6557");
    p.cancel("npx \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002Node.js \u3092\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    process.exit(1);
  }
  s.stop("\u74B0\u5883\u30C1\u30A7\u30C3\u30AF\u5B8C\u4E86");
}

// src/steps/auth.ts
import * as p2 from "@clack/prompts";

// src/lib/wrangler.ts
import { execa as execa2 } from "execa";
var WranglerError = class extends Error {
  constructor(message, stderr) {
    super(message);
    this.stderr = stderr;
    this.name = "WranglerError";
  }
};
async function wrangler(args2, options) {
  try {
    const result = await execa2("npx", ["wrangler", ...args2], {
      cwd: options?.cwd,
      input: options?.input,
      env: { ...process.env, FORCE_COLOR: "0" }
    });
    return result.stdout;
  } catch (error) {
    throw new WranglerError(
      `wrangler ${args2[0]} failed: ${error.stderr || error.message}`,
      error.stderr || ""
    );
  }
}
async function wranglerInteractive(args2) {
  await execa2("npx", ["wrangler", ...args2], {
    stdio: "inherit",
    env: { ...process.env, FORCE_COLOR: "1" }
  });
}
async function isWranglerAuthenticated() {
  try {
    const output = await wrangler(["whoami"]);
    return !output.toLowerCase().includes("not authenticated");
  } catch {
    return false;
  }
}

// src/steps/auth.ts
async function ensureAuth() {
  const s = p2.spinner();
  s.start("Cloudflare \u8A8D\u8A3C\u30C1\u30A7\u30C3\u30AF\u4E2D...");
  const authenticated = await isWranglerAuthenticated();
  if (authenticated) {
    s.stop("Cloudflare \u8A8D\u8A3C\u6E08\u307F");
    return;
  }
  s.stop("Cloudflare \u306B\u30ED\u30B0\u30A4\u30F3\u304C\u5FC5\u8981\u3067\u3059");
  p2.log.info("\u30D6\u30E9\u30A6\u30B6\u304C\u958B\u304D\u307E\u3059\u3002Cloudflare \u306B\u30ED\u30B0\u30A4\u30F3\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
  await wranglerInteractive(["login"]);
  const nowAuthenticated = await isWranglerAuthenticated();
  if (!nowAuthenticated) {
    p2.cancel("Cloudflare \u30ED\u30B0\u30A4\u30F3\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u3082\u3046\u4E00\u5EA6\u8A66\u3057\u3066\u304F\u3060\u3055\u3044\u3002");
    process.exit(1);
  }
  p2.log.success("Cloudflare \u30ED\u30B0\u30A4\u30F3\u5B8C\u4E86");
}
async function getAccountId() {
  const output = await wrangler(["whoami"]);
  const match = output.match(/│\s+\S.*?\s+│\s+([a-f0-9]{32})\s+│/);
  if (!match) {
    throw new Error(
      "Cloudflare \u30A2\u30AB\u30A6\u30F3\u30C8 ID \u3092\u53D6\u5F97\u3067\u304D\u307E\u305B\u3093\u3002wrangler whoami \u306E\u51FA\u529B\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    );
  }
  return match[1];
}

// src/steps/prompt.ts
import * as p3 from "@clack/prompts";
async function promptLineCredentials() {
  p3.log.step(
    "LINE Developers Console \u3067\u30C1\u30E3\u30CD\u30EB\u60C5\u5831\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\nhttps://developers.line.biz/console/"
  );
  p3.log.info(
    [
      "\u5FC5\u8981\u306A\u30C1\u30E3\u30CD\u30EB\uFF082\u3064\uFF09:",
      "  1. Messaging API \u30C1\u30E3\u30CD\u30EB \u2014 Bot\u306E\u30E1\u30C3\u30BB\u30FC\u30B8\u9001\u53D7\u4FE1\u7528",
      "  2. LINE Login \u30C1\u30E3\u30CD\u30EB   \u2014 \u30E6\u30FC\u30B6\u30FC\u8A8D\u8A3C\u30FBLIFF\u7528",
      "",
      "\u307E\u3060\u4F5C\u3063\u3066\u3044\u306A\u3051\u308C\u3070\u3001\u4E0A\u306EURL\u304B\u3089\u4F5C\u6210\u3057\u3066\u304F\u3060\u3055\u3044\u3002"
    ].join("\n")
  );
  p3.log.message(
    [
      "\u2500\u2500 Messaging API \u2500\u2500",
      "\u5834\u6240: LINE Official Account Manager \u2192 \u8A2D\u5B9A \u2192 Messaging API",
      "  https://manager.line.biz/ \u2192 \u30A2\u30AB\u30A6\u30F3\u30C8\u9078\u629E \u2192 \u8A2D\u5B9A \u2192 Messaging API"
    ].join("\n")
  );
  const lineChannelId = await p3.text({
    message: "Channel ID\uFF08\u6570\u5B57\uFF09",
    placeholder: "\u540C\u3058\u30DA\u30FC\u30B8\u306B\u8868\u793A\u3055\u308C\u3066\u3044\u308B Channel ID",
    validate(value) {
      if (!value || !/^\d+$/.test(value.trim())) {
        return "Channel ID \u306F\u6570\u5B57\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      }
    }
  });
  if (p3.isCancel(lineChannelId)) {
    p3.cancel("\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F");
    process.exit(0);
  }
  const lineChannelAccessToken = await p3.text({
    message: "\u30C1\u30E3\u30CD\u30EB\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\uFF08\u9577\u671F\uFF09",
    placeholder: "Messaging API\u8A2D\u5B9A \u2192 \u30C1\u30E3\u30CD\u30EB\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3 \u2192 \u767A\u884C",
    validate(value) {
      if (!value || value.trim().length < 10) {
        return "\u30C1\u30E3\u30CD\u30EB\u30A2\u30AF\u30BB\u30B9\u30C8\u30FC\u30AF\u30F3\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      }
    }
  });
  if (p3.isCancel(lineChannelAccessToken)) {
    p3.cancel("\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F");
    process.exit(0);
  }
  const lineChannelSecret = await p3.text({
    message: "\u30C1\u30E3\u30CD\u30EB\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8",
    placeholder: "\u30C1\u30E3\u30CD\u30EB\u57FA\u672C\u8A2D\u5B9A \u2192 \u30C1\u30E3\u30CD\u30EB\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8",
    validate(value) {
      if (!value || value.trim().length < 10) {
        return "\u30C1\u30E3\u30CD\u30EB\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      }
    }
  });
  if (p3.isCancel(lineChannelSecret)) {
    p3.cancel("\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F");
    process.exit(0);
  }
  p3.log.message(
    [
      "\u2500\u2500 LINE Login \u30C1\u30E3\u30CD\u30EB \u2500\u2500",
      "\u5834\u6240: LINE Developers Console \u2192 \u30D7\u30ED\u30D0\u30A4\u30C0\u30FC \u2192 LINE Login \u30C1\u30E3\u30CD\u30EB",
      "  https://developers.line.biz/console/",
      "  \u203B Messaging API \u3068\u306F\u5225\u306E\u30C1\u30E3\u30CD\u30EB\u3067\u3059"
    ].join("\n")
  );
  const lineLoginChannelId = await p3.text({
    message: "\u30C1\u30E3\u30CD\u30EB ID\uFF08\u6570\u5B57\uFF09",
    placeholder: "\u30C1\u30E3\u30CD\u30EB\u57FA\u672C\u8A2D\u5B9A \u2192 \u30C1\u30E3\u30CD\u30EBID\uFF08\u4F8B: 2009554425\uFF09",
    validate(value) {
      if (!value || !/^\d+$/.test(value.trim())) {
        return "\u30C1\u30E3\u30CD\u30EB ID \u306F\u6570\u5B57\u3067\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044";
      }
    }
  });
  if (p3.isCancel(lineLoginChannelId)) {
    p3.cancel("\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F");
    process.exit(0);
  }
  return {
    lineChannelId: lineChannelId.trim(),
    lineChannelAccessToken: lineChannelAccessToken.trim(),
    lineChannelSecret: lineChannelSecret.trim(),
    lineLoginChannelId: lineLoginChannelId.trim()
  };
}

// src/steps/database.ts
import * as p4 from "@clack/prompts";
import { readdirSync } from "fs";
import { join } from "path";
async function createDatabase(repoDir) {
  const s = p4.spinner();
  const databaseName = "line-harness";
  s.start("D1 \u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u4F5C\u6210\u4E2D...");
  let databaseId;
  try {
    const output = await wrangler(["d1", "create", databaseName]);
    const tomlMatch = output.match(/database_id\s*=\s*"([^"]+)"/);
    const jsonMatch = output.match(/"database_id"\s*:\s*"([^"]+)"/);
    const uuidMatch = output.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    );
    const match = tomlMatch || jsonMatch || uuidMatch;
    if (!match) {
      throw new Error(`D1 ID \u3092\u30D1\u30FC\u30B9\u3067\u304D\u307E\u305B\u3093: ${output}`);
    }
    databaseId = match[1];
    s.stop("D1 \u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u4F5C\u6210\u5B8C\u4E86");
  } catch (error) {
    if (error instanceof WranglerError && error.stderr.includes("already exists")) {
      s.stop("D1 \u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u306F\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059");
      const listOutput = await wrangler(["d1", "list", "--json"]);
      const databases = JSON.parse(listOutput);
      const db = databases.find(
        (d) => d.name === databaseName
      );
      if (!db) {
        throw new Error("\u65E2\u5B58\u306E D1 \u30C7\u30FC\u30BF\u30D9\u30FC\u30B9\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093");
      }
      databaseId = db.uuid;
    } else {
      throw error;
    }
  }
  const schemaFile = join(repoDir, "packages/db/schema.sql");
  const migrationsDir = join(repoDir, "packages/db/migrations");
  const migrationFiles = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
  const totalFiles = 1 + migrationFiles.length;
  s.start(`\u30C6\u30FC\u30D6\u30EB\u4F5C\u6210\u4E2D\uFF08${totalFiles} files\uFF09...`);
  try {
    await wrangler([
      "d1",
      "execute",
      databaseName,
      "--remote",
      "--file",
      schemaFile
    ]);
  } catch {
  }
  for (const file of migrationFiles) {
    try {
      await wrangler([
        "d1",
        "execute",
        databaseName,
        "--remote",
        "--file",
        join(migrationsDir, file)
      ]);
    } catch {
    }
  }
  s.stop("\u30C6\u30FC\u30D6\u30EB\u4F5C\u6210\u5B8C\u4E86");
  return { databaseId, databaseName };
}

// src/steps/deploy-worker.ts
import * as p5 from "@clack/prompts";
import { writeFileSync, existsSync, readFileSync, unlinkSync } from "fs";
import { join as join2 } from "path";
async function deployWorker(options) {
  const s = p5.spinner();
  const workerDir = join2(options.repoDir, "apps/worker");
  const tomlPath = join2(workerDir, "wrangler.toml");
  const originalToml = existsSync(tomlPath) ? readFileSync(tomlPath, "utf-8") : null;
  s.start("Worker \u30C7\u30D7\u30ED\u30A4\u4E2D...");
  const deployToml = `name = "${options.workerName}"
main = "src/index.ts"
compatibility_date = "2024-12-01"
workers_dev = true
account_id = "${options.accountId}"

# Static assets (LIFF pages) served by Workers Assets
# SPA fallback ensures all non-API paths serve index.html
[assets]
not_found_handling = "single-page-application"

[[d1_databases]]
binding = "DB"
database_name = "${options.d1DatabaseName}"
database_id = "${options.d1DatabaseId}"

[triggers]
crons = ["*/5 * * * *"]
`;
  writeFileSync(tomlPath, deployToml);
  const envPath = join2(workerDir, ".env");
  const envContent = `VITE_LIFF_ID=${options.liffId}
VITE_BOT_BASIC_ID=${options.botBasicId}
`;
  writeFileSync(envPath, envContent);
  try {
    const output = await wrangler(["deploy"], { cwd: workerDir });
    const urlMatch = output.match(/(https:\/\/[^\s]+\.workers\.dev)/);
    const workerUrl = urlMatch ? urlMatch[1] : `https://${options.workerName}.workers.dev`;
    s.stop("Worker \u30C7\u30D7\u30ED\u30A4\u5B8C\u4E86");
    return { workerUrl };
  } finally {
    if (originalToml) {
      writeFileSync(tomlPath, originalToml);
    }
    const deployEnvPath = join2(workerDir, ".env");
    if (existsSync(deployEnvPath)) {
      unlinkSync(deployEnvPath);
    }
  }
}

// src/steps/deploy-admin.ts
import * as p6 from "@clack/prompts";
import { writeFileSync as writeFileSync2 } from "fs";
import { join as join3 } from "path";
import { execa as execa3 } from "execa";
async function deployAdmin(options) {
  const s = p6.spinner();
  const webDir = join3(options.repoDir, "apps/web");
  s.start("Admin UI \u30D3\u30EB\u30C9\u4E2D...");
  const envContent = `NEXT_PUBLIC_API_URL=${options.workerUrl}
`;
  writeFileSync2(join3(webDir, ".env.production"), envContent);
  try {
    await execa3("pnpm", ["run", "build"], { cwd: webDir });
  } catch (error) {
    s.stop("Admin UI \u30D3\u30EB\u30C9\u5931\u6557");
    throw new Error(`Admin UI \u306E\u30D3\u30EB\u30C9\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${error.message}`);
  }
  s.stop("Admin UI \u30D3\u30EB\u30C9\u5B8C\u4E86");
  s.start("Admin UI \u30C7\u30D7\u30ED\u30A4\u4E2D...");
  try {
    try {
      await wrangler(["pages", "project", "create", options.projectName, "--production-branch", "main"]);
    } catch {
    }
    const output = await wrangler(
      ["pages", "deploy", "out", "--project-name", options.projectName, "--commit-dirty=true"],
      { cwd: webDir }
    );
    let adminUrl = `https://${options.projectName}.pages.dev`;
    try {
      const projectList = await wrangler(["pages", "project", "list"]);
      const subdomainMatch = projectList.match(
        new RegExp(`${options.projectName}\\s+\u2502\\s+(\\S+\\.pages\\.dev)`)
      );
      if (subdomainMatch) {
        adminUrl = `https://${subdomainMatch[1]}`;
      }
    } catch {
    }
    s.stop("Admin UI \u30C7\u30D7\u30ED\u30A4\u5B8C\u4E86");
    return { adminUrl };
  } catch (error) {
    s.stop("Admin UI \u30C7\u30D7\u30ED\u30A4\u5931\u6557");
    throw new Error(`Admin UI \u306E\u30C7\u30D7\u30ED\u30A4\u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${error.message}`);
  }
}

// src/steps/secrets.ts
import * as p7 from "@clack/prompts";
async function setSecrets(options) {
  const s = p7.spinner();
  s.start("\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8\u8A2D\u5B9A\u4E2D...");
  const secrets = {
    LINE_CHANNEL_ACCESS_TOKEN: options.lineChannelAccessToken,
    LINE_CHANNEL_SECRET: options.lineChannelSecret,
    LINE_LOGIN_CHANNEL_ID: options.lineLoginChannelId,
    LIFF_URL: `https://liff.line.me/${options.liffId}`,
    API_KEY: options.apiKey
  };
  for (const [name, value] of Object.entries(secrets)) {
    await wrangler(["secret", "put", name, "--name", options.workerName], {
      input: value
    });
  }
  s.stop("\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8\u8A2D\u5B9A\u5B8C\u4E86");
}

// src/steps/mcp-config.ts
import * as p8 from "@clack/prompts";
import { readFileSync as readFileSync2, writeFileSync as writeFileSync3, existsSync as existsSync2 } from "fs";
import { join as join4 } from "path";
function generateMcpConfig(options) {
  const mcpJsonPath = join4(process.cwd(), ".mcp.json");
  const newServerConfig = {
    command: "npx",
    args: ["-y", "@line-harness/mcp-server@latest"],
    env: {
      LINE_HARNESS_API_URL: options.workerUrl,
      LINE_HARNESS_API_KEY: options.apiKey
    }
  };
  let mcpConfig = {};
  if (existsSync2(mcpJsonPath)) {
    try {
      mcpConfig = JSON.parse(readFileSync2(mcpJsonPath, "utf-8"));
    } catch {
    }
  }
  if (!mcpConfig.mcpServers) {
    mcpConfig.mcpServers = {};
  }
  let serverName = "line-harness";
  if (mcpConfig.mcpServers["line-harness"]) {
    const suffix = options.apiKey.slice(0, 8);
    serverName = `line-harness-${suffix}`;
    p8.log.info(
      `\u65E2\u5B58\u306E line-harness \u8A2D\u5B9A\u304C\u3042\u308B\u305F\u3081\u3001${serverName} \u3068\u3057\u3066\u8FFD\u52A0\u3057\u307E\u3059`
    );
  }
  mcpConfig.mcpServers[serverName] = newServerConfig;
  writeFileSync3(mcpJsonPath, JSON.stringify(mcpConfig, null, 2) + "\n");
  p8.log.success(`.mcp.json \u306B MCP \u8A2D\u5B9A\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F\uFF08${serverName}\uFF09`);
}

// src/lib/crypto.ts
import { randomBytes } from "crypto";
function generateApiKey() {
  return randomBytes(32).toString("hex");
}

// src/commands/setup.ts
function getStatePath(repoDir) {
  return join5(repoDir, ".line-harness-setup.json");
}
function loadState(repoDir) {
  const path = getStatePath(repoDir);
  if (existsSync3(path)) {
    try {
      return JSON.parse(readFileSync3(path, "utf-8"));
    } catch {
    }
  }
  return { completedSteps: [] };
}
function saveState(repoDir, state) {
  writeFileSync4(getStatePath(repoDir), JSON.stringify(state, null, 2) + "\n");
}
function isDone(state, step) {
  return state.completedSteps.includes(step);
}
function markDone(state, step) {
  if (!state.completedSteps.includes(step)) {
    state.completedSteps.push(step);
  }
}
async function runSetup(repoDir) {
  p9.intro(pc.bgCyan(pc.black(" LINE Harness \u30BB\u30C3\u30C8\u30A2\u30C3\u30D7 ")));
  const state = loadState(repoDir);
  if (state.completedSteps.length > 0) {
    p9.log.info(
      `\u524D\u56DE\u306E\u9014\u4E2D\u304B\u3089\u518D\u958B\u3057\u307E\u3059\uFF08\u5B8C\u4E86\u6E08\u307F: ${state.completedSteps.join(", ")}\uFF09`
    );
  }
  await checkDeps();
  await ensureAuth();
  if (!state.accountId) {
    const accountId = await getAccountId();
    state.accountId = accountId;
    saveState(repoDir, state);
    p9.log.success(`Cloudflare \u30A2\u30AB\u30A6\u30F3\u30C8: ${accountId}`);
  }
  if (!isDone(state, "credentials")) {
    const credentials = await promptLineCredentials();
    state.lineChannelId = credentials.lineChannelId;
    state.lineChannelAccessToken = credentials.lineChannelAccessToken;
    state.lineChannelSecret = credentials.lineChannelSecret;
    state.lineLoginChannelId = credentials.lineLoginChannelId;
    markDone(state, "credentials");
    saveState(repoDir, state);
  } else {
    p9.log.success("LINE \u30C1\u30E3\u30CD\u30EB\u60C5\u5831: \u5165\u529B\u6E08\u307F\uFF08\u30B9\u30AD\u30C3\u30D7\uFF09");
  }
  if (!isDone(state, "liffId")) {
    p9.log.message(
      [
        "\u2500\u2500 LIFF \u30A2\u30D7\u30EA\uFF08LINE Login \u30C1\u30E3\u30CD\u30EB\u5185\uFF09 \u2500\u2500",
        "",
        "LINE Login \u30C1\u30E3\u30CD\u30EB\u306E\u8A2D\u5B9A:",
        "  \u30EA\u30F3\u30AF\u3055\u308C\u305F\u30DC\u30C3\u30C8: Messaging API \u306E\u30DC\u30C3\u30C8\u3092\u9078\u629E",
        "  Scope: openid, profile, chat_message.write \u3092\u6709\u52B9\u5316",
        "  \u53CB\u3060\u3061\u8FFD\u52A0\u30AA\u30D7\u30B7\u30E7\u30F3: On (aggressive)",
        "",
        "LIFF \u30A2\u30D7\u30EA\u306E\u4F5C\u6210:",
        "  1. LINE Login \u30C1\u30E3\u30CD\u30EB \u2192 LIFF \u30BF\u30D6 \u2192 \u8FFD\u52A0",
        "  2. \u30B5\u30A4\u30BA: Full",
        "  3. \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8 URL: https://example.com\uFF08\u5F8C\u3067\u5909\u66F4\u3057\u307E\u3059\uFF09",
        "  4. \u4F5C\u6210\u5F8C\u306B\u8868\u793A\u3055\u308C\u308B LIFF ID \u3092\u30B3\u30D4\u30FC",
        "",
        "\u6CE8\u610F: LIFF \u30A2\u30D7\u30EA\u3092\u300C\u516C\u958B\u6E08\u307F\u300D\u306B\u3057\u3066\u304F\u3060\u3055\u3044\uFF08\u958B\u767A\u4E2D\u3060\u3068\u52D5\u304D\u307E\u305B\u3093\uFF09"
      ].join("\n")
    );
    const liffId = await p9.text({
      message: "LIFF ID",
      placeholder: "\u30C1\u30E3\u30CD\u30EBID-\u30E9\u30F3\u30C0\u30E0\u6587\u5B57\u5217\uFF08\u4F8B: 2009554425-4IMBmLQ9\uFF09",
      validate(value) {
        if (!value || !value.includes("-")) {
          return "LIFF ID \u306F\u300C\u30C1\u30E3\u30CD\u30EBID-\u30E9\u30F3\u30C0\u30E0\u6587\u5B57\u5217\u300D\u306E\u5F62\u5F0F\u3067\u3059\uFF08\u4F8B: 2009554425-4IMBmLQ9\uFF09";
        }
      }
    });
    if (p9.isCancel(liffId)) {
      p9.cancel("\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u3092\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u307E\u3057\u305F");
      process.exit(0);
    }
    state.liffId = liffId.trim();
    markDone(state, "liffId");
    saveState(repoDir, state);
  } else {
    p9.log.success(`LIFF ID: \u5165\u529B\u6E08\u307F\uFF08${state.liffId}\uFF09`);
  }
  if (!state.apiKey) {
    state.apiKey = generateApiKey();
    saveState(repoDir, state);
  }
  if (!isDone(state, "database")) {
    const { databaseId, databaseName } = await createDatabase(repoDir);
    state.d1DatabaseId = databaseId;
    state.d1DatabaseName = databaseName;
    markDone(state, "database");
    saveState(repoDir, state);
  } else {
    p9.log.success(`D1 \u30C7\u30FC\u30BF\u30D9\u30FC\u30B9: \u4F5C\u6210\u6E08\u307F\uFF08${state.d1DatabaseId}\uFF09`);
  }
  if (!state.botBasicId) {
    try {
      const botRes = await fetch("https://api.line.me/v2/bot/info", {
        headers: { Authorization: `Bearer ${state.lineChannelAccessToken}` }
      });
      if (botRes.ok) {
        const bot = await botRes.json();
        if (bot.basicId) {
          state.botBasicId = bot.basicId;
          saveState(repoDir, state);
          p9.log.success(`Bot Basic ID: ${state.botBasicId}`);
        }
      }
    } catch {
    }
  }
  const workerName = "line-harness";
  state.workerName = workerName;
  if (!isDone(state, "worker")) {
    const { workerUrl } = await deployWorker({
      repoDir,
      d1DatabaseId: state.d1DatabaseId,
      d1DatabaseName: state.d1DatabaseName,
      workerName,
      accountId: state.accountId,
      liffId: state.liffId,
      botBasicId: state.botBasicId || ""
    });
    state.workerUrl = workerUrl;
    markDone(state, "worker");
    saveState(repoDir, state);
  } else {
    p9.log.success(`Worker: \u30C7\u30D7\u30ED\u30A4\u6E08\u307F\uFF08${state.workerUrl}\uFF09`);
  }
  if (!isDone(state, "secrets")) {
    await setSecrets({
      workerName,
      lineChannelAccessToken: state.lineChannelAccessToken,
      lineChannelSecret: state.lineChannelSecret,
      lineLoginChannelId: state.lineLoginChannelId,
      liffId: state.liffId,
      apiKey: state.apiKey
    });
    markDone(state, "secrets");
    saveState(repoDir, state);
  } else {
    p9.log.success("\u30B7\u30FC\u30AF\u30EC\u30C3\u30C8: \u8A2D\u5B9A\u6E08\u307F");
  }
  if (!isDone(state, "lineAccount")) {
    const s = p9.spinner();
    s.start("LINE \u30A2\u30AB\u30A6\u30F3\u30C8\u767B\u9332\u4E2D...");
    try {
      const res = await fetch(`${state.workerUrl}/api/line-accounts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${state.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "LINE Harness",
          channelId: state.lineChannelId,
          channelAccessToken: state.lineChannelAccessToken,
          channelSecret: state.lineChannelSecret
        })
      });
      if (res.ok) {
        try {
          await wrangler([
            "d1",
            "execute",
            "line-harness",
            "--remote",
            "--command",
            `UPDATE line_accounts SET login_channel_id = '${state.lineLoginChannelId}' WHERE channel_id = '${state.lineChannelId}'`
          ]);
        } catch {
        }
        s.stop("LINE \u30A2\u30AB\u30A6\u30F3\u30C8\u767B\u9332\u5B8C\u4E86");
      } else {
        const data = await res.json();
        s.stop(`LINE \u30A2\u30AB\u30A6\u30F3\u30C8\u767B\u9332: ${data.error || "\u30A8\u30E9\u30FC"}`);
      }
    } catch {
      s.stop("LINE \u30A2\u30AB\u30A6\u30F3\u30C8\u767B\u9332\u30B9\u30AD\u30C3\u30D7\uFF08Worker \u8D77\u52D5\u5F85\u3061\uFF09");
    }
    markDone(state, "lineAccount");
    saveState(repoDir, state);
  } else {
    p9.log.success("LINE \u30A2\u30AB\u30A6\u30F3\u30C8: \u767B\u9332\u6E08\u307F");
  }
  const suffix = state.apiKey.slice(0, 8);
  const adminProjectName = `lh-admin-${suffix}`;
  if (!isDone(state, "admin")) {
    const { adminUrl } = await deployAdmin({
      repoDir,
      workerUrl: state.workerUrl,
      apiKey: state.apiKey,
      projectName: adminProjectName
    });
    state.adminUrl = adminUrl;
    markDone(state, "admin");
    saveState(repoDir, state);
  } else {
    p9.log.success(`Admin UI: \u30C7\u30D7\u30ED\u30A4\u6E08\u307F\uFF08${state.adminUrl}\uFF09`);
  }
  const addMcp = await p9.confirm({
    message: "MCP \u8A2D\u5B9A\u3092 .mcp.json \u306B\u8FFD\u52A0\u3057\u307E\u3059\u304B\uFF1F\uFF08Claude Code / Cursor \u7528\uFF09"
  });
  if (addMcp && !p9.isCancel(addMcp)) {
    generateMcpConfig({ workerUrl: state.workerUrl, apiKey: state.apiKey });
  }
  p9.note(
    [
      `${pc.bold("\u2460 Webhook URL \u3092\u8A2D\u5B9A\u3057\u3066\u304F\u3060\u3055\u3044:")}`,
      `   ${pc.cyan(`${state.workerUrl}/webhook`)}`,
      `   \u2192 LINE Official Account Manager \u2192 \u8A2D\u5B9A \u2192 Messaging API`,
      `   \u2192 Webhook URL \u306B\u8CBC\u308A\u4ED8\u3051 \u2192 \u300CWebhook\u306E\u5229\u7528\u300D\u3092 ${pc.bold("ON")} \u306B\u3059\u308B`,
      "",
      `${pc.bold("\u2461 LIFF \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8 URL \u3092\u66F4\u65B0\u3057\u3066\u304F\u3060\u3055\u3044:")}`,
      `   ${pc.cyan(state.workerUrl)}`,
      `   \u2192 LINE Developers Console \u2192 LINE Login \u30C1\u30E3\u30CD\u30EB \u2192 LIFF`,
      `   \u2192 \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8 URL \u3092\u3053\u306E URL \u306B\u5909\u66F4`,
      "",
      `${pc.bold("\u2462 \u53CB\u3060\u3061\u8FFD\u52A0 URL\uFF08\u3053\u306E URL \u3092\u5171\u6709\u3057\u3066\u304F\u3060\u3055\u3044\uFF09:")}`,
      `   ${pc.cyan(`${state.workerUrl}/auth/line?ref=setup`)}`,
      `   \u2192 QR \u3067\u76F4\u8FFD\u52A0\u3067\u306F\u306A\u304F\u3053\u306E URL \u7D4C\u7531\u3067\u8FFD\u52A0\u3057\u3066\u3082\u3089\u3046`,
      "",
      `${pc.bold("\u2463 \u7BA1\u7406\u753B\u9762:")}`,
      `   ${pc.cyan(state.adminUrl)}`,
      "",
      `${pc.bold("API Key:")}`,
      `   ${pc.dim(state.apiKey)}`,
      `   \u2192 \u3053\u306E\u5024\u306F\u518D\u8868\u793A\u3067\u304D\u307E\u305B\u3093\u3002\u5B89\u5168\u306A\u5834\u6240\u306B\u4FDD\u5B58\u3057\u3066\u304F\u3060\u3055\u3044`
    ].join("\n"),
    "\u30BB\u30C3\u30C8\u30A2\u30C3\u30D7\u5B8C\u4E86\uFF01"
  );
  const statePath = getStatePath(repoDir);
  if (existsSync3(statePath)) {
    const { unlinkSync: unlinkSync2 } = await import("fs");
    unlinkSync2(statePath);
  }
  p9.outro(pc.green("LINE Harness \u3092\u4F7F\u3044\u59CB\u3081\u307E\u3057\u3087\u3046 \u{1F389}"));
}

// src/commands/update.ts
import * as p10 from "@clack/prompts";
import pc2 from "picocolors";
import { join as join6 } from "path";
import { execa as execa4 } from "execa";
async function runUpdate(repoDir) {
  p10.intro(pc2.bgCyan(pc2.black(" LINE Harness \u30A2\u30C3\u30D7\u30C7\u30FC\u30C8 ")));
  await ensureAuth();
  const s = p10.spinner();
  s.start("\u30DE\u30A4\u30B0\u30EC\u30FC\u30B7\u30E7\u30F3\u78BA\u8A8D\u4E2D...");
  try {
    await wrangler(
      ["d1", "migrations", "apply", "line-harness", "--remote"],
      { cwd: join6(repoDir, "packages/db") }
    );
    s.stop("\u30DE\u30A4\u30B0\u30EC\u30FC\u30B7\u30E7\u30F3\u5B8C\u4E86");
  } catch {
    s.stop("\u30DE\u30A4\u30B0\u30EC\u30FC\u30B7\u30E7\u30F3\u5B8C\u4E86\uFF08\u5909\u66F4\u306A\u3057\uFF09");
  }
  s.start("Worker \u518D\u30C7\u30D7\u30ED\u30A4\u4E2D...");
  await wrangler(["deploy"], { cwd: join6(repoDir, "apps/worker") });
  s.stop("Worker \u518D\u30C7\u30D7\u30ED\u30A4\u5B8C\u4E86");
  s.start("Admin UI \u518D\u30C7\u30D7\u30ED\u30A4\u4E2D...");
  const webDir = join6(repoDir, "apps/web");
  await execa4("pnpm", ["run", "build"], { cwd: webDir });
  await wrangler(
    ["pages", "deploy", "out", "--project-name", "line-harness-admin"],
    { cwd: webDir }
  );
  s.stop("Admin UI \u518D\u30C7\u30D7\u30ED\u30A4\u5B8C\u4E86");
  p10.outro(pc2.green("\u30A2\u30C3\u30D7\u30C7\u30FC\u30C8\u5B8C\u4E86\uFF01"));
}

// src/steps/clone-repo.ts
import * as p11 from "@clack/prompts";
import { existsSync as existsSync4 } from "fs";
import { join as join7 } from "path";
import { tmpdir } from "os";
import { execa as execa5 } from "execa";
var REPO_URL = "https://github.com/Shudesu/line-harness.git";
async function ensureRepo(repoDir) {
  if (repoDir && existsSync4(join7(repoDir, "pnpm-workspace.yaml"))) {
    return repoDir;
  }
  if (existsSync4(join7(process.cwd(), "pnpm-workspace.yaml"))) {
    return process.cwd();
  }
  const homeDir = join7(
    process.env.HOME || process.env.USERPROFILE || tmpdir(),
    ".line-harness"
  );
  if (existsSync4(join7(homeDir, "pnpm-workspace.yaml"))) {
    const s2 = p11.spinner();
    s2.start("\u6700\u65B0\u30D0\u30FC\u30B8\u30E7\u30F3\u3092\u53D6\u5F97\u4E2D...");
    try {
      await execa5("git", ["pull", "--ff-only"], { cwd: homeDir });
    } catch {
    }
    s2.stop("\u30EA\u30DD\u30B8\u30C8\u30EA\u66F4\u65B0\u5B8C\u4E86");
    return homeDir;
  }
  const s = p11.spinner();
  s.start("LINE Harness \u3092\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u4E2D...");
  try {
    await execa5("git", ["clone", "--depth", "1", REPO_URL, homeDir]);
  } catch (error) {
    s.stop("\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u5931\u6557");
    throw new Error(
      `git clone \u306B\u5931\u6557\u3057\u307E\u3057\u305F: ${error.message}
git \u304C\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u3055\u308C\u3066\u3044\u308B\u304B\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
    );
  }
  s.stop("\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u5B8C\u4E86");
  s.start("\u4F9D\u5B58\u95A2\u4FC2\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u4E2D...");
  try {
    await execa5("npx", ["pnpm", "install", "--frozen-lockfile"], {
      cwd: homeDir
    });
  } catch {
    await execa5("npx", ["pnpm", "install"], { cwd: homeDir });
  }
  s.stop("\u4F9D\u5B58\u95A2\u4FC2\u30A4\u30F3\u30B9\u30C8\u30FC\u30EB\u5B8C\u4E86");
  return homeDir;
}

// src/index.ts
var args = process.argv.slice(2);
function parseArgs() {
  let command = "setup";
  let repoDir = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--repo-dir" && args[i + 1]) {
      repoDir = resolve(args[i + 1]);
      i++;
    } else if (!args[i].startsWith("-")) {
      command = args[i];
    }
  }
  return { command, repoDir };
}
async function main() {
  const { command, repoDir: explicitRepoDir } = parseArgs();
  const repoDir = await ensureRepo(explicitRepoDir);
  if (command === "setup") {
    await runSetup(repoDir);
  } else if (command === "update") {
    await runUpdate(repoDir);
  } else {
    console.error(`Unknown command: ${command}`);
    console.error("Usage: create-line-harness [setup|update] [--repo-dir <path>]");
    process.exit(1);
  }
}
main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
