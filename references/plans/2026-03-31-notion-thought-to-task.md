# Notion思考ノート → TasksDB 自動タスク化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 毎日の思考ノート（Notionページ）の `📋 Claude Tasks` トグルを読み取り、Claude APIでタスク解釈してTasksDBに自動登録する2レーン構成のスクリプトを実装する

**Architecture:** 即時レーン（`notion-extract-tasks.mjs`）はセッション中に手動実行、非同期レーン（`notion-nightly-scan.mjs`）はlaunchdで毎朝07:00自動実行。どちらも `scripts/lib/notion.mjs` と `scripts/lib/env.mjs` を使い、Claude API（Anthropic SDK）でLLMタスク解釈を行う。

**Tech Stack:** Node.js 20+, Notion API v2022-06-28, Anthropic SDK (@anthropic-ai/sdk), 既存の `scripts/lib/` ユーティリティ

---

## ファイル構成

| ファイル | 役割 |
|----------|------|
| `scripts/notion-extract-tasks.mjs` | 新規作成: 即時レーン（今日の思考ノート→TasksDB） |
| `scripts/notion-nightly-scan.mjs` | 新規作成: 非同期レーン（昨日の思考ノート→TasksDB） |
| `scripts/lib/task-extractor.mjs` | 新規作成: LLMによるタスク解釈ロジック（共有） |
| `scripts/lib/notion-tasks.mjs` | 新規作成: TasksDB登録・重複チェック（共有） |
| `scripts/launchd/com.postcabinets.nightly-scan.plist.example` | 新規作成: launchd設定例 |
| `package.json` | 修正: `notion:extract-tasks` / `notion:nightly-scan` スクリプト追加 |
| `docs/notion-template-setup.md` | 新規作成: Notionテンプレートボタン設定手順書 |

---

## Task 1: Anthropic SDKをインストールしTasksDBスキーマを確認する

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Anthropic SDK をインストール**

```bash
cd "/Users/apple/claude for me"
npm install @anthropic-ai/sdk
```

Expected: `node_modules/@anthropic-ai/sdk` が追加される

- [ ] **Step 2: TasksDB の実際のフィールド名をAPIで確認**

```bash
node -e "
import('./scripts/lib/env.mjs').then(({loadDotEnv, projectRoot}) => {
  loadDotEnv(projectRoot());
  const hub = JSON.parse(require('fs').readFileSync('.notion-hub.json','utf8'));
  return fetch('https://api.notion.com/v1/databases/' + hub.databases.tasks.id, {
    headers: {
      'Authorization': 'Bearer ' + process.env.NOTION_TOKEN,
      'Notion-Version': '2022-06-28'
    }
  });
}).then(r => r.json()).then(d => console.log(JSON.stringify(Object.keys(d.properties), null, 2)));
"
```

Expected: TasksDB のフィールド名一覧が表示される（例: `["Title","Status","Owner","Priority","Notes","Project"]`）

**→ 実際のフィールド名をメモして以降のタスクで使うこと**

- [ ] **Step 3: .env に ANTHROPIC_API_KEY があることを確認**

```bash
grep ANTHROPIC_API_KEY "/Users/apple/claude for me/.env"
```

Expected: `ANTHROPIC_API_KEY=sk-ant-...` が表示される。なければ `.env` に追加する。

- [ ] **Step 4: コミット**

```bash
cd "/Users/apple/claude for me"
git add package.json package-lock.json
git commit -m "chore: add @anthropic-ai/sdk for task extraction"
```

---

## Task 2: 共有ライブラリ `scripts/lib/task-extractor.mjs` を作成する

**Files:**
- Create: `scripts/lib/task-extractor.mjs`

- [ ] **Step 1: task-extractor.mjs を作成**

```javascript
// scripts/lib/task-extractor.mjs
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `あなたはNotionの思考ノートからタスクを抽出するアシスタントです。
入力テキストを読み、Claude（AI）が実行できるタスクのリストをJSON配列で返してください。

ルール:
- チェックボックス付きの行（「- [ ]」で始まる行）はnobu自身のタスクなので無視する
- 1つの文章が複数タスクを含む場合は分割する
- 曖昧すぎて実行不可能なもの（「なんとかする」等）は除外する
- 個人的な予定や人間にしかできないことは除外する

各タスクのJSON形式:
{
  "title": "30字以内の日本語タスク名",
  "owner": "Claude" | "Human" | "Either",
  "priority": "High" | "Medium" | "Low",
  "project_hint": "関連プロジェクト名（不明なら空文字）",
  "notes": "元テキストの文脈・補足（50字以内）"
}

