'use client';

import { useEffect, useState } from 'react';
import { DeliveryNote } from './WmsPage'; // 親ページから型定義をインポート

type Props = {
  selectedName: string;
  onSelectData: (data: DeliveryNote) => void;
};

export default function DeliveryList({ selectedName, onSelectData }: Props) {
  const [rows, setRows] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/erpnext/delivery-note'); 
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setRows(list);
        
        // 初回のみ、自動的に一番上の行を選択
        if (list.length > 0 && !selectedName) {
          onSelectData(list[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [onSelectData]);

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
        比率調整：出荷日(80px) 納期(110px) 取引先(150px) 納品先(150px) 住所(180px固定でコンパクトに) 使用便(残り全て)
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 110px 150px 150px 180px 1fr',
          backgroundColor: '#e6e6e6',
          borderBottom: '2px solid #bbb',
          padding: '10px 8px',
          fontSize: 14, // 文字を大きく
          fontWeight: 'bold',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div>出荷日</div>
        <div>納期</div>
        <div style={{ textAlign: 'left', paddingLeft: 6 }}>取引先（荷主）</div>
        <div style={{ textAlign: 'left', paddingLeft: 6 }}>納品先</div>
        <div style={{ textAlign: 'left', paddingLeft: 6 }}>住所</div>
        <div>使用便</div>
      </div>

      {/* スクロール可能なデータ行エリア */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rows.map((row) => {
          // row.name (ID) を正確に比較して選択状態を判定
          const isSelected = selectedName === row.name;
          return (
            <div
              key={row.name}
              onClick={() => onSelectData(row)} // クリックした瞬間、親コンポーネントに伝票オブジェクト全体を渡して即時切り替え
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 110px 150px 150px 180px 1fr',
                alignItems: 'center',
                padding: '10px 8px',
                borderBottom: '1px solid #ddd',
                fontSize: 13, // 文字を全体的に大きく見やすく
                cursor: 'pointer',
                backgroundColor: isSelected ? '#b3d1ff' : '#fff', // 選択されたら確実にAccess風の青色に
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
              
              {/* 3. 取引先名 */}
              <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 6px' }}>
                {row.customer_name || row.customer || '-'}
              </div>
              
              {/* 4. 納品先 */}
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 6px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                {row.custom_delivery_name || '-'}
              </div>
              
              {/* 5. 住所 (幅180pxにぎゅっと縮小・はみ出しは綺麗に自動カット) */}
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
