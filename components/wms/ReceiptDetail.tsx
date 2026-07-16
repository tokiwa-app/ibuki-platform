'use client';

import React, { useEffect, useState } from 'react';

interface ReceiptDetailProps {
  name: string; // 選択されたPR番号（空なら新規作成）
  onSaveSuccess: () => void;
}

interface PRItem {
  item_code: string;
  item_name: string;
  qty: number;
  warehouse: string;
}

export default function ReceiptDetail({ name, onSaveSuccess }: ReceiptDetailProps) {
  const isNew = !name;
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<PRItem[]>([
    { item_code: '', item_name: '', qty: 1, warehouse: 'Stores - HP' }
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 過去の入庫情報を取得して閲覧モードにする
  useEffect(() => {
    if (isNew) {
      setSupplier('');
      setItems([{ item_code: '', item_name: '', qty: 1, warehouse: 'Stores - HP' }]);
      setError(null);
      return;
    }

    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/resource/Purchase Receipt/${name}`);
        const data = await res.json();
        if (data.data) {
          setSupplier(data.data.supplier);
          setItems(data.data.items || []);
        }
      } catch (err) {
        setError('詳細データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [name, isNew]);

  const handleAddItem = () => {
    setItems([...items, { item_code: '', item_name: '', qty: 1, warehouse: 'Stores - HP' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PRItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/erpnext/purchase-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplier, items })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '登録に失敗しました');

      alert(`入庫を確定しました！(PR番号: ${result.name || '成功'})`);
      onSaveSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>データを読み込み中...</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 'bold' }}>
          {isNew ? '📦 新規入庫フォーム' : `🔍 入庫詳細 (${name})`}
        </h3>
        {!isNew && <span style={{ fontSize: 11, color: '#2e7d32', fontWeight: 'bold' }}>保存済み（実在庫化完了）</span>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {error && (
          <div style={{ padding: 12, backgroundColor: '#ffebee', color: '#c62828', borderRadius: 4, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 荷主（Supplier） */}
          <div>
            <label style={labelStyle}>荷主 (Supplier)</label>
            <input
              type="text"
              disabled={!isNew}
              style={{ ...inputStyle, backgroundColor: isNew ? '#fff' : '#f5f5f5' }}
              placeholder="例: 0012_荷主A"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
            />
          </div>

          {/* 明細行 */}
          <div>
            <label style={labelStyle}>入庫商品明細</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
              {items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: 6, alignItems: 'center', border: '1px solid #e0e0e0', padding: 8, borderRadius: 4, backgroundColor: '#fcfcfc' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      disabled={!isNew}
                      style={{ ...smallInputStyle, backgroundColor: isNew ? '#fff' : '#f5f5f5' }}
                      placeholder="商品コード"
                      value={item.item_code}
                      onChange={(e) => handleItemChange(index, 'item_code', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ flex: 1.5 }}>
                    <input
                      type="text"
                      disabled={!isNew}
                      style={{ ...smallInputStyle, backgroundColor: isNew ? '#fff' : '#f5f5f5' }}
                      placeholder="品名"
                      value={item.item_name}
                      onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                    />
                  </div>
                  <div style={{ width: 60 }}>
                    <input
                      type="number"
                      disabled={!isNew}
                      min="1"
                      style={{ ...smallInputStyle, textAlign: 'center', backgroundColor: isNew ? '#fff' : '#f5f5f5' }}
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ width: 100 }}>
                    <input
                      type="text"
                      disabled={!isNew}
                      style={{ ...smallInputStyle, backgroundColor: isNew ? '#fff' : '#f5f5f5' }}
                      placeholder="倉庫"
                      value={item.warehouse}
                      onChange={(e) => handleItemChange(index, 'warehouse', e.target.value)}
                      required
                    />
                  </div>
                  {isNew && items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      style={{ border: 'none', background: 'none', color: '#d9534f', cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
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
                style={{ marginTop: 8, padding: '4px 8px', fontSize: 12, backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', borderRadius: 4, cursor: 'pointer' }}
              >
                ＋ 行を追加
              </button>
            )}
          </div>

          {/* 登録ボタン */}
          {isNew && (
            <div style={{ marginTop: 12, borderTop: '1px solid #eee', paddingTop: 16 }}>
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
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                {saving ? 'ERPNextに送信中...' : '📦 実在庫として登録（入庫確定）'}
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
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'bold',
  color: '#555',
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
