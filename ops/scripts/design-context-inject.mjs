#!/usr/bin/env node
/**
 * design-context-inject.mjs
 * UserPromptSubmit hook: デザイン関連ワードを検知したら
 * apple / smarthr の DESIGN.md をコンテキストとして stdout に出力する。
 * Claude Code はこの出力を <system-reminder> として会話に注入する。
 */

import { readFileSync } from 'fs';

const DESIGN_KEYWORDS = [
  'デザイン', 'design', 'ui', 'ux', 'lp', 'landing',
  '画面', 'コンポーネント', 'component', 'pencil', 'ペンシル',
  'スタイル', 'style', 'レイアウト', 'layout', 'カラー', 'color',
  '色', 'フォント', 'font', 'ボタン', 'button', 'フォーム', 'form',
  'ページ作成', 'ページデザイン', 'モバイル', 'アプリデザイン',
];

const DESIGN_BASE = process.env.HOME + '/claude for me/references/design-md-jp/design-md';

function readDesign(service) {
  try {
    return readFileSync(`${DESIGN_BASE}/${service}/DESIGN.md`, 'utf8');
  } catch {
    return null;
  }
}

// stdin から prompt を読む
let prompt = '';
try {
  // Claude Code は UserPromptSubmit 時に JSON を stdin に渡す
  const raw = readFileSync('/dev/stdin', 'utf8');
  const data = JSON.parse(raw);
  prompt = (data.prompt || '').toLowerCase();
} catch {
  // stdin なし or パース失敗 → 何もしない
  process.exit(0);
}

const matched = DESIGN_KEYWORDS.some(kw => prompt.includes(kw.toLowerCase()));
if (!matched) process.exit(0);

// apple と smarthr の DESIGN.md を注入
const apple = readDesign('apple');
const smarthr = readDesign('smarthr');

if (!apple && !smarthr) process.exit(0);

let output = `\n========================================\n`;
output += `[DESIGN CONTEXT — 自動注入]\n`;
output += `デザイン関連の指示を検知しました。以下のデザインルールを必ず参照してデザインしてください。\n`;
output += `========================================\n\n`;

if (apple) {
  output += `## Apple Japan DESIGN.md\n\n${apple}\n\n`;
}
if (smarthr) {
  output += `## SmartHR DESIGN.md\n\n${smarthr}\n\n`;
}

output += `========================================\n`;
output += `[END DESIGN CONTEXT]\n`;
output += `========================================\n`;

process.stdout.write(output);
