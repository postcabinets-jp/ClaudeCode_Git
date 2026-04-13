#!/usr/bin/env node
/**
 * kokkai-fetch.mjs
 * 国会会議録APIから直近の会議録を取得し、AI要約してNotionの会議録DBに投入する。
 *
 * 使い方:
 *   node scripts/kokkai-fetch.mjs            # 昨日分を取得
 *   node scripts/kokkai-fetch.mjs --days 7   # 過去7日分を取得
 *   node scripts/kokkai-fetch.mjs --dry-run  # Notionに投入せず結果を表示のみ
 */
import { loadDotEnv, projectRoot } from "./lib/env.mjs";
import { notionFetch } from "./lib/notion.mjs";

const root = projectRoot();
loadDotEnv(root);

// ---- 設定 ----
const KOKKAI_API = "https://kokkai.ndl.go.jp/api/meeting";
const NOTION_TOKEN = process.env.NOTION_TOKEN;
// 会議録DBのID（前セッションで作成済み）
const KAIGIROKU_DB_ID = process.env.KOKKAI_KAIGIROKU_DB_ID || "e523f207-386f-4b69-9770-acfe90256511";

// ---- 引数パース ----
const args = process.argv.slice(2);
const daysArg = args.indexOf("--days");
const days = daysArg >= 0 ? parseInt(args[daysArg + 1], 10) : 1;
const dryRun = args.includes("--dry-run");

if (!NOTION_TOKEN && !dryRun) {
  console.error("NOTION_TOKEN が未設定です。");
  process.exit(1);
}

// ---- 日付計算 ----
function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

const today = new Date();
// untilは昨日（当日公開されることは稀なため）
const until = new Date(today);
until.setDate(today.getDate() - 1);
const from = new Date(until);
from.setDate(until.getDate() - (days - 1));
const fromStr = toDateStr(from);
const untilStr = toDateStr(until);

console.log(`取得期間: ${fromStr} 〜 ${untilStr}`);

// ---- 国会会議録API から会議一覧を全件取得（ページング対応）----
async function fetchMeetings(fromDate, untilDate) {
  const allRecords = [];
  let startRecord = 1;
  const MAX_PER_REQ = 10; // API上限

  while (true) {
    const params = new URLSearchParams({
      from: fromDate,
      until: untilDate,
      recordPacking: "json",
      maximumRecords: String(MAX_PER_REQ),
      startRecord: String(startRecord),
    });
    const url = `${KOKKAI_API}?${params}`;
    console.log(`API呼び出し: ${url}`);

    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`国会API エラー: ${res.status} ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const records = data.meetingRecord ?? [];
    allRecords.push(...records);

    // 次ページがあるか確認
    const next = data.nextRecordPosition;
    if (!next || records.length === 0) break;
    startRecord = next;
    await new Promise((r) => setTimeout(r, 500)); // レートリミット対策
  }

  return allRecords;
}

// ---- 会議録をAI要約（Claude API直接呼び出し）----
async function summarizeMeeting(meeting) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // APIキーなしの場合は簡易要約
    return {
      主要議題: meeting.nameOfMeeting ?? "不明",
      議論サマリー: `${meeting.nameOfMeeting}の会議録（${meeting.date}）。発言数: ${meeting.speechRecord?.length ?? 0}件。`,
      注目発言: "",
    };
  }

  // 発言テキストを収集（最大5000字）
  const speeches = (meeting.speechRecord ?? [])
    .map((s) => `【${s.speaker ?? ""}】${s.speech ?? ""}`)
    .join("\n")
    .slice(0, 5000);

  const prompt = `以下は日本の国会会議録です。JSON形式で要約してください。

会議名: ${meeting.nameOfMeeting}
院: ${meeting.nameOfHouse}
日付: ${meeting.date}
発言内容（抜粋）:
${speeches}

以下の形式でJSONのみ返してください（他のテキスト不要）:
{
  "主要議題": "50字以内",
  "議論サマリー": "200字以内の要約",
  "注目発言": "最も重要な発言を100字以内で"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.warn("AI要約失敗:", err);
    return { 主要議題: meeting.nameOfMeeting, 議論サマリー: "", 注目発言: "" };
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { 主要議題: "", 議論サマリー: text, 注目発言: "" };
  } catch {
    return { 主要議題: "", 議論サマリー: text, 注目発言: "" };
  }
}

// ---- 既存ページを検索（重複防止）----
async function findExistingPage(meetingId) {
  const res = await notionFetch(
    `/v1/databases/${KAIGIROKU_DB_ID}/query`,
    NOTION_TOKEN,
    {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "会議録ID",
          rich_text: { equals: meetingId },
        },
        page_size: 1,
      }),
    }
  );
  return res.results?.[0] ?? null;
}

// ---- Notionページを作成 ----
async function createNotionPage(meeting, summary) {
  const props = {
    "会議名": {
      title: [{ text: { content: meeting.nameOfMeeting ?? "" } }],
    },
    "院": {
      select: { name: meeting.nameOfHouse ?? "衆議院" },
    },
    "委員会名": {
      rich_text: [{ text: { content: meeting.nameOfMeeting ?? "" } }],
    },
    "開催日": {
      date: meeting.date ? { start: meeting.date } : null,
    },
    "国会回次": {
      number: meeting.issueID ? parseInt(meeting.issueID.slice(0, 3)) : 221,
    },
    "号数": {
      number: meeting.issue ? parseInt(meeting.issue, 10) : null,
    },
    "主要議題": {
      rich_text: [{ text: { content: summary.主要議題 ?? "" } }],
    },
    "議論サマリー": {
      rich_text: [{ text: { content: (summary.議論サマリー ?? "").slice(0, 2000) } }],
    },
    "注目発言": {
      rich_text: [{ text: { content: (summary.注目発言 ?? "").slice(0, 2000) } }],
    },
    "会議録URL": {
      url: meeting.meetingURL ?? null,
    },
    "会議録ID": {
      rich_text: [{ text: { content: meeting.issueID ?? "" } }],
    },
  };

  // nullのdateプロパティは除去
  if (!props["開催日"].date) delete props["開催日"];

  await notionFetch("/v1/pages", NOTION_TOKEN, {
    method: "POST",
    body: JSON.stringify({
      parent: { database_id: KAIGIROKU_DB_ID },
      properties: props,
    }),
  });
}

// ---- メイン処理 ----
async function main() {
  const meetings = await fetchMeetings(fromStr, untilStr);
  console.log(`取得した会議数: ${meetings.length}件`);

  if (meetings.length === 0) {
    console.log("新しい会議録はありません。");
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const meeting of meetings) {
    const meetingId = meeting.issueID ?? `${meeting.date}-${meeting.nameOfMeeting}`;
    console.log(`処理中: ${meeting.nameOfMeeting} (${meeting.date})`);

    if (!dryRun) {
      // 重複チェック
      const existing = await findExistingPage(meetingId);
      if (existing) {
        console.log(`  → スキップ（既存）`);
        skipped++;
        continue;
      }
    }

    // AI要約
    const summary = await summarizeMeeting(meeting);
    console.log(`  → 要約: ${summary.主要議題}`);

    if (!dryRun) {
      try {
        await createNotionPage(meeting, summary);
        console.log(`  → Notion投入完了`);
        created++;
        // レートリミット対策
        await new Promise((r) => setTimeout(r, 400));
      } catch (err) {
        console.error(`  → エラー:`, err.message);
      }
    } else {
      console.log(`  [dry-run] 投入スキップ`);
    }
  }

  console.log(`\n完了: 新規${created}件 / スキップ${skipped}件 / 合計${meetings.length}件`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
