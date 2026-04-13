#!/usr/bin/env node
/**
 * granola-token-refresh.mjs
 * Granolaアプリのsupabase.jsonからアクセストークンを読み込み、
 * ~/.claude/settings.json のGranola MCPヘッダーを更新する。
 *
 * 使い方:
 *   node ops/scripts/granola-token-refresh.mjs
 *
 * launchdやsession-start.mjsから呼び出す。
 */

import { readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const GRANOLA_SUPABASE = join(homedir(), 'Library/Application Support/Granola/supabase.json');
const CLAUDE_SETTINGS = join(homedir(), '.claude/settings.json');

function loadGranolaToken() {
  const raw = JSON.parse(readFileSync(GRANOLA_SUPABASE, 'utf8'));
  const tokens = JSON.parse(raw.workos_tokens);

  const now = Date.now();
  const expiresAt = tokens.obtained_at + tokens.expires_in * 1000;
  const remainingSec = Math.floor((expiresAt - now) / 1000);

  if (remainingSec < 300) {
    console.log(`⚠️  Granolaトークンの残り有効期限が${remainingSec}秒です。Granolaアプリを起動してトークンを更新してください。`);
    process.exit(1);
  }

  console.log(`✅ Granolaトークン有効 (残り${Math.floor(remainingSec / 60)}分)`);
  return tokens.access_token;
}

function updateClaudeSettings(token) {
  const settings = JSON.parse(readFileSync(CLAUDE_SETTINGS, 'utf8'));

  if (!settings.mcpServers?.granola) {
    console.error('❌ ~/.claude/settings.json にgranola MCPサーバーが設定されていません');
    process.exit(1);
  }

  settings.mcpServers.granola.headers = {
    Authorization: `Bearer ${token}`,
  };

  writeFileSync(CLAUDE_SETTINGS, JSON.stringify(settings, null, 2) + '\n', 'utf8');
  console.log('✅ ~/.claude/settings.json のGranolaトークンを更新しました');
}

const token = loadGranolaToken();
updateClaudeSettings(token);
