'use client';

import { useEffect, useState } from 'react';

type DeliveryNoteRow = {
  name: string;
  customer?: string;
  customer_name?: string;
  posting_date?: string;
  status?: string;
  total_qty?: number;
  transporter?: string;
  transporter_name?: string;
  custom_delivery_name?: string;
  custom_delivery_zip?: string;
  custom_delivery_address?: string;
  custom_delivery_tel?: string;
  custom_delivery_date?: string;
  custom_delivery_time?: string;
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

      const res = await fetch('/api/erpnext/delivery-note');
      const data = await res.json();

      setRows(Array.isArray(data) ? data : []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
        読み込み中...
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}>
      {rows.map((row) => (
        <button
          key={row.name}
          onClick={() => onSelect(row.name)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: 14,
            border: 0,
            borderBottom: '1px solid #eee',
            background: selectedName === row.name ? '#f0f6ff' : '#fff',
            cursor: 'pointer',
          }}
        >
          <div>荷主　　{row.customer_name || row.customer || '-'}</div>

          <div
            style={{
              marginTop: 6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            納品　　{row.custom_delivery_name || '-'} ｜{' '}
            {row.custom_delivery_address || '-'}
          </div>

          <div style={{ marginTop: 6 }}>
            運送　　{row.transporter_name || row.transporter || '-'}
          </div>

          <div style={{ marginTop: 6, color: '#666', fontSize: 13 }}>
            出荷　{row.posting_date || '-'}　　納期{' '}
            {row.custom_delivery_date || '-'} {row.custom_delivery_time || ''}
          </div>
        </button>
      ))}
    </section>
  );
}
