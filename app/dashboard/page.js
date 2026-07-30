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
    return (
      <p
        style={{
          textAlign: 'center',
          marginTop: 40,
          color: '#666',
        }}
      >
        Loading...
      </p>
    );
  }


  const cards = [
    {
      title: 'WMS',
      description: '倉庫管理システム',
      path: '/wms/delivery-note',
      subButtons: [
        {
          label: '📥 入庫登録 (PR)',
          path: '/wms/in',
          color: '#2e7d32',
        },
        {
          label: '📤 出庫管理 (DN)',
          path: '/wms/out',
          color: '#2b579a',
        },
      ],
    },

    {
      title: 'MES',
      description: '製造実行システム',
      path: '/mes',
    },

  {
    title: '取引先管理',
    description: 'カスタマー・サプライヤー情報管理',
    path: '/masters/party',
    subButtons: [
      {
        label: '👤 カスタマー',
        path: '/masters/customer',
        color: '#2563eb',
      },
      {
        label: '🏭 サプライヤー',
        path: '/masters/supplier',
        color: '#7c3aed',
      },
    ],
  },
];


  return (
    <main
      style={{
        padding: 32,
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f9fafb',
      }}
    >

      <header
        style={{
          marginBottom: 32,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >

        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              margin: 0,
              color: '#111827',
            }}
          >
            Ibuki Platform
          </h1>

          <p
            style={{
              marginTop: 8,
              color: '#4b5563',
              fontSize: 14,
            }}
          >
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
          }}
        >
          ログアウト
        </button>

      </header>



      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >

        {cards.map((card) => {

          const hasSubButtons =
            card.subButtons &&
            card.subButtons.length > 0;


          return (
            <div
              key={card.title}
              style={{
                padding: 24,
                borderRadius: 12,
                border: '1px solid #e5e7eb',
                background: '#fff',
                boxShadow:
                  '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 180,
              }}
            >

              <div>

                <h2
                  style={{
                    fontSize: 22,
                    margin: '0 0 8px',
                    color: '#111827',
                    fontWeight: 700,
                  }}
                >
                  {card.title}
                </h2>


                <p
                  style={{
                    margin: '0 0 16px',
                    fontSize: 14,
                    color: '#6b7280',
                    lineHeight: 1.5,
                  }}
                >
                  {card.description}
                </p>

              </div>



              <div>

                {hasSubButtons ? (

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1fr 1fr',
                      gap: 8,
                    }}
                  >

                    {card.subButtons?.map((btn) => (

                      <button
                        key={btn.label}
                        onClick={() =>
                          router.push(btn.path)
                        }
                        style={{
                          padding: '10px 8px',
                          borderRadius: 6,
                          border: 'none',
                          backgroundColor: btn.color,
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        {btn.label}
                      </button>

                    ))}

                  </div>

                ) : (

                  <button
                    onClick={() =>
                      router.push(card.path)
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 6,
                      border:
                        '1px solid #d1d5db',
                      backgroundColor: '#f9fafb',
                      color: '#374151',
                      fontWeight: 'bold',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
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
