"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { getSession, getUser } from "@/lib/supabase/auth";

// エントリーポイント: セッション・プロフィール状態に応じてルーティング
export default function RootPage() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const setProfileFromGoogle = useUserStore((s) => s.setProfileFromGoogle);

  useEffect(() => {
    if (!hasHydrated) return;

    (async () => {
      const session = await getSession();

      if (session) {
        // セッションあり
        if (profile) {
          // LocalStorageにprofileが存在 → そのまま/homeへ
          router.replace("/home");
        } else {
          // LocalStorageにprofileがない（Googleログイン直後など）
          // Supabaseのユーザー情報でprofileを初期化してから/homeへ
          const user = await getUser();
          if (user) {
            setProfileFromGoogle({
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split("@")[0] || "ユーザー",
              email: user.email || "",
              avatar: user.user_metadata?.avatar_url,
            });
          }
          router.replace("/home");
        }
      } else {
        router.replace("/onboarding");
      }
    })();
  }, [hasHydrated, profile, router, setProfileFromGoogle]);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100svh", backgroundColor: "#FDF8F2" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 48 }}>🌿</span>
        <p style={{ fontSize: 14, color: "#6B9E8F", fontWeight: 500, margin: 0 }}>てあて薬局</p>
      </div>
    </div>
  );
}
