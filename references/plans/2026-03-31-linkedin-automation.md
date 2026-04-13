# LinkedIn自動投稿パイプライン 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notionに生成した投稿下書きをnobuが「投稿OK」チェックするだけでLinkedInへ自動投稿されるパイプラインを構築する。

**Architecture:** 2つのlaunchd job（毎朝7時の下書き生成 + 15分ごとの投稿監視）でパイプラインを構成。Claude APIで投稿コンテンツを生成しNotionに保存、PlaywrightでLinkedInをブラウザ自動操作して投稿する。

**Tech Stack:** Node.js 20+, Playwright (既インストール), @anthropic-ai/sdk (既インストール), Notion API, launchd (macOS)

---

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `scripts/linkedin-setup.mjs` | 初回のみ: ブラウザ手動ログイン → `.linkedin-session.json` 保存 |
| `scripts/linkedin-generate.mjs` | Job1: 毎朝7時, Claude APIで下書き生成 → Notionに追加 → Discord通知 |
| `scripts/linkedin-post.mjs` | Job2: 15分ごと, Notionポーリング → 投稿OK検知 → LinkedIn投稿 → Notion更新 |
| `scripts/lib/linkedin-playwright.mjs` | Playwright操作ロジック (login check, post, get URL) |
| `scripts/lib/linkedin-notion.mjs` | LinkedIn投稿DB専用Notion操作 (create, query, update) |
| `scripts/launchd/com.postcabinets.linkedin-generate.plist.example` | Job1 launchd設定例 |
| `scripts/launchd/com.postcabinets.linkedin-post.plist.example` | Job2 launchd設定例 |

---

## Task 1: NotionにLinkedIn投稿DBを作成する

**Files:**
- Create: `scripts/linkedin-setup-notion.mjs`

LinkedIn戦略ページ（`3339bf08-eefd-8165-9638-fcd36a6fee37`）内にインラインDBを作成する。

- [ ] **Step 1: スクリプトを作成する**

```js
// scripts/linkedin-setup-notion.mjs
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionFetch } from "./lib/notion.mjs";

loadDotEnv(projectRoot());
const token = process.env.NOTION_TOKEN;
const LINKEDIN_PAGE_ID = "3339bf08-eefd-8165-9638-fcd36a6fee37";

const res = await notionFetch("/v1/databases", token, {
  method: "POST",
  body: JSON.stringify({
    parent: { type: "page_id", page_id: LINKEDIN_PAGE_ID },
    title: [{ text: { content: "LinkedIn投稿" } }],
    properties: {
      タイトル: { title: {} },
      本文: { rich_text: {} },
      柱: {
        select: {
          options: [
            { name: "経営の実践ログ", color: "blue" },
            { name: "仕組みの設計思想", color: "green" },
            { name: "社会・地域への視点", color: "orange" },
          ],
        },
      },
      投稿OK: { checkbox: {} },
      ステータス: {
        select: {
          options: [
            { name: "下書き", color: "gray" },
            { name: "投稿済", color: "green" },
            { name: "エラー", color: "red" },
            { name: "要再ログイン", color: "yellow" },
          ],
        },
      },
      生成日: { date: {} },
      投稿日時: { date: {} },
      投稿URL: { url: {} },
    },
  }),
});

console.log("DB作成完了:", res.id);
console.log("LINKEDIN_DB_ID=" + res.id);
```

- [ ] **Step 2: 実行してDB IDを取得する**

```bash
node scripts/linkedin-setup-notion.mjs
```

期待出力例:
```
DB作成完了: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
LINKEDIN_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

- [ ] **Step 3: DB IDを.envに追記する**

出力されたIDを `.env` に追記:
```
LINKEDIN_DB_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

- [ ] **Step 4: NotionでLinkedIn戦略ページを開き、DBが作成されていることを確認する**

https://www.notion.so/LinkedIn-3339bf08eefd81659638fcd36a6fee37

- [ ] **Step 5: コミット**

```bash
git add scripts/linkedin-setup-notion.mjs
git commit -m "feat: LinkedIn投稿DB作成スクリプト"
```

---

## Task 2: Notion操作ライブラリを作成する

**Files:**
- Create: `scripts/lib/linkedin-notion.mjs`

- [ ] **Step 1: ライブラリを作成する**

