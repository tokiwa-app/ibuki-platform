```tsx
'use client';

import React, { useEffect, useState } from 'react';

interface ReceiptDetailProps {
  name: string;
  onSaveSuccess: () => void;
}

interface PRItem {
  name?: string;
  item_code: string;
  item_name: string;
  qty: number;
  uom?: string;
  warehouse: string;
  rate?: number;
}

interface PurchaseReceipt {
  name: string;
  supplier: string;
  supplier_name?: string;
  posting_date?: string;
  status?: string;
  docstatus?: number;
  items?: PRItem[];
}

const emptyItem: PRItem = {
  item_code: '',
  item_name: '',
  qty: 1,
  warehouse: 'Stores - HP',
};

export default function ReceiptDetail({
  name,
  onSaveSuccess,
}: ReceiptDetailProps) {
  const isNew = !name;

  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<PRItem[]>([{ ...emptyItem }]);
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setSupplier('');
      setItems([{ ...emptyItem }]);
      setReceipt(null);
      setError(null);
      return;
    }

    async function fetchDetail() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/erpnext/purchase-receipt?name=${encodeURIComponent(name)}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '詳細データの取得に失敗しました');
        }

        // APIは result.data を直接返しているため data.data ではなく data
        const detail: PurchaseReceipt = data;

        setReceipt(detail);
        setSupplier(detail.supplier || '');
        setItems(
          Array.isArray(detail.items) && detail.items.length > 0
            ? detail.items.map((item) => ({
                name: item.name,
                item_code: item.item_code || '',
                item_name: item.item_name || '',
                qty: Number(item.qty || 0),
                uom: item.uom || 'Nos',
                warehouse: item.warehouse || '',
                rate: Number(item.rate || 0),
              }))
            : [{ ...emptyItem }],
        );
      } catch (err: unknown) {
        console.error('Purchase Receipt detail error:', err);

        setReceipt(null);
        setSupplier('');
        setItems([{ ...emptyItem }]);

        setError(
          err instanceof Error
            ? err.message
            : '詳細データの取得に失敗しました',
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [name, isNew]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof PRItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === 'qty' ? Number(value) : value,
            }
          : item,
      ),
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/erpnext/purchase-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplier,
          items: items.map((item) => ({
            item_code: item.item_code,
            item_name: item.item_name,
            qty: Number(item.qty),
            uom: item.uom || 'Nos',
            warehouse: item.warehouse || 'Stores - HP',
            rate: Number(item.rate || 0),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '登録に失敗しました');
      }

      alert(`入庫伝票を作成しました（PR番号: ${result.name}）`);
      onSaveSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : '入庫登録に失敗しました',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            padding: 24,
            textAlign: 'center',
            color: '#666',
          }}
        >
          詳細データをロード中...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#fafafa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          {isNew
            ? '📦 新規入庫登録フォーム'
            : `🔍 入庫伝票明細 (${name})`}
        </h3>

        {!isNew && (
          <span
            style={{
              fontSize: 11,
              color: '#2e7d32',
              fontWeight: 'bold',
              backgroundColor: '#e8f5e9',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            {receipt?.status || '登録済み'}
          </span>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
        }}
      >
        {error && (
          <div
            style={{
              padding: 12,
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: 4,
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSave}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <label style={labelStyle}>荷主（Supplier）</label>

            <input
              type="text"
              disabled={!isNew}
              style={{
                ...inputStyle,
                backgroundColor: isNew ? '#fff' : '#f5f5f5',
              }}
              placeholder="例: 0012_荷主A"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
            />
          </div>

          {!isNew && receipt?.posting_date && (
            <div>
              <label style={labelStyle}>入庫日</label>

              <input
                type="text"
                disabled
                style={{
                  ...inputStyle,
                  backgroundColor: '#f5f5f5',
                }}
                value={receipt.posting_date}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>入庫商品明細一覧</label>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                marginTop: 6,
              }}
            >
              {items.map((item, index) => (
                <div
                  key={item.name || `${item.item_code}-${index}`}
                  style={{
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    border: '1px solid #e0e0e0',
                    padding: 8,
                    borderRadius: 4,
                    backgroundColor: '#fcfcfc',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label style={subLabelStyle}>商品コード</label>

                    <input
                      type="text"
                      disabled={!isNew}
                      style={{
                        ...smallInputStyle,
                        backgroundColor: isNew ? '#fff' : '#f5f5f5',
                      }}
                      placeholder="商品コード"
                      value={item.item_code || ''}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'item_code',
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>

                  <div style={{ flex: 1.5 }}>
                    <label style={subLabelStyle}>品名</label>

                    <input
                      type="text"
                      disabled={!isNew}
                      style={{
                        ...smallInputStyle,
                        backgroundColor: isNew ? '#fff' : '#f5f5f5',
                      }}
                      placeholder="品名"
                      value={item.item_name || ''}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'item_name',
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div style={{ width: 70 }}>
                    <label style={subLabelStyle}>数量</label>

                    <input
                      type="number"
                      disabled={!isNew}
                      min="1"
                      step="any"
                      style={{
                        ...smallInputStyle,
                        textAlign: 'center',
                        backgroundColor: isNew ? '#fff' : '#f5f5f5',
                      }}
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'qty',
                          Number(e.target.value),
                        )
                      }
                      required
                    />
                  </div>

                  <div style={{ width: 140 }}>
                    <label style={subLabelStyle}>格納先倉庫</label>

                    <input
                      type="text"
                      disabled={!isNew}
                      style={{
                        ...smallInputStyle,
                        backgroundColor: isNew ? '#fff' : '#f5f5f5',
                      }}
                      placeholder="倉庫"
                      value={item.warehouse || ''}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          'warehouse',
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>

                  {isNew && items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#d9534f',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: 'bold',
                        marginTop: 14,
                      }}
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
            </div>

            {isNew && (
              <button
                type="button"
                onClick={handleAddItem}
                style={{
                  marginTop: 8,
                  padding: '4px 8px',
                  fontSize: 12,
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  border: '1px solid #a5d6a7',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                ＋ 商品を追加
              </button>
            )}
          </div>

          {isNew && (
            <div
              style={{
                marginTop: 12,
                borderTop: '1px solid #eee',
                paddingTop: 16,
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#2e7d32',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? 'ERPNextに送信中...'
                  : '📦 実在庫として入庫確定（保存）'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: 6,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'bold',
  color: '#555',
};

const subLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#888',
  display: 'block',
  marginBottom: 2,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: '8px',
  marginTop: 4,
  boxSizing: 'border-box',
  fontSize: 13,
  color: '#000',
};

const smallInputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #ccc',
  borderRadius: 4,
  padding: '6px',
  boxSizing: 'border-box',
  fontSize: 12,
  color: '#000',
};
```