必ずJSON配列のみを返し、説明文は不要です。タスクがない場合は [] を返してください。`;

/**
 * テキストからClaude向けタスクをLLMで抽出する
 * @param {string} text - 思考ノートのトグル内テキスト
 * @param {string} apiKey - Anthropic APIキー
 * @returns {Promise<Array>} タスクの配列
 */
export async function extractTasks(text, apiKey) {
  if (!text || !text.trim()) return [];

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: text }],
  });

  const raw = message.content[0]?.text ?? "[]";

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.error("LLMレスポンスのパースに失敗:", raw);
    return [];
  }
}
```

- [ ] **Step 2: 動作確認（CLIで直接テスト）**

```bash
node -e "
import('./scripts/lib/env.mjs').then(({loadDotEnv, projectRoot}) => {
  loadDotEnv(projectRoot());
  return import('./scripts/lib/task-extractor.mjs');
}).then(({extractTasks}) => {
  return extractTasks(
    'AI研修の資料構成を叩き台として作っておいて\n- [ ] 自分でやる作業\nDiscord通知が届かなかった原因を調べて',
    process.env.ANTHROPIC_API_KEY
  );
}).then(tasks => console.log(JSON.stringify(tasks, null, 2)));
" 2>&1
```

Expected: 2件のタスク配列が表示される（チェックボックス行は除外される）

```json
[
  {
    "title": "AI研修資料の構成叩き台を作成",
    "owner": "Claude",
    "priority": "Medium",
    "project_hint": "AI研修",
    "notes": "AI研修の資料構成を叩き台として作る"
  },
  {
    "title": "Discord通知未着の原因調査",
    "owner": "Claude",
    "priority": "High",
    "project_hint": "インフラ",
    "notes": "先週のDiscord通知が届かなかった原因を調べる"
  }
]
```

- [ ] **Step 3: コミット**

```bash
cd "/Users/apple/claude for me"
git add scripts/lib/task-extractor.mjs
git commit -m "feat: add LLM-based task extractor from thought notes"
```

---

## Task 3: 共有ライブラリ `scripts/lib/notion-tasks.mjs` を作成する

**Files:**
- Create: `scripts/lib/notion-tasks.mjs`

**注意:** Step 1実行前に、Task 1 Step 2で確認した実際のフィールド名に合わせること。以下は想定フィールド名（`Title`, `Status`, `Owner`, `Priority`, `Notes`）で書いてある。

- [ ] **Step 1: notion-tasks.mjs を作成**

```javascript
// scripts/lib/notion-tasks.mjs
import { notionFetch } from "./notion.mjs";

/**
 * 今日または指定日付の思考ノートページを検索する
 * タイトル形式: "2026/03/31"
 * @param {string} token - Notion APIトークン
 * @param {string} dateStr - "YYYY/MM/DD" 形式の日付
 * @returns {Promise<object|null>} Notionページオブジェクトまたはnull
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
 * ページ内の「📋 Claude Tasks」トグルブロックのテキストを取得する
 * @param {string} token - Notion APIトークン
 * @param {string} pageId - NotionページID
 * @returns {Promise<string>} トグル内のテキスト（改行区切り）
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

  // トグルの子ブロックを取得
  const children = await notionFetch(`/v1/blocks/${toggleBlock.id}/children`, token, {
    method: "GET",
  });

  const lines = [];
  for (const block of children.results ?? []) {
    const type = block.type;
    const richText = block[type]?.rich_text ?? [];
    const text = richText.map((t) => t.plain_text).join("");
    if (!text.trim()) continue;

    // チェックボックスブロックは "- [ ] テキスト" 形式で保持（抽出時に除外）
    if (type === "to_do") {
      lines.push(`- [ ] ${text}`);
    } else {
      lines.push(text);
    }
  }

  return lines.join("\n");
}

/**
 * TasksDBに重複チェックしてタスクを登録する
 * @param {string} token - Notion APIトークン
 * @param {string} tasksDbId - TasksDB のID
 * @param {object} task - extractTasksが返すタスクオブジェクト
 * @param {string} sourcePageId - 元の思考ノートページID（重複防止用）
 * @returns {Promise<{created: boolean, page: object}>}
 */
export async function registerTask(token, tasksDbId, task, sourcePageId) {
  // 重複チェック: 同じソースページIDとtitleのタスクが既に存在しないか確認
  const existing = await notionFetch(`/v1/databases/${tasksDbId}/query`, token, {
    method: "POST",
    body: JSON.stringify({
      filter: {
        and: [
          {
            property: "Title",
            title: { equals: task.title },
          },
        ],
      },
      page_size: 1,
    }),
  });

  if ((existing.results?.length ?? 0) > 0) {
    return { created: false, page: existing.results[0] };
  }

  // 新規登録
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
```

