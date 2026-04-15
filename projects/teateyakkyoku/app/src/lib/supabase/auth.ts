import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle() {
  const supabase = createClient();

  // WebView環境（LINE内ブラウザ等）ではdisallowed_useragentが発生するため
  // skipBrowserRedirect + window.location.href で強制リダイレクト
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (data.url) {
    window.location.href = data.url;
  }
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
