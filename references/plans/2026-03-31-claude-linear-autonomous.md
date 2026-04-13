# Claude Code × Linear 自律駆動体制 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Claude CodeがLinear APIを通じてIssueを自律管理し、launchdで15分ごとに自動実行される体制を構築する

**Architecture:** `scripts/lib/linear.mjs` をLinear APIラッパーとして実装し、`scripts/linear-agent-loop.mjs` がNotionスキャン→Linear起票→Issue実行→Discord通知のループを担う。既存の `lib/env.mjs` / `lib/notion-tasks.mjs` / `notify-discord.mjs` の仕組みをそのまま流用する。

**Tech Stack:** `@linear/sdk` (Linear公式Node.js SDK), Node.js ESM, launchd, 既存 `@notionhq/client`

---

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `scripts/lib/linear.mjs` | Linear API ラッパー（Issue CRUD・ラベル・ステータス操作） |
| `scripts/linear-setup.mjs` | 初回セットアップ（APIキー入力→.env書き込み→ワークスペース確認） |
| `scripts/linear-agent-loop.mjs` | メインループ（Notion→Linear起票→Issue実行→Discord通知） |
| `scripts/linear-morning-summary.mjs` | 朝サマリー（Notion+LinearのStateを1画面で表示） |
| `scripts/launchd/com.postcabinets.linear-agent-loop.plist.example` | launchd定義ファイルのサンプル |

---

## Task 1: `@linear/sdk` のインストールと動作確認

**Files:**
- Modify: `package.json`

- [ ] **Step 1: @linear/sdk をインストールする**

```bash
cd "/Users/apple/claude for me"
npm install @linear/sdk
```

Expected output: `added N packages` でエラーなし

- [ ] **Step 2: インストール確認**

```bash
node -e "import('@linear/sdk').then(m => console.log('OK:', Object.keys(m)))"
```

Expected output: `OK: [ 'LinearClient', ... ]`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @linear/sdk dependency"
```

---

## Task 2: Linear APIラッパー `scripts/lib/linear.mjs` の実装

**Files:**
- Create: `scripts/lib/linear.mjs`

- [ ] **Step 1: ファイルを作成する**

```js
// scripts/lib/linear.mjs
import { LinearClient } from "@linear/sdk";

/**
 * Linear APIクライアントを生成して返す
 * @param {string} apiKey - LINEAR_API_KEY
 * @returns {LinearClient}
 */
export function createLinearClient(apiKey) {
  return new LinearClient({ apiKey });
}

/**
 * チームのIssue一覧を取得（Assignee=Claude & Status=Todo のもの）
 * @param {LinearClient} client
 * @param {string} teamId - LINEAR_TEAM_ID
 * @param {string} claudeUserId - LINEAR_CLAUDE_USER_ID
 * @returns {Promise<Array>} Issueの配列（優先度順）
 */
export async function fetchTodoIssues(client, teamId, claudeUserId) {
  const issues = await client.issues({
    filter: {
      team: { id: { eq: teamId } },
      assignee: { id: { eq: claudeUserId } },
      state: { type: { eq: "unstarted" } },
    },
    orderBy: "priority",
  });
  return issues.nodes;
}

/**
 * Issueを新規作成する
 * @param {LinearClient} client
 * @param {object} params
 * @param {string} params.teamId
 * @param {string} params.title
 * @param {string} params.description
 * @param {string} params.claudeUserId
 * @param {number} [params.priority] - 1=Urgent, 2=High, 3=Medium, 4=Low
 * @param {string[]} [params.labelIds]
 * @returns {Promise<object>} 作成されたIssue
 */
export async function createIssue(client, { teamId, title, description, claudeUserId, priority = 3, labelIds = [] }) {
  const issue = await client.createIssue({
    teamId,
    title,
    description,
    assigneeId: claudeUserId,
    priority,
    labelIds,
  });
  return issue.issue;
}

/**
 * IssueのステータスをIDで更新する
 * @param {LinearClient} client
 * @param {string} issueId
 * @param {string} stateId - Linear の WorkflowState ID
 * @returns {Promise<void>}
 */
export async function updateIssueState(client, issueId, stateId) {
  await client.updateIssue(issueId, { stateId });
}

