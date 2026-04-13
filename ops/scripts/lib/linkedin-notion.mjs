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
 * @throws {Error} Notion API がエラーを返した場合
 */
export async function countPendingDrafts(dbId, token) {
  const filter = {
    and: [
      { property: "投稿OK", checkbox: { equals: false } },
      { property: "ステータス", select: { equals: "下書き" } },
    ],
  };
  let count = 0;
  let cursor;
  do {
    const res = await notionFetch(`/v1/databases/${dbId}/query`, token, {
      method: "POST",
      body: JSON.stringify({ filter, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    count += res.results.length;
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return count;
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
 * @throws {Error} Notion API がエラーを返した場合
 */
export async function getApprovedDrafts(dbId, token) {
  const filter = {
    and: [
      { property: "投稿OK", checkbox: { equals: true } },
      { property: "ステータス", select: { equals: "下書き" } },
    ],
  };
  const sorts = [{ property: "生成日", direction: "ascending" }];
  const pages = [];
  let cursor;
  do {
    const res = await notionFetch(`/v1/databases/${dbId}/query`, token, {
      method: "POST",
      body: JSON.stringify({ filter, sorts, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return pages.map((p) => ({
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
