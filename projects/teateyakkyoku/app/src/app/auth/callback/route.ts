import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";
  const origin = requestUrl.origin;

  if (code) {
    // レスポンスを先に生成してcookieをそこに書き込む（PKCEセッションをブラウザに返す）
    const response = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // リクエストのcookieからverifierを読む
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // セッションcookieをレスポンスに書き込む
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options ?? {});
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(
        new URL(`/onboarding?error=${encodeURIComponent(error.message)}`, origin)
      );
    }

    return response;
  }

  return NextResponse.redirect(new URL(next, origin));
}
