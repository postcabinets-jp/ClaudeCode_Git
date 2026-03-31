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
