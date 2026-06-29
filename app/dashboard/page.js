'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace('/');
        return;
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: 40 }}>Loading...</p>;
  }

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ margin: '12px 0 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>
          Ibuki WMS
        </h1>
        <p style={{ marginTop: 6, fontSize: 13, color: '#666' }}>
          トップ画面
        </p>
      </header>

      <div
        style={{
          background: '#ffffff',
          padding: 20,
          borderRadius: 10,
          minHeight: '50vh',
          width: '100%',
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>
          📌 今日のサマリー
        </h2>
        <p style={{ fontSize: 13, color: '#444' }}>
          今後ここに在庫アラート・出荷状況・作業状況を表示します。
        </p>

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('active_tenant_id');
            router.replace('/');
          }}
          style={{ marginTop: 24, padding: '8px 16px' }}
        >
          ログアウト
        </button>
      </div>
    </main>
  );
}
