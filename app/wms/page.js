'use client';

import { useEffect, useState } from 'react';
import DeliveryDetail from '../../components/wms/DeliveryDetail';
import DeliveryList from '../../components/wms/DeliveryList';

export default function WmsPage() {
  const [selectedName, setSelectedName] = useState('');

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>出庫一覧</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16 }}>
        <DeliveryList selectedName={selectedName} onSelect={setSelectedName} />
        <DeliveryDetail name={selectedName} />
      </div>
    </main>
  );
}