/**
 * Issueにコメントを追加する
 * @param {LinearClient} client
 * @param {string} issueId
 * @param {string} body - Markdownテキスト
 * @returns {Promise<void>}
 */
export async function addComment(client, issueId, body) {
  await client.createComment({ issueId, body });
}

/**
 * チームのWorkflowStateをすべて取得して name->id のMapを返す
 * @param {LinearClient} client
 * @param {string} teamId
 * @returns {Promise<Map<string, string>>}
 */
export async function fetchStateMap(client, teamId) {
  const states = await client.workflowStates({
    filter: { team: { id: { eq: teamId } } },
  });
  return new Map(states.nodes.map(s => [s.name, s.id]));
}

/**
 * チームのLabelをすべて取得して name->id のMapを返す
 * @param {LinearClient} client
 * @param {string} teamId
 * @returns {Promise<Map<string, string>>}
 */
export async function fetchLabelMap(client, teamId) {
  const labels = await client.issueLabels({
    filter: { team: { id: { eq: teamId } } },
  });
  return new Map(labels.nodes.map(l => [l.name, l.id]));
}
```

- [ ] **Step 2: 構文チェック**

```bash
node --input-type=module <<'EOF'
import { createLinearClient } from "./scripts/lib/linear.mjs";
console.log("syntax OK:", typeof createLinearClient);
EOF
```

Expected output: `syntax OK: function`

- [ ] **Step 3: Commit**

```bash
git add scripts/lib/linear.mjs
git commit -m "feat: Linear APIラッパー (lib/linear.mjs) を追加"
```

---

## Task 3: 初回セットアップスクリプト `scripts/linear-setup.mjs` の実装

**Files:**
- Create: `scripts/linear-setup.mjs`
- Modify: `package.json`

- [ ] **Step 1: セットアップスクリプトを作成する**

```js
// scripts/linear-setup.mjs
import { createInterface } from "node:readline/promises";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { createLinearClient } from "./lib/linear.mjs";

const root = projectRoot();
const envPath = resolve(root, ".env");

const rl = createInterface({ input: process.stdin, output: process.stdout });

console.log("=== Linear セットアップ ===\n");
console.log("Linear の Settings > API で Personal API Key を発行してください。\n");

const apiKey = await rl.question("LINEAR_API_KEY: ");
const teamId = await rl.question("LINEAR_TEAM_ID (Settings > Workspace > Teams の URL末尾): ");
const claudeUserId = await rl.question("LINEAR_CLAUDE_USER_ID (ClaudeメンバーのユーザーID): ");

rl.close();

// .env に書き込み（既存行があれば上書き、なければ追記）
function upsertEnvVar(envContent, key, value) {
  const regex = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  return regex.test(envContent) ? envContent.replace(regex, line) : `${envContent}\n${line}`;
}

let envContent = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
envContent = upsertEnvVar(envContent, "LINEAR_API_KEY", apiKey);
envContent = upsertEnvVar(envContent, "LINEAR_TEAM_ID", teamId);
envContent = upsertEnvVar(envContent, "LINEAR_CLAUDE_USER_ID", claudeUserId);
writeFileSync(envPath, envContent.trimStart());

console.log("\n.env に書き込みました。疎通確認中...");

try {
  const client = createLinearClient(apiKey);
  const viewer = await client.viewer;
  console.log(`✅ Linear API 接続OK: ログイン中のユーザー = ${viewer.name}`);

  const team = await client.team(teamId);
  console.log(`✅ チーム確認OK: ${team.name}`);

  const user = await client.user(claudeUserId);
  console.log(`✅ Claudeユーザー確認OK: ${user.name}`);

  console.log("\n🎉 セットアップ完了！\n次のステップ: npm run linear:loop を実行してテストしてください。");
} catch (err) {
  console.error("❌ 接続エラー:", err.message);
  console.error("APIキー・TeamID・UserIDを確認してください。");
  process.exit(1);
}
```

- [ ] **Step 2: package.json にスクリプトを追加する**

`package.json` の `"scripts"` に以下を追加:

```json
"linear:setup": "node scripts/linear-setup.mjs",
```

- [ ] **Step 3: 構文チェック**

```bash
node --check scripts/linear-setup.mjs
```

Expected output: エラーなし（終了コード0）

- [ ] **Step 4: Commit**

```bash
git add scripts/linear-setup.mjs package.json
git commit -m "feat: Linear初回セットアップスクリプトを追加"
```

---

## Task 4: メインループ `scripts/linear-agent-loop.mjs` の実装

**Files:**
- Create: `scripts/linear-agent-loop.mjs`
- Modify: `package.json`

**Note:** claude CLIの呼び出しは `execFileSync` を使い引数を配列で渡すことでシェルインジェクションを防ぐ。

- [ ] **Step 1: メインループを作成する**

```js
// scripts/linear-agent-loop.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import {
  createLinearClient,
  fetchTodoIssues,
  updateIssueState,
  addComment,
  fetchStateMap,
  fetchLabelMap,
} from "./lib/linear.mjs";

