'use client';

import { useEffect, useState } from 'react';

export default function DeliveryDetail({ name }) {
  const [data, setData] = useState(null);
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
      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
        出庫を選択してください。
      </section>
    );
  }

  if (loading) {
    return (
      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
        読み込み中...
      </section>
    );
  }

  if (!data) {
    return (
      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
        データがありません。
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>出庫詳細</h2>

      <p><b>荷主：</b>{data.customer_name || data.customer || '-'}</p>
      <p><b>納品先：</b>{data.shipping_address_name || '-'}</p>
      <p><b>住所：</b>{data.shipping_address || '-'}</p>
      <p><b>運送：</b>{data.transporter_name || data.transporter || '-'}</p>
      <p><b>出荷日：</b>{data.posting_date || '-'}</p>
      <p><b>納期：</b>{data.delivery_date || '-'}</p>
      <p><b>状態：</b>{data.status || '-'}</p>

      <h3>明細</h3>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>商品</th>
            <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>数量</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>倉庫</th>
          </tr>
        </thead>
        <tbody>
          {(data.items || []).map((item) => (
            <tr key={item.name}>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                {item.item_name || item.item_code}
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'right' }}>
                {item.qty}
              </td>
              <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                {item.warehouse || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
