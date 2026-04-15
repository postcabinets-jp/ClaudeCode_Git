"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { TabBar } from "@/components/TabBar";
import { PRODUCTS_DATA, getProductsByType, getKampoEmoji, type KampoProduct } from "@/lib/products-data";
import { FATIGUE_LABELS } from "@/types";
import type { FatigueType } from "@/types";

type FilterType = FatigueType | "all";

function searchKampo(query: string, products: KampoProduct[]): KampoProduct[] {
  if (!query.trim()) return products;
  const q = query.trim().toLowerCase();
  return products.filter((p) =>
    p.name.toLowerCase().includes(q) ||
    p.reading.toLowerCase().includes(q) ||
    p.symptoms.some((s) => s.includes(q)) ||
    p.oneLiner.toLowerCase().includes(q) ||
    p.ingredients.toLowerCase().includes(q)
  );
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "brain", label: "脳疲労" },
  { value: "blood", label: "血流不足" },
  { value: "nerve", label: "自律神経" },
  { value: "organ", label: "内臓疲労" },
  { value: "energy", label: "エネルギー" },
];

export default function ShopPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const [tab, setTab] = useState<"recommended" | "all">("recommended");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const fatigueType = profile?.character?.type;

  const recommended = fatigueType ? getProductsByType(fatigueType) : [];

  const filteredAll =
    typeFilter === "all"
      ? PRODUCTS_DATA
      : PRODUCTS_DATA.filter((p) => p.types.includes(typeFilter as FatigueType));

  const baseList = tab === "recommended" ? recommended : filteredAll;
  const displayList = searchKampo(searchQuery, baseList);

  // "all" タブ時: primaryType に一致する漢方を上部ハイライト / 残りを分割
  const highlightList =
    tab === "all" && fatigueType && !searchQuery
      ? displayList.filter((p) => p.types.includes(fatigueType))
      : [];
  const restList =
    tab === "all" && fatigueType && !searchQuery
      ? displayList.filter((p) => !p.types.includes(fatigueType))
      : displayList;

  return (
    <div style={{
      height: "100svh",
      backgroundColor: "#FDF8F2",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
    }}>

      <div style={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Header */}
        <div style={{ padding: "4px 20px 16px" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#6B9E8F", fontWeight: 500 }}>漢方の知識を深めよう</p>
          <h1 style={{ margin: "2px 0 12px", fontSize: 22, fontWeight: 800, color: "#1E2D2A" }}>漢方辞典</h1>

          {/* Tab toggle */}
          <div style={{
            display: "flex",
            backgroundColor: "#F0EDE8",
            borderRadius: 12,
            padding: 4,
            gap: 4,
          }}>
            {(["recommended", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: tab === t ? "#fff" : "transparent",
                  color: tab === t ? "#1E2D2A" : "#6B9E8F",
                  boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {t === "recommended" ? "おすすめ" : "すべて"}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "0 16px 12px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="漢方名・症状で検索"
            style={{
              width: "100%",
              boxSizing: "border-box",
              height: 44,
              padding: "0 16px",
              borderRadius: 16,
              border: "1px solid #E8E5E0",
              backgroundColor: "#F5F3F0",
              fontSize: 14,
              color: "#1E2D2A",
              outline: "none",
              fontFamily: "'Inter', 'Hiragino Sans', sans-serif",
            }}
          />
        </div>

        {/* Type filter */}
        {tab === "all" && (
          <div style={{
            padding: "0 16px 12px",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
          }}>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTypeFilter(opt.value)}
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${typeFilter === opt.value ? "#2C4A3E" : "#E0D8CC"}`,
                  backgroundColor: typeFilter === opt.value ? "#2C4A3E" : "#fff",
                  color: typeFilter === opt.value ? "#FDF8F2" : "#6B7F7A",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Rec Banner */}
        {fatigueType && tab === "recommended" && (
          <div style={{
            margin: "0 16px 8px",
            backgroundColor: "#2C4A3E",
            borderRadius: 20,
            padding: 20,
            height: 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
          }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "#E8956D" }}>
              {FATIGUE_LABELS[fatigueType]}タイプにおすすめ
            </p>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#FFFFFF" }}>
              今週のピックアップ
            </p>
          </div>
        )}

        {/* Highlight Section: "all" タブ × primaryType 一致 × 検索なし */}
        {highlightList.length > 0 && (
          <div style={{ padding: "0 16px 4px" }}>
            <div style={{
              backgroundColor: "#2C4A3E",
              borderRadius: 20,
              padding: "14px 16px 10px",
              marginBottom: 12,
            }}>
              <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#E8956D", letterSpacing: 0.5 }}>
                ★ あなたの{FATIGUE_LABELS[fatigueType!]}タイプにぴったり
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {highlightList.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isRecommended={true}
                    highlighted={true}
                  />
                ))}
              </div>
            </div>

            {restList.length > 0 && (
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#6B9E8F" }}>
                その他の漢方
              </p>
            )}
          </div>
        )}

        {/* Product List */}
        <div style={{
          padding: highlightList.length > 0 ? "0 16px 16px" : "8px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}>
          {displayList.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#A8C5BB" }}>
              <p style={{ fontSize: 32, margin: "0 0 8px" }}>🌿</p>
              <p style={{ margin: 0, fontSize: 14 }}>診断を受けるとおすすめが表示されます</p>
              <button
                onClick={() => router.push("/diagnosis")}
                style={{
                  marginTop: 16,
                  padding: "10px 24px",
                  borderRadius: 20,
                  backgroundColor: "#E8956D",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                診断する
              </button>
            </div>
          ) : (
            restList.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isRecommended={!!fatigueType && p.types.includes(fatigueType)}
              />
            ))
          )}
        </div>
      </div>

      <TabBar activePath="/kampo" />
    </div>
  );
}

function ProductCard({ product, isRecommended, highlighted = false }: { product: KampoProduct; isRecommended: boolean; highlighted?: boolean }) {
  const router = useRouter();
  const emoji = getKampoEmoji(product);
  const availLabel = product.insurance ? "保険適用" : "市販";
  const typeLabels = product.types.map((t) => {
    const map: Record<FatigueType, string> = {
      brain: "脳疲労",
      blood: "血流不足",
      nerve: "自律神経",
      organ: "内臓疲労",
      energy: "エネルギー",
    };
    return map[t];
  });

  return (
    <>
    <div style={{
      backgroundColor: highlighted ? "rgba(255,255,255,0.07)" : "#fff",
      borderRadius: 20,
      padding: "16px",
      border: `1.5px solid ${highlighted ? "rgba(232,149,109,0.5)" : isRecommended ? "#E8956D40" : "#F0EAE0"}`,
      boxShadow: highlighted ? "none" : isRecommended ? "0 4px 16px rgba(232,149,109,0.12)" : "0 2px 8px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 16,
          backgroundColor: isRecommended ? "rgba(232,149,109,0.1)" : "#F5F0E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 30,
          flexShrink: 0,
        }}>
          {emoji}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
            {typeLabels.map((label) => (
              <span
                key={label}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isRecommended ? "#E8956D" : "#6B9E8F",
                  backgroundColor: isRecommended ? "rgba(232,149,109,0.1)" : "#F0EDE8",
                  padding: "2px 8px",
                  borderRadius: 8,
                }}
              >
                {label}
              </span>
            ))}
            {product.tsumuraNo && (
              <span style={{
                fontSize: 10,
                color: "#A8C5BB",
                backgroundColor: "#F0EDE8",
                padding: "2px 8px",
                borderRadius: 8,
              }}>
                No.{product.tsumuraNo}
              </span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: highlighted ? "#FFFFFF" : "#1E2D2A" }}>{product.name}</p>
          <p style={{ margin: "1px 0 0", fontSize: 11, color: highlighted ? "rgba(255,255,255,0.5)" : "#A8C5BB" }}>{product.reading}</p>
          <p style={{ margin: "4px 0 10px", fontSize: 12, color: highlighted ? "rgba(255,255,255,0.7)" : "#6B7F7A", lineHeight: 1.5 }}>
            {product.oneLiner}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {product.symptoms.map((s) => (
              <span
                key={s}
                style={{
                  fontSize: 10,
                  color: "#6B7F7A",
                  backgroundColor: "#F5F0E8",
                  padding: "2px 6px",
                  borderRadius: 6,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: product.insurance ? "#2C4A3E" : "#6B7F7A",
              backgroundColor: product.insurance ? "#E8F5E9" : "#F5F0E8",
              padding: "3px 10px",
              borderRadius: 10,
            }}>
              {availLabel}
            </span>
            <span style={{
              fontSize: 10,
              color: "#A8C5BB",
              marginLeft: 8,
            }}>
              {product.otc}
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => router.push(`/kampo/${product.id}`)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                backgroundColor: isRecommended ? "#E8956D" : "#2C4A3E",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              詳しく見る
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