const root = projectRoot();
loadDotEnv(root);

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
const LINEAR_CLAUDE_USER_ID = process.env.LINEAR_CLAUDE_USER_ID;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const MAX_ISSUES_PER_RUN = 3;

if (!LINEAR_API_KEY || !LINEAR_TEAM_ID || !LINEAR_CLAUDE_USER_ID) {
  console.error("LINEAR_API_KEY / LINEAR_TEAM_ID / LINEAR_CLAUDE_USER_ID が未設定です");
  console.error("npm run linear:setup を先に実行してください");
  process.exit(1);
}

/** Discord に通知する */
async function notifyDiscord(message) {
  if (!DISCORD_WEBHOOK_URL) return;
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  }).catch(() => {});
}

/**
 * claude CLI でIssueを実行する（引数配列渡しでインジェクション防止）
 * @param {object} issue - Linear Issue オブジェクト
 * @returns {{ success: boolean, output: string }}
 */
function executeWithClaude(issue) {
  const prompt = [
    `# Linear Issue: ${issue.title}`,
    ``,
    issue.description ?? "(説明なし)",
    ``,
    `このIssueを実行して完了させてください。`,
    `完了したら「完了: <1行サマリー>」という形式で最後に報告してください。`,
  ].join("\n");

  try {
    const result = execFileSync(
      "claude",
      ["--print", prompt],
      { cwd: root, timeout: 5 * 60 * 1000, encoding: "utf8" }
    );
    return { success: true, output: result.trim() };
  } catch (err) {
    return { success: false, output: err.message };
  }
}

// ---- メイン処理 ----
const client = createLinearClient(LINEAR_API_KEY);
const stateMap = await fetchStateMap(client, LINEAR_TEAM_ID);
const labelMap = await fetchLabelMap(client, LINEAR_TEAM_ID);

const inProgressStateId = stateMap.get("In Progress");
const doneStateId = stateMap.get("Done");
const backlogStateId = stateMap.get("Backlog");
const blockedLabelId = labelMap.get("status:blocked");
const requiresApprovalLabelId = labelMap.get("requires-approval");

if (!inProgressStateId || !doneStateId) {
  console.error("WorkflowStateに 'In Progress' または 'Done' が見つかりません");
  console.error("Linearのワークフロー設定を確認してください");
  process.exit(1);
}

const issues = await fetchTodoIssues(client, LINEAR_TEAM_ID, LINEAR_CLAUDE_USER_ID);

// requires-approval を分離
const executableIssues = issues
  .filter(i => !requiresApprovalLabelId || !i.labelIds?.includes(requiresApprovalLabelId))
  .slice(0, MAX_ISSUES_PER_RUN);

const approvalNeededIssues = requiresApprovalLabelId
  ? issues.filter(i => i.labelIds?.includes(requiresApprovalLabelId))
  : [];

// requires-approval はDiscord通知のみ
for (const issue of approvalNeededIssues) {
  await notifyDiscord(
    `🟡 **承認待ち** [${issue.title}](${issue.url})\n\`requires-approval\` ラベルがついています`
  );
}

if (executableIssues.length === 0) {
  console.log("[linear-loop] 実行対象のIssueがありません。終了します。");
  process.exit(0);
}

console.log(`[linear-loop] ${executableIssues.length}件のIssueを実行します`);