```js
// scripts/lib/linkedin-notion.mjs
import { notionFetch } from "./notion.mjs";

/**
 * 今日の曜日に対応する柱名を返す
 * 日曜日は null（生成しない）
 */
export function getPillarForToday() {
  const day = new Date().getDay(); // 0=日, 1=月, ...
  const map = {
    1: "経営の実践ログ",      // 月
    2: "経営の実践ログ",      // 火
    3: "仕組みの設計思想",    // 水
    4: "仕組みの設計思想",    // 木
    5: "社会・地域への視点",  // 金
    6: "経営の実践ログ",      // 土
  };
  return map[day] ?? null; // 日曜は null
}

/**
 * 直近N件の投稿タイトルを取得する
 */
export async function getRecentTitles(dbId, token, limit = 5) {
  const res = await notionFetch(`/v1/databases/${dbId}/query`, token, {
    method: "POST",
    body: JSON.stringify({
      sorts: [{ property: "生成日", direction: "descending" }],
      page_size: limit,
    }),
  });
  return res.results.map(
    (p) => p.properties.タイトル?.title?.[0]?.plain_text ?? ""
  ).filter(Boolean);
}

/**
 * 未投稿（投稿OKなし・ステータス=下書き）の件数を返す
 */
export async function countPendingDrafts(dbId, token) {
  const res = await notionFetch(`/v1/databases/${dbId}/query`, token, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        and: [
          { property: "投稿OK", checkbox: { equals: false } },
          { property: "ステータス", select: { equals: "下書き" } },
        ],
      },
    }),
  });
  return res.results.length;
}

/**
 * 投稿ページをNotionに追加する
 */
export async function createDraft(dbId, token, { title, body, pillar }) {
  return await notionFetch("/v1/pages", token, {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: {
        タイトル: { title: [{ text: { content: title } }] },
        本文: { rich_text: [{ text: { content: body } }] },
        柱: { select: { name: pillar } },
        ステータス: { select: { name: "下書き" } },
        生成日: { date: { start: new Date().toISOString().split("T")[0] } },
      },
    }),
  });
}

/**
 * 投稿OK=true かつ ステータス=下書き のページを生成日の古い順に取得
 */
export async function getApprovedDrafts(dbId, token) {
  const res = await notionFetch(`/v1/databases/${dbId}/query`, token, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        and: [
          { property: "投稿OK", checkbox: { equals: true } },
          { property: "ステータス", select: { equals: "下書き" } },
        ],
      },
      sorts: [{ property: "生成日", direction: "ascending" }],
    }),
  });
  return res.results.map((p) => ({
    id: p.id,
    url: p.url,
    title: p.properties.タイトル?.title?.[0]?.plain_text ?? "",
    body: p.properties.本文?.rich_text?.[0]?.plain_text ?? "",
  }));
}

/**
 * ページのステータス・投稿日時・投稿URLを更新する
 */
export async function updatePostStatus(pageId, token, { status, postedAt, linkedInUrl }) {
  const properties = {
    ステータス: { select: { name: status } },
  };
  if (postedAt) properties.投稿日時 = { date: { start: postedAt } };
  if (linkedInUrl) properties.投稿URL = { url: linkedInUrl };

  return await notionFetch(`/v1/pages/${pageId}`, token, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}
```

- [ ] **Step 2: 動作確認（DB IDが設定されていることを前提）**

```bash
node -e "
import('./scripts/lib/linkedin-notion.mjs').then(async (m) => {
  const { loadDotEnv, projectRoot } = await import('./scripts/lib/env.mjs');
  loadDotEnv(projectRoot());
  console.log('今日の柱:', m.getPillarForToday());
  const titles = await m.getRecentTitles(process.env.LINKEDIN_DB_ID, process.env.NOTION_TOKEN);
  console.log('直近タイトル:', titles);
});
"
```

期待出力例:
```
今日の柱: 経営の実践ログ
直近タイトル: []
```

- [ ] **Step 3: コミット**

```bash
git add scripts/lib/linkedin-notion.mjs
git commit -m "feat: LinkedIn Notion操作ライブラリ"
```

---

## Task 3: Playwright操作ライブラリを作成する

**Files:**
- Create: `scripts/lib/linkedin-playwright.mjs`

- [ ] **Step 1: ライブラリを作成する**

```js
// scripts/lib/linkedin-playwright.mjs
import { chromium } from "playwright";
import { resolve } from "node:path";
import { projectRoot } from "./env.mjs";

const SESSION_FILE = resolve(projectRoot(), ".linkedin-session.json");

/**
 * セッションファイルを使ってheadlessブラウザを起動する
 * セッションファイルがない場合はエラーをスロー
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
```

