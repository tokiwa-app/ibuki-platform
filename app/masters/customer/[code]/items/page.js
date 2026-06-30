'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

function getCustomerCode(customerCode) {
  return String(customerCode || '').padStart(4, '0');
}

export default function CustomerItemsPage() {
  const router = useRouter();
  const params = useParams();
  const code = getCustomerCode(params?.code);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadItems() {
    setLoading(true);

    const res = await fetch(`/api/erpnext/item?customer_code=${code}`);

    if (res.ok) {
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } else {
      setItems([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (code) loadItems();
  }, [code]);

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <button
        onClick={() => router.push(`/masters/customer/${params?.code}`)}
        style={{ marginBottom: 24 }}
      >
        ← Customerへ戻る
      </button>

      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>関連アイテム</h1>
          <p style={textStyle}>顧客 {code} に紐づく商品マスターです。</p>
        </div>

        <button
          onClick={() => router.push(`/masters/customer/${code}/items/new`)}
          style={buttonStyle}
        >
          Itemを作成
        </button>
      </header>

      <section style={cardStyle}>
        {loading ? (
          <div>Itemを読み込み中...</div>
        ) : items.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Item Code</th>
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Item Group</th>
                <th style={thStyle}>Stock UOM</th>
                <th style={thStyle}>Default Warehouse</th>
                <th style={thStyle}>状態</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  key={item.name}
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    router.push(
                      `/masters/customer/${code}/items/${encodeURIComponent(
                        item.name
                      )}`
                    )
                  }
                >
                  <td style={tdStyle}>{item.item_code || item.name}</td>
                  <td style={tdStyle}>{item.item_name}</td>
                  <td style={tdStyle}>{item.item_group || '-'}</td>
                  <td style={tdStyle}>{item.stock_uom || '-'}</td>
                  <td style={tdStyle}>{item.default_warehouse || '-'}</td>
                  <td style={tdStyle}>{item.disabled ? '無効' : '有効'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={emptyStyle}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              まだItemはありません。
            </div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              右上の「Itemを作成」から、この顧客用の商品マスターを登録できます。
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

const headerStyle = {
  maxWidth: 1100,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 24,
};

const titleStyle = {
  fontSize: 28,
  fontWeight: 700,
  margin: 0,
};

const textStyle = {
  marginTop: 8,
  color: '#666',
};

const cardStyle = {
  maxWidth: 1100,
  padding: 24,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
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

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#fff',
};

const thStyle = {
  textAlign: 'left',
  padding: 12,
  borderBottom: '1px solid #ddd',
  fontSize: 13,
  color: '#555',
};

const tdStyle = {
  padding: 12,
  borderBottom: '1px solid #eee',
  fontSize: 14,
};

const emptyStyle = {
  padding: 24,
  border: '1px dashed #d1d5db',
  borderRadius: 10,
  background: '#f9fafb',
};
