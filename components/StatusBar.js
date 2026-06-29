// components/StatusBar.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TENANT_KEY = 'active_tenant_id';

export default function StatusBar({ sidebarOpen, setSidebarOpen }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTenantId, setActiveTenantId] = useState('');

  useEffect(() => {
    // Tenant は「表示専用」：localStorageから即読み（読込中などにしない）
    if (typeof window !== 'undefined') {
      setActiveTenantId(localStorage.getItem(TENANT_KEY) || '');
    }

    // メールアドレスと同じ扱い：authセッションから取得
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);
      setLoading(false);
    })();

    // ログイン/ログアウトの監視（tenantはここでは決めない）
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      // tenant はログイン時に確定してある前提だが、念のため再読込して表示更新
      if (typeof window !== 'undefined') {
        setActiveTenantId(localStorage.getItem(TENANT_KEY) || '');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TENANT_KEY);
    }
    location.href = '/';
  }

  return (
    <header
      style={{
        width: '100%',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 13,
        background: '#fff',
        borderBottom: '1px solid #ddd',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          padding: '4px 8px',
          borderRadius: 4,
          border: '1px solid #ccc',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        {sidebarOpen ? '－' : '＋'}
      </button>

      <div style={{ fontWeight: 600, flex: 1 }}>
        Ibuki ERP System
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* ✅ Tenantは表示専用（切替しない） */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#666', fontSize: 12 }}>Tenant</span>
            <span
              style={{
                color: '#333',
                fontSize: 12,
                padding: '2px 6px',
                borderRadius: 4,
                border: '1px solid #eee',
                background: '#f9f9f9',
                minWidth: 80,
                textAlign: 'center',
              }}
            >
              {activeTenantId || '—'}
            </span>
          </div>
        )}

        {loading ? (
          <span style={{ color: '#666' }}>ログイン情報取得中...</span>
        ) : user ? (
          <>
            <span style={{ color: '#333' }}>{user.email}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '4px 10px',
                fontSize: 12,
                borderRadius: 4,
                border: '1px solid #ccc',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              ログアウト
            </button>
          </>
        ) : (
          <span style={{ color: '#999' }}>未ログイン</span>
        )}
      </div>
    </header>
  );
}
