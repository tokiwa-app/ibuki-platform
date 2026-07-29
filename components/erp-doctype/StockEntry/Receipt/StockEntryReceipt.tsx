'use client';

import {
  useEffect,
  useState,
} from 'react';

interface StockEntryReceiptProps {
  erpProjectId: string | null;
}

interface StockEntry {
  name: string;
  stock_entry_type?: string;
  posting_date?: string;
  status?: string;
}

export default function StockEntryReceipt({
  erpProjectId,
}: StockEntryReceiptProps) {
  const [entries, setEntries] =
    useState<StockEntry[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');


  useEffect(() => {
    if (!erpProjectId) {
      setEntries([]);
      return;
    }


    async function fetchStockEntryReceipt() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/erpnext/stock-entry?erpProjectId=${encodeURIComponent(
            erpProjectId,
          )}`,
          {
            cache: 'no-store',
          },
        );


        const result =
          await response.json();


        if (!response.ok) {
          throw new Error(
            result?.error ??
              'Stock Entry取得失敗',
          );
        }


        const data =
          Array.isArray(result)
            ? result
            : result.data ?? [];


        // 入庫系だけ
        setEntries(
          data.filter(
            (entry: StockEntry) =>
              entry.stock_entry_type ===
              'Material Receipt',
          ),
        );


      } catch (e) {

        setEntries([]);

        setError(
          e instanceof Error
            ? e.message
            : 'Stock Entry取得失敗',
        );

      } finally {

        setLoading(false);

      }
    }


    void fetchStockEntryReceipt();

  }, [erpProjectId]);


  if (!erpProjectId) {
    return (
      <div style={{ padding: 12 }}>
        ERPプロジェクト未連携
      </div>
    );
  }


  if (loading) {
    return (
      <div style={{ padding: 12 }}>
        入庫情報読込中...
      </div>
    );
  }


  if (error) {
    return (
      <div
        style={{
          padding: 12,
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
        padding: 12,
      }}
    >
      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 15,
        }}
      >
        在庫入庫（Stock Entry）
      </h3>


      {entries.length === 0 ? (
        <div
          style={{
            color: '#777',
          }}
        >
          入庫履歴はありません。
        </div>
      ) : (

        entries.map((entry) => (
          <div
            key={entry.name}
            style={{
              display: 'grid',
              gridTemplateColumns:
                '180px 160px 120px',
              gap: 8,
              padding: 8,
              borderBottom:
                '1px solid #eee',
            }}
          >
            <div>
              {entry.name}
            </div>

            <div>
              {entry.stock_entry_type}
            </div>

            <div>
              {entry.posting_date ?? '-'}
            </div>

          </div>
        ))

      )}

    </div>
  );
}