- [ ] **Step 2: コミット**

```bash
git add scripts/lib/linkedin-playwright.mjs
git commit -m "feat: LinkedIn Playwright操作ライブラリ"
```

---

## Task 4: 初回ログインセットアップスクリプトを作成する

**Files:**
- Create: `scripts/linkedin-setup.mjs`

- [ ] **Step 1: スクリプトを作成する**

```js
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
```

- [ ] **Step 2: .gitignoreに追加する**

`.gitignore` を開き、以下の行を追加:
```
.linkedin-session.json
```

- [ ] **Step 3: コミット（セッションファイルは含めない）**

```bash
git add scripts/linkedin-setup.mjs .gitignore
git commit -m "feat: LinkedIn初回ログインセットアップスクリプト"
```

- [ ] **Step 4: セットアップを実行してログインする（手動）**

```bash
node scripts/linkedin-setup.mjs
```

ブラウザが開いたらLinkedInにログインし、ターミナルでEnterを押す。`.linkedin-session.json` が生成されることを確認。

---

## Task 5: 投稿下書き生成スクリプト（Job1）を作成する

**Files:**
- Create: `scripts/linkedin-generate.mjs`

- [ ] **Step 1: スクリプトを作成する**

```js
// scripts/linkedin-generate.mjs
/**
 * Job1: 毎朝7時実行
 * Claude APIで投稿下書きを生成 → Notionに保存 → Discord通知
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import {
  getPillarForToday,
  getRecentTitles,
  countPendingDrafts,
  createDraft,
} from "./lib/linkedin-notion.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const dbId = process.env.LINKEDIN_DB_ID;
const webhook = process.env.DISCORD_WEBHOOK_URL;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!token || !dbId || !anthropicKey) {
  console.error("必要な環境変数が未設定です: NOTION_TOKEN, LINKEDIN_DB_ID, ANTHROPIC_API_KEY");
  process.exit(1);
}

// 日曜は生成しない
const pillar = getPillarForToday();
if (!pillar) {
  console.log("日曜日のため生成をスキップします。");
  process.exit(0);
}

// 未投稿が3件以上あればスキップ
const pendingCount = await countPendingDrafts(dbId, token);
if (pendingCount >= 3) {
  console.log(`未投稿が${pendingCount}件あるためスキップします。`);
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `⏭️ LinkedIn投稿生成をスキップ\n未確認の下書きが${pendingCount}件あります。Notionで確認・承認してください。`,
      }),
    });
  }
  process.exit(0);
}

// 戦略設計書を読む
const strategyDoc = readFileSync(
  resolve(root, "docs/superpowers/specs/2026-03-30-linkedin-strategy-design.md"),
  "utf8"
);

// 直近5件のタイトルを取得
const recentTitles = await getRecentTitles(dbId, token, 5);
const recentTitlesText = recentTitles.length > 0
  ? `直近の投稿タイトル（重複しないようにしてください）:\n${recentTitles.map((t) => `- ${t}`).join("\n")}`
  : "まだ投稿はありません。";

// Claude APIで生成
const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
const dayName = dayNames[new Date().getDay()];

const client = new Anthropic({ apiKey: anthropicKey });

let result = null;
let attempts = 0;

while (attempts < 3) {
  attempts++;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `あなたはPOST CABINETS代表・前田暢のLinkedIn投稿担当です。
以下の戦略設計書に従って投稿を作成してください。

${strategyDoc}`,
      messages: [
        {
          role: "user",
          content: `今日は${dayName}曜日です。「${pillar}」の投稿を1本作成してください。

- 文字数: 300〜600字
- トーン: 気取らない。リアル。試行錯誤も見せる
- ${recentTitlesText}
- 必ずJSON形式のみで返してください（他のテキスト不要）: {"title": "...", "body": "..."}`,
        },
      ],
    });

    const text = message.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSONが見つかりません");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.title || !parsed.body) throw new Error("title/bodyが空です");
    if (parsed.body.length < 200) throw new Error(`本文が短すぎます: ${parsed.body.length}字`);

    result = parsed;
    break;
  } catch (err) {
    console.error(`生成失敗 (${attempts}回目):`, err.message);
    if (attempts >= 3) {
      if (webhook) {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `❌ LinkedIn投稿生成に失敗しました\nエラー: ${err.message}`,
          }),
        });
      }
      process.exit(1);
    }
  }
}

// Notionに保存
const page = await createDraft(dbId, token, {
  title: result.title,
  body: result.body,
  pillar,
});

console.log("下書きを作成しました:", result.title);

// Discord通知
if (webhook) {
  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `📝 LinkedIn投稿下書きを作成しました\nタイトル: ${result.title}\n柱: ${pillar}\n→ Notionで確認・編集して「投稿OK」をチェックしてください\n🔗 ${page.url}`,
    }),
  });
}
```

