// scripts/lib/notion-tasks.mjs
import { notionFetch } from "./notion.mjs";

/**
 * 思考ノートページを日付文字列で検索する
 * タイトル形式: "2026/03/31"
 * @param {string} token
 * @param {string} dateStr - "YYYY/MM/DD"
 * @returns {Promise<object|null>}
 */
export async function findThoughtNotePage(token, dateStr) {
  const data = await notionFetch("/v1/search", token, {
    method: "POST",
    body: JSON.stringify({
      query: dateStr,
      filter: { value: "page", property: "object" },
      sort: { direction: "descending", timestamp: "last_edited_time" },
      page_size: 10,
    }),
  });

  const page = data.results?.find((r) => {
    const title = r.properties?.title?.title?.map((t) => t.plain_text).join("") ?? "";
    return title.includes(dateStr);
  });

  return page ?? null;
}

/**
 * ページ内の「📋 Claude Tasks」トグルの子ブロックテキストを返す
 * @param {string} token
 * @param {string} pageId
 * @returns {Promise<string>} 改行区切りのテキスト
 */
export async function getClaudeTasksToggleText(token, pageId) {
  const data = await notionFetch(`/v1/blocks/${pageId}/children`, token, {
    method: "GET",
  });

  const toggleBlock = data.results?.find((b) => {
    if (b.type !== "toggle") return false;
    const text = b.toggle?.rich_text?.map((t) => t.plain_text).join("") ?? "";
    return text.includes("Claude Tasks");
  });

  if (!toggleBlock) return "";

  const children = await notionFetch(`/v1/blocks/${toggleBlock.id}/children`, token, {
    method: "GET",
  });

  const lines = [];
  for (const block of children.results ?? []) {
    const type = block.type;
    const richText = block[type]?.rich_text ?? [];
    const text = richText.map((t) => t.plain_text).join("");
    if (!text.trim()) continue;
    // チェックボックスは "- [ ] テキスト" 形式で保持（extractTasksが除外する）
    lines.push(type === "to_do" ? `- [ ] ${text}` : text);
  }

  return lines.join("\n");
}

/**
 * TasksDBに重複チェックしてタスクを登録する
 * @param {string} token
 * @param {string} tasksDbId
 * @param {object} task - { title, owner, priority, notes }
 * @param {string} sourcePageId - 元ページID（Notesに記録して重複防止）
 * @returns {Promise<{created: boolean, page: object}>}
 */
export async function registerTask(token, tasksDbId, task, sourcePageId) {
  // タイトルで重複チェック
  const existing = await notionFetch(`/v1/databases/${tasksDbId}/query`, token, {
    method: "POST",
    body: JSON.stringify({
      filter: { property: "Title", title: { equals: task.title } },
      page_size: 1,
    }),
  });

  if ((existing.results?.length ?? 0) > 0) {
    return { created: false, page: existing.results[0] };
  }

  const notes = `[source:${sourcePageId}] ${task.notes ?? ""}`.slice(0, 2000);

  const page = await notionFetch("/v1/pages", token, {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: tasksDbId },
      properties: {
        Title: { title: [{ type: "text", text: { content: task.title } }] },
        Status: { select: { name: "Inbox" } },
        Owner: { select: { name: task.owner ?? "Claude" } },
        Priority: { select: { name: task.priority ?? "Medium" } },
        Notes: { rich_text: [{ type: "text", text: { content: notes } }] },
      },
    }),
  });

  return { created: true, page };
}
