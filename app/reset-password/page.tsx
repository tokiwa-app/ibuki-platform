"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      // 1) code= 方式（PKCE）
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        // URLを掃除（任意だけどおすすめ）
        window.history.replaceState({}, document.title, "/reset-password");
      }

      // 2) hash 方式（#access_token=...）
      // hash がある場合は supabase が内部で拾って onAuthStateChange が飛ぶ
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED"
        ) {
          setReady(true);
        }
      });
      unsub = () => data.subscription.unsubscribe();

      // 3) すでにセッションがある場合
      const { data: sess } = await supabase.auth.getSession();
      if (sess.session) setReady(true);
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setMsg(`失敗: ${error.message}`);
      return;
    }

    setMsg("パスワードを更新しました。ログインし直してください。");
    await supabase.auth.signOut();
  };

  if (!ready) {
    return (
      <div style={{ padding: 24 }}>
        <h1>パスワード再設定</h1>
        <p>リンクを確認中です…（無効ならもう一度メールを送ってください）</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h1>パスワード再設定</h1>

      <form onSubmit={onSubmit}>
        <label>
          新しいパスワード
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 8, padding: 8 }}
            required
          />
        </label>

        <button type="submit" style={{ marginTop: 12, padding: "8px 12px" }}>
          更新
        </button>
      </form>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
