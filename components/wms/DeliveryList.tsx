'use client';

import { useEffect, useState } from 'react';

type DeliveryNoteRow = {
  name: string;
  customer?: string;
  customer_name?: string;
  posting_date?: string;
  custom_delivery_name?: string;
  custom_delivery_address?: string; // 住所を正しくマッピング
  custom_delivery_date?: string;
  custom_delivery_time?: string;
  transporter_name?: string;
  status?: string;
};

type Props = {
  selectedName: string;
  onSelect: (name: string) => void;
};

export default function DeliveryList({ selectedName, onSelect }: Props) {
  const [rows, setRows] = useState<DeliveryNoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/erpnext/delivery-note'); 
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRows(list);
        
        // 初回ロード時、選択されているIDがなければ、一番上の行を自動選択
        if (list.length > 0 && !selectedName) {
          onSelect(list[0].name);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onSelect]); // selectedNameを外して、左画面の不要な再ロード（無限ループ）を防止

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}>
        データ読み込み中...
      </div>
    );
  }

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #ccc',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* テーブルヘッダー 
        比率：出荷日(80px) 納期(110px) 取引先(140px) 納品先(140px) 住所(140px固定) 使用便(残り全て)
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 110px 140px 140px 140px 1fr',
          backgroundColor: '#e6e6e6',
          borderBottom: '2px solid #bbb',
          padding: '12px 8px',
          fontSize: 14,
          fontWeight: 'bold',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div>出荷日</div>
        <div>納期</div>
        <div style={{ textAlign: 'left', paddingLeft: 6 }}>取引先</div>
        <div style={{ textAlign: 'left', paddingLeft: 6 }}>納品先</div>
        <div style={{ textAlign: 'left', paddingLeft: 6 }}>住所</div>
        <div>使用便</div>
      </div>

      {/* スクロールデータエリア */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rows.map((row) => {
          // row.name (ID) を親の selectedName と確実に比較
          const isSelected = selectedName === row.name;
          return (
            <div
              key={row.name}
              onClick={() => onSelect(row.name)} // クリック時に親の setSelectedName(ID) が100%正しく走ります
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 110px 140px 140px 140px 1fr',
                alignItems: 'center',
                padding: '12px 8px',
                borderBottom: '1px solid #ddd',
                fontSize: 14, // 文字をハッキリ大きく
                cursor: 'pointer',
                backgroundColor: isSelected ? '#b3d1ff' : '#fff', // 選択されている行が青くなります
                transition: 'background-color 0.05s',
                boxSizing: 'border-box',
              }}
            >
              {/* 1. 出荷日 */}
              <div style={{ textAlign: 'center', fontWeight: isSelected ? 'bold' : 'normal' }}>
                {row.posting_date ? row.posting_date.substring(5) : '-'}
              </div>
              
              {/* 2. 納期 */}
              <div style={{ textAlign: 'center', color: '#444' }}>
                {row.custom_delivery_date ? row.custom_delivery_date.substring(5) : '-'} 
                <span style={{ fontSize: 11, marginLeft: 4 }}>
                  {row.custom_delivery_time ? row.custom_delivery_time.substring(0, 5) : ''}
                </span>
              </div>
              
              {/* 3. 取引先 */}
              <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 6px' }}>
                {row.customer_name || row.customer || '-'}
              </div>
              
              {/* 4. 納品先 */}
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 6px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                {row.custom_delivery_name || '-'}
              </div>
              
              {/* 5. 住所 (140px幅に固定され、長い場合は自動で「…」とスマートに省略されます) */}
              <div style={{ color: '#888', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 6px' }}>
                {row.custom_delivery_address || '-'} 
              </div>
              
              {/* 6. 使用便 */}
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: 'bold', color: '#1a365d' }}>
                {row.transporter_name || '-'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
