'use client';

import { useState } from 'react';
import DeliveryDetail from '../../components/wms/DeliveryDetail';
import DeliveryList from '../../components/wms/DeliveryList';

export default function WmsPage() {
  const [selectedName, setSelectedName] = useState('');

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
      {/* 上部ツールバー */}
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

      {/* メインエリア（50:50等分割） */}
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
        {/* 【ここを確実に修正！】onSelect={setSelectedName} で正しいID連携に。 */}
        <DeliveryList 
          selectedName={selectedName} 
          onSelect={setSelectedName} 
        />
        <DeliveryDetail 
          name={selectedName} 
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
