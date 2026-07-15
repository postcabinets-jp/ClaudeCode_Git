#!/usr/bin/env node
/**
 * memory-context-inject.mjs
 * SessionStart hook: memory/ の内容をシステムコンテキストとして注入する
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { homedir } from 'os';

const MEMORY_BASE = resolve(homedir(), '.claude', 'projects');

function findMemoryIndex() {
  if (!existsSync(MEMORY_BASE)) return null;

  // 正準: 現在のプロジェクト(cwd)から proj ID を導出（端末非依存）。
  // 例 /Users/apple/note → -Users-apple-note。readdir順に依存せず正準を必ず選ぶ。
  const projDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const canonicalId = projDir.replace(/\//g, '-');
  const canonicalIndex = join(MEMORY_BASE, canonicalId, 'memory', 'MEMORY.md');
  if (existsSync(canonicalIndex)) {
    return { indexPath: canonicalIndex, memDir: join(MEMORY_BASE, canonicalId, 'memory') };
  }

  // フォールバック: 従来どおり最初に見つかった proj
  let dirs;
  try { dirs = readdirSync(MEMORY_BASE, { withFileTypes: true }); } catch { return null; }
  const projects = dirs.filter(d => d.isDirectory()).map(d => d.name);
  for (const proj of projects) {
    const indexPath = join(MEMORY_BASE, proj, 'memory', 'MEMORY.md');
    if (existsSync(indexPath)) {
      return { indexPath, memDir: join(MEMORY_BASE, proj, 'memory') };
    }
  }
  return null;
}

function loadAllMemories(indexPath, memDir) {
  const index = readFileSync(indexPath, 'utf8');
  const memories = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
  let match;
  while ((match = linkPattern.exec(index)) !== null) {
    const [, title, file] = match;
    const filePath = join(memDir, file);
    if (existsSync(filePath)) {
      try {
        memories.push({ title, content: readFileSync(filePath, 'utf8') });
      } catch { /* skip */ }
    }
  }
  return { index, memories };
}

const found = findMemoryIndex();
if (!found) process.exit(0);

const { indexPath, memDir } = found;
const { index, memories } = loadAllMemories(indexPath, memDir);
if (memories.length === 0) process.exit(0);

let out = '\n========================================\n';
out += '[MEMORY CONTEXT — 自動注入]\n';
out += '以下は過去セッションから蓄積した記憶です。作業開始前に必ず参照してください。\n';
out += '========================================\n\n';
out += '## MEMORY INDEX\n\n' + index + '\n\n';
out += '## MEMORY DETAILS\n\n';
for (const { title, content } of memories) {
  out += `### ${title}\n\n${content}\n\n---\n\n`;
}
out += '\n> セッション終了時は Dreaming Summary を実行してください（詳細: CLAUDE.md §8）。\n';

process.stdout.write(out);
