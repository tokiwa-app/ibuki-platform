// app/page.js
'use client';
import Head from 'next/head';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const TENANT_KEY = 'active_tenant_id';

export default function Home() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const [step, setStep] = useState('login'); // 'login' | 'tenant'
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');

  function saveTenantAndGo(tenantId) {
    if (typeof window !== 'undefined') {
      if (tenantId) localStorage.setItem(TENANT_KEY, tenantId);
      else localStorage.removeItem(TENANT_KEY);
    }
    location.href = '/dashboard';
  }

  async function onForgotPassword() {
    setBusy(true);
    setMsg('');

    const { error } = await supabase.auth.resetPasswordForEmail(loginId, {
      redirectTo: 'https://ibuki-platform.vercel.app/reset-password',
    });

    setBusy(false);
    setMsg(error ? `送信失敗: ${error.message}` : 'リセットメールを送信しました');
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginId,
      password,
    });

    if (error) {
      setMsg('メールアドレスまたはパスワードが正しくありません');
      setBusy(false);
      return;
    }

    const uid = data?.user?.id;
    if (!uid) {
      setMsg('ログインに失敗しました（ユーザー情報が取得できません）');
      setBusy(false);
      return;
    }

    try {
      const { data: list, error: tErr } = await supabase
        .from('user_tenants')
        .select('tenant_id')
        .eq('user_id', uid)
        .order('tenant_id', { ascending: true });

      if (tErr) throw tErr;

      const arr = list ?? [];
      if (arr.length === 0) {
        setMsg('利用可能なテナントがありません');
        setBusy(false);
        return;
      }

      if (arr.length === 1) {
        saveTenantAndGo(arr[0].tenant_id);
        return;
      }

      setTenants(arr);

      const saved =
        typeof window !== 'undefined' ? localStorage.getItem(TENANT_KEY) || '' : '';
      const savedValid = saved && arr.some((t) => t.tenant_id === saved);
      setSelectedTenant(savedValid ? saved : arr[0].tenant_id);

      setStep('tenant');
    } catch (e2) {
      console.error(e2);
      setMsg('テナント取得に失敗しました');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '48px auto',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+HK:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <title>Ibuki Platform</title>
      </Head>

      <h1
        style={{
          fontSize: '5.0rem',
          fontWeight: 700,
          marginTop: 8,
          marginBottom: 24,
          letterSpacing: '1px',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <span style={{ fontFamily: "'M PLUS Rounded 1c'", fontWeight: 800, letterSpacing: '0.5px' }}>
          Ibuki
        </span>
        <span
          style={{
            fontFamily: "'Noto Sans HK'",
            fontStyle: 'italic',
            fontWeight: 600,
            letterSpacing: '0px',
            transform: 'translateY(-3px)',
          }}
        >
          Platform
        </span>
      </h1>

      <img
        src="/ibuki-header.png"
        alt="ibuki platform"
        style={{ width: '100%', maxWidth: 420, margin: '0 auto 32px', display: 'block' }}
      />

      {step === 'login' ? (
        <>
          <p style={{ color: '#555', marginBottom: 16 }}>
            メールアドレスとパスワードを入力してログインしてください。
          </p>

          <form onSubmit={onSubmit}>
            <input
              type="email"
              placeholder="mail@example.com"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 8, boxSizing: 'border-box' }}
            />

            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 12, boxSizing: 'border-box' }}
            />

            <button type="submit" disabled={busy || !loginId || !password} style={{ width: '100%', padding: 10, fontSize: 16 }}>
              {busy ? '送信中…' : 'ログイン'}
            </button>
          </form>

          <button
            type="button"
            onClick={onForgotPassword}
            disabled={busy || !loginId}
            style={{ width: '100%', padding: 10, fontSize: 14, marginTop: 8 }}
          >
            パスワードを忘れた
          </button>
        </>
      ) : (
        <>
          <p style={{ color: '#555', marginBottom: 16 }}>テナントを選択して続行してください。</p>

          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            style={{ width: '100%', padding: 10, fontSize: 16, marginBottom: 12, boxSizing: 'border-box' }}
          >
            {tenants.map((t) => (
              <option key={t.tenant_id} value={t.tenant_id}>
                {t.tenant_id}
              </option>
            ))}
          </select>

          <button
            onClick={() => saveTenantAndGo(selectedTenant)}
            disabled={busy || !selectedTenant}
            style={{ width: '100%', padding: 10, fontSize: 16 }}
          >
            {busy ? '処理中…' : 'このテナントで続行'}
          </button>
        </>
      )}

      {msg && <p style={{ color: '#c00', marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
