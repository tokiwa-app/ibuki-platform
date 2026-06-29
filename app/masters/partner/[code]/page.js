'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code;

  const [partner, setPartner] = useState(null);
  const [form, setForm] = useState({
    name: '',
    customer_name: '',
    customer_group: '',
    territory: '',
    partner_type: '荷主',
    is_own_company: false,
    remarks: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await fetch(`/api/erpnext/customer/${code}`);
      const data = await res.json();

      const p = data?.data || data;
      setPartner(p);

      setForm({
        name: p?.name || '',
        customer_name: p?.customer_name || '',
        customer_group: p?.customer_group || '',
        territory: p?.territory || '',
        partner_type: p?.partner_type || '荷主',
        is_own_company: !!p?.is_own_company,
        remarks: p?.remarks || '',
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
      <button onClick={() => router.push('/masters/customer')} style={{ marginBottom: 24 }}>
        ← 取引先一覧へ戻る
      </button>

      <h1 style={{ fontSize: 28, marginBottom: 24 }}>
        取引先詳細
      </h1>

      <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
        <label>
          <div>取引先コード</div>
          <input value={form.name} disabled style={inputStyle} />
        </label>

        <label>
          <div>取引先名</div>
          <input
            value={form.customer_name}
            onChange={(e) => updateField('customer_name', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <div>取引先種別</div>
          <select
            value={form.partner_type}
            onChange={(e) => updateField('partner_type', e.target.value)}
            style={inputStyle}
          >
            <option value="自社">自社</option>
            <option value="荷主">荷主</option>
            <option value="協力会社">協力会社</option>
            <option value="運送会社">運送会社</option>
            <option value="仕入先">仕入先</option>
          </select>
        </label>

        <label>
          <div>地域</div>
          <input
            value={form.territory}
            onChange={(e) => updateField('territory', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={form.is_own_company}
            onChange={(e) => updateField('is_own_company', e.target.checked)}
          />
          自社として扱う
        </label>

        <label>
          <div>備考</div>
          <textarea
            value={form.remarks}
            onChange={(e) => updateField('remarks', e.target.value)}
            rows={4}
            style={inputStyle}
          />
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={save} disabled={saving} style={buttonStyle}>
            {saving ? '保存中...' : '保存'}
          </button>

          <button onClick={() => router.push(`/masters/partner/${code}/warehouses`)}>
            利用倉庫
          </button>

          <button onClick={() => router.push(`/masters/partner/${code}/items`)}>
            商品マスター
          </button>
        </div>
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
