'use client';

import {
  useEffect,
  useState,
} from 'react';

interface StockEntryReceiptProps {
  stockEntryName: string | null;
}

interface StockEntry {
  name: string;
  stock_entry_type?: string;
  posting_date?: string;
  posting_time?: string;
  status?: string;
  project?: string;
  creation?: string;
  modified?: string;
}

export default function StockEntryReceipt({
  stockEntryName,
}: StockEntryReceiptProps) {
  const [entry, setEntry] =
    useState<StockEntry | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');


  useEffect(() => {
    if (!stockEntryName) {
      setEntry(null);
      setError('');
      return;
    }


    async function fetchStockEntry() {
      setLoading(true);
      setError('');


      try {
        const response = await fetch(
          `/api/erpnext/stock-entry/receipt/${encodeURIComponent(
            stockEntryName,
          )}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );


        const text =
          await response.text();


        let result: unknown;


        try {
          result = JSON.parse(text);
        } catch {
          throw new Error(
            `APIがJSONを返していません。status=${response.status}`,
          );
        }


        if (!response.ok) {
          const message =
            typeof result === 'object' &&
            result !== null &&
            'error' in result &&
            typeof result.error === 'string'
              ? result.error
              : 'Stock Entry取得失敗';


          throw new Error(message);
        }


        setEntry(
          result as StockEntry,
        );


      } catch (e) {

        setEntry(null);

        setError(
          e instanceof Error
            ? e.message
            : 'Stock Entry取得失敗',
        );


      } finally {

        setLoading(false);

      }
    }


    void fetchStockEntry();

  }, [stockEntryName]);


  if (!stockEntryName) {
    return (
      <div
        style={{
          padding: 12,
          color: '#777',
        }}
      >
        入庫登録はありません。
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


  if (!entry) {
    return (
      <div
        style={{
          padding: 12,
          color: '#777',
        }}
      >
        入庫情報がありません。
      </div>
    );
  }


  return (
    <div
      style={{
        padding: 12,
        borderBottom:
          '1px solid #ddd',
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


      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '140px 1fr',
          gap: 8,
          fontSize: 14,
        }}
      >
        <div>番号</div>
        <div>
          {entry.name}
        </div>


        <div>入庫タイプ</div>
        <div>
          {entry.stock_entry_type ?? '-'}
        </div>


        <div>登録日</div>
        <div>
          {entry.posting_date ?? '-'}
        </div>


        <div>状態</div>
        <div>
          {entry.status ?? '-'}
        </div>


        <div>Project</div>
        <div>
          {entry.project ?? '-'}
        </div>


      </div>
    </div>
  );
}
