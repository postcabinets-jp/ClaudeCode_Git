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

// 本文チェック
if (!draft.body || draft.body.trim() === "") {
  console.error("投稿本文が空です。投稿をスキップします:", draft.title);
  await updatePostStatus(draft.id, token, { status: "エラー" }).catch(() => {});
  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `❌ LinkedIn自動投稿エラー: 投稿本文が空です\n対象: ${draft.title}`,
      }),
    }).catch((e) => console.error("Discord通知失敗:", e.message));
  }
  process.exit(1);
}

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
      }).catch((e) => console.error("Discord通知失敗:", e.message));
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

  const fallbackUrl = "https://www.linkedin.com/feed/";
  if (linkedInUrl && linkedInUrl !== fallbackUrl) {
    console.log("投稿完了:", linkedInUrl);
  } else {
    console.log("投稿完了（URL取得失敗）");
  }

  // Discord通知
  if (webhook) {
    const urlLine =
      linkedInUrl && linkedInUrl !== fallbackUrl
        ? `\n🔗 ${linkedInUrl}`
        : "\n🔗 URL取得失敗（投稿は成功した可能性があります）";
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `✅ LinkedInに投稿しました\nタイトル: ${draft.title}${urlLine}`,
      }),
    }).catch((e) => console.error("Discord通知失敗:", e.message));
  }

  await browser.close();
} catch (err) {
  console.error("投稿エラー:", err.message);
  if (browser) await browser.close().catch(() => {});

  await updatePostStatus(draft.id, token, { status: "エラー" }).catch(() => {});

  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `❌ LinkedIn自動投稿でエラーが発生しました\nエラー: ${err.message}\n対象: ${draft.title}\n🔗 Notion: ${draft.url}`,
      }),
    }).catch((e) => console.error("Discord通知失敗:", e.message));
  }
  process.exit(1);
}
