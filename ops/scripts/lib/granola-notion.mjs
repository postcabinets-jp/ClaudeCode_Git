// scripts/lib/granola-notion.mjs
// Granola会議ノートをNotion Meeting Notes DBに書き込むライブラリ

import { notionFetch, normalizeNotionId } from "./notion.mjs";

const DB_ID = () => normalizeNotionId(process.env.GRANOLA_MEETING_NOTES_DB_ID);

/**
 * Granola ID で既存ページを検索する
 * @param {string} granolaId
 * @param {string} token
 * @returns {string|null} 既存ページID or null
 */
export async function findByGranolaId(granolaId, token) {
  const res = await notionFetch(`/v1/databases/${DB_ID()}/query`, token, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        property: "Granola ID",
        rich_text: { equals: granolaId },
      },
      page_size: 1,
    }),
  });
  return res.results?.[0]?.id ?? null;
}

/**
 * 会議ノートをNotionにupsert（存在すれば更新、なければ作成）
 * @param {Object} meeting - Granola会議データ
 * @param {string} token
 * @returns {string} NotionページID
 */
export async function upsertMeeting(meeting, token) {
  const existingId = await findByGranolaId(meeting.id, token);

  const properties = buildProperties(meeting);

  if (existingId) {
    // 更新
    await notionFetch(`/v1/pages/${existingId}`, token, {
      method: "PATCH",
      body: JSON.stringify({ properties }),
    });
    // ノート本文を更新
    await updatePageContent(existingId, meeting, token);
    console.log(`更新: ${meeting.title} (${existingId})`);
    return existingId;
  } else {
    // 新規作成
    const page = await notionFetch(`/v1/pages`, token, {
      method: "POST",
      body: JSON.stringify({
        parent: { database_id: DB_ID() },
        properties,
        children: buildPageContent(meeting),
      }),
    });
    console.log(`作成: ${meeting.title} (${page.id})`);
    return page.id;
  }
}

/**
 * Notionプロパティを構築
 */
function buildProperties(meeting) {
  const props = {
    // タイトル
    Name: {
      title: [{ text: { content: meeting.title ?? "（タイトルなし）" } }],
    },
    // Granola ID（重複防止キー）
    "Granola ID": {
      rich_text: [{ text: { content: meeting.id ?? "" } }],
    },
  };

  // 会議日時
  if (meeting.date) {
    props["Date"] = {
      date: { start: toISODate(meeting.date) },
    };
  }

  // 参加者
  if (meeting.attendees?.length) {
    props["Attendees"] = {
      rich_text: [
        {
          text: {
            content: meeting.attendees
              .map((a) => (typeof a === "string" ? a : a.name ?? a.email ?? ""))
              .filter(Boolean)
              .join(", "),
          },
        },
      ],
    };
  }

  return props;
}

/**
 * ページ本文ブロックを構築
 */
function buildPageContent(meeting) {
  const blocks = [];

  // サマリー
  if (meeting.summary) {
    blocks.push(
      { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Summary" } }] } },
      {
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ text: { content: meeting.summary } }] },
      }
    );
  }

  // アクションアイテム
  if (meeting.action_items?.length) {
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: { rich_text: [{ text: { content: "Action Items" } }] },
    });
    for (const item of meeting.action_items) {
      blocks.push({
        object: "block",
        type: "to_do",
        to_do: {
          rich_text: [{ text: { content: typeof item === "string" ? item : item.text ?? "" } }],
          checked: false,
        },
      });
    }
  }

  // トランスクリプト
  if (meeting.transcript) {
    blocks.push(
      { object: "block", type: "heading_2", heading_2: { rich_text: [{ text: { content: "Transcript" } }] } },
      ...chunkText(meeting.transcript, 1900).map((chunk) => ({
        object: "block",
        type: "paragraph",
        paragraph: { rich_text: [{ text: { content: chunk } }] },
      }))
    );
  }

  return blocks;
}

/**
 * 既存ページの本文を全削除して再書き込み
 */
async function updatePageContent(pageId, meeting, token) {
  // 既存ブロックを取得して削除
  const existing = await notionFetch(`/v1/blocks/${pageId}/children`, token, {
    method: "GET",
  });
  for (const block of existing.results ?? []) {
    await notionFetch(`/v1/blocks/${block.id}`, token, {
      method: "DELETE",
    }).catch(() => {}); // エラーは無視して続行
  }

  const newBlocks = buildPageContent(meeting);
  if (newBlocks.length === 0) return;

  // 100件ずつ追加（Notion APIの制限）
  for (let i = 0; i < newBlocks.length; i += 100) {
    await notionFetch(`/v1/blocks/${pageId}/children`, token, {
      method: "PATCH",
      body: JSON.stringify({ children: newBlocks.slice(i, i + 100) }),
    });
  }
}

/**
 * テキストをNotion APIの2000文字制限に合わせて分割
 */
function chunkText(text, size = 1900) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

/**
 * 日付文字列をISO 8601に正規化
 */
function toISODate(dateStr) {
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return dateStr;
  }
}
