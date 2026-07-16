'use client';

import { useEffect, useState } from 'react';

type DeliveryNoteItem = {
  name: string;
  item_code?: string;
  item_name?: string;
  qty?: number;
  warehouse?: string;
};

type DeliveryNote = {
  name: string;
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
  items?: DeliveryNoteItem[];
};

type Props = {
  name: string;
};

export default function DeliveryDetail({ name }: Props) {
  const [data, setData] = useState<DeliveryNote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!name) {
      setData(null);
      return;
    }
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/erpnext/delivery-note/${encodeURIComponent(name)}`);
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    load();
  }, [name]);

  if (!name) {
    return (
      <div style={placeholderStyle}>
        左側の一覧からデータを選択してください。
      </div>
    );
  }

  if (loading) {
    return <div style={placeholderStyle}>詳細データを読み込み中...</div>;
  }

  if (!data) {
    return <div style={placeholderStyle}>データが存在しません。</div>;
  }

  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: 8,
        border: '1px solid #ccc',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        overflowY: 'auto', // 万が一の溢れ防止
      }}
    >
      {/* 上段：基本情報（2カラム構成） */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* 納品先ボックス */}
        <div style={boxStyle}>
          <div style={boxHeaderStyle}>【納品先】</div>
          <div style={rowStyle}><b>宛先:</b> {data.custom_delivery_name || '-'}</div>
          <div style={rowStyle}><b>〒:</b> {data.custom_delivery_zip || '-'}</div>
          <div style={rowStyle}><b>住所:</b> {data.custom_delivery_address || '-'}</div>
          <div style={rowStyle}><b>TEL:</b> {data.custom_delivery_tel || '-'}</div>
        </div>

        {/* 出荷・荷主ボックス */}
        <div style={boxStyle}>
          <div style={boxHeaderStyle}>【荷主・運送情報】</div>
          <div style={rowStyle}><b>荷主:</b> {data.customer_name || '-'}</div>
          <div style={rowStyle}><b>出荷日:</b> {data.posting_date || '-'}</div>
          <div style={rowStyle}><b>納期:</b> {data.custom_delivery_date || '-'} {data.custom_delivery_time || ''}</div>
          <div style={rowStyle}><b>運送便:</b> {data.transporter_name || '-'}</div>
        </div>
      </div>

      {/* 中段：商品明細グリッド */}
      <div style={{ flex: 1, minHeight: 120, display: 'flex', flexDirection: 'column' }}>
        <div style={boxHeaderStyle}>【商品明細】</div>
        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 4, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f0f0f0' }}>
              <tr style={{ borderBottom: '2px solid #ccc' }}>
                <th style={thStyle}>商品番号</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>品名</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>数量</th>
                <th style={thStyle}>保管場所</th>
              </tr>
            </thead>
            <tbody>
              {(data.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#0066cc', fontWeight: 'bold' }}>
                    {item.item_code || '-'}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: '500' }}>{item.item_name || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>{item.qty ?? 0}</td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>{item.warehouse || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 下段：記事・備考（Access再現） */}
      <div style={{ ...boxStyle, backgroundColor: '#fafafa' }}>
        <div style={boxHeaderStyle}>【記事・備考】</div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px 8px', fontSize: 11, padding: 4 }}>
          <div style={labelStyle}>記事：</div>
          <div style={valueStyle}>{data.instructions || '（特記事項なし）'}</div>
          <div style={labelStyle}>備考：</div>
          <div style={valueStyle}>*請求書21日付 / JP送り状用 11495</div>
        </div>
      </div>
    </section>
  );
}

// 共通インラインスタイル
const placeholderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  backgroundColor: '#fff',
  borderRadius: 8,
  border: '1px solid #ccc',
  color: '#666',
};

const boxStyle = {
  border: '1px solid #ddd',
  borderRadius: 6,
  padding: '8px 10px',
  backgroundColor: '#fbfbfb',
};

const boxHeaderStyle = {
  fontSize: 12,
  fontWeight: 'bold' as const,
  color: '#2b579a',
  marginBottom: 6,
};

const rowStyle = {
  fontSize: 11,
  lineHeight: '1.6',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const thStyle = {
  padding: '6px',
  borderBottom: '1px solid #ccc',
  color: '#555',
  fontSize: 11,
};

const tdStyle = {
  padding: '6px',
  fontSize: 11,
};

const labelStyle = {
  fontWeight: 'bold' as const,
  color: '#555',
  textAlign: 'right' as const,
};

const valueStyle = {
  color: '#333',
};
