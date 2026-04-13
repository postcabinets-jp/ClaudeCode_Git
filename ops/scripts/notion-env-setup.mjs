#!/usr/bin/env node
/**
 * Notion 用の .env を対話で埋める（トークンをチャットに貼らずに済む）。
 *
 *   cd プロジェクトルート && node scripts/notion-env-setup.mjs
 *
 * 親ページ URL 例: https://www.notion.so/タイトル-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envPath = resolve(root, ".env");

function toUuidWithHyphens(hex32) {
  const hex = hex32.replace(/-/g, "").toLowerCase();
  if (hex.length !== 32 || !/^[a-f0-9]{32}$/.test(hex)) return "";
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function parsePageIdFromInput(raw) {
  const s = raw.trim();
  if (!s) return "";
  const compact = s.replace(/-/g, "");
  if (/^[a-f0-9]{32}$/i.test(compact)) {
    return toUuidWithHyphens(compact);
  }
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(s)) {
    return s;
  }
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    const path = u.pathname;
    const last = (path.split("/").filter(Boolean).pop() ?? "").split("?")[0];
    const dashed = last.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    if (dashed) return dashed[1];
    const parts = last.split("-");
    for (let i = parts.length - 1; i >= 0; i--) {
      const id = toUuidWithHyphens(parts[i]);
      if (id) return id;
    }
  } catch {
    return "";
  }
  return "";
}

function upsertEnv(content, key, value) {
  const lines = content.split("\n");
  const re = new RegExp(`^${key}=`);
  let found = false;
  const out = lines.map((line) => {
    if (re.test(line)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) {
    out.push(`${key}=${value}`);
  }
  return out.join("\n");
}

const rl = createInterface({ input, output });

console.log(`
=== Notion .env セットアップ ===
1) https://www.notion.so/my-integrations でインテグレーションを作成し「内部インテグレーションシークレット」をコピー
2) ワークスペースに「COPAIN Hub」などのページを作り、ページ右上 … → 接続 → そのインテグレーションを選択
3) 以下にシークレットと、ページの URL（または 32 文字のページ ID）を入力
`);

const token = (await rl.question("NOTION_TOKEN（ntn_ または secret_ で始まる値）: ")).trim();
const pageRaw = (await rl.question("親ページの Notion URL またはページ ID: ")).trim();
rl.close();

if (!token) {
  console.error("トークンが空です。中止します。");
  process.exit(1);
}

const pageId = parsePageIdFromInput(pageRaw);
if (!pageId) {
  console.error("ページ ID を解釈できませんでした。Notion のページをブラウザで開き、アドレス欄の末尾の 32 文字を確認してください。");
  process.exit(1);
}

let base = "";
if (existsSync(envPath)) {
  base = readFileSync(envPath, "utf8");
} else if (existsSync(resolve(root, ".env.example"))) {
  base = readFileSync(resolve(root, ".env.example"), "utf8");
}

let next = upsertEnv(base, "NOTION_TOKEN", token);
next = upsertEnv(next, "NOTION_PARENT_PAGE_ID", pageId);
writeFileSync(envPath, next.endsWith("\n") ? next : `${next}\n`, "utf8");

console.log("\nOK: .env を更新しました（NOTION_TOKEN / NOTION_PARENT_PAGE_ID）。");
console.log("確認: npm run notion:verify");
console.log("次:   npm run notion:hub   （未作成なら DB 作成）\n");
