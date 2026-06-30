'use client';

import { useRouter } from 'next/navigation';

export default function MastersPage() {
  const router = useRouter();

  const masters = [
    {
      title: '顧客',
      description: 'ERPNext customer',
      path: '/masters/customer',
    },

  ];

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <button
        onClick={() => router.push('/dashboard')}
        style={{ marginBottom: 24 }}
      >
        ← ダッシュボードへ戻る
      </button>

      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          マスター管理
        </h1>
        <p style={{ marginTop: 8, color: '#666' }}>
          ERPNext DocType
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        {masters.map((master) => (
          <button
            key={master.title}
            onClick={() => router.push(master.path)}
            style={{
              textAlign: 'left',
              padding: 24,
              borderRadius: 12,
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>
              {master.title}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
              {master.description}
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}
