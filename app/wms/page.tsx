'use client';

import { useState } from 'react';
import DeliveryDetail from '../../components/wms/DeliveryDetail';
import DeliveryList from '../../components/wms/DeliveryList';

export type DeliveryNote = {
  name: string;
  customer_name?: string;
  customer?: string;
  posting_date?: string;
  status?: string;
  transporter_name?: string;
  instructions?: string;
  custom_delivery_name?: string;
  custom_delivery_zip?: string;
  custom_delivery_address?: string;
  custom_delivery_tel?: string;
  custom_delivery_date?: string;
  custom_delivery_time?: string;
  items?: Array<{
    name: string;
    item_code?: string;
    item_name?: string;
    qty?: number;
    warehouse?: string;
  }>;
};

export default function WmsPage() {
  const [selectedData, setSelectedData] = useState<DeliveryNote | null>(null);

  return (
    <main
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        backgroundColor: '#f3f4f6',
        color: '#333',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '12px 16px',
          backgroundColor: '#2b579a',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 'bold' }}>出庫一覧・詳細（WMS）</h1>
          <div style={{ fontSize: 13, backgroundColor: '#1e3f73', padding: '4px 8px', borderRadius: 4 }}>
            期間: 2026/06/05 〜 2026/08/14
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={buttonStyle}>佐川CSV取込</button>
          <button style={buttonStyle}>大和(本日出荷)</button>
          <button style={{ ...buttonStyle, backgroundColor: '#d9534f' }}>終了</button>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: 12,
          overflow: 'hidden',
        }}
      >
        {/* selectedName を selectedData.name から確実に渡す */}
        <DeliveryList 
          selectedName={selectedData?.name || ''} 
          onSelectData={setSelectedData} 
        />
        <DeliveryDetail 
          data={selectedData} 
        />
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: '6px 12px',
  backgroundColor: '#f0f0f0',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 'bold' as const,
};
