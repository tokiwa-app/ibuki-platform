'use client';

import { useEffect, useState } from 'react';

type DeliveryNoteRow = {
  name: string;
  customer?: string;      // 追加：取引先ID (例: "52")
  customer_name?: string; // 追加：取引先名 (例: "PIXY PF" または "ヘア イン アブレ")
  posting_date?: string;
  custom_delivery_name?: string;
  custom_delivery_date?: string;
  transporter_name?: string;
  status?: string;
  custom_is_instructed?: boolean; 
  custom_is_completed?: boolean;
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
        
        // 初回ロード時のみ、何も選択されていなければ一番上を選択
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
    // 【修正1】監視リストから selectedName を削除。これでクリック時の「左も再ロード」が消えます。
  }, [onSelect]); 

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
      {/* テーブルヘッダー */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px 80px 140px 1fr 100px 50px 50px',
          backgroundColor: '#e6e6e6',
          borderBottom: '2px solid #bbb',
          padding: '8px 4px',
          fontSize: 11,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        <div>区分</div>
        <div>出荷日</div>
        <div>取引先名（名称）</div>
        <div>納品先（住所）</div>
        <div>運送便</div>
        <div>指示</div>
        <div>完了</div>
      </div>

      {/* スクロール可能なデータ行エリア */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {rows.map((row) => {
          const isSelected = selectedName === row.name;
          return (
            <div
              key={row.name}
              onClick={() => onSelect(row.name)}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 80px 140px 1fr 100px 50px 50px',
                alignItems: 'center',
                padding: '6px 4px',
                borderBottom: '1px solid #ddd',
                fontSize: 11,
                cursor: 'pointer',
                backgroundColor: isSelected ? '#b3d1ff' : '#fff', // 選択時ははっきり青
                transition: 'background-color 0.1s',
              }}
            >
              {/* 区分 */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#2b579a' }}>出庫</div>
              
              {/* 出荷日 */}
              <div style={{ textAlign: 'center' }}>{row.posting_date?.substring(5) || '-'}</div>
              
              {/* 【修正2】取引先名（Accessの名称カラム） */}
              <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
                {row.customer_name || row.customer || '-'}
              </div>
              
              {/* 納品先名 / 住所 */}
              <div style={{ color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
                {row.custom_delivery_name || '-'}
              </div>
              
              {/* 運送便 */}
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                {row.transporter_name || '-'}
              </div>
              
              {/* 指示チェック状況 */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#008000', fontWeight: 'bold' }}>✔</span>
              </div>
              
              {/* 完了チェック状況 */}
              <div style={{ textAlign: 'center' }}>
                <span style={{ color: '#0066cc', fontWeight: 'bold' }}>✔</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
