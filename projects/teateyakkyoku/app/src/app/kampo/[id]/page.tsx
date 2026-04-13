"use client";

import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS_DATA, getKampoEmoji } from "@/lib/products-data";

const BADGE_STYLE = {
  borderRadius: 20,
  padding: "4px 12px",
  fontSize: 12,
  backgroundColor: "#F0EDE8",
  color: "#6B7F7A",
  display: "inline-block",
  whiteSpace: "nowrap",
};

function BadgeList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((item) => (
        <span key={item} style={BADGE_STYLE}>{item}</span>
      ))}
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{
      padding: "16px 0",
      borderBottom: "1px solid #F0EAE0",
    }}>
      <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#8A9E98" }}>{label}</p>
      {children}
    </div>
  );
}

export default function KampoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  const product = PRODUCTS_DATA.find((p) => p.id === id);

  if (!product) {
    // ページが描画される前に router.replace は呼べないので useEffect に近い処理として
    // 簡易的にnullを返してリダイレクト
    if (typeof window !== "undefined") {
      router.replace("/kampo");
    }
    return null;
  }

  const emoji = getKampoEmoji(product);

  return (
    <div style={{
      minHeight: "100svh",
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
          backgroundColor: "#FDF8F2",
          borderBottom: "1px solid #F0EAE0",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#fff",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1E2D2A", flex: 1 }}>
            漢方詳細
          </p>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          padding: "0 20px 32px",
          overflow: "auto",
        }}>

          {/* Hero */}
          <div style={{
            textAlign: "center",
            padding: "28px 0 24px",
            borderBottom: "1px solid #F0EAE0",
          }}>
            <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}>{emoji}</div>
            <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 800, color: "#1E2D2A" }}>
              {product.name}
            </h1>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#A8C5BB" }}>{product.reading}</p>
            {product.tsumuraNo && (
              <span style={{
                ...BADGE_STYLE,
                backgroundColor: "#E8F5E9",
                color: "#2C4A3E",
                fontWeight: 600,
              }}>
                ツムラ {product.tsumuraNo}番
              </span>
            )}
          </div>

          {/* oneLiner */}
          <div style={{ padding: "20px 0 16px", borderBottom: "1px solid #F0EAE0" }}>
            <p style={{ margin: 0, fontSize: 15, color: "#1E2D2A", lineHeight: 1.7, fontWeight: 500 }}>
              {product.oneLiner}
            </p>
          </div>

          {/* 対象の体質 */}
          {product.constitution && product.constitution.length > 0 && (
            <Section label="対象の体質">
              <BadgeList items={product.constitution} />
            </Section>
          )}

          {/* 薬効分類 */}
          {product.classification && product.classification.length > 0 && (
            <Section label="薬効分類">
              <BadgeList items={product.classification} />
            </Section>
          )}

          {/* 適応症状 */}
          {product.symptoms && product.symptoms.length > 0 && (
            <Section label="適応症状">
              <BadgeList items={product.symptoms} />
            </Section>
          )}

          {/* 主な構成生薬 */}
          {product.ingredients && (
            <Section label="主な構成生薬">
              <p style={{ margin: 0, fontSize: 13, color: "#1E2D2A", lineHeight: 1.8 }}>
                {product.ingredients}
              </p>
            </Section>
          )}

          {/* 出典 */}
          {product.source && (
            <Section label="出典">
              <p style={{ margin: 0, fontSize: 13, color: "#6B7F7A", lineHeight: 1.6 }}>
                {product.source}
              </p>
            </Section>
          )}

          {/* 別名 */}
          {product.alias && (
            <Section label="別名">
              <p style={{ margin: 0, fontSize: 13, color: "#6B7F7A" }}>
                {product.alias}
              </p>
            </Section>
          )}

          {/* 注意・禁忌 */}
          {product.caution && (
            <Section label="注意・禁忌">
              <p style={{ margin: 0, fontSize: 13, color: "#C05050", lineHeight: 1.6 }}>
                {product.caution}
              </p>
            </Section>
          )}

          {/* 保険・市販 */}
          <div style={{ padding: "16px 0", borderBottom: "1px solid #F0EAE0" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#8A9E98" }}>保険・市販</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                ...BADGE_STYLE,
                backgroundColor: product.insurance ? "#E8F5E9" : "#F0EDE8",
                color: product.insurance ? "#2C4A3E" : "#6B7F7A",
                fontWeight: 600,
              }}>
                {product.insurance ? "保険適用" : "保険適用外"}
              </span>
              {product.otc && (
                <span style={BADGE_STYLE}>{product.otc}</span>
              )}
            </div>
          </div>

          {/* 免責事項 */}
          <div style={{
            marginTop: 24,
            fontSize: 11,
            color: "#8A9E98",
            padding: 16,
            backgroundColor: "#F8F5F0",
            borderRadius: 16,
            lineHeight: 1.7,
          }}>
            この情報は一般的な漢方の解説です。個人の体質や症状により適切な処方は異なります。服用の際は必ず薬剤師にご相談ください。
          </div>

          {/* 相談ボタン */}
          <button
            onClick={() => router.push(`/inquiry?kampo=${product.id}`)}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "16px",
              borderRadius: 28,
              backgroundColor: "#2C4A3E",
              color: "#FDF8F2",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            薬局に相談する
          </button>

        </div>
    </div>
  );
}
