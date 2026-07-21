'use client';

import { useState } from 'react';

import MasterDetailLayout from '../../../components/layout/MasterDetailLayout';
import DeliveryDetail from '../../../components/wms/DeliveryDetail';
import DeliveryList from '../../../components/wms/DeliveryList';

export default function WmsPage() {
  const [selectedName, setSelectedName] = useState('');

  return (
    <main
      style={{
        width: '100%',
        height: '100vh',
        padding: 12,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <MasterDetailLayout
        title="出庫管理"
        titleBackground="#2b579a"
        titleColor="#fff"
        left={
          <DeliveryList
            selectedName={selectedName}
            onSelect={setSelectedName}
          />
        }
        right={
          <DeliveryDetail
            name={selectedName}
          />
        }
      />
    </main>
  );
}
