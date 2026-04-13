// scripts/linkedin-setup.mjs
/**
 * 初回のみ実行: ブラウザを開いてLinkedInに手動ログイン
 * ログイン完了後にCookieを .linkedin-session.json に保存する
 */
import { chromium } from "playwright";
import { resolve } from "node:path";
import { projectRoot } from "./lib/env.mjs";

const SESSION_FILE = resolve(projectRoot(), ".linkedin-session.json");

console.log("ブラウザを開きます。LinkedInにログインしてください。");
console.log("ログイン完了後、このターミナルでEnterを押してください。\n");

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto("https://www.linkedin.com/login");

// ユーザーがEnterを押すまで待つ
process.stdin.resume();
await new Promise((resolve) => {
  process.stdin.once("data", resolve);
});
process.stdin.pause();

// Cookie保存
await context.storageState({ path: SESSION_FILE });
console.log(`\nセッションを保存しました: ${SESSION_FILE}`);
console.log(".gitignoreに追加されていることを確認してください。");

await browser.close();
