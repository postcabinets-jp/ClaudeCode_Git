import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // /auth/callback はPKCE codeの交換を行うRoute Handlerが処理するため
  // proxyでgetUser()を呼ぶとverifierが消費されてしまうのでスキップする
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // リクエストオブジェクトにも書き込んで転送する
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 新しいレスポンスを作り直してリクエストのcookieを引き継ぐ
          supabaseResponse = NextResponse.next({
            request,
          });
          // レスポンスにもcookieを書き込む（ブラウザへのSet-Cookie）
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options ?? {})
          );
        },
      },
    }
  );

  // セッションをリフレッシュ（PKCEのverifierをcookieで保持）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未ログイン状態で保護ルートにアクセスした場合は /onboarding へリダイレクト
  const PROTECTED_PREFIX = [
    "/home",
    "/diagnosis",
    "/result",
    "/checkin",
    "/report",
    "/mypage",
    "/kampo",
    "/shop",
    "/chat",
    "/character",
    "/purchases",
    "/inquiry",
  ];
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIX.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const proxyConfig = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
