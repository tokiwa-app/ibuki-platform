'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CustomerEditForm from './CustomerEditForm';
import CustomerWarehouses from './CustomerWarehouses';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code;

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadCustomer() {
    setLoading(true);

    const res = await fetch(`/api/erpnext/customer/${code}`);
    const data = await res.json();

    setForm({
      name: data?.name || '',
      customer_name: data?.customer_name || '',
      customer_type: data?.customer_type || '',
      customer_group: data?.customer_group || '',
      territory: data?.territory || '',
      tax_id: data?.tax_id || '',
      tax_category: data?.tax_category || '',
      billing_currency: data?.billing_currency || '',
      default_price_list: data?.default_price_list || '',
      payment_terms: data?.payment_terms || '',
      website: data?.website || '',
      disabled: data?.disabled || 0,
      is_frozen: data?.is_frozen || 0,
    });

    setLoading(false);
  }

  useEffect(() => {
    if (code) loadCustomer();
  }, [code]);

  if (loading) {
    return <main style={{ padding: 32 }}>Loading...</main>;
  }

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <button
        onClick={() => router.push('/masters/customer')}
        style={{ marginBottom: 24 }}
      >
        ← Customer一覧へ戻る
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Customer</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        ERPNext標準のCustomer情報を編集します。
      </p>

      <CustomerEditForm code={code} form={form} setForm={setForm} />

      <CustomerWarehouses customerCode={form.name || code} />
    </main>
  );
}