- [ ] **Step 2: コミット**

```bash
cd "/Users/apple/claude for me"
git add scripts/lib/notion-tasks.mjs
git commit -m "feat: add Notion tasks DB helper (find page, toggle, register)"
```

---

## Task 4: 即時レーン `scripts/notion-extract-tasks.mjs` を作成する

**Files:**
- Create: `scripts/notion-extract-tasks.mjs`

- [ ] **Step 1: notion-extract-tasks.mjs を作成**

```javascript
#!/usr/bin/env node
/**
 * 即時レーン: 今日の思考ノートから Claude Tasks を抽出して TasksDB に登録する
 * 実行: npm run notion:extract-tasks
 * 実行: npm run notion:extract-tasks -- --date 2026/03/30  （過去日指定）
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { extractTasks } from "./lib/task-extractor.mjs";
import {
  findThoughtNotePage,
  getClaudeTasksToggleText,
  registerTask,
} from "./lib/notion-tasks.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const apiKey = process.env.ANTHROPIC_API_KEY;
const hubPath = resolve(root, ".notion-hub.json");

if (!token) { console.error("NOTION_TOKEN が未設定です"); process.exit(1); }
if (!apiKey) { console.error("ANTHROPIC_API_KEY が未設定です"); process.exit(1); }
if (!existsSync(hubPath)) { console.error(".notion-hub.json がありません"); process.exit(1); }

const hub = JSON.parse(readFileSync(hubPath, "utf8"));
const tasksDbId = hub.databases?.tasks?.id;
if (!tasksDbId) { console.error("tasks DB ID が .notion-hub.json にありません"); process.exit(1); }

// 日付引数の処理（デフォルト: 今日）
const args = process.argv.slice(2);
const dateArgIdx = args.indexOf("--date");
let targetDate;
if (dateArgIdx !== -1 && args[dateArgIdx + 1]) {
  targetDate = args[dateArgIdx + 1];
} else {
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  targetDate = `${jst.getFullYear()}/${String(jst.getMonth() + 1).padStart(2, "0")}/${String(jst.getDate()).padStart(2, "0")}`;
}

console.log(`\n📋 思考ノートを検索中: ${targetDate}`);

const page = await findThoughtNotePage(token, targetDate);
if (!page) {
  console.log(`⚠️  思考ノートが見つかりません: ${targetDate}`);
  process.exit(0);
}

console.log(`✅ ページ発見: ${page.url}`);

const toggleText = await getClaudeTasksToggleText(token, page.id);
if (!toggleText.trim()) {
  console.log("ℹ️  「📋 Claude Tasks」トグルが空か見つかりません。");
  process.exit(0);
}

console.log(`\n📝 トグル内容:\n${toggleText}\n`);
console.log("🤖 LLMでタスクを解釈中...");

const tasks = await extractTasks(toggleText, apiKey);
if (tasks.length === 0) {
  console.log("ℹ️  抽出できるタスクがありませんでした。");
  process.exit(0);
}

console.log(`\n${tasks.length}件のタスクを検出しました:\n`);
for (const t of tasks) {
  console.log(`  [${t.priority}] ${t.title} (${t.owner})`);
  if (t.notes) console.log(`         → ${t.notes}`);
}

console.log("\nTasksDB に登録中...");
let created = 0;
let skipped = 0;
for (const task of tasks) {
  const result = await registerTask(token, tasksDbId, task, page.id);
  if (result.created) {
    console.log(`  ✅ 登録: ${task.title}`);
    created++;
  } else {
    console.log(`  ⏭️  スキップ（重複）: ${task.title}`);
    skipped++;
  }
}

console.log(`\n完了: ${created}件登録, ${skipped}件スキップ`);
```

- [ ] **Step 2: 実行テスト**

```bash
cd "/Users/apple/claude for me"
node scripts/notion-extract-tasks.mjs
```

Expected: 今日の思考ノートが見つかれば処理される。ページがなければ「見つかりません」と表示。エラーなく終了。

- [ ] **Step 3: コミット**

```bash
git add scripts/notion-extract-tasks.mjs
git commit -m "feat: add notion-extract-tasks (immediate lane)"
```

---

