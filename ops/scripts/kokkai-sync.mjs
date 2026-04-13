#!/usr/bin/env node
/**
 * kokkai-sync.mjs
 * 衆議院議案ページをスクレイピングし、Notionの議案DBを差分更新する。
 * 審議状況・可決結果の変化のみ検知して更新する（全件上書きではない）。
 *
 * 使い方:
 *   node scripts/kokkai-sync.mjs            # 第221回国会（デフォルト）
 *   node scripts/kokkai-sync.mjs --kai 222  # 国会回次を指定
 *   node scripts/kokkai-sync.mjs --dry-run  # Notionに書かず差分表示のみ
 */
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionFetch } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

// ---- 設定 ----
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const GIAN_DB_ID = process.env.KOKKAI_GIAN_DB_ID || "db69b75c-658c-4689-9673-709a9e550bd0";

// ---- 引数パース ----
const args = process.argv.slice(2);
const kaiArg = args.indexOf("--kai");
const KAI = kaiArg >= 0 ? parseInt(args[kaiArg + 1], 10) : 221;
const dryRun = args.includes("--dry-run");

if (!NOTION_TOKEN && !dryRun) {
  console.error("NOTION_TOKEN が未設定です。");
  process.exit(1);
}

// ---- 審議経過ページから審議結果をスクレイピング ----
async function fetchKeikaPage(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; kokkai-sync-bot)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  // Shift-JIS → UTF-8 変換
  const buf = await res.arrayBuffer();
  const decoded = new TextDecoder("shift-jis").decode(buf);
  return decoded;
}

function parseKeikaHtml(html) {
  const stripTags = (s) =>
    s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

  // 結果テキストから「可決」「否決」等のキーワードを抽出
  function extractResult(raw) {
    if (!raw) return "";
    const text = stripTags(raw);
    if (text.includes("可決")) return "可決";
    if (text.includes("否決")) return "否決";
    if (text.includes("成立")) return "成立";
    if (text.includes("廃案")) return "廃案";
    if (text.includes("撤回")) return "撤回";
    return "";
  }

  // 「衆議院審議終了年月日／衆議院審議結果」に続くTDを取得
  const shuMatch = html.match(
    /衆議院審議終了年月日[^<]*(?:<[^>]+>)*[^<]*衆議院審議結果[\s\S]{0,200}?<TD[^>]*>([\s\S]*?)<\/TD>/i
  );
  const shuResult = extractResult(shuMatch?.[1] ?? "");

  // 「参議院審議終了年月日／参議院審議結果」に続くTDを取得
  const sanMatch = html.match(
    /参議院審議終了年月日[^<]*(?:<[^>]+>)*[^<]*参議院審議結果[\s\S]{0,200}?<TD[^>]*>([\s\S]*?)<\/TD>/i
  );
  const sanResult = extractResult(sanMatch?.[1] ?? "");

  return { 衆議院結果: shuResult, 参議院結果: sanResult };
}

// ---- NotionDBから全議案のURLリストを取得してスクレイピング ----
async function scrapeAll() {
  // Notionから議案番号とURLの一覧を取得
  const pages = [];
  let cursor = undefined;

  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await notionFetch(
      `/v1/databases/${GIAN_DB_ID}/query`,
      NOTION_TOKEN,
      { method: "POST", body: JSON.stringify(body) }
    );

    for (const page of res.results ?? []) {
      const p = page.properties;
      const bangou = p?.["議案番号"]?.rich_text?.[0]?.plain_text ?? "";
      const url = p?.["衆議院URL"]?.url ?? "";
      if (!bangou || !url) continue;
      pages.push({ pageId: page.id, bangou, url });
    }

    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);

  console.log(`Notionから${pages.length}件のURL取得完了`);

  // 各審議経過ページをフェッチ
  const results = [];
  for (const page of pages) {
    try {
      const html = await fetchKeikaPage(page.url);
      const { 衆議院結果, 参議院結果 } = parseKeikaHtml(html);
      results.push({
        pageId: page.pageId,
        議案番号: page.bangou,
        衆議院結果,
        参議院結果,
      });
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.warn(`  [${page.bangou}] フェッチ失敗: ${err.message}`);
    }
  }
  return results;
}

