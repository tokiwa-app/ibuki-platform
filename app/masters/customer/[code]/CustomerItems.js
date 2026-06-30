'use client';

import { useEffect, useState } from 'react';

const COMPANY_ABBR = 'T';

function getCustomerCode(customerCode) {
  return String(customerCode || '').padStart(4, '0');
}

function getDefaultWarehouses(customerCode) {
  const code = getCustomerCode(customerCode);

  return [
    `${code}-hirakata-normal - ${COMPANY_ABBR}`,
    `${code}-hirakata-ng - ${COMPANY_ABBR}`,
    `${code}-hirakata-work-required - ${COMPANY_ABBR}`,
  ];
}

export default function CustomerItems({ customerCode }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const code = getCustomerCode(customerCode);
  const warehouseOptions = getDefaultWarehouses(customerCode);

  const [newItem, setNewItem] = useState({
    customer_item_code: '',
    item_name: '',
    stock_uom: 'Nos',
    item_group: 'Products',
    default_warehouse: warehouseOptions[0],
  });

  async function loadItems() {
    if (!code) return;

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
    setNewItem((prev) => ({
      ...prev,
      default_warehouse: warehouseOptions[0],
    }));

    loadItems();
  }, [customerCode]);

  function updateNewItem(key, value) {
    setNewItem((prev) => ({ ...prev, [key]: value }));
  }

  async function createItem() {
    if (!newItem.customer_item_code.trim()) {
      alert('顧客側の商品コードを入力してください');
      return;
    }

    if (!newItem.item_name.trim()) {
      alert('商品名を入力してください');
      return;
    }

    setCreating(true);

    const res = await fetch('/api/erpnext/item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_code: code,
        ...newItem,
      }),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || 'Item作成に失敗しました');
      return;
    }

    alert('Itemを作成しました');

    setNewItem({
      customer_item_code: '',
      item_name: '',
      stock_uom: 'Nos',
      item_group: 'Products',
      default_warehouse: warehouseOptions[0],
    });

    await loadItems();
  }

  return (
    <section style={cardStyle}>
      <div style={sectionHeaderStyle}>
        <div>
          <h2 style={sectionTitleStyle}>関連アイテム</h2>
          <p style={sectionTextStyle}>
            顧客別の商品マスターを作成・確認します。
          </p>
        </div>
      </div>

      <div style={createBoxStyle}>
        <div style={formGridStyle}>
          <label style={fieldStyle}>
            <div style={labelStyle}>顧客側の商品コード</div>
            <input
              value={newItem.customer_item_code}
              placeholder="例：ABC001"
              onChange={(e) =>
                updateNewItem('customer_item_code', e.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            <div style={labelStyle}>商品名</div>
            <input
              value={newItem.item_name}
              placeholder="例：商品A"
              onChange={(e) => updateNewItem('item_name', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            <div style={labelStyle}>単位</div>
            <input
              value={newItem.stock_uom}
              placeholder="例：Nos"
              onChange={(e) => updateNewItem('stock_uom', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            <div style={labelStyle}>Item Group</div>
            <input
              value={newItem.item_group}
              placeholder="例：Products"
              onChange={(e) => updateNewItem('item_group', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ ...fieldStyle, gridColumn: '1 / -1' }}>
            <div style={labelStyle}>Default Warehouse</div>
            <select
              value={newItem.default_warehouse}
              onChange={(e) =>
                updateNewItem('default_warehouse', e.target.value)
              }
              style={inputStyle}
            >
              {warehouseOptions.map((warehouse) => (
                <option key={warehouse} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={createItem} disabled={creating} style={buttonStyle}>
            {creating ? '作成中...' : 'Itemを作成'}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <div>Itemを読み込み中...</div>
        ) : items.length > 0 ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Item Code</th>
                <th style={thStyle}>Item Name</th>
                <th style={thStyle}>Default Warehouse</th>
                <th style={thStyle}>状態</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.name}>
                  <td style={tdStyle}>{item.item_code || item.name}</td>
                  <td style={tdStyle}>{item.item_name}</td>
                  <td style={tdStyle}>
                    {item.default_warehouse || '-'}
                  </td>
                  <td style={tdStyle}>{item.disabled ? '無効' : '有効'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={emptyStyle}>まだItemはありません。</div>
        )}
      </div>
    </section>
  );
}

const cardStyle = {
  maxWidth: 980,
  marginTop: 40,
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
  marginBottom: 20,
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

const createBoxStyle = {
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 10,
  background: '#f9fafb',
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
  background: '#fff',
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

const emptyStyle = {
  padding: 16,
  color: '#6b7280',
  border: '1px dashed #d1d5db',
  borderRadius: 10,
};
