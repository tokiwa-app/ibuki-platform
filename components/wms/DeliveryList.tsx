'use client';

import { useEffect, useState } from 'react';

type DeliveryNoteRow = {
  name: string;
  customer?: string;
  customer_name?: string;
  posting_date?: string;
  custom_delivery_name?: string;
  custom_delivery_date?: string;
  transporter_name?: string;
  status?: string;
};

type Props = {
  selectedName: string;
  onSelect: (name: string) => void; // 元の「name（文字列）を渡す」イベントに戻します
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
        
        // 初回ロード時のみ、自動的に一番上の行を選択してIDを親に伝える
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
    // selectedName は監視しません（左画面の不要な再ロードを防ぐため）
  }, [onSelect]); 

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
      {/* テーブルヘッダー：出荷日、納期、取引先、納品先、住所（細め）、使用便 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 110px 140px 140px 140px 1fr',
          backgroundColor: '#e6e6e6',
          borderBottom: '2px solid #bbb',
          padding: '12px 8px',
          fontSize: 14, // 文字サイズ拡大
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
          const isSelected = selectedName === row.name;
          return (
            <div
              key={row.name}
              onClick={() => onSelect(row.name)} // クリックしたID（name）を親に渡す（元の正しい挙動）
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 110px 140px 140px 140px 1fr',
                alignItems: 'center',
                padding: '12px 8px', // 余白を広げて文字を押しやすく
                borderBottom: '1px solid #ddd',
                fontSize: 14, // 全体的な文字を大きく
                cursor: 'pointer',
                backgroundColor: isSelected ? '#b3d1ff' : '#fff', // 選択時はAccess風の青
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
              
              {/* 5. 住所 (140px固定幅。途中できれてもいいように省略表示) */}
              <div style={{ color: '#888', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 6px' }}>
                {row.custom_delivery_name || '-'} 
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
