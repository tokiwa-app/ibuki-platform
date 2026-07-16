'use client';

import { useEffect, useState } from 'react';

// Delivery Note明細の型
type DeliveryItem = {
  name?: string;       // 既存明細のユニークID（ERPNext側での判定用、新規行は無し）
  item_code: string;   // 商品コード（例: "0012-A001"）
  item_name: string;   // 品名
  qty: number;         // 数量
  uom?: string;        // 単位
  warehouse?: string;  // 倉庫
};

// Delivery Note本体の型
type DeliveryNote = {
  name: string;
  customer?: string;             // これが customer_code になります (例: "12" や "0012")
  customer_name?: string;
  posting_date?: string;
  transporter_name?: string;
  instructions?: string;
  custom_delivery_name?: string;
  custom_delivery_zip?: string;
  custom_delivery_address?: string;
  custom_delivery_tel?: string;
  custom_delivery_date?: string;
  custom_delivery_time?: string;
  items?: DeliveryItem[];
};

// 既存Item API (GET) が返す商品マスタの型
type ErpnextItem = {
  name: string;        // item_code に相当 (例: "0012-A001")
  item_name: string;   // 品名
  stock_uom?: string;  // 標準単位
};

type Props = {
  name: string; // 親から渡される選択中の伝票ID
};

