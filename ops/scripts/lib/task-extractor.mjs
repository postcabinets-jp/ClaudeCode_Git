// scripts/lib/task-extractor.mjs
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const SYSTEM_PROMPT = `あなたはNotionの思考ノートからタスクを抽出するアシスタントです。
入力テキストを読み、Claude（AI）が実行できるタスクのリストをJSON配列で返してください。

ルール:
- チェックボックス付きの行（「- [ ]」で始まる行）はnobu自身のタスクなので無視する
- 1つの文章が複数タスクを含む場合は分割する
- 曖昧すぎて実行不可能なもの（「なんとかする」等）は除外する
- 個人的な予定や人間にしかできないことは除外する

各タスクのJSON形式:
{"title":"30字以内の日本語タスク名","owner":"Claude","priority":"High/Medium/Low のいずれか","project_hint":"関連プロジェクト名（不明なら空）","notes":"元テキストの文脈・補足（50字以内）"}

重要: コードブロックや説明文なしで、JSON配列のみを返してください。タスクがない場合は [] を返してください。`;

/**
 * claude CLIのresultフィールドからJSON配列を抽出する
 */
function extractJsonFromResult(result) {
  // コードブロック内のJSONを探す
  const codeBlockMatch = result.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      console.error("コードブロック内JSON解析失敗");
      return [];
    }
  }
  // コードブロックなしで直接JSON配列を探す
  const arrayMatch = result.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch {
      console.error("JSON配列解析失敗");
      return [];
    }
  }
  return [];
}

/**
 * テキストからClaude向けタスクをclaude CLIで抽出する
 * @param {string} text - 思考ノートのトグル内テキスト
 * @returns {Promise<Array>} タスクの配列
 */
export async function extractTasks(text) {
  if (!text || !text.trim()) return [];

  const prompt = `${SYSTEM_PROMPT}\n\n【入力テキスト】\n${text}`;

  try {
    const { stdout } = await execFileAsync("claude", ["-p", prompt, "--output-format", "json"], {
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    });

    const response = JSON.parse(stdout);
    if (response.is_error || !response.result) {
      console.error("claude CLIエラー:", response);
      return [];
    }

    if (typeof response.result !== "string") {
      console.error("claude CLIの結果が文字列ではありません:", typeof response.result);
      return [];
    }

    const tasks = extractJsonFromResult(response.result);

    // priority の正規化
    const validPriorities = ["high", "medium", "low"];
    return tasks.map((task) => ({
      ...task,
      priority: validPriorities.includes(task.priority?.toLowerCase?.())
        ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()
        : "Medium",
    }));
  } catch (err) {
    console.error("タスク抽出失敗:", err.message);
    return [];
  }
}
