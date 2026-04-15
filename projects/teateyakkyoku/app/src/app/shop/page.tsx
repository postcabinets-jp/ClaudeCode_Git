"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// /shop は /kampo にリダイレクト（ショップ機能は /kampo に統合）
export default function ShopRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/kampo");
  }, [router]);
  return null;
}
