'use client';

import { StockEntry } from './types';

interface Props {
  doc: StockEntry | null;
}

export default function StockEntryHeader({
  doc,
}: Props) {

  const statusLabel =
    doc?.docstatus === 0
      ? 'Draft'
      : doc?.docstatus === 1
      ? 'Submitted'
      : doc?.docstatus === 2
      ? 'Cancelled'
      : 'New';

  const statusColor =
    doc?.docstatus === 0
      ? '#ff9800'
      : doc?.docstatus === 1
      ? '#4caf50'
      : doc?.docstatus === 2
      ? '#f44336'
      : '#9e9e9e';

  return (
    <div
      style={{
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #ddd',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
          }}
        >
          在庫入庫
        </h3>

        <span
          style={{
            background: statusColor,
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 16,
            fontSize: 12,
            fontWeight: 'bold',
          }}
        >
          {statusLabel}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '220px 180px 1fr',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: '#666',
            }}
          >
            Stock Entry
          </div>

          <div
            style={{
              fontWeight: 'bold',
            }}
          >
            {doc?.name || '未作成'}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              color: '#666',
            }}
          >
            Posting Date
          </div>

          <div>
            {doc?.posting_date || '-'}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              color: '#666',
            }}
          >
            Purpose
          </div>

          <div>
            {doc?.stock_entry_type || '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
