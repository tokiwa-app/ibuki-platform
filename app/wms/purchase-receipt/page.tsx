```tsx
'use client';

import { useState } from 'react';

import MasterDetailLayout from '../../../components/layout/MasterDetailLayout';
import ReceiptDetail from '../../../components/wms/ReceiptDetail';
import ReceiptList from '../../../components/wms/ReceiptList';

export default function PurchaseReceiptPage() {
  const [selectedName, setSelectedName] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaveSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedName('');
  };

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        padding: 12,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <MasterDetailLayout
        title="入庫管理"
        titleBackground="#2e7d32"
        titleColor="#fff"
        left={
          <ReceiptList
            selectedName={selectedName}
            onSelect={setSelectedName}
            refreshTrigger={refreshTrigger}
          />
        }
        right={
          <ReceiptDetail
            name={selectedName}
            onSaveSuccess={handleSaveSuccess}
          />
        }
      />
    </main>
  );
}
```
