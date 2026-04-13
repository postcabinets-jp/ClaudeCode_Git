"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { CHARACTERS } from "@/types";
import { TabBar } from "@/components/TabBar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "今日の疲れに合う漢方は？",
  "睡眠の質を上げるには？",
  "冷え性に効く食事は？",
  "脳疲労の回復方法を教えて",
];

export default function ChatPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (hasHydrated && !profile) {
      router.replace("/onboarding");
    }
  }, [hasHydrated, profile, router]);

  if (!hasHydrated || !profile) return null;

  const char = profile.character;
  const charBase = char ? CHARACTERS[char.type] : null;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          fatigueType: char?.type,
          characterName: char?.name,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.message ?? "申し訳ありません、うまく回答できませんでした。" }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "接続エラーが発生しました。しばらくしてからもう一度お試しください。" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const isEmptyChat = messages.length === 0;

  return (
    <div style={{
      height: "100svh",
      backgroundColor: "#FDF8F2",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 20px",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E8E5E0",
        height: 56,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#2C4A3E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}>
          {charBase?.emoji ?? "🌿"}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E2D2A" }}>
            {charBase?.name ?? "てあて薬局"}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#6B9E8F" }}>漢方アドバイザー</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflow: "auto",
        padding: "16px 16px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>

        {/* Welcome / empty state */}
        {isEmptyChat && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 16px" }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#2C4A3E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}>
              {charBase?.emoji ?? "🌿"}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1E2D2A" }}>
                {charBase?.name ?? "てあて薬局"}に相談する
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#6B9E8F", lineHeight: 1.6 }}>
                疲れ・漢方・体のことなんでも聞いてね
              </p>
            </div>

            {/* クイック質問 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#A8C5BB", fontWeight: 600 }}>よくある質問</p>
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 16,
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E8E5E0",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#1E2D2A",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            {msg.role === "assistant" && (
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#2C4A3E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                flexShrink: 0,
              }}>
                {charBase?.emoji ?? "🌿"}
              </div>
            )}
            <div style={{
              maxWidth: "72%",
              padding: "12px 16px",
              borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              backgroundColor: msg.role === "user" ? "#2C4A3E" : "#FFFFFF",
              color: msg.role === "user" ? "#FDF8F2" : "#1E2D2A",
              fontSize: 14,
              lineHeight: 1.6,
              boxShadow: msg.role === "assistant" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              border: msg.role === "assistant" ? "1px solid #F0EAE0" : "none",
              whiteSpace: "pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: "#2C4A3E",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0,
            }}>
              {charBase?.emoji ?? "🌿"}
            </div>
            <div style={{
              padding: "12px 16px",
              borderRadius: "20px 20px 20px 4px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #F0EAE0",
              display: "flex", gap: 4, alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: "#A8C5BB",
                  animation: "pulse 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: "8px 16px",
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E8E5E0",
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メッセージを入力..."
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            border: "1.5px solid #E8E5E0",
            borderRadius: 20,
            padding: "10px 14px",
            fontSize: 14,
            fontFamily: "inherit",
            color: "#1E2D2A",
            backgroundColor: "#F8F5F1",
            outline: "none",
            lineHeight: 1.5,
            maxHeight: 100,
            overflow: "auto",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: input.trim() && !loading ? "#2C4A3E" : "#E0DDD8",
            border: "none",
            cursor: input.trim() && !loading ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background-color 0.15s",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      <TabBar activePath="/chat" />
    </div>
  );
}
