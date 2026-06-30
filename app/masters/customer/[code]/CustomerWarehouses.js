'use client';

import { useEffect, useState } from 'react';

function getWarehouseCode(customerCode) {
  return String(customerCode || '').padStart(4, '0');
}

async function fetchChildrenRecursive(parentWarehouseName, level = 1) {
  const res = await fetch(
    `/api/erpnext/warehouse?parent_warehouse=${encodeURIComponent(
      parentWarehouseName
    )}`
  );

  if (!res.ok) {
    return [];
  }

  const children = await res.json();
  const list = Array.isArray(children) ? children : children?.data || [];

  const result = [];

  for (const child of list) {
    result.push({
      ...child,
      level,
    });

    if (child.is_group) {
      const descendants = await fetchChildrenRecursive(child.name, level + 1);
      result.push(...descendants);
    }
  }

  return result;
}

export default function CustomerWarehouses({ customerCode }) {
  const [warehouseCode, setWarehouseCode] = useState('');
  const [warehouse, setWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [creatingWarehouses, setCreatingWarehouses] = useState(false);

  async function loadWarehouses() {
    const whCode = getWarehouseCode(customerCode);
    setWarehouseCode(whCode);

    if (!whCode) return;

    setWarehouseLoading(true);

    try {
      const whRes = await fetch(`/api/erpnext/warehouse/${whCode}`);

      if (!whRes.ok) {
        setWarehouse(null);
        setWarehouses([]);
        return;
      }

      const whData = await whRes.json();
      setWarehouse(whData);

      const allChildren = await fetchChildrenRecursive(whData.name, 1);
      setWarehouses(allChildren);
    } catch (error) {
      setWarehouse(null);
      setWarehouses([]);
    } finally {
      setWarehouseLoading(false);
    }
  }

  useEffect(() => {
    if (customerCode) loadWarehouses();
  }, [customerCode]);

  async function createRelatedWarehouses() {
    if (!warehouseCode) return;

    const ok = confirm(
      `倉庫 ${warehouseCode} と配下倉庫を自動作成します。よろしいですか？`
    );

    if (!ok) return;

    setCreatingWarehouses(true);

    const res = await fetch('/api/erpnext/warehouse/create-customer-warehouses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_code: customerCode }),
    });

    setCreatingWarehouses(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data?.error || '倉庫作成に失敗しました');
      return;
    }

    alert('関連倉庫を作成しました');
    await loadWarehouses();
  }

  return (
    <section style={{ marginTop: 40, maxWidth: 760 }}>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>関連倉庫</h2>

      <p style={{ color: '#666', marginBottom: 16 }}>
        顧客コードを4桁ゼロ埋めした倉庫コードと、その配下倉庫を表示します。
      </p>

      <div style={warehouseBoxStyle}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#777' }}>Warehouse Code</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{warehouseCode}</div>
        </div>

        {warehouseLoading ? (
          <div>倉庫を確認中...</div>
        ) : warehouse ? (
          <>
            <div style={{ marginBottom: 16, color: '#15803d', fontWeight: 600 }}>
              ✅ 関連倉庫あり
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
                  <td style={tdStyle}>{warehouse.disabled ? '無効' : '有効'}</td>
                </tr>

                {warehouses.map((wh) => (
                  <tr key={wh.name}>
                    <td style={tdStyle}>
                      <span style={{ paddingLeft: wh.level * 18 }}>
                        {wh.level > 0 ? '└ ' : ''}
                        {wh.name}
                      </span>
                    </td>
                    <td style={tdStyle}>{wh.warehouse_name || wh.name}</td>
                    <td style={tdStyle}>{wh.parent_warehouse || '-'}</td>
                    <td style={tdStyle}>{wh.disabled ? '無効' : '有効'}</td>
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
          <div>
            <div style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 16 }}>
              ❌ 倉庫 {warehouseCode} は未作成です
            </div>

            <button
              onClick={createRelatedWarehouses}
              disabled={creatingWarehouses}
              style={buttonStyle}
            >
              {creatingWarehouses ? '作成中...' : '関連倉庫を作成'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const buttonStyle = {
  padding: '10px 20px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
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
