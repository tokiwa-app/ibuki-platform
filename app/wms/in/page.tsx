'use client';

import { useState } from 'react';

import MasterDetailLayout from '../../../components/layout/MasterDetailLayout';
import ProjectList from '../../../components/projects/ProjectList';
import ProjectDetail from '../../../components/wms/in/Detail/ProjectDetail';

export default function PurchaseReceiptPage() {
  const [projectId, setProjectId] =
    useState<number | null>(null);

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
            selectedId={projectId}
            onSelect={setProjectId}
            projectType="入庫案件"
          />
        }
        right={
          <ProjectDetail
            projectId={projectId}
          />
        }
      />
    </main>
  );
}