- [ ] **Step 2: 手動実行して動作確認する**

```bash
node scripts/linkedin-generate.mjs
```

期待出力:
```
下書きを作成しました: [生成されたタイトル]
```

Notionの LinkedIn投稿DB に1件追加され、Discordに通知が来ることを確認。

- [ ] **Step 3: コミット**

```bash
git add scripts/linkedin-generate.mjs
git commit -m "feat: LinkedIn投稿下書き自動生成スクリプト (Job1)"
```

---

## Task 6: 投稿実行スクリプト（Job2）を作成する

**Files:**
- Create: `scripts/linkedin-post.mjs`

- [ ] **Step 1: スクリプトを作成する**

```js
// scripts/linkedin-post.mjs
/**
 * Job2: 15分ごと実行
 * Notionで「投稿OK=true かつ ステータス=下書き」を検索
 * → Playwrightで1件投稿 → Notionを更新 → Discord通知
 */
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { getApprovedDrafts, updatePostStatus } from "./lib/linkedin-notion.mjs";
import { launchWithSession, checkLoggedIn, postToLinkedIn } from "./lib/linkedin-playwright.mjs";

loadDotEnv(projectRoot());

const token = process.env.NOTION_TOKEN;
const dbId = process.env.LINKEDIN_DB_ID;
const webhook = process.env.DISCORD_WEBHOOK_URL;

if (!token || !dbId) {
  console.error("必要な環境変数が未設定です: NOTION_TOKEN, LINKEDIN_DB_ID");
  process.exit(1);
}

// 投稿対象を取得
const drafts = await getApprovedDrafts(dbId, token);
if (drafts.length === 0) {
  console.log("投稿対象なし。終了します。");
  process.exit(0);
}

// 1件だけ処理
const draft = drafts[0];
console.log("投稿対象:", draft.title);

let browser;
try {
  const { browser: b, context } = await launchWithSession();
  browser = b;

  // ログイン確認
  const loggedIn = await checkLoggedIn(context);
  if (!loggedIn) {
    await updatePostStatus(draft.id, token, { status: "要再ログイン" });
    if (webhook) {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `⚠️ LinkedIn: Cookieが切れています\n再ログインが必要です: node scripts/linkedin-setup.mjs\n対象: ${draft.title}`,
        }),
      });
    }
    await browser.close();
    process.exit(1);
  }

  // 投稿
  const linkedInUrl = await postToLinkedIn(context, draft.body);
  const postedAt = new Date().toISOString();

  // Notion更新
  await updatePostStatus(draft.id, token, {
    status: "投稿済",
    postedAt,
    linkedInUrl,
  });

  console.log("投稿完了:", linkedInUrl);

  // Discord通知
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `✅ LinkedInに投稿しました\nタイトル: ${draft.title}\n🔗 ${linkedInUrl}`,
      }),
    });
  }

  await browser.close();
} catch (err) {
  console.error("投稿エラー:", err.message);
  if (browser) await browser.close().catch(() => {});

  await updatePostStatus(draft.id, token, { status: "エラー" });

  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `❌ LinkedIn自動投稿でエラーが発生しました\nエラー: ${err.message}\n対象: ${draft.title}\n🔗 Notion: ${draft.url}`,
      }),
    });
  }
  process.exit(1);
}
```

- [ ] **Step 2: 動作確認（Notionに「投稿OK」チェック済みの下書きがある状態で）**

Task5で作成した下書きをNotionで開き「投稿OK」にチェックを入れてから:

```bash
node scripts/linkedin-post.mjs
```

期待出力:
```
投稿対象: [タイトル]
投稿完了: https://www.linkedin.com/feed/update/...
```

LinkedInに投稿され、Notionのステータスが「投稿済」になり、Discordに通知が来ることを確認。

- [ ] **Step 3: コミット**

