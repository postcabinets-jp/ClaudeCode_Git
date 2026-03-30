// scripts/lib/linkedin-playwright.mjs
import { chromium } from "playwright";
import { resolve } from "node:path";
import { projectRoot } from "./env.mjs";

const SESSION_FILE = resolve(projectRoot(), ".linkedin-session.json");

/**
 * セッションファイルを使ってheadlessブラウザを起動する
 * セッションファイルがない場合はエラーをスロー
 * @throws {Error} セッションファイルが存在しない場合
 */
export async function launchWithSession() {
  const { existsSync } = await import("node:fs");
  if (!existsSync(SESSION_FILE)) {
    throw new Error(
      `.linkedin-session.json が見つかりません。\n` +
      `先に node scripts/linkedin-setup.mjs を実行してログインしてください。`
    );
  }
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: SESSION_FILE });
  return { browser, context };
}

/**
 * LinkedInにログイン済みかどうか確認する
 * ログインページにリダイレクトされた場合は false
 */
export async function checkLoggedIn(context) {
  const page = await context.newPage();
  await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 15000 });
  const url = page.url();
  await page.close();
  return !url.includes("/login") && !url.includes("/authwall");
}

/**
 * LinkedIn に投稿して投稿URLを返す
 * @param {import('playwright').BrowserContext} context
 * @param {string} text 投稿本文
 * @returns {Promise<string>} 投稿後のURL (取得できない場合は "https://www.linkedin.com/feed/")
 */
export async function postToLinkedIn(context, text) {
  const page = await context.newPage();

  await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 15000 });

  // 「投稿を始める」ボタンをクリック
  await page.click('[data-control-name="share.sharebox_feed_prompt"]', { timeout: 10000 })
    .catch(() => page.click('button:has-text("投稿を始める")', { timeout: 5000 }))
    .catch(() => page.click('button:has-text("Start a post")', { timeout: 5000 }));

  // テキストエリアに入力
  const editor = page.locator('.ql-editor, [role="textbox"]').first();
  await editor.waitFor({ timeout: 10000 });
  await editor.fill(text);

  // 「投稿する」ボタンをクリック
  await page.click('button:has-text("投稿する")', { timeout: 5000 })
    .catch(() => page.click('button:has-text("Post")', { timeout: 5000 }));

  // 投稿完了を待つ（モーダルが閉じるまで）
  await page.waitForTimeout(3000);

  // 投稿URLを取得（フィードの最新投稿から）
  try {
    const postLink = await page.locator('a[href*="/feed/update/"]').first().getAttribute("href", { timeout: 5000 });
    const url = postLink ? `https://www.linkedin.com${postLink}` : "https://www.linkedin.com/feed/";
    await page.close();
    return url;
  } catch {
    await page.close();
    return "https://www.linkedin.com/feed/";
  }
}
