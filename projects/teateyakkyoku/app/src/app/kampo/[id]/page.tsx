"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { CHARACTERS } from "@/types";
import { PRODUCTS_DATA, getKampoEmoji } from "@/lib/products-data";

// 漢方の月額価格（円）— 保険適用外は市販価格の目安
const PRODUCT_PRICE_MAP: Record<string, number> = {
  default: 1480,
};

const FATIGUE_LABELS: Record<string, string> = {
  brain: "脳疲労タイプ向け",
  blood: "血流不足タイプ向け",
  nerve: "自律神経タイプ向け",
  organ: "内臓疲労タイプ向け",
  energy: "エネルギー不足タイプ向け",
};

export default function KampoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const profile = useUserStore((s) => s.profile);
  const [purchasing, setPurchasing] = useState(false);

  const product = PRODUCTS_DATA.find((p) => p.id === id);

  if (!product) {
    if (typeof window !== "undefined") router.replace("/kampo");
    return null;
  }

  const emoji = getKampoEmoji(product);
  const char = profile?.character;
  const charBase = char ? CHARACTERS[char.type] : null;
  const primaryType = product.types[0];
  const typeLabel = primaryType ? FATIGUE_LABELS[primaryType] : null;
  const productPrice = PRODUCT_PRICE_MAP[product.id] ?? PRODUCT_PRICE_MAP.default;

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: productPrice,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("決済の準備ができていません。しばらくしてからお試しください。");
      }
    } catch {
      alert("エラーが発生しました。");
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div style={{
      minHeight: "100svh",
      backgroundColor: "#FDF8F2",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
    }}>

      {/* Header（back button — absolute over hero） */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 20px",
        height: 56,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
            border: "none",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#FDF8F2", flexShrink: 0,
          }}
        >
          ←
        </button>
      </div>

      {/* Hero Area — 280px green gradient */}
      <div style={{
        background: "linear-gradient(180deg, #2C4A3E 0%, #1E3830 100%)",
        height: 280,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 88, lineHeight: 1 }}>{emoji}</span>
        {typeLabel && (
          <div style={{
            backgroundColor: "#E8956D",
            borderRadius: 20,
            padding: "6px 14px",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#1E2D2A" }}>{typeLabel}</span>
          </div>
        )}
      </div>

      {/* Scroll content */}
      <div style={{ flex: 1, overflow: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* タイトル行 */}
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#1E2D2A" }}>
              {product.name}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: "#8A9E98" }}>{product.reading}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#2C4A3E" }}>¥1,480〜</span>
            <span style={{ fontSize: 11, color: "#8A9E98" }}>/ 月</span>
          </div>
        </div>

        {/* AIキャラのコメントボックス */}
        {charBase && (
          <div style={{
            backgroundColor: "#F0EDE6",
            borderRadius: 16,
            padding: 14,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16,
              backgroundColor: "#1A1A1A",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, flexShrink: 0,
            }}>
              {charBase.emoji}
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#1A1A1A", lineHeight: 1.6, flex: 1 }}>
              {product.oneLiner}
            </p>
          </div>
        )}

        {/* 主な効果 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1A1A1A" }}>主な効果</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {product.symptoms.slice(0, 5).map((s) => (
              <span key={s} style={{
                fontSize: 12, color: "#2C4A3E",
                backgroundColor: "#E8F0EC",
                padding: "4px 12px", borderRadius: 20, fontWeight: 500,
              }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* 区切り */}
        <div style={{ height: 1, backgroundColor: "#F0EAE0" }} />

        {/* 効能・効果 */}
        {product.symptoms.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#8A9E98" }}>効能・効果</p>
            <p style={{ margin: 0, fontSize: 14, color: "#1E2D2A", lineHeight: 1.5 }}>
              {product.symptoms.join("、")}
            </p>
          </div>
        )}

        {/* 主な構成生薬 */}
        {product.ingredients && (
          <div style={{ padding: "12px 0", borderTop: "1px solid #F0EAE0" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#8A9E98" }}>主な構成生薬</p>
            <p style={{ margin: 0, fontSize: 13, color: "#1E2D2A", lineHeight: 1.8 }}>{product.ingredients}</p>
          </div>
        )}

        {/* 保険・市販 */}
        <div style={{ padding: "12px 0", borderTop: "1px solid #F0EAE0" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#8A9E98" }}>保険・市販</p>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{
              fontSize: 12, fontWeight: 600,
              color: product.insurance ? "#2C4A3E" : "#6B7F7A",
              backgroundColor: product.insurance ? "#E8F5E9" : "#F0EDE8",
              padding: "4px 12px", borderRadius: 20,
            }}>
              {product.insurance ? "保険適用" : "保険適用外"}
            </span>
            {product.otc && (
              <span style={{ fontSize: 12, color: "#6B7F7A", backgroundColor: "#F0EDE8", padding: "4px 12px", borderRadius: 20 }}>
                {product.otc}
              </span>
            )}
          </div>
        </div>

        {/* 注意 */}
        {product.caution && (
          <div style={{ padding: "12px 0", borderTop: "1px solid #F0EAE0" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#C05050" }}>注意・禁忌</p>
            <p style={{ margin: 0, fontSize: 13, color: "#C05050", lineHeight: 1.6 }}>{product.caution}</p>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            style={{
              width: "100%", height: 56, borderRadius: 28,
              backgroundColor: purchasing ? "#A8C5BB" : "#2C4A3E", color: "#FDF8F2",
              fontSize: 15, fontWeight: 700, border: "none",
              cursor: purchasing ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontFamily: "inherit",
              boxShadow: purchasing ? "none" : "0 4px 16px rgba(0,0,0,0.20)",
            }}
          >
            {purchasing ? "処理中…" : `¥${productPrice.toLocaleString()} で購入する`}
          </button>
          <button
            onClick={() => router.push(`/inquiry?kampo=${product.id}`)}
            style={{
              width: "100%", height: 48, borderRadius: 24,
              backgroundColor: "#FDF8F2", color: "#2C4A3E",
              fontSize: 14, fontWeight: 600,
              border: "1px solid #E0D8CC",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            薬局に相談する
          </button>
          <button
            onClick={() => router.push("/chat")}
            style={{
              width: "100%", height: 44, borderRadius: 22,
              backgroundColor: "transparent", color: "#8A9E98",
              fontSize: 13, fontWeight: 500,
              border: "none",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            AIに質問する
          </button>
          <p style={{ margin: 0, fontSize: 11, color: "#8A9E98", textAlign: "center", lineHeight: 1.5 }}>
            ※本アプリは一般的な漢方知識の提供を目的としています。医療アドバイスではありません。
          </p>
        </div>
      </div>
    </div>
  );
}