for (const issue of executableIssues) {
  console.log(`[linear-loop] 開始: ${issue.title}`);

  await updateIssueState(client, issue.id, inProgressStateId);
  await notifyDiscord(`🔵 **実行開始** [${issue.title}](${issue.url})`);

  const { success, output } = executeWithClaude(issue);

  if (success) {
    await updateIssueState(client, issue.id, doneStateId);
    await addComment(client, issue.id, `✅ 完了\n\n${output}`);
    await notifyDiscord(`✅ **完了** [${issue.title}](${issue.url})\n${output.slice(0, 200)}`);
    console.log(`[linear-loop] 完了: ${issue.title}`);
  } else {
    const updatePayload = { stateId: backlogStateId ?? inProgressStateId };
    if (blockedLabelId) updatePayload.labelIds = [blockedLabelId];
    await client.updateIssue(issue.id, updatePayload);
    await addComment(client, issue.id, `❌ エラー\n\n\`\`\`\n${output}\n\`\`\``);
    await notifyDiscord(`❌ **エラー** [${issue.title}](${issue.url})\n\`${output.slice(0, 200)}\``);
    console.error(`[linear-loop] エラー: ${issue.title}\n${output}`);
  }
}

console.log("[linear-loop] ループ完了");
```

- [ ] **Step 2: package.json にスクリプトを追加する**

`package.json` の `"scripts"` に以下を追加:

```json
"linear:loop": "node scripts/linear-agent-loop.mjs",
```

- [ ] **Step 3: 構文チェック**

```bash
node --check scripts/linear-agent-loop.mjs
```

Expected output: エラーなし（終了コード0）

- [ ] **Step 4: Commit**

```bash
git add scripts/linear-agent-loop.mjs package.json
git commit -m "feat: Linear自律ループスクリプトを追加"
```

---

## Task 5: 朝サマリースクリプト `scripts/linear-morning-summary.mjs` の実装

**Files:**
- Create: `scripts/linear-morning-summary.mjs`
- Modify: `package.json`

- [ ] **Step 1: 朝サマリースクリプトを作成する**

```js
// scripts/linear-morning-summary.mjs
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { createLinearClient, fetchStateMap } from "./lib/linear.mjs";
import { Client } from "@notionhq/client";

const root = projectRoot();
loadDotEnv(root);

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const LINEAR_TEAM_ID = process.env.LINEAR_TEAM_ID;
const LINEAR_CLAUDE_USER_ID = process.env.LINEAR_CLAUDE_USER_ID;
const NOTION_TOKEN = process.env.NOTION_TOKEN;

const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
console.log(`\n${"=".repeat(60)}`);
console.log(`🌅 おはようございます！  ${now}`);
console.log(`${"=".repeat(60)}\n`);

// ---- Linear セクション ----
if (LINEAR_API_KEY && LINEAR_TEAM_ID && LINEAR_CLAUDE_USER_ID) {
  const client = createLinearClient(LINEAR_API_KEY);
  const stateMap = await fetchStateMap(client, LINEAR_TEAM_ID);

  const inProgressId = stateMap.get("In Progress");
  const todoId = stateMap.get("Todo");

  const issues = await client.issues({
    filter: {
      team: { id: { eq: LINEAR_TEAM_ID } },
      assignee: { id: { eq: LINEAR_CLAUDE_USER_ID } },
      state: { id: { in: [inProgressId, todoId].filter(Boolean) } },
    },
    orderBy: "priority",
  });

  console.log(`📋 Linear（AI担当 Issue）`);
  if (issues.nodes.length === 0) {
    console.log("  （積みタスクなし）");
  } else {
    for (const issue of issues.nodes) {
      const stateLabel = issue.state?.name ?? "?";
      const priorityLabel = ["", "🔴 Urgent", "🟠 High", "🟡 Medium", "⚪ Low"][issue.priority] ?? "?";
      console.log(`  [${stateLabel}] ${priorityLabel} ${issue.title}`);
      console.log(`    ${issue.url}`);
    }
  }
  console.log();
} else {
  console.log("⚠️  Linear未設定（npm run linear:setup を実行してください）\n");
}

