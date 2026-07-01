'use client';

import { useEffect, useState } from 'react';

export default function DeliveryList({ selectedName, onSelect }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/erpnext/delivery-note');
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    }

    load();
  }, []);

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
          <div style={{ marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            納品　　{row.shipping_address_name || '-'} ｜ {row.shipping_address || '-'}
          </div>
          <div style={{ marginTop: 6 }}>
            運送　　{row.transporter_name || row.transporter || '-'}
          </div>
          <div style={{ marginTop: 6, color: '#666', fontSize: 13 }}>
            出荷　{row.posting_date || '-'}　　納期　{row.delivery_date || '-'}
          </div>
        </button>
      ))}
    </section>
  );
}
