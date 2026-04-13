"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { getSession } from "@/lib/supabase/auth";

// エントリーポイント: セッション・プロフィール状態に応じてルーティング
export default function RootPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    (async () => {
      const session = await getSession();

      if (session) {
        // セッションあり
        if (profile) {
          router.replace("/home");
        } else {
          // 初回ユーザー（診断未実施）
          router.replace("/diagnosis");
        }
      } else {
        router.replace("/onboarding");
      }
    })();
  }, [hasHydrated, profile, router]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100svh", backgroundColor: "#FDF8F2" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 48 }}>🌿</span>
        <p style={{ fontSize: 14, color: "#6B9E8F", fontWeight: 500, margin: 0 }}>てあて薬局</p>
      </div>
    </div>
  );
}
