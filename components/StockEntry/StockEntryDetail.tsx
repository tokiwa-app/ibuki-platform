'use client';

import {
  useEffect,
  useState,
} from 'react';

interface StockEntryDetailProps {
  projectId: number | null;
}

interface StockEntry {
  project?: string | null;
}

export default function StockEntryDetail({
  projectId,
}: StockEntryDetailProps) {
  const [entries, setEntries] =
    useState<StockEntry[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (projectId == null) {
      setEntries([]);
      setError('');
      return;
    }

    async function fetchStockEntries() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/erpnext/stock-entry?projectId=${encodeURIComponent(
            String(projectId),
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
              : 'Stock Entryの取得に失敗しました';

          throw new Error(message);
        }


        if (Array.isArray(result)) {
          setEntries(result);
          return;
        }


        if (
          typeof result === 'object' &&
          result !== null &&
          'data' in result &&
          Array.isArray(result.data)
        ) {
          setEntries(result.data);
          return;
        }


        setEntries([]);

      } catch (e) {

        console.error(
          'Stock Entry取得エラー',
          e,
        );

        setEntries([]);

        setError(
          e instanceof Error
            ? e.message
            : 'Stock Entryの取得に失敗しました',
        );

      } finally {
        setLoading(false);
      }
    }

    void fetchStockEntries();

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
        Stock Entryを読込中...
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
        Stock Entry
      </h3>


      {entries.length === 0 ? (
        <div style={{ color: '#777' }}>
          Stock Entryはありません。
        </div>
      ) : (
        entries.map((entry, index) => (
          <div
            key={index}
            style={{
              padding: 12,
              borderBottom:
                '1px solid #eee',
            }}
          >
            Project:
            <strong>
              {entry.project ?? '-'}
            </strong>
          </div>
        ))
      )}

    </div>
  );
}