// ---- Notionから現在値を取得（差分比較用）----
async function fetchCurrentValues(pageId) {
  const res = await notionFetch(`/v1/pages/${pageId}`, NOTION_TOKEN, { method: "GET" });
  const p = res.properties ?? {};
  return {
    衆議院結果: p?.["衆議院結果"]?.select?.name ?? "",
    参議院結果: p?.["参議院結果"]?.select?.name ?? "",
    審議状況: p?.["審議状況"]?.select?.name ?? "",
  };
}

// ---- 審議状況を推定 ----
function inferStatus(shuResult, sanResult) {
  const terminal = ["可決", "否決", "成立", "廃案", "撤回"];
  if (terminal.includes(shuResult) && (terminal.includes(sanResult) || sanResult === "")) {
    return "完了";
  }
  return "進行中";
}

// ---- 変化分だけ Notion を PATCH 更新 ----
async function updatePage(pageId, changes) {
  const props = {};
  if (changes.衆議院結果 !== undefined) props["衆議院結果"] = { select: { name: changes.衆議院結果 } };
  if (changes.参議院結果 !== undefined) props["参議院結果"] = { select: { name: changes.参議院結果 } };
  if (changes.審議状況 !== undefined) props["審議状況"] = { status: { name: changes.審議状況 } };
  if (Object.keys(props).length === 0) return;

  await notionFetch(`/v1/pages/${pageId}`, NOTION_TOKEN, {
    method: "PATCH",
    body: JSON.stringify({ properties: props }),
  });
}

// ---- メイン ----
async function main() {
  console.log(`\n=== 第${KAI}回国会 議案差分同期${dryRun ? " [dry-run]" : ""} ===\n`);

  if (dryRun) {
    // dry-runは直接スクレイピングで確認
    console.log("衆議院審議経過ページへの接続テスト...");
    const testUrl = "https://www.shugiin.go.jp/internet/itdb_gian.nsf/html/gian/keika/1DE14CE.htm";
    try {
      const html = await fetchKeikaPage(testUrl);
      const result = parseKeikaHtml(html);
      console.log("テスト結果（閣法第1号）:", result);
    } catch (err) {
      console.error("接続失敗:", err.message);
    }
    return;
  }

  // 本番実行: Notionから全ページのURLを取得してスクレイピング
  const scraped = await scrapeAll();
  console.log(`\nスクレイピング完了: ${scraped.length}件`);

  if (scraped.length === 0) {
    console.log("議案が取得できませんでした。");
    return;
  }

  let updated = 0;
  let unchanged = 0;

  for (const g of scraped) {
    // scrapeAll内でpageIdを取得済み、現在値も含む形に変更が必要なため
    // ここでは現在値を別途取得する（バッチで一度取得済みなら再利用を推奨）
    const current = await fetchCurrentValues(g.pageId);

    const newShu = g.衆議院結果 || current.衆議院結果;
    const newSan = (g.参議院結果 && g.参議院結果 !== "審議中")
      ? g.参議院結果
      : current.参議院結果;
    const newStatus = inferStatus(newShu, newSan);

    const changes = {};
    if (newShu && newShu !== current.衆議院結果) changes.衆議院結果 = newShu;
    if (newSan && newSan !== current.参議院結果) changes.参議院結果 = newSan;
    if (newStatus !== current.審議状況) changes.審議状況 = newStatus;

    if (Object.keys(changes).length === 0) {
      unchanged++;
      continue;
    }

    console.log(`  [更新] ${g.議案番号}: ${JSON.stringify(changes)}`);
    try {
      await updatePage(g.pageId, changes);
      updated++;
      await new Promise((r) => setTimeout(r, 350));
    } catch (err) {
      console.error(`  → エラー: ${err.message}`);
    }
  }

  console.log(`\n完了: 更新${updated}件 / 変化なし${unchanged}件`);

  // Discord通知（変化があった場合）
  if (updated > 0 && process.env.DISCORD_WEBHOOK_URL) {
    const content = `\uD83C\uDFDB **国会議案 差分更新** \u2014 ${updated}件更新\n第${KAI}回国会の審議状況が変化しました。`;
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }).catch(() => {});
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
