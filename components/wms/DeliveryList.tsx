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
        // ERPNextから明細や詳細住所を含む全データを一括取得
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
  }, [onSelectData]); // selectedNameを監視しないため、クリック時に左画面は再ロードされません

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#fff', borderRadius: 8, border: '1px solid #ccc' }}>
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
        幅比率：出荷日(70px) 納期(100px) 取引先(130px) 納品先(130px) 住所(1fr - 残り全て) 使用便(90px)
      */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px 100px 130px 130px 1fr 90px',
          backgroundColor: '#e6e6e6',
          borderBottom: '2px solid #bbb',
          padding: '8px 6px',
          fontSize: 11,
          fontWeight: 'bold',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div>出荷日</div>
        <div>納期</div>
        <div style={{ textAlign: 'left', paddingLeft: 4 }}>取引先（荷主）</div>
        <div style={{ textAlign: 'left', paddingLeft: 4 }}>納品先</div>
        <div style={{ textAlign: 'left', paddingLeft: 4 }}>住所</div>
        <div>使用便</div>
      </div>

      {/* スクロール可能なデータ行エリア */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rows.map((row) => {
          const isSelected = selectedName === row.name;
          return (
            <div
              key={row.name}
              onClick={() => onSelectData(row)} // クリックされたら1ミリ秒で右側にデータを連携
              style={{
                display: 'grid',
                gridTemplateColumns: '70px 100px 130px 130px 1fr 90px',
                alignItems: 'center',
                padding: '8px 6px',
                borderBottom: '1px solid #ddd',
                fontSize: 11,
                cursor: 'pointer',
                backgroundColor: isSelected ? '#b3d1ff' : '#fff', // 選択時ははっきりとしたAccess風のアクティブブルー
                transition: 'background-color 0.05s',
                boxSizing: 'border-box',
              }}
            >
              {/* 1. 出荷日 (月-日表示にスッキリ短縮) */}
              <div style={{ textAlign: 'center' }}>
                {row.posting_date ? row.posting_date.substring(5) : '-'}
              </div>
              
              {/* 2. 納期 (月-日 時:分 表示) */}
              <div style={{ textAlign: 'center', color: '#555' }}>
                {row.custom_delivery_date ? row.custom_delivery_date.substring(5) : '-'} 
                <span style={{ fontSize: 10, marginLeft: 3 }}>
                  {row.custom_delivery_time ? row.custom_delivery_time.substring(0, 5) : ''}
                </span>
              </div>
              
              {/* 3. 取引先名 (太字で強調) */}
              <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
                {row.customer_name || row.customer || '-'}
              </div>
              
              {/* 4. 納品先 */}
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
                {row.custom_delivery_name || '-'}
              </div>
              
              {/* 5. 住所 (数センチ幅ではみ出したら自動で「…」にカット) */}
              <div style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
                {row.custom_delivery_address || '-'}
              </div>
              
              {/* 6. 使用便 */}
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', fontWeight: '500' }}>
                {row.transporter_name || '-'}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
