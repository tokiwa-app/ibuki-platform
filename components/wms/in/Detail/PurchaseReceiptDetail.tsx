'use client';

import {
  useEffect,
  useState,
} from 'react';

interface PurchaseReceiptDetailProps {
  projectId: number | null;
}

interface PurchaseReceipt {
  name: string;
  supplier?: string;
  posting_date?: string;
  status?: string;
  grand_total?: number;
}

export default function PurchaseReceiptDetail({
  projectId,
}: PurchaseReceiptDetailProps) {
  const [receipts, setReceipts] =
    useState<PurchaseReceipt[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (projectId == null) {
      setReceipts([]);
      return;
    }

    async function fetchPurchaseReceipts() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/erpnext/purchase-receipts/project/${projectId}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              'Purchase Receiptの取得に失敗しました',
          );
        }

        setReceipts(
          Array.isArray(result)
            ? result
            : result.data ?? [],
        );
      } catch (e) {
        setReceipts([]);

        setError(
          e instanceof Error
            ? e.message
            : 'Purchase Receiptの取得に失敗しました',
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchPurchaseReceipts();
  }, [projectId]);

  if (projectId == null) {
    return (
      <div style={{ padding: 16 }}>
        プロジェクトを選択してください。
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        Purchase Receiptを読込中...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          color: '#c62828',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 15,
        }}
      >
        Purchase Receipt
      </h3>

      {receipts.length === 0 ? (
        <div style={{ color: '#777' }}>
          Purchase Receiptはありません。
        </div>
      ) : (
        receipts.map((receipt) => (
          <div
            key={receipt.name}
            style={{
              display: 'grid',
              gridTemplateColumns:
                '160px 1fr 120px 100px',
              gap: 8,
              padding: '8px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <div>{receipt.name}</div>

            <div>
              {receipt.supplier ?? '-'}
            </div>

            <div>
              {receipt.posting_date ?? '-'}
            </div>

            <div>
              {receipt.status ?? '-'}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
