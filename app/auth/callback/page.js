'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [msg, setMsg] = useState('Googleログインを処理しています…');

  useEffect(() => {
    let active = true;

    async function completeGoogleLogin() {
      try {
        const params = new URLSearchParams(window.location.search);

        const code = params.get('code');
        const oauthError =
          params.get('error_description') || params.get('error');

        if (oauthError) {
          throw new Error(oauthError);
        }

        if (!code) {
          /*
           * すでにセッション交換済みでコールバック画面へ
           * 戻ったケースも確認します。
           */
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            throw sessionError;
          }

          if (!session) {
            throw new Error('認証コードが見つかりません');
          }
        } else {
          const { error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        }

        if (active) {
          router.replace('/');
        }
      } catch (error) {
        console.error(error);

        if (active) {
          setMsg(
            `Googleログインに失敗しました。\n${error.message}`
          );
        }
      }
    }

    completeGoogleLogin();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '80px auto',
        padding: '0 16px',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <p style={{ whiteSpace: 'pre-wrap' }}>{msg}</p>

      {msg.startsWith('Googleログインに失敗') && (
        <button
          type="button"
          onClick={() => router.replace('/')}
          style={{
            width: '100%',
            padding: 10,
            marginTop: 16,
            fontSize: 16,
          }}
        >
          ログイン画面へ戻る
        </button>
      )}
    </main>
  );
}
