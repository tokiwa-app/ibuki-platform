'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code;

  const [form, setForm] = useState({
    name: '',
    customer_name: '',
    customer_type: '',
    customer_group: '',
    territory: '',
    tax_id: '',
    tax_category: '',
    billing_currency: '',
    default_price_list: '',
    payment_terms: '',
    website: '',
    disabled: 0,
    is_frozen: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
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

    if (code) load();
  }, [code]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);

    const res = await fetch(`/api/erpnext/customer/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      alert('保存に失敗しました');
      return;
    }

    alert('保存しました');
  }

  if (loading) {
    return <main style={{ padding: 32 }}>Loading...</main>;
  }

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <button
        onClick={() => router.push('/masters/Customer')}
        style={{ marginBottom: 24 }}
      >
        ← Customer一覧へ戻る
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 24 }}>Customer</h1>

      <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
        <label>
          <div>Customer</div>
          <input value={form.name} disabled style={inputStyle} />
        </label>

        <label>
          <div>Customer Name</div>
          <input
            value={form.customer_name}
            onChange={(e) => updateField('customer_name', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Customer Type</div>
          <input
            value={form.customer_type}
            onChange={(e) => updateField('customer_type', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Customer Group</div>
          <input
            value={form.customer_group}
            onChange={(e) => updateField('customer_group', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Territory</div>
          <input
            value={form.territory}
            onChange={(e) => updateField('territory', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Tax ID</div>
          <input
            value={form.tax_id}
            onChange={(e) => updateField('tax_id', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Tax Category</div>
          <input
            value={form.tax_category}
            onChange={(e) => updateField('tax_category', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Billing Currency</div>
          <input
            value={form.billing_currency}
            onChange={(e) => updateField('billing_currency', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Price List</div>
          <input
            value={form.default_price_list}
            onChange={(e) => updateField('default_price_list', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Payment Terms Template</div>
          <input
            value={form.payment_terms}
            onChange={(e) => updateField('payment_terms', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>Website</div>
          <input
            value={form.website}
            onChange={(e) => updateField('website', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={!!form.disabled}
            onChange={(e) => updateField('disabled', e.target.checked ? 1 : 0)}
          />
          Disabled
        </label>

        <label>
          <input
            type="checkbox"
            checked={!!form.is_frozen}
            onChange={(e) => updateField('is_frozen', e.target.checked ? 1 : 0)}
          />
          Is Frozen
        </label>

        <button onClick={save} disabled={saving} style={buttonStyle}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: 10,
  border: '1px solid #ccc',
  borderRadius: 6,
  marginTop: 4,
};

const buttonStyle = {
  padding: '10px 20px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
};