// ---- Notion セクション ----
const hubPath = resolve(root, ".notion-hub.json");
if (NOTION_TOKEN && existsSync(hubPath)) {
  const hub = JSON.parse(readFileSync(hubPath, "utf8"));
  const tasksDbId = hub.databases?.tasks?.id;

  if (tasksDbId) {
    const notion = new Client({ auth: NOTION_TOKEN });

    const response = await notion.databases.query({
      database_id: tasksDbId,
      filter: {
        and: [
          { property: "Owner", select: { equals: "Claude" } },
          { property: "Status", select: { does_not_equal: "Done" } },
        ],
      },
      sorts: [{ property: "Due", direction: "ascending" }],
      page_size: 10,
    }).catch(() => ({ results: [] }));

    console.log(`📝 Notion（Claude向けタスク）`);
    if (response.results.length === 0) {
      console.log("  （タスクなし）");
    } else {
      for (const page of response.results) {
        const title = page.properties?.Title?.title?.[0]?.plain_text ?? "(無題)";
        const status = page.properties?.Status?.select?.name ?? "?";
        const due = page.properties?.Due?.date?.start ?? "";
        const dueLabel = due ? ` [Due: ${due}]` : "";
        console.log(`  [${status}]${dueLabel} ${title}`);
      }
    }
    console.log();
  }
}

console.log(`${"=".repeat(60)}`);
console.log(`💬 今日の方針を話してください。タスクをLinearに起票します。`);
console.log(`${"=".repeat(60)}\n`);
```

- [ ] **Step 2: package.json にスクリプトを追加する**

`package.json` の `"scripts"` に以下を追加:

```json
"linear:morning": "node scripts/linear-morning-summary.mjs",
```

- [ ] **Step 3: 構文チェック**

```bash
node --check scripts/linear-morning-summary.mjs
```

Expected output: エラーなし（終了コード0）

- [ ] **Step 4: Commit**

```bash
git add scripts/linear-morning-summary.mjs package.json
git commit -m "feat: 朝サマリースクリプトを追加"
```

---

## Task 6: launchd 定義ファイルの作成

**Files:**
- Create: `scripts/launchd/com.postcabinets.linear-agent-loop.plist.example`

- [ ] **Step 1: plistファイルを作成する**

ファイルの内容（Write toolで作成）:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.postcabinets.linear-agent-loop</string>

  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/Users/apple/claude for me/scripts/linear-agent-loop.mjs</string>
  </array>

  <key>StartInterval</key>
  <integer>900</integer>

  <key>StandardOutPath</key>
  <string>/Users/apple/Library/Logs/linear-agent-loop.log</string>

  <key>StandardErrorPath</key>
  <string>/Users/apple/Library/Logs/linear-agent-loop.error.log</string>

  <key>RunAtLoad</key>
  <false/>

  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin</string>
    <key>HOME</key>
    <string>/Users/apple</string>
  </dict>
</dict>
</plist>
```

- [ ] **Step 2: Commit**

```bash
git add scripts/launchd/com.postcabinets.linear-agent-loop.plist.example
git commit -m "feat: linear-agent-loop launchd plistサンプルを追加"
```

---

## Task 7: 手動での動作確認とlaunchd登録

**Files:** なし（手順のみ）

**前提:** `npm run linear:setup` が完了していること（LINEAR_API_KEY等が .env に設定済み）

- [ ] **Step 1: セットアップを実行する**

```bash
npm run linear:setup
```

Expected: APIキー・TeamID・UserIDを入力 → `✅ 接続OK` が3行表示される

- [ ] **Step 2: 朝サマリーの動作確認**

```bash
npm run linear:morning
```

Expected: LinearのIssue一覧とNotionタスクが1画面で表示される

- [ ] **Step 3: ループの手動実行テスト**

```bash
npm run linear:loop
```

Expected: `[linear-loop] 実行対象のIssueがありません。終了します。` または Issue実行ログが表示される

- [ ] **Step 4: launchd に登録する**

```bash
# nodeのパスを確認
which node

# plistをコピーしてnodeのパスを環境に合わせて編集（which nodeの出力に合わせる）
cp "scripts/launchd/com.postcabinets.linear-agent-loop.plist.example" \
   ~/Library/LaunchAgents/com.postcabinets.linear-agent-loop.plist

launchctl load ~/Library/LaunchAgents/com.postcabinets.linear-agent-loop.plist
```

- [ ] **Step 5: launchd 登録確認**

```bash
launchctl list | grep linear
```

Expected: `com.postcabinets.linear-agent-loop` が表示される

- [ ] **Step 6: ログ確認**

```bash
tail -f ~/Library/Logs/linear-agent-loop.log
```

Expected: 15分後に実行ログが流れ始める
