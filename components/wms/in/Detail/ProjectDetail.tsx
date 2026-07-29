'use client';

import PurchaseReceiptDetail from '../../../../erp-doctype/PurchaseReceipt/PurchaseReceiptDetail';
import StockEntryDetail from '../../../../erp-doctype/StockEntryDetail';

interface ProjectDetailProps {
  projectId: number | null;
}

export default function ProjectDetail({
  projectId,
}: ProjectDetailProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom: '1px solid #ddd',
          flexShrink: 0,
        }}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: 8,
            fontSize: 18,
          }}
        >
          プロジェクト明細
        </h2>

        <div>
          Project ID : {projectId ?? '-'}
        </div>
      </div>


      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >

        <div
          style={{
            marginBottom: 24,
          }}
        >
          <PurchaseReceiptDetail
            projectId={projectId}
          />
        </div>


        <div
          style={{
            borderTop: '1px solid #ddd',
            paddingTop: 16,
          }}
        >
          <StockEntryDetail
            projectId={projectId}
          />
        </div>

      </div>

    </div>
  );
}
