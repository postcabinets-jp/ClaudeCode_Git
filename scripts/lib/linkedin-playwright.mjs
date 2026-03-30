// scripts/lib/linkedin-playwright.mjs
import { existsSync } from "node:fs";
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
  try {
    await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 15000 });
    const url = page.url();
    return !url.includes("/login") && !url.includes("/authwall");
  } finally {
    await page.close();
  }
}

/**
 * LinkedIn に投稿して投稿URLを返す
 * @param {import('playwright').BrowserContext} context
 * @param {string} text 投稿本文
 * @returns {Promise<string>} 投稿後のURL (取得できない場合は "https://www.linkedin.com/feed/")
 * @throws {Error} Notion API がエラーを返した場合
 */
export async function postToLinkedIn(context, text) {
  const page = await context.newPage();
  try {
    await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: 15000 });

    // 「投稿を始める」ボタンをクリック（日本語/英語UI両対応）
    const startBtn = page.locator([
      '[data-control-name="share.sharebox_feed_prompt"]',
      'button:has-text("投稿を始める")',
      'button:has-text("Start a post")',
    ].join(", ")).first();
    await startBtn.click({ timeout: 10000 });

    // テキストエリアに入力
    const editor = page.locator('.ql-editor, [role="textbox"]').first();
    await editor.waitFor({ timeout: 10000 });
    await editor.fill(text);

    // 「投稿する」ボタンをクリック（日本語/英語UI両対応）
    const postBtn = page.locator('button:has-text("投稿する"), button:has-text("Post")').first();
    await postBtn.click({ timeout: 5000 });

    // モーダルが閉じるまで待つ（share-creation-stateが消えるか最大15秒）
    await page.waitForSelector('.share-creation-state', { state: "detached", timeout: 15000 })
      .catch(() => {}); // モーダルセレクタが変わっても続行

    // 投稿URLを取得（フィードの最新投稿から）
    const postLink = await page.locator('a[href*="/feed/update/"]').first()
      .getAttribute("href", { timeout: 5000 })
      .catch(() => null);
    return postLink ? `https://www.linkedin.com${postLink}` : "https://www.linkedin.com/feed/";
  } finally {
    await page.close();
  }
}
