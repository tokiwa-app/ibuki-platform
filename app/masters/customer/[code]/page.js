'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const fields = [
  {
    key: 'name',
    ja: '顧客コード',
    en: 'Customer',
    readonly: true,
    placeholder: '例：5',
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

function getWarehouseCode(customerCode) {
  return String(customerCode || '').padStart(4, '0');
}

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code;

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [warehouseCode, setWarehouseCode] = useState('');
  const [warehouse, setWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);

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

      const whCode = getWarehouseCode(data?.name || code);
      setWarehouseCode(whCode);

      setWarehouseLoading(true);

      try {
        const whRes = await fetch(`/api/erpnext/warehouse/${whCode}`);

        if (whRes.ok) {
          const whData = await whRes.json();
          setWarehouse(whData);

          const childrenRes = await fetch(
            `/api/erpnext/warehouse?parent_warehouse=${encodeURIComponent(
              whCode
            )}`
          );

          if (childrenRes.ok) {
            const childrenData = await childrenRes.json();
            setWarehouses(childrenData?.data || childrenData || []);
          } else {
            setWarehouses([]);
          }
        } else {
          setWarehouse(null);
          setWarehouses([]);
        }
      } catch (error) {
        setWarehouse(null);
        setWarehouses([]);
      } finally {
        setWarehouseLoading(false);
      }

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
        onClick={() => router.push('/masters/customer')}
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
            onChange={(e) =>
              updateField('is_frozen', e.target.checked ? 1 : 0)
            }
          />
          凍結 / Is Frozen
        </label>

        <button onClick={save} disabled={saving} style={buttonStyle}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <section style={{ marginTop: 40, maxWidth: 760 }}>
        <h2 style={{ fontSize: 22, marginBottom: 8 }}>関連倉庫</h2>

        <p style={{ color: '#666', marginBottom: 16 }}>
          顧客コードを4桁ゼロ埋めした倉庫コードと、その配下倉庫を表示します。
        </p>

        <div style={warehouseBoxStyle}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#777' }}>Warehouse Code</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              {warehouseCode}
            </div>
          </div>

          {warehouseLoading ? (
            <div>倉庫を確認中...</div>
          ) : warehouse ? (
            <>
              <div
                style={{
                  marginBottom: 16,
                  color: '#15803d',
                  fontWeight: 600,
                }}
              >
                ✅ 親倉庫あり
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>倉庫コード</th>
                    <th style={thStyle}>倉庫名</th>
                    <th style={thStyle}>親倉庫</th>
                    <th style={thStyle}>状態</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td style={tdStyle}>{warehouse.name}</td>
                    <td style={tdStyle}>
                      {warehouse.warehouse_name || warehouse.name}
                    </td>
                    <td style={tdStyle}>-</td>
                    <td style={tdStyle}>
                      {warehouse.disabled ? '無効' : '有効'}
                    </td>
                  </tr>

                  {warehouses.map((wh) => (
                    <tr key={wh.name}>
                      <td style={tdStyle}>{wh.name}</td>
                      <td style={tdStyle}>
                        {wh.warehouse_name || wh.name}
                      </td>
                      <td style={tdStyle}>
                        {wh.parent_warehouse || warehouseCode}
                      </td>
                      <td style={tdStyle}>
                        {wh.disabled ? '無効' : '有効'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {warehouses.length === 0 && (
                <div style={{ marginTop: 12, color: '#777' }}>
                  配下倉庫はありません。
                </div>
              )}
            </>
          ) : (
            <div style={{ color: '#b91c1c', fontWeight: 600 }}>
              ❌ 倉庫 {warehouseCode} は未作成です
            </div>
          )}
        </div>
      </section>
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

const warehouseBoxStyle = {
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: 16,
  background: '#fafafa',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
};

const thStyle = {
  textAlign: 'left',
  padding: 10,
  borderBottom: '1px solid #ddd',
  fontSize: 13,
  color: '#555',
};

const tdStyle = {
  padding: 10,
  borderBottom: '1px solid #eee',
  fontSize: 14,
};
