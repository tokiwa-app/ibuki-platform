'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const TENANT_KEY = 'active_tenant_id';

export default function Home() {
  const router = useRouter();

  const [busy, setBusy] = useState(true);
  const [msg, setMsg] = useState('');
  const [step, setStep] = useState('login');

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');

  useEffect(() => {
    document.title = 'Ibuki Platform';

    async function initialize() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!session?.user?.id) {
          setBusy(false);
          return;
        }

        await loadTenants(session.user.email);
      } catch (error) {
        console.error(error);
        setMsg('ログイン状態の確認に失敗しました');
        setBusy(false);
      }
    }

    initialize();
  }, []);

async function loadTenants(email) {
  setBusy(true);
  setMsg('');

  try {
    const { data, error } = await supabase
      .from('user_tenants')
      .select('tenant_id')
      .eq('email', email)
      .order('tenant_id', { ascending: true });

    ...

      if (error) {
        throw error;
      }

      const tenantList = data ?? [];

      if (tenantList.length === 0) {
        localStorage.removeItem(TENANT_KEY);
        setMsg(
          'このGoogleアカウントに利用可能なテナントが登録されていません。'
        );
        setStep('login');
        return;
      }

      if (tenantList.length === 1) {
        saveTenantAndGo(tenantList[0].tenant_id);
        return;
      }

      const savedTenantId = localStorage.getItem(TENANT_KEY) ?? '';

      const savedTenantIsValid = tenantList.some(
        (tenant) => tenant.tenant_id === savedTenantId
      );

      setTenants(tenantList);
      setSelectedTenant(
        savedTenantIsValid
          ? savedTenantId
          : tenantList[0].tenant_id
      );
      setStep('tenant');
    } catch (error) {
      console.error(error);
      setMsg('テナント情報の取得に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  function saveTenantAndGo(tenantId) {
    if (!tenantId) {
      setMsg('テナントを選択してください');
      return;
    }

    localStorage.setItem(TENANT_KEY, tenantId);
    router.replace('/dashboard');
  }

  async function signInWithGoogle() {
    setBusy(true);
    setMsg('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(error);
      setMsg(`Googleログインに失敗しました: ${error.message}`);
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setMsg('');

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      localStorage.removeItem(TENANT_KEY);
      setTenants([]);
      setSelectedTenant('');
      setStep('login');
    } catch (error) {
      console.error(error);
      setMsg(`ログアウトに失敗しました: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        width: 'calc(100% - 32px)',
        maxWidth: 480,
        margin: '48px auto',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 'clamp(3rem, 12vw, 5rem)',
          fontWeight: 700,
          marginTop: 8,
          marginBottom: 24,
          letterSpacing: '1px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <span
          style={{
            fontFamily: "'M PLUS Rounded 1c', system-ui, sans-serif",
            fontWeight: 800,
            letterSpacing: '0.5px',
          }}
        >
          Ibuki
        </span>

        <span
          style={{
            fontFamily: "'Noto Sans HK', system-ui, sans-serif",
            fontStyle: 'italic',
            fontWeight: 600,
            letterSpacing: 0,
            transform: 'translateY(-3px)',
          }}
        >
          Platform
        </span>
      </h1>

      <img
        src="/ibuki-header.png"
        alt="Ibuki Platform"
        style={{
          width: '100%',
          maxWidth: 420,
          height: 'auto',
          margin: '0 auto 32px',
          display: 'block',
        }}
      />

      {busy && step === 'login' ? (
        <p style={{ color: '#555' }}>ログイン状態を確認しています…</p>
      ) : step === 'login' ? (
        <>
          <p
            style={{
              color: '#555',
              marginBottom: 20,
            }}
          >
            Googleアカウントを使用してログインしてください。
          </p>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 16,
              fontWeight: 600,
              color: '#202124',
              backgroundColor: '#fff',
              border: '1px solid #dadce0',
              borderRadius: 6,
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.7 : 1,
              boxSizing: 'border-box',
            }}
          >
            {busy ? 'Googleへ移動しています…' : 'Googleでログイン'}
          </button>
        </>
      ) : (
        <>
          <p
            style={{
              color: '#555',
              marginBottom: 16,
            }}
          >
            利用するテナントを選択してください。
          </p>

          <select
            value={selectedTenant}
            onChange={(event) =>
              setSelectedTenant(event.target.value)
            }
            disabled={busy}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 16,
              marginBottom: 12,
              boxSizing: 'border-box',
            }}
          >
            {tenants.map((tenant) => (
              <option
                key={tenant.tenant_id}
                value={tenant.tenant_id}
              >
                {tenant.tenant_id}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => saveTenantAndGo(selectedTenant)}
            disabled={busy || !selectedTenant}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 16,
              cursor:
                busy || !selectedTenant
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {busy ? '処理中…' : 'このテナントで続行'}
          </button>

          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            style={{
              width: '100%',
              padding: 10,
              fontSize: 14,
              marginTop: 8,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            別のGoogleアカウントを使う
          </button>
        </>
      )}

      {msg && (
        <p
          role="alert"
          style={{
            color: '#c00',
            marginTop: 16,
            whiteSpace: 'pre-wrap',
          }}
        >
          {msg}
        </p>
      )}
    </main>
  );
}
