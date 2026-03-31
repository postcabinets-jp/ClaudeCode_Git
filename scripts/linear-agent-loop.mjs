// scripts/linear-agent-loop.mjs
import { execFileSync } from "node:child_process";
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

async function notifyDiscord(message) {
  if (!DISCORD_WEBHOOK_URL) return;
  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message }),
  }).catch(() => {});
}

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

const executableIssues = issues
  .filter(i => !requiresApprovalLabelId || !i.labelIds?.includes(requiresApprovalLabelId))
  .slice(0, MAX_ISSUES_PER_RUN);

const approvalNeededIssues = requiresApprovalLabelId
  ? issues.filter(i => i.labelIds?.includes(requiresApprovalLabelId))
  : [];

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
