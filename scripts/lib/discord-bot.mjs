// scripts/lib/discord-bot.mjs
// Discord Bot API ラッパー（双方向通信）
// DISCORD_BOT_TOKEN を使う。Webhook（一方向）とは別。

const DISCORD_API = "https://discord.com/api/v10";

/**
 * チャンネルにメッセージを送信する
 * @param {string} token - DISCORD_BOT_TOKEN
 * @param {string} channelId
 * @param {string} content
 * @param {string|null} replyToMessageId - 返信先メッセージID（nullなら通常送信）
 * @returns {Promise<object>} 送信したメッセージオブジェクト
 */
export async function sendMessage(token, channelId, content, replyToMessageId = null) {
  const body = { content };
  if (replyToMessageId) {
    body.message_reference = { message_id: replyToMessageId };
  }
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord送信失敗 ${res.status}: ${err}`);
  }
  return res.json();
}

/**
 * チャンネルの最新メッセージ一覧を取得する
 * @param {string} token
 * @param {string} channelId
 * @param {object} [opts]
 * @param {number} [opts.limit=20] - 取得件数（最大100）
 * @param {string} [opts.after] - このメッセージID以降を取得
 * @returns {Promise<Array>} メッセージの配列（新しい順）
 */
export async function fetchMessages(token, channelId, { limit = 20, after } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set("after", after);
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages?${params}`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discordメッセージ取得失敗 ${res.status}: ${err}`);
  }
  return res.json(); // 新しい順で返ってくる
}

/**
 * 特定メッセージIDのスレッド（返信）を取得する
 * Discord APIにはネイティブスレッド取得がないため、
 * チャンネル履歴からmessage_reference.message_idで絞り込む
 * @param {string} token
 * @param {string} channelId
 * @param {string} rootMessageId - スレッドの起点メッセージID
 * @param {number} [limit=50]
 * @returns {Promise<Array>} 返信メッセージの配列（古い順）
 */
export async function fetchThreadReplies(token, channelId, rootMessageId, limit = 50) {
  const messages = await fetchMessages(token, channelId, { limit, after: rootMessageId });
  return messages
    .filter(m => m.message_reference?.message_id === rootMessageId)
    .reverse(); // 古い順に並べ直す
}

/**
 * Botが送信したメッセージかどうかを確認する
 * @param {object} message - Discordメッセージオブジェクト
 * @param {string} botUserId - BotのユーザーID
 * @returns {boolean}
 */
export function isBotMessage(message, botUserId) {
  return message.author?.id === botUserId;
}

/**
 * Bot自身のユーザーIDを取得する
 * @param {string} token
 * @returns {Promise<string>} Bot User ID
 */
export async function getBotUserId(token) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) throw new Error(`Bot情報取得失敗 ${res.status}`);
  const data = await res.json();
  return data.id;
}