export default function DeliveryDetail({ name }: Props) {
  const [data, setData] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 編集用の一時メモリ保持
  const [editData, setEditData] = useState<DeliveryNote | null>(null);
  // この取引先専用の商品マスタリスト
  const [filteredItems, setFilteredItems] = useState<ErpnextItem[]>([]);

  // 既存APIが提供するcustomer_codeパディング関数と同じ挙動をフロントでも用意
  const getFormattedCustomerCode = (code: string | undefined) => {
    return String(code || '').padStart(4, '0');
  };

  // 1. 選択された伝票IDの切り替え時に最新情報をAPIからGET
  useEffect(() => {
    if (!name) return;

    async function loadDetailAndMaster() {
      setLoading(true);
      setIsEditing(false);
      try {
        // ① 伝票詳細を取得
        const resDetail = await fetch(`/api/erpnext/delivery-note/${encodeURIComponent(name)}`);
        if (!resDetail.ok) throw new Error('詳細データの取得に失敗しました');
        const detailJson: DeliveryNote = await resDetail.json();
        
        setData(detailJson);
        setEditData(JSON.parse(JSON.stringify(detailJson))); // 編集用にコピー

        // ② 顧客コード（customer）に紐づく商品マスタのみをGET（提示いただいたAPIを使用）
        const customerCode = getFormattedCustomerCode(detailJson.customer);
        if (customerCode && customerCode !== '0000') {
          // 例: /api/erpnext/item?customer_code=0012
          const resItems = await fetch(`/api/erpnext/item?customer_code=${customerCode}`);
          if (resItems.ok) {
            const itemsJson = await resItems.json();
            setFilteredItems(itemsJson);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadDetailAndMaster();
  }, [name]);

  if (!name) {
    return <div style={placeholderStyle}>左側の一覧からデータを選択してください。</div>;
  }

  if (loading) {
    return <div style={placeholderStyle}>詳細データ読み込み中...</div>;
  }

  if (!data || !editData) return null;

  // 基本情報のテキスト変更
  const handleTextChange = (field: keyof DeliveryNote, value: string) => {
    setEditData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // 明細（商品）の新規追加（この顧客用の有効な商品の初期値を割り当てる）
  const handleAddItem = () => {
    if (filteredItems.length === 0) {
      alert('この取引先に登録されている商品（Item）がありません。\nまずはERPNext側で商品を登録してください。');
      return;
    }

    const defaultItem = filteredItems[0];
    const newItem: DeliveryItem = {
      item_code: defaultItem.name, // "0012-A001"
      item_name: defaultItem.item_name,
      qty: 1,
      uom: defaultItem.stock_uom || 'Nos',
      warehouse: 'Stores - HP', // 運用のメイン倉庫(任意)
    };

    setEditData((prev) => {
      if (!prev) return null;
      return { ...prev, items: [...(prev.items || []), newItem] };
    });
  };

  // プルダウン変更時、品名や単位も取引先商品リストから自動追従
  const handleItemSelect = (index: number, selectedCode: string) => {
    const matched = filteredItems.find((m) => m.name === selectedCode);
    if (!matched) return;

    setEditData((prev) => {
      if (!prev || !prev.items) return null;
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        item_code: matched.name,
        item_name: matched.item_name,
        uom: matched.stock_uom || newItems[index].uom,
      };
      return { ...prev, items: newItems };
    });
  };

  // 数量変更
  const handleQtyChange = (index: number, qty: number) => {
    setEditData((prev) => {
      if (!prev || !prev.items) return null;
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], qty };
      return { ...prev, items: newItems };
    });
  };

  // 行の削除
  const handleRemoveItem = (index: number) => {
    setEditData((prev) => {
      if (!prev || !prev.items) return null;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  };

  // 保存処理（PUT）
  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/erpnext/delivery-note/${encodeURIComponent(name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        const updated = await res.json();
        setData(updated);
        setEditData(JSON.parse(JSON.stringify(updated)));
        setIsEditing(false);
        alert('変更を正常に保存しました。');
      } else {
        const errJson = await res.json();
        alert(`保存に失敗しました。:\n${errJson.error || 'ERPNextの登録制約エラーです'}`);
      }
    } catch (e) {
      console.error(e);
      alert('保存処理中に通信エラーが発生しました。');
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

        <div style={boxStyle}>
          <div style={boxHeaderStyle}>【荷主・運送情報】</div>
          <div style={formRowStyle}>
            <label style={labelStyle}>取引先:</label>
            <span style={valueStyle}>
              {data.customer_name || '-'} (コード: {getFormattedCustomerCode(data.customer)})
            </span>
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
                <th style={{ ...thStyle, width: '220px' }}>顧客対応 商品コード</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>品名</th>
                <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>数量</th>
                {isEditing && <th style={{ ...thStyle, width: '60px' }}>操作</th>}
              </tr>
            </thead>
            <tbody>
              {(isEditing ? editData.items || [] : data.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  {/* 取引先コードに完全一致する商品のみセレクトボックスに抽出 */}
                  <td style={tdStyle}>
                    {isEditing ? (
                      <select
                        value={item.item_code}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        style={selectStyle}
                      >
                        {filteredItems.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name} ({m.item_name})
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

                  {/* 行削除 */}
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

// プレースホルダー表示用スタイル
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

const boxStyle = { border: '1px solid #ddd', borderRadius: 6, padding: '10px', backgroundColor: '#fbfbfb' };
const boxHeaderStyle = { fontSize: 14, fontWeight: 'bold' as const, color: '#2b579a', marginBottom: 8 };
const formRowStyle = { display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center', marginBottom: 6, fontSize: 13 };
const labelStyle = { fontWeight: 'bold' as const, color: '#555' };
const valueStyle = { color: '#333' };
const inputStyle = { padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' as const };
const selectStyle = { padding: '4px', width: '100%', fontSize: 12, borderRadius: 4, border: '1px solid #ccc' };
const thStyle = { padding: '10px 8px', borderBottom: '1px solid #ccc', color: '#555', fontSize: 13 };
const tdStyle = { padding: '8px 6px', fontSize: 13, verticalAlign: 'middle' };
const editBtnStyle = { padding: '6px 12px', backgroundColor: '#f0ad4e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' as const };
const saveBtnStyle = { padding: '6px 12px', backgroundColor: '#5cb85c', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' as const };
const cancelBtnStyle = { padding: '6px 12px', backgroundColor: '#d9534f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold' as const };
const addItemsBtnStyle = { padding: '4px 8px', backgroundColor: '#2b579a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' as const };
const deleteBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 };
