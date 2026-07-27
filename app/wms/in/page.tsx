'use client';

import { useState } from 'react';

import MasterDetailLayout from '../../../components/layout/MasterDetailLayout';
import ReceiptDetail from '../../../components/wms/ReceiptDetail';
import ProjectList from '../../../components/wms/in/ProjectList';

export default function PurchaseReceiptPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
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
          <ProjectList
            selectedId={selectedId}
            onSelect={setSelectedId}
            projectType="入庫案件"
          />
        }
        right={
          <ReceiptDetail
            name=""
            onSaveSuccess={() => {}}
          />
        }
      />
    </main>
  );
}