```bash
git add scripts/linkedin-post.mjs
git commit -m "feat: LinkedIn自動投稿スクリプト (Job2)"
```

---

## Task 7: launchd設定ファイルを作成する

**Files:**
- Create: `scripts/launchd/com.postcabinets.linkedin-generate.plist.example`
- Create: `scripts/launchd/com.postcabinets.linkedin-post.plist.example`

- [ ] **Step 1: Job1 plistを作成する**

```xml
<!-- scripts/launchd/com.postcabinets.linkedin-generate.plist.example -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.postcabinets.linkedin-generate</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/apple/.nvm/versions/node/v20.19.5/bin/node</string>
    <string>/Users/apple/claude for me/scripts/linkedin-generate.mjs</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/apple/claude for me</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/Users/apple/.nvm/versions/node/v20.19.5/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
  <!-- 毎朝 7:00 に実行 -->
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>7</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>/tmp/linkedin-generate.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/linkedin-generate.err</string>
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
```

- [ ] **Step 2: Job2 plistを作成する**

```xml
<!-- scripts/launchd/com.postcabinets.linkedin-post.plist.example -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.postcabinets.linkedin-post</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/apple/.nvm/versions/node/v20.19.5/bin/node</string>
    <string>/Users/apple/claude for me/scripts/linkedin-post.mjs</string>
  </array>
  <key>WorkingDirectory</key>
  <string>/Users/apple/claude for me</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/Users/apple/.nvm/versions/node/v20.19.5/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
  </dict>
  <!-- 15分ごとに実行 -->
  <key>StartInterval</key>
  <integer>900</integer>
  <key>StandardOutPath</key>
  <string>/tmp/linkedin-post.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/linkedin-post.err</string>
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
```

- [ ] **Step 3: launchd にロードする**

`.example` をコピーして実際のplistとして登録:

```bash
# Job1
cp "scripts/launchd/com.postcabinets.linkedin-generate.plist.example" \
   ~/Library/LaunchAgents/com.postcabinets.linkedin-generate.plist
launchctl load ~/Library/LaunchAgents/com.postcabinets.linkedin-generate.plist

# Job2
cp "scripts/launchd/com.postcabinets.linkedin-post.plist.example" \
   ~/Library/LaunchAgents/com.postcabinets.linkedin-post.plist
launchctl load ~/Library/LaunchAgents/com.postcabinets.linkedin-post.plist
```

- [ ] **Step 4: 登録確認**

```bash
launchctl list | grep linkedin
```

期待出力:
```
-  0  com.postcabinets.linkedin-generate
-  0  com.postcabinets.linkedin-post
```

- [ ] **Step 5: package.jsonにnpmスクリプトを追加する**

`package.json` の `"scripts"` に追記:
```json
"linkedin:generate": "node scripts/linkedin-generate.mjs",
"linkedin:post": "node scripts/linkedin-post.mjs",
"linkedin:setup": "node scripts/linkedin-setup.mjs",
"linkedin:setup-notion": "node scripts/linkedin-setup-notion.mjs"
```

- [ ] **Step 6: コミット**

```bash
git add scripts/launchd/com.postcabinets.linkedin-generate.plist.example \
        scripts/launchd/com.postcabinets.linkedin-post.plist.example \
        package.json
git commit -m "feat: LinkedIn launchd設定とnpmスクリプト追加"
```

---

## セットアップ手順まとめ（実装完了後）

```bash
# 1. Notion DBを作成してIDを.envに追記
node scripts/linkedin-setup-notion.mjs
# → .envにLINKEDIN_DB_IDを追記

# 2. LinkedInにログインしてCookieを保存
node scripts/linkedin-setup.mjs

# 3. 手動で動作確認
npm run linkedin:generate   # 下書き生成テスト
# → Notionで「投稿OK」にチェック
npm run linkedin:post        # 投稿テスト

# 4. launchd登録
cp scripts/launchd/com.postcabinets.linkedin-generate.plist.example ~/Library/LaunchAgents/com.postcabinets.linkedin-generate.plist
cp scripts/launchd/com.postcabinets.linkedin-post.plist.example ~/Library/LaunchAgents/com.postcabinets.linkedin-post.plist
launchctl load ~/Library/LaunchAgents/com.postcabinets.linkedin-generate.plist
launchctl load ~/Library/LaunchAgents/com.postcabinets.linkedin-post.plist
```
