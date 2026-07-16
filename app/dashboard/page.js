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

  const cards = [
    {
      title: 'WMS',
      description: '入出庫・在庫・倉庫業務',
      path: '/wms/delivery-note',
    },
    {
      title: 'HMS',
      description: 'ハンディ・現場作業管理',
      path: '/hms',
    },
    {
      title: 'マスター管理',
      description: '顧客・商品・倉庫などの共通マスター',
      path: '/masters',
    },
  ];

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          Ibuki Platform
        </h1>
        <p style={{ marginTop: 8, color: '#666' }}>
          利用する機能を選択してください。
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <button
            key={card.title}
            onClick={() => router.push(card.path)}
            style={{
              textAlign: 'left',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <h2 style={{ fontSize: 22, margin: '0 0 8px' }}>{card.title}</h2>
            <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
              {card.description}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          localStorage.removeItem('active_tenant_id');
          router.replace('/');
        }}
        style={{ marginTop: 32, padding: '8px 16px' }}
      >
        ログアウト
      </button>
    </main>
  );
}
