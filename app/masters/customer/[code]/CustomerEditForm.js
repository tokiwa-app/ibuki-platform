'use client';

import { useState } from 'react';

const fields = [
  { key: 'name', label: '顧客コード', readonly: true, placeholder: '例：5' },
  { key: 'customer_type', label: '顧客種別', placeholder: '例：Company' },
  { key: 'customer_name', label: '顧客名', placeholder: '例：株式会社シブタニ' },
  { key: 'territory', label: '地域', placeholder: '例：Japan' },
  { key: 'customer_group', label: '顧客グループ', placeholder: '例：Commercial' },
  { key: 'website', label: 'Webサイト', placeholder: '例：https://example.co.jp/' },
  { key: 'tax_id', label: '税番号', placeholder: '例：T1234567890123' },
  { key: 'billing_currency', label: '請求通貨', placeholder: '例：JPY' },
  { key: 'tax_category', label: '税区分', placeholder: '例：課税事業者' },
  { key: 'default_price_list', label: '価格表', placeholder: '例：Standard Selling' },
  {
    key: 'payment_terms',
    label: '支払条件',
    placeholder: '例：月末締め翌月末払い',
    fullWidth: true,
  },
];

export default function CustomerEditForm({ code, form, setForm }) {
  const [saving, setSaving] = useState(false);

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

  return (
    <section style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>顧客基本情報</h2>
          <p style={sectionTextStyle}>Customer情報を編集します。</p>
        </div>

        <button onClick={save} disabled={saving} style={buttonStyle}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div style={formGridStyle}>
        {fields.map((field) => (
          <label
            key={field.key}
            style={{
              ...fieldStyle,
              gridColumn: field.fullWidth ? '1 / -1' : undefined,
            }}
          >
            <div style={labelStyle}>{field.label}</div>

            <input
              value={form[field.key] || ''}
              disabled={field.readonly}
              placeholder={field.placeholder}
              onChange={(e) => updateField(field.key, e.target.value)}
              style={{
                ...inputStyle,
                background: field.readonly ? '#f3f4f6' : '#fff',
              }}
            />
          </label>
        ))}

        <div style={checkboxRowStyle}>
          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={!!form.disabled}
              onChange={(e) =>
                updateField('disabled', e.target.checked ? 1 : 0)
              }
            />
            無効 / Disabled
          </label>

          <label style={checkboxLabelStyle}>
            <input
              type="checkbox"
              checked={!!form.is_frozen}
              onChange={(e) =>
                updateField('is_frozen', e.target.checked ? 1 : 0)
              }
            />
            凍結 / Is Frozen
          </label>
        </div>
      </div>
    </section>
  );
}

const cardStyle = {
  maxWidth: 980,
  padding: 24,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

const sectionHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 24,
};

const sectionTitleStyle = {
  fontSize: 20,
  margin: 0,
};

const sectionTextStyle = {
  color: '#6b7280',
  margin: '4px 0 0',
  fontSize: 14,
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '16px 20px',
};

const fieldStyle = {
  display: 'grid',
  gap: 6,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  boxSizing: 'border-box',
};

const checkboxRowStyle = {
  gridColumn: '1 / -1',
  display: 'flex',
  gap: 24,
  paddingTop: 4,
};

const checkboxLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 14,
  color: '#374151',
};

const buttonStyle = {
  padding: '10px 20px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
};