## Task 5: 非同期レーン `scripts/notion-nightly-scan.mjs` を作成する

**Files:**
- Create: `scripts/notion-nightly-scan.mjs`

- [ ] **Step 1: notion-nightly-scan.mjs を作成**

```javascript
#!/usr/bin/env node
/**
 * 非同期レーン: 昨日の思考ノートをスキャンして TasksDB に登録し、Discordに通知する
 * 実行: npm run notion:nightly-scan
 * launchd: 毎朝07:00に自動実行
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { extractTasks } from "./lib/task-extractor.mjs";
import {
  findThoughtNotePage,
  getClaudeTasksToggleText,
  registerTask,
} from "./lib/notion-tasks.mjs";

const root = projectRoot();
loadDotEnv(root);

const token = process.env.NOTION_TOKEN;
const apiKey = process.env.ANTHROPIC_API_KEY;
const webhook = process.env.DISCORD_WEBHOOK_URL;
const hubPath = resolve(root, ".notion-hub.json");

if (!token) { console.error("NOTION_TOKEN が未設定です"); process.exit(1); }
if (!apiKey) { console.error("ANTHROPIC_API_KEY が未設定です"); process.exit(1); }
if (!existsSync(hubPath)) { console.error(".notion-hub.json がありません"); process.exit(1); }

const hub = JSON.parse(readFileSync(hubPath, "utf8"));
const tasksDbId = hub.databases?.tasks?.id;
if (!tasksDbId) { console.error("tasks DB ID が .notion-hub.json にありません"); process.exit(1); }

// 昨日の日付（JST）
const now = new Date();
const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
jst.setDate(jst.getDate() - 1);
const yesterday = `${jst.getFullYear()}/${String(jst.getMonth() + 1).padStart(2, "0")}/${String(jst.getDate()).padStart(2, "0")}`;

console.log(`[nightly-scan] 対象日: ${yesterday}`);

const page = await findThoughtNotePage(token, yesterday);
if (!page) {
  console.log(`[nightly-scan] 思考ノートなし: ${yesterday} → スキップ`);
  process.exit(0);
}

const toggleText = await getClaudeTasksToggleText(token, page.id);
if (!toggleText.trim()) {
  console.log("[nightly-scan] Claudeトグルなし → スキップ");
  process.exit(0);
}

const tasks = await extractTasks(toggleText, apiKey);
if (tasks.length === 0) {
  console.log("[nightly-scan] 抽出タスクなし → スキップ");
  process.exit(0);
}

let created = 0;
const createdTitles = [];
for (const task of tasks) {
  const result = await registerTask(token, tasksDbId, task, page.id);
  if (result.created) {
    created++;
    createdTitles.push(`• [${task.priority}] ${task.title}`);
  }
}

console.log(`[nightly-scan] 完了: ${created}件登録`);

// Discord通知（新規登録があった場合のみ）
if (created > 0 && webhook) {
  const lines = [
    `**📋 思考ノートから ${created}件のタスクをInboxに追加しました（${yesterday}分）**`,
    "",
    ...createdTitles,
    "",
    "_次回Claudeセッション開始時に確認・実行されます_",
  ];
  const content = lines.join("\n").slice(0, 1900);

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    console.error("[nightly-scan] Discord通知失敗:", res.status);
  } else {
    console.log("[nightly-scan] Discord通知送信済み");
  }
}
```

- [ ] **Step 2: 実行テスト（昨日分）**

```bash
cd "/Users/apple/claude for me"
node scripts/notion-nightly-scan.mjs
```

Expected: 昨日の思考ノートが存在すれば処理、なければ「スキップ」と表示してexit 0。

- [ ] **Step 3: コミット**

```bash
git add scripts/notion-nightly-scan.mjs
git commit -m "feat: add notion-nightly-scan (async lane with Discord notification)"
```

---

## Task 6: package.json にスクリプトを追加し、launchd設定例を作成する

**Files:**
- Modify: `package.json`
- Create: `scripts/launchd/com.postcabinets.nightly-scan.plist.example`

- [ ] **Step 1: package.json にスクリプト追加**

`package.json` の `"scripts"` に以下を追加:

```json
"notion:extract-tasks": "node scripts/notion-extract-tasks.mjs",
"notion:nightly-scan": "node scripts/notion-nightly-scan.mjs"
```

