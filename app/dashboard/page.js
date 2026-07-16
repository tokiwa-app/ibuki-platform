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
    return <p style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>Loading...</p>;
  }

  // メインの機能カード（最大6枠まで綺麗にグリッドに収まります）
  const cards = [
    {
      title: 'WMS',
      description: '倉庫管理システム',
      // WMSカード自体をクリックしたときは、デフォルトとして出庫画面に遷移させます
      path: '/wms/delivery-note', 
      // カード内に個別の作業ボタンを配置するための設定
      subButtons: [
        { label: '📥 入庫登録 (PR)', path: '/wms/purchase-receipt', color: '#2e7d32' },
        { label: '📤 出庫管理 (DN)', path: '/wms/delivery-note', color: '#2b579a' },
      ]
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
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#111827' }}>
            Ibuki Platform
          </h1>
          <p style={{ marginTop: 8, color: '#4b5563', fontSize: 14 }}>
            利用する機能またはメニューを選択してください。
          </p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            localStorage.removeItem('active_tenant_id');
            router.replace('/');
          }}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            color: '#ef4444',
            border: '1px solid #fee2e2',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 'bold',
            transition: 'all 0.15s ease',
          }}
        >
          ログアウト
        </button>
      </header>

      {/* グリッドレイアウト（3カラム固定から、最大6枚でも美しく折り返すレスポンシブ構成） */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        {cards.map((card) => {
          const hasSubButtons = card.subButtons && card.subButtons.length > 0;

          return (
            <div
              key={card.title}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                background: '#fff',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 180,
              }}
            >
              {/* カード上部：タイトルと説明 */}
              <div>
                <h2 style={{ fontSize: 22, margin: '0 0 8px', color: '#111827', fontWeight: 700 }}>
                  {card.title}
                </h2>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                  {card.description}
                </p>
              </div>

              {/* カード下部：ボタンエリア */}
              <div>
                {hasSubButtons ? (
                  // WMS用の内包ボタン
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {card.subButtons?.map((btn) => (
                      <button
                        key={btn.label}
                        onClick={() => router.push(btn.path)}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: btn.color,
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 12,
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  // 通常の全画面遷移ボタン
                  <button
                    onClick={() => router.push(card.path)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border: '1px solid #d1d5db',
                      backgroundColor: '#f9fafb',
                      color: '#374151',
                      fontWeight: 'bold',
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  >
                    開く ➔
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
