#!/usr/bin/env node
/**
 * limitless-sync.mjs
 * Limitless AIのライフログを取得して mind/thinking/ にMarkdownとして保存する
 * 使い方: node ops/scripts/limitless-sync.mjs [--date YYYY-MM-DD] [--days 1]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

// .envからAPIキーを読む
function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

// ライフログをMarkdownに変換
function toMarkdown(log) {
  const startDate = log.startTime ? log.startTime.slice(0, 10) : 'unknown';
  const startJST = log.startTime
    ? new Date(log.startTime).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    : '';

  const title = log.contents?.find(c => c.type === 'heading1')?.content || '(無題)';

  const lines = [
    '---',
    `date: ${startDate}`,
    `source: limitless`,
    `lifelog_id: ${log.id || ''}`,
    `tags:`,
    `  - lifelog`,
    `  - thinking`,
    '---',
    '',
    `# ${title}`,
    '',
    `> 録音日時: ${startJST}`,
    '',
  ];

  for (const c of (log.contents || [])) {
    if (c.type === 'heading1') continue; // タイトルは使用済み
    if (c.type === 'heading2') {
      lines.push(`## ${c.content}`, '');
    } else if (c.type === 'heading3') {
      lines.push(`### ${c.content}`, '');
    } else if (c.type === 'blockquote') {
      const speaker = c.speakerName && c.speakerName !== 'Unknown' ? `**${c.speakerName}**: ` : '';
      lines.push(`> ${speaker}${c.content}`);
    } else if (c.type === 'paragraph') {
      lines.push(c.content, '');
    }
  }

  return { title, startDate, markdown: lines.join('\n') };
}

async function main() {
  const args = process.argv.slice(2);
  const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : null;
  const daysArg = args.includes('--days') ? parseInt(args[args.indexOf('--days') + 1]) : 1;

  const env = loadEnv();
  const apiKey = env.LIMITLESS_API_KEY || process.env.LIMITLESS_API_KEY;

  if (!apiKey) {
    console.error('LIMITLESS_API_KEY が .env に見つかりません');
    process.exit(1);
  }

  // 取得対象日をJSTで計算（JST 00:00 = UTC 前日15:00）
  const JST_OFFSET = 9 * 60 * 60 * 1000;
  const todayJST = dateArg
    ? new Date(dateArg + 'T00:00:00+09:00')
    : new Date(Date.now() + JST_OFFSET); // JSTの今日
  const endJST = new Date(todayJST);
  endJST.setHours(23, 59, 59, 0);

  const startJST = new Date(todayJST);
  startJST.setDate(startJST.getDate() - (daysArg - 1));
  startJST.setHours(0, 0, 0, 0);

  // UTCに変換してAPIに渡す
  const startISO = new Date(startJST.getTime() - JST_OFFSET).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const endISO   = new Date(endJST.getTime()   - JST_OFFSET).toISOString().replace(/\.\d{3}Z$/, 'Z');

  const targetDateStr = todayJST.toISOString().slice(0, 10);
  const startDateStr  = startJST.toISOString().slice(0, 10);
  console.log(`Limitlessライフログ取得中: JST ${startDateStr} 〜 ${targetDateStr}`);

  // ページネーションで全件取得
  const logs = [];
  let cursor = null;
  do {
    const params = new URLSearchParams({ limit: '50', start: startISO, end: endISO });
    if (cursor) params.set('cursor', cursor);
    const res = await fetch(`https://api.limitless.ai/v1/lifelogs?${params}`, {
      headers: { 'X-API-Key': apiKey }
    });
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      process.exit(1);
    }
    const data = await res.json();
    const batch = data?.data?.lifelogs || [];
    logs.push(...batch);
    cursor = data?.data?.meta?.nextCursor || null;
    if (batch.length > 0) process.stdout.write(`  取得中... ${logs.length} 件\r`);
  } while (cursor);

  if (logs.length === 0) {
    console.log('対象期間のライフログはありません');
    return;
  }

  console.log(`${logs.length} 件のライフログを取得`);

  const thinkingDir = join(ROOT, 'mind/thinking');
  if (!existsSync(thinkingDir)) mkdirSync(thinkingDir, { recursive: true });

  let saved = 0;
  for (const log of logs) {
    const shortId = (log.id || '').slice(-8);
    // ファイル名を先に確定（スキップ判定用）
    const tempTitle = log.contents?.find(c => c.type === 'heading1')?.content
      || log.title
      || '(無題)';
    const tempDate = (log.startTime || '').slice(0, 10) || 'unknown';
    const safeTitle = tempTitle.replace(/[\/\\:*?"<>|]/g, '-').slice(0, 40);
    const fileName = `${tempDate}-lifelog-${shortId}-${safeTitle}.md`;
    const filePath = join(thinkingDir, fileName);

    if (existsSync(filePath)) {
      // 既存ファイルが空（内容行なし）なら上書き取得
      const existing = readFileSync(filePath, 'utf8');
      const hasContent = existing.split('\n').some(l => l.startsWith('>') && !l.includes('録音日時'));
      if (hasContent) {
        process.stdout.write(`  スキップ: ${fileName}\n`);
        continue;
      }
      process.stdout.write(`  再取得（空）: ${fileName}\n`);
    }

    // 個別APIで本文を取得
    const detailRes = await fetch(`https://api.limitless.ai/v1/lifelogs/${log.id}`, {
      headers: { 'X-API-Key': apiKey }
    });
    if (!detailRes.ok) {
      console.error(`  詳細取得エラー: ${log.id}`);
      continue;
    }
    const detailData = await detailRes.json();
    const fullLog = detailData?.data?.lifelog || log;

    const { title, startDate: logDate, markdown } = toMarkdown(fullLog);

    // 本文が空なら保存しない（未処理ログはスキップ）
    const hasContent = (fullLog.contents || []).some(c => c.type === 'blockquote' && c.content?.trim());
    if (!hasContent) {
      process.stdout.write(`  スキップ（未処理）: ${shortId}\n`);
      // 既存の空ファイルがあれば削除
      if (existsSync(filePath)) { const { unlinkSync } = await import('fs'); unlinkSync(filePath); }
      continue;
    }

    const finalSafeTitle = title.replace(/[\/\\:*?"<>|]/g, '-').slice(0, 40);
    const finalFileName = `${logDate}-lifelog-${shortId}-${finalSafeTitle}.md`;
    const finalFilePath = join(thinkingDir, finalFileName);

    // ファイル名が変わった場合は古いファイルを削除
    if (existsSync(filePath) && filePath !== finalFilePath) {
      const { unlinkSync } = await import('fs');
      unlinkSync(filePath);
    }

    writeFileSync(finalFilePath, markdown, 'utf8');
    process.stdout.write(`  保存: ${finalFileName}\n`);
    saved++;
  }

  console.log(`\n完了: ${saved} 件保存 → mind/thinking/`);
}

main().catch(e => { console.error(e); process.exit(1); });