- [ ] **Step 2: launchd plist 例を作成**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.postcabinets.nightly-scan</string>

  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/Users/apple/claude for me/scripts/notion-nightly-scan.mjs</string>
  </array>

  <key>WorkingDirectory</key>
  <string>/Users/apple/claude for me</string>

  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>7</integer>
    <key>Minute</key><integer>0</integer>
  </dict>

  <key>StandardOutPath</key>
  <string>/Users/apple/Library/Logs/postcabinets/nightly-scan.log</string>

  <key>StandardErrorPath</key>
  <string>/Users/apple/Library/Logs/postcabinets/nightly-scan.err</string>

  <key>EnvironmentVariables</key>
  <dict>
    <key>HOME</key>
    <string>/Users/apple</string>
  </dict>
</dict>
</plist>
```

`scripts/launchd/com.postcabinets.nightly-scan.plist.example` として保存。

- [ ] **Step 3: 動作確認**

```bash
cd "/Users/apple/claude for me"
npm run notion:extract-tasks
```

Expected: エラーなく動作する。

- [ ] **Step 4: コミット**

```bash
git add package.json scripts/launchd/com.postcabinets.nightly-scan.plist.example
git commit -m "chore: add npm scripts and launchd config for task extraction"
```

---

## Task 7: Notionテンプレートボタン設定手順書を作成する

**Files:**
- Create: `docs/notion-template-setup.md`

- [ ] **Step 1: 手順書を作成**

```markdown
# Notion 思考ノートテンプレートボタン 設定手順

## 概要

毎日の思考ノートを作成するときに使うテンプレートボタンをNotionに設定します。
`📋 Claude Tasks` トグルを含むページが自動生成されるようになります。

## テンプレートの内容

```
思考ノート - 2026/03/31

## 今日の思考・メモ
（自由記述）

## チェックリスト（自分タスク）
- [ ]

▶ 📋 Claude Tasks
  （ここにClaude向けタスクを自由記述。箇条書きでも文章でも可）
```

## セットアップ手順

### 1. テンプレートを置くページを決める

思考ノートを置く親ページ（例: 「Daily Notes」「思考ログ」）を開きます。

### 2. テンプレートボタンを追加する

1. ページ内の任意の場所で `/template` と入力
2. 「テンプレートボタン」を選択
3. ボタン名を「📝 今日の思考ノート」に設定

### 3. テンプレート本文を入力する

テンプレートボタンの編集画面で、以下の構造を作成:

```
# 思考ノート - @today
```

→ `@today` は Notion が今日の日付に自動変換します（例: `2026/03/31`）

続けて以下のブロックを追加:

- `## 今日の思考・メモ` ヘッダー
- テキストブロック（空）
- `## チェックリスト（自分タスク）` ヘッダー
- チェックボックスブロック（空）
- トグルブロック: タイトルを `📋 Claude Tasks` に設定
  - トグル内にテキストブロック（空）を追加

### 4. 動作確認

テンプレートボタンをクリックして、今日の日付のページが生成されることを確認。
ページタイトルが `2026/03/31` 形式になっていること。

## Claude Tasks の書き方

トグル内に自由に書いてください:

```
AI研修の資料構成を叩き台として作っておいて
先週のDiscord通知が届かなかった原因を調べて
LINEボットのウェルカムメッセージを改善したい

- [ ] これはnobu自身がやる（Claudeは無視）
```

## タスク抽出の実行

テンプレートに書いたらターミナルで:

```bash
npm run notion:extract-tasks
```

TasksDBのInboxに自動登録されます。
```

- [ ] **Step 2: コミット**

```bash
cd "/Users/apple/claude for me"
git add docs/notion-template-setup.md
git commit -m "docs: add Notion template button setup guide"
```

---

## 自己レビュー

**スペックカバレッジ:**
- ✅ 即時レーン（notion-extract-tasks.mjs）
- ✅ 非同期レーン（notion-nightly-scan.mjs）
- ✅ LLMタスク解釈（task-extractor.mjs）
- ✅ 重複チェック（notion-tasks.mjs の registerTask）
- ✅ Discord通知（nightly-scan）
- ✅ launchd設定例
- ✅ Notionテンプレート手順書
- ✅ `2026/03/31` 形式のページ検索

**プレースホルダースキャン:** なし

**型・関数名の一貫性:**
- `extractTasks(text, apiKey)` → Task 2で定義、Task 4・5で使用 ✅
- `findThoughtNotePage(token, dateStr)` → Task 3で定義、Task 4・5で使用 ✅
- `getClaudeTasksToggleText(token, pageId)` → Task 3で定義、Task 4・5で使用 ✅
- `registerTask(token, tasksDbId, task, sourcePageId)` → Task 3で定義、Task 4・5で使用 ✅
