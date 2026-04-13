// 漢方大全データベース → Notion 投入スクリプト
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NOTION_TOKEN = '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';
const DATABASE_ID = '33b9bf08-eefd-8191-813c-fc6a1bc88e3d';

const items = JSON.parse(
  readFileSync(join(__dirname, '../data/kampo-master.json'), 'utf-8')
);

// 2000文字制限対応：長いテキストを分割
function toRichText(text) {
  if (!text) return [{ text: { content: '' } }];
  const chunks = [];
  for (let i = 0; i < text.length; i += 1900) {
    chunks.push({ text: { content: text.slice(i, i + 1900) } });
  }
  return chunks;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function createPage(item) {
  const body = {
    parent: { database_id: DATABASE_ID },
    properties: {
      処方名: {
        title: [{ text: { content: item.name } }],
      },
      '読み仮名': { rich_text: toRichText(item.yomi) },
      '別名・英名': { rich_text: toRichText(item.alias || '') },
      カテゴリ: { select: { name: item.category } },
      薬効分類: {
        multi_select: (item.effects || []).map((e) => ({ name: e })),
      },
      '主な適応症状': {
        multi_select: (item.symptoms || []).map((s) => ({ name: s })),
      },
      '対象体質（証）': {
        multi_select: (item.constitution || []).map((c) => ({ name: c })),
      },
      '主な構成生薬': { rich_text: toRichText(item.herbs || '') },
      '出典・典拠': { rich_text: toRichText(item.source || '') },
      保険適用: { checkbox: item.insurance || false },
      ツムラ番号: { rich_text: toRichText(item.tsumura_no || '') },
      '市販品': { select: { name: item.otc || '要確認' } },
      '注意・禁忌': { rich_text: toRichText(item.caution || '') },
      ステータス: { select: { name: '確認済' } },
    },
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: '概要・特徴' } }] },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toRichText(item.description || '') },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: '効能メカニズム（東洋医学）' } }] },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toRichText(item.mechanism || '') },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: 'こんな人に向いています' } }] },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toRichText(item.suitable_for || '') },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: '構成生薬' } }] },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toRichText(item.herbs || '') },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: '由来・歴史的背景' } }] },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toRichText(item.origin || '') },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: '現代的応用・研究' } }] },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: toRichText(item.modern_use || '') },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: '注意事項・禁忌' } }] },
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: toRichText(item.caution || 'なし'),
          icon: { type: 'emoji', emoji: '⚠️' },
          color: 'yellow_background',
        },
      },
    ],
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return (await res.json()).id;
}

async function main() {
  console.log(`投入開始: ${items.length}件`);
  let ok = 0, ng = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const id = await createPage(item);
      console.log(`✓ [${i + 1}/${items.length}] ${item.name} → ${id}`);
      ok++;
    } catch (err) {
      console.error(`✗ [${i + 1}/${items.length}] ${item.name}: ${err.message.slice(0, 120)}`);
      ng++;
    }
    if (i < items.length - 1) await sleep(350);
  }

  console.log(`\n完了: 成功${ok}件 / 失敗${ng}件`);
  console.log(`DB: https://www.notion.so/${DATABASE_ID.replace(/-/g, '')}`);
}

main().catch(console.error);
