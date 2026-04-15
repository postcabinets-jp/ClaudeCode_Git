"use client";

import { useRouter } from "next/navigation";
import { TabBar } from "@/components/TabBar";

export default function PurchasesPage() {
  const router = useRouter();

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
        padding: "16px 20px 12px",
        gap: 12,
        borderBottom: "1px solid #F0EAE0",
        backgroundColor: "#FDF8F2",
      }}>
        <button
          onClick={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#F0EAE0",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 18,
            color: "#2C4A3E",
            flexShrink: 0,
          }}
        >
          ‹
        </button>
        <h1 style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 700,
          color: "#1E2D2A",
        }}>
          購入履歴
        </h1>
      </div>

      {/* Empty state */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 32px",
        gap: 16,
        paddingBottom: 100,
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "#F0EAE0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          marginBottom: 8,
        }}>
          🛒
        </div>
        <p style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          color: "#1E2D2A",
        }}>
          まだ購入履歴はありません
        </p>
        <p style={{
          margin: 0,
          fontSize: 13,
          color: "#6B9E8F",
          textAlign: "center",
          lineHeight: 1.6,
        }}>
          漢方を購入すると、ここに履歴が表示されます
        </p>
        <button
          onClick={() => router.push("/kampo")}
          style={{
            marginTop: 8,
            padding: "14px 32px",
            borderRadius: 16,
            border: "none",
            backgroundColor: "#2C4A3E",
            color: "#FDF8F2",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          漢方を見る
        </button>
      </div>

      <TabBar activePath="/mypage" />
    </div>
  );
}
