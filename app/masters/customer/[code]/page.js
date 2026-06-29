'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const fields = [
  {
    key: 'name',
    ja: '顧客コード',
    en: 'Customer',
    readonly: true,
    placeholder: '例：0001',
    help: 'ERPNext上のCustomer IDです。',
  },
  {
    key: 'customer_name',
    ja: '顧客名',
    en: 'Customer Name',
    placeholder: '例：株式会社シブタニ',
    help: '会社名または個人名を入力します。',
  },
  {
    key: 'customer_type',
    ja: '顧客種別',
    en: 'Customer Type',
    placeholder: '例：Company',
    help: '法人ならCompany、個人ならIndividualです。',
  },
  {
    key: 'customer_group',
    ja: '顧客グループ',
    en: 'Customer Group',
    placeholder: '例：Commercial',
    help: 'ERPNextのCustomer Groupです。',
  },
  {
    key: 'territory',
    ja: '地域',
    en: 'Territory',
    placeholder: '例：Japan',
    help: '営業地域・国・エリアです。',
  },
  {
    key: 'tax_id',
    ja: '税番号（インボイス登録番号）',
    en: 'Tax ID',
    placeholder: '例：T1234567890123',
    help: '日本では主に適格請求書発行事業者登録番号を入力します。',
  },
  {
    key: 'tax_category',
    ja: '税区分',
    en: 'Tax Category',
    placeholder: '例：課税事業者',
    help: 'ERPNextのTax Categoryです。',
  },
  {
    key: 'billing_currency',
    ja: '請求通貨',
    en: 'Billing Currency',
    placeholder: '例：JPY',
    help: '日本円ならJPYです。',
  },
  {
    key: 'default_price_list',
    ja: '価格表',
    en: 'Price List',
    placeholder: '例：Standard Selling',
    help: '販売時に使う標準価格表です。',
  },
  {
    key: 'payment_terms',
    ja: '支払条件テンプレート',
    en: 'Payment Terms Template',
    placeholder: '例：月末締め翌月末払い',
    help: 'ERPNextのPayment Terms Templateです。',
  },
  {
    key: 'website',
    ja: 'Webサイト',
    en: 'Website',
    placeholder: '例：https://example.co.jp/',
    help: '取引先のWebサイトURLです。',
  },
];

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code;

  const [form, setForm] = useState({});
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

      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Customer</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        ERPNext標準のCustomer情報を編集します。
      </p>

      <div style={{ display: 'grid', gap: 18, maxWidth: 760 }}>
        {fields.map((field) => (
          <label key={field.key}>
            <div style={{ fontWeight: 600 }}>{field.ja}</div>
            <div style={{ fontSize: 12, color: '#777', marginBottom: 4 }}>
              {field.en}
            </div>

            <input
              value={form[field.key] || ''}
              disabled={field.readonly}
              placeholder={field.placeholder}
              onChange={(e) => updateField(field.key, e.target.value)}
              style={inputStyle}
            />

            <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
              {field.help}
            </div>
          </label>
        ))}

        <label>
          <input
            type="checkbox"
            checked={!!form.disabled}
            onChange={(e) => updateField('disabled', e.target.checked ? 1 : 0)}
          />
          無効 / Disabled
        </label>

        <label>
          <input
            type="checkbox"
            checked={!!form.is_frozen}
            onChange={(e) => updateField('is_frozen', e.target.checked ? 1 : 0)}
          />
          凍結 / Is Frozen
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
