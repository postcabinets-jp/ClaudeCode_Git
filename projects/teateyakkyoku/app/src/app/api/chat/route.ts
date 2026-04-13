import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, fatigueType, characterName } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ message: "AIサービスが設定されていません。" }, { status: 503 });
    }

    const systemPrompt = `あなたは「${characterName ?? "てあて"}」という名前の漢方アドバイザーキャラクターです。
てあて薬局のAIアシスタントとして、ユーザーの健康・疲労・漢方に関する相談に親しみやすく答えます。

ユーザーの疲労タイプ: ${fatigueType ?? "未診断"}

ルール:
- 150字以内で簡潔に答える（長くなる場合は段落を分ける）
- 日本語で、やさしいトーンで話す
- 医療診断・処方はせず「薬剤師に相談を」と添える
- 漢方・食事・生活習慣のアドバイスを中心に
- 絵文字を1〜2個使って親しみやすく`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ message: "AI応答に失敗しました。" }, { status: 500 });
    }

    const data = await response.json();
    const message = data.content?.[0]?.text ?? "うまく回答できませんでした。";
    return NextResponse.json({ message });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ message: "エラーが発生しました。" }, { status: 500 });
  }
}
