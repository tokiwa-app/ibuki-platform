'use client';

import React, { useEffect, useState } from 'react';

interface ReceiptListProps {
  selectedName: string;
  onSelect: (name: string) => void;
  refreshTrigger: number;
}

export default function ReceiptList({ selectedName, onSelect, refreshTrigger }: ReceiptListProps) {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchReceipts() {
      setLoading(true);
      try {
        // ERPNextから直接入庫データを取得するAPI（仮）
        // ※ 既存のGET APIがある、または別途作成する場合
        const fields = '["name","supplier","posting_date","docstatus"]';
        const res = await fetch(`/api/resource/Purchase Receipt?fields=${fields}&order_by=creation desc&limit_page_length=50`);
        const data = await res.json();
        setReceipts(data.data || []);
      } catch (err) {
        console.error('入庫履歴の取得に失敗しました', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReceipts();
  }, [refreshTrigger]);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 6,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', backgroundColor: '#fafafa' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 'bold' }}>入庫履歴（最近の50件）</h3>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {loading ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>読込中...</div>
        ) : receipts.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#999' }}>入庫履歴がありません</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {receipts.map((rc) => {
              const isSelected = rc.name === selectedName;
              return (
                <div
                  key={rc.name}
                  onClick={() => onSelect(rc.name)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 4,
                    border: isSelected ? '1px solid #2e7d32' : '1px solid #e0e0e0',
                    backgroundColor: isSelected ? '#e8f5e9' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 'bold', fontSize: 13, color: isSelected ? '#1b5e20' : '#333' }}>
                      {rc.name}
                    </span>
                    <span style={{ fontSize: 11, color: '#888' }}>{rc.posting_date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    荷主/仕入先: <strong>{rc.supplier}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
