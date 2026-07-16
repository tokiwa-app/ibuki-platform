'use client';

import { useEffect, useState } from 'react';

// 親から受け取る型定義
type DeliveryNote = {
  name: string;
  customer_name?: string;
  customer?: string;
  posting_date?: string;
  transporter_name?: string;
  instructions?: string;
  custom_delivery_name?: string;
  custom_delivery_zip?: string;
  custom_delivery_address?: string;
  custom_delivery_tel?: string;
  custom_delivery_date?: string;
  custom_delivery_time?: string;
  items?: Array<DeliveryItem>;
};

type DeliveryItem = {
  name?: string;
  item_code: string;
  item_name: string;
  qty: number;
  warehouse?: string;
};

// 選択肢用の商品マスター型
type ItemMaster = {
  item_code: string;
  item_name: string;
};

type Props = {
  name: string; // 選択された伝票のID
};

export default function DeliveryDetail({ name }: Props) {
  const [data, setData] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 編集モードのフラグ

  // フォーム用の一時状態
  const [editData, setEditData] = useState<DeliveryNote | null>(null);
  
  // 商品マスターの選択肢（APIから取得、または初期リスト）
  const [itemMaster, setItemMaster] = useState<ItemMaster[]>([
    { item_code: 'ITEM-001', item_name: 'オーガニックシャンプー 300ml' },
    { item_code: 'ITEM-002', item_name: 'リペアトリートメント 250g' },
    { item_code: 'ITEM-003', item_name: 'スカルプエッセンス 100ml' },
    { item_code: 'ITEM-004', item_name: 'プロフェッショナルワックス 80g' },
  ]);

  // 1. 選択されたID(name)が変わったら詳細データをフェッチ
  useEffect(() => {
    if (!name) return;
    
    async function loadDetail() {
      setLoading(true);
      setIsEditing(false); // 伝票が変わったら一度プレビューモードに戻す
      try {
        const res = await fetch(`/api/erpnext/delivery-note/${name}`);
        const json = await res.json();
        setData(json);
        setEditData(JSON.parse(JSON.stringify(json))); // 編集用にディープコピー
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    // 同時に商品マスターもERPNextから取得しておく
    async function loadItemMaster() {
      try {
        const res = await fetch('/api/erpnext/item-master'); // 商品マスター取得用API（想定）
        if (res.ok) {
          const list = await res.json();
          setItemMaster(list);
        }
      } catch (e) {
        console.error('商品マスターの取得に失敗:', e);
      }
    }

    loadDetail();
    loadItemMaster();
  }, [name]);

  if (!name) {
    return <div style={placeholderStyle}>左側の一覧からデータを選択してください。</div>;
  }

  if (loading) {
    return <div style={placeholderStyle}>詳細データ読み込み中...</div>;
  }

  if (!data || !editData) return null;

  // --- フォーム操作用ハンドラー ---
  const handleTextChange = (field: keyof DeliveryNote, value: string) => {
    setEditData((prev) => prev ? { ...prev, [field]: value } : null);
  };

  // 明細（商品）の追加
  const handleAddItem = () => {
    const newItem: DeliveryItem = {
      item_code: itemMaster[0]?.item_code || '',
      item_name: itemMaster[0]?.item_name || '',
      qty: 1,
      warehouse: 'Finished Goods - HP', // デフォルト倉庫
    };
    setEditData((prev) => {
      if (!prev) return null;
      return { ...prev, items: [...(prev.items || []), newItem] };
    });
  };

  // 明細（商品）の選択変更
  const handleItemSelect = (index: number, selectedCode: string) => {
    const matched = itemMaster.find((item) => item.item_code === selectedCode);
    if (!matched) return;

    setEditData((prev) => {
      if (!prev || !prev.items) return null;
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        item_code: matched.item_code,
        item_name: matched.item_name,
      };
      return { ...prev, items: newItems };
    });
  };

  // 明細（商品）の数量変更
  const handleQtyChange = (index: number, qty: number) => {
    setEditData((prev) => {
      if (!prev || !prev.items) return null;
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], qty: qty };
      return { ...prev, items: newItems };
    });
  };

  // 明細（商品）の行削除
  const handleRemoveItem = (index: number) => {
    setEditData((prev) => {
      if (!prev || !prev.items) return null;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  };

  // ERPNextへの保存送信
  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/erpnext/delivery-note/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        setIsEditing(false);
        alert('保存しました！');
      } else {
        alert('保存に失敗しました。ERPNext側のバリデーションエラーの可能性があります。');
      }
    } catch (e) {
      console.error(e);
      alert('通信エラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #ccc',
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* 操作ヘッダーバー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #2b579a', paddingBottom: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 'bold', color: '#2b579a' }}>
          伝票番号: {data.name}
        </span>
        <div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} style={editBtnStyle}>編集する</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSave} style={saveBtnStyle}>保存</button>
              <button onClick={() => { setIsEditing(false); setEditData(JSON.parse(JSON.stringify(data))); }} style={cancelBtnStyle}>キャンセル</button>
            </div>
          )}
        </div>
      </div>

      {/* 上段：基本情報 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {/* 納品先情報 */}
        <div style={boxStyle}>
          <div style={boxHeaderStyle}>【納品先】</div>
          <div style={formRowStyle}>
            <label style={labelStyle}>宛先:</label>
            {isEditing ? (
              <input type="text" value={editData.custom_delivery_name || ''} onChange={(e) => handleTextChange('custom_delivery_name', e.target.value)} style={inputStyle} />
            ) : (
              <span style={valueStyle}>{data.custom_delivery_name || '-'}</span>
            )}
          </div>
          <div style={formRowStyle}>
            <label style={labelStyle}>郵便番号:</label>
            {isEditing ? (
              <input type="text" value={editData.custom_delivery_zip || ''} onChange={(e) => handleTextChange('custom_delivery_zip', e.target.value)} style={inputStyle} />
            ) : (
              <span style={valueStyle}>{data.custom_delivery_zip || '-'}</span>
            )}
          </div>
          <div style={formRowStyle}>
            <label style={labelStyle}>住所:</label>
            {isEditing ? (
              <input type="text" value={editData.custom_delivery_address || ''} onChange={(e) => handleTextChange('custom_delivery_address', e.target.value)} style={inputStyle} />
            ) : (
              <span style={valueStyle}>{data.custom_delivery_address || '-'}</span>
            )}
          </div>
        </div>

        {/* 荷主・運送情報 */}
        <div style={boxStyle}>
          <div style={boxHeaderStyle}>【荷主・運送情報】</div>
          <div style={formRowStyle}>
            <label style={labelStyle}>取引先:</label>
            <span style={valueStyle}>{data.customer_name || data.customer || '-'}</span>
          </div>
          <div style={formRowStyle}>
            <label style={labelStyle}>出荷日:</label>
            {isEditing ? (
              <input type="date" value={editData.posting_date || ''} onChange={(e) => handleTextChange('posting_date', e.target.value)} style={inputStyle} />
            ) : (
              <span style={valueStyle}>{data.posting_date || '-'}</span>
            )}
          </div>
          <div style={formRowStyle}>
            <label style={labelStyle}>使用便:</label>
            {isEditing ? (
              <input type="text" value={editData.transporter_name || ''} onChange={(e) => handleTextChange('transporter_name', e.target.value)} style={inputStyle} />
            ) : (
              <span style={valueStyle}>{data.transporter_name || '-'}</span>
            )}
          </div>
        </div>
      </div>

      {/* 中段：商品明細グリッド */}
      <div style={{ flex: 1, minHeight: 150, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={boxHeaderStyle}>【商品明細】</span>
          {isEditing && (
            <button onClick={handleAddItem} style={addItemsBtnStyle}>➕ 商品を追加</button>
          )}
        </div>
        
        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 4, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f0f0f0', zIndex: 1 }}>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={{ ...thStyle, width: '150px' }}>商品番号</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>品名</th>
                <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>数量</th>
                {isEditing && <th style={{ ...thStyle, width: '60px' }}>操作</th>}
              </tr>
            </thead>
            <tbody>
              {(isEditing ? editData.items || [] : data.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  {/* 商品番号（選択式） */}
                  <td style={tdStyle}>
                    {isEditing ? (
                      <select
                        value={item.item_code}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        style={selectStyle}
                      >
                        {itemMaster.map((m) => (
                          <option key={m.item_code} value={m.item_code}>
                            {m.item_code}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: '#0066cc', fontWeight: 'bold' }}>{item.item_code}</span>
                    )}
                  </td>

                  {/* 品名 */}
                  <td style={tdStyle}>{item.item_name}</td>

                  {/* 数量 */}
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                        style={{ ...inputStyle, width: '60px', textAlign: 'right' }}
                      />
                    ) : (
                      <b style={{ fontSize: 14 }}>{item.qty}</b>
                    )}
                  </td>

                  {/* 削除ボタン（編集時のみ表示） */}
                  {isEditing && (
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <button onClick={() => handleRemoveItem(idx)} style={deleteBtnStyle}>
                        🗑️
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 下段：記事・備考 */}
      <div style={boxStyle}>
        <div style={boxHeaderStyle}>【記事・備考】</div>
        {isEditing ? (
          <textarea
            value={editData.instructions || ''}
            onChange={(e) => handleTextChange('instructions', e.target.value)}
            style={{ ...inputStyle, width: '100%', height: '60px', resize: 'none' }}
          />
        ) : (
          <div style={{ fontSize: 13, color: '#333', padding: '4px' }}>
            {data.instructions || '（特記事項なし）'}
          </div>
        )}
      </div>
    </section>
  );
}

// --- スタイリング定義 ---
const placeholderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #ccc',
  color: '#666',
  fontSize: 16,
};

const boxStyle = {
  border: '1px solid #ddd',
  borderRadius: 6,
  padding: '10px',
  backgroundColor: '#fbfbfb',
};

const boxHeaderStyle = {
  fontSize: 14,
  fontWeight: 'bold' as const,
  color: '#2b579a',
  marginBottom: 8,
};

const formRowStyle = {
  display: 'grid',
  gridTemplateColumns: '80px 1fr',
  alignItems: 'center',
  marginBottom: 6,
  fontSize: 13,
};

const labelStyle = {
  fontWeight: 'bold' as const,
  color: '#555',
};

const valueStyle = {
  color: '#333',
};

const inputStyle = {
  padding: '4px 8px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 13,
  boxSizing: 'border-box' as const,
};

const selectStyle = {
  padding: '4px',
  width: '100%',
  fontSize: 12,
  borderRadius: 4,
  border: '1px solid #ccc',
};

const thStyle = {
  padding: '10px 8px',
  borderBottom: '1px solid #ccc',
  color: '#555',
  fontSize: 13,
};

const tdStyle = {
  padding: '8px 6px',
  fontSize: 13,
  verticalAlign: 'middle',
};

// ボタン類
const editBtnStyle = {
  padding: '6px 12px',
  backgroundColor: '#f0ad4e',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 'bold' as const,
};

const saveBtnStyle = {
  padding: '6px 12px',
  backgroundColor: '#5cb85c',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 'bold' as const,
};

const cancelBtnStyle = {
  padding: '6px 12px',
  backgroundColor: '#d9534f',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 'bold' as const,
};

const addItemsBtnStyle = {
  padding: '4px 8px',
  backgroundColor: '#2b579a',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 'bold' as const,
};

const deleteBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 14,
};
