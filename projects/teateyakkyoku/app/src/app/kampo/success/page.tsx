"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCTS_DATA } from "@/lib/products-data";
import { TabBar } from "@/components/TabBar";

function SuccessContent() {
  const router = useRouter();
  const params = useSearchParams();
  const productId = params.get("product");
  const product = productId ? PRODUCTS_DATA.find((p) => p.id === productId) : null;

  return (
    <div style={{
      minHeight: "100svh",
      backgroundColor: "#FDF8F2",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
    }}>
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 28px 40px",
        gap: 24,
        textAlign: "center",
      }}>
        {/* 成功アイコン */}
        <div style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: "rgba(107,158,120,0.12)",
          border: "2px solid #6B9E78",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 40,
        }}>
          ✅
        </div>

        {/* タイトル */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1E2D2A" }}>
            ご注文ありがとうございます！
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "#6B9E8F", lineHeight: 1.6 }}>
            {product ? `${product.name}のご注文を受け付けました。` : "ご注文を受け付けました。"}
            <br />まもなくお届けいたします。
          </p>
        </div>

        {/* 注文商品カード */}
        {product && (
          <div style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            borderRadius: 20,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 4px 16px rgba(44,74,62,0.06)",
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: "#EBF5F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}>
              🌿
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#1E2D2A" }}>
                {product.name}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#8A9E98" }}>
                {product.reading}
              </p>
            </div>
          </div>
        )}

        {/* ビフォーチェック促進 */}
        <div style={{
          width: "100%",
          backgroundColor: "#2C4A3E",
          borderRadius: 20,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#FDF8F2" }}>
            今日の調子を記録しよう
          </p>
          <p style={{ margin: 0, fontSize: 12, color: "#A8C5BB", lineHeight: 1.6 }}>
            服用前の状態を記録しておくと、<br />効果の変化がわかりやすくなります。
          </p>
          <button
            onClick={() => router.push("/checkin")}
            style={{
              padding: "12px",
              borderRadius: 14,
              backgroundColor: "#E8956D",
              color: "#1E2D2A",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            今日の調子を記録する
          </button>
        </div>

        {/* ホームへ */}
        <button
          onClick={() => router.push("/home")}
          style={{
            padding: "14px 40px",
            borderRadius: 28,
            backgroundColor: "transparent",
            color: "#6B9E8F",
            fontSize: 14,
            fontWeight: 600,
            border: "1.5px solid #C8D8D4",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ホームに戻る
        </button>
      </div>

      <TabBar activePath="/kampo" />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100svh",
        backgroundColor: "#FDF8F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6B9E8F",
        fontSize: 14,
        fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
      }}>
        読み込み中…
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
