// 既存ページに「効能一言」を追記するスクリプト
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN = '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';
const DB_ID = '33b9bf08-eefd-8191-813c-fc6a1bc88e3d';

const taglines = JSON.parse(
  readFileSync(join(__dirname, '../data/kampo-master-v2.json'), 'utf-8')
);
const taglineMap = Object.fromEntries(taglines.map(t => [t.name, t.tagline]));

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// DBの全ページを取得（ページネーション対応）
async function getAllPages() {
  const pages = [];
  let cursor = undefined;
  while (true) {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const res = await fetch(`https://api.notion.com/v1/databases/${DB_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    pages.push(...data.results);
    if (!data.has_more) break;
    cursor = data.next_cursor;
  }
  return pages;
}

async function updatePage(pageId, tagline) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        '効能一言': { rich_text: [{ text: { content: tagline } }] },
      },
    }),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function main() {
  console.log('全ページ取得中...');
  const pages = await getAllPages();
  console.log(`${pages.length}件取得`);

  let ok = 0, skip = 0;
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const name = page.properties['処方名']?.title?.[0]?.plain_text;
    const tagline = taglineMap[name];
    if (!tagline) { skip++; continue; }
    try {
      await updatePage(page.id, tagline);
      console.log(`✓ [${i+1}/${pages.length}] ${name}`);
      ok++;
    } catch(e) {
      console.error(`✗ ${name}: ${e.message.slice(0,80)}`);
    }
    await sleep(300);
  }
  console.log(`\n完了: 更新${ok}件 / スキップ${skip}件`);
}

main().catch(console.error);
