'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '../../../lib/supabaseClient';

type Detail = {
  id: number;
  transaction_id: number | null;
  detail_type: string;
  product_attribute: string;

  quantity: number | null;
  unit_price: number | null;
  amount: number | null;
  invoice_amount: number | null;

  qty_ctn: number | null;
  fraction: number | null;

  warehouse_id: number | null;
  storage_location: string | null;
  lot_no: string | null;
};

type Transaction = {
  id: number;

  date_created: string | null;
  delivery_date: string | null;

  category: number;
  delivery_source: string | null;
  staff: string | null;

  billing_id: number | null;
  payment_destination_id: number | null;

  project_name: string | null;
  item_name: string | null;
  name: string | null;

  d_month: string;
  p_month: string;

  status: string | null;
  notes: string | null;

  t_transaction_details: Detail[];
};

const th: React.CSSProperties = {
  border: '1px solid #555',
  padding: '3px 5px',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  fontSize: 12,
  fontWeight: 700,
  background: '#e5e7eb',
};

const td: React.CSSProperties = {
  border: '1px solid #aaa',
  padding: '2px 5px',
  whiteSpace: 'nowrap',
  fontSize: 12,
  height: 25,
};

const buttonStyle: React.CSSProperties = {
  height: 28,
  padding: '0 12px',
  border: '1px solid #24508f',
  borderRadius: 4,
  background: '#4472c4',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12,
};

function n(value: number | null | undefined) {
  return Number(value ?? 0);
}

function money(value: number | null | undefined) {
  const v = n(value);
  return v === 0 ? '0' : v.toLocaleString('ja-JP');
}

function formatDate(value: string | null) {
  if (!value) return '';

  const [y, m, d] = value.split('-');

  if (!y || !m || !d) return value;

  return `${y.slice(2)}/${m}/${d}`;
}

export default function WmsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    let query = supabase
      .from('t_transactions')
      .select(`
        id,
        date_created,
        delivery_date,
        category,
        delivery_source,
        staff,
        billing_id,
        payment_destination_id,
        project_name,
        item_name,
        name,
        d_month,
        p_month,
        status,
        notes,

        t_transaction_details (
          id,
          transaction_id,
          detail_type,
          product_attribute,
          quantity,
          unit_price,
          amount,
          invoice_amount,
          qty_ctn,
          fraction,
          warehouse_id,
          storage_location,
          lot_no
        )
      `)
      .order('delivery_date', {
        ascending: false,
        nullsFirst: false,
      })
      .order('id', {
        ascending: false,
      })
      .limit(500);

    if (dateFrom) {
      query = query.gte('delivery_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('delivery_date', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as Transaction[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f3f4f6',
        overflow: 'hidden',
        fontFamily: 'sans-serif',
      }}
    >
      {/* 上部ボタン */}
      <div
        style={{
          flexShrink: 0,
          padding: 6,
          display: 'flex',
          gap: 5,
          flexWrap: 'wrap',
          borderBottom: '1px solid #999',
          background: '#eef1f5',
        }}
      >
        <button style={buttonStyle}>入庫・加工・調整・参照</button>
        <button style={buttonStyle}>本日の出荷</button>
        <button style={buttonStyle}>取引先マスタ</button>
        <button style={buttonStyle}>CSVデータ取込</button>
        <button style={buttonStyle}>製品マスタ</button>
        <button style={buttonStyle}>構成マスタ</button>

        <button
          style={{
            ...buttonStyle,
            marginLeft: 20,
          }}
          onClick={loadData}
        >
          更新
        </button>
      </div>

      {/* 検索 */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 8px',
          background: '#fff',
          borderBottom: '1px solid #aaa',
          fontSize: 12,
        }}
      >
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />

        <span>～</span>

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />

        <button
          style={buttonStyle}
          onClick={loadData}
        >
          検索
        </button>

        <span style={{ marginLeft: 15 }}>
          {loading ? '読込中...' : `${rows.length}件`}
        </span>

        {error && (
          <span style={{ color: 'red' }}>
            {error}
          </span>
        )}
      </div>

      {/* 一覧 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#fff',
        }}
      >
        <table
          style={{
            borderCollapse: 'collapse',
            minWidth: 1800,
            width: '100%',
          }}
        >
          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <tr>
              <th rowSpan={2} style={th}>区分</th>
              <th rowSpan={2} style={th}>ID</th>
              <th rowSpan={2} style={th}>出荷日</th>
              <th rowSpan={2} style={th}>納品日</th>
              <th rowSpan={2} style={th}>請求先ID</th>
              <th rowSpan={2} style={th}>名称</th>
              <th rowSpan={2} style={th}>担当</th>
              <th rowSpan={2} style={th}>D月</th>
              <th rowSpan={2} style={th}>P月</th>

              <th
                colSpan={4}
                style={{
                  ...th,
                  background: '#f5b5d2',
                }}
              >
                支払
              </th>

              <th
                colSpan={4}
                style={{
                  ...th,
                  background: '#b9e8f0',
                }}
              >
                請求
              </th>

              <th
                rowSpan={2}
                style={{
                  ...th,
                  background: '#c6efce',
                }}
              >
                粗利
              </th>

              <th rowSpan={2} style={th}>
                明細
              </th>
            </tr>

            <tr>
              <th style={th}>数量</th>
              <th style={th}>単価</th>
              <th style={th}>割増</th>
              <th style={th}>金額</th>

              <th style={th}>数量</th>
              <th style={th}>単価</th>
              <th style={th}>割増</th>
              <th style={th}>金額</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const details = row.t_transaction_details ?? [];

              /*
               * detail_type によって
               * D/P代表行を1件取得
               */
              const p = details.find(
                (x) => x.detail_type === 'P'
              );

              const d = details.find(
                (x) => x.detail_type === 'D'
              );

              const normalCount = details.filter(
                (x) => x.detail_type === 'normal'
              ).length;

              const pAmount = n(p?.amount);
              const dAmount = n(d?.amount);

              const profit = dAmount - pAmount;

              const selected = selectedId === row.id;

              return (
                <tr
                  key={row.id}
                  onClick={() => setSelectedId(row.id)}
                  style={{
                    background: selected
                      ? '#fff4b8'
                      : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  <td style={td}>
                    {row.category}
                  </td>

                  <td style={td}>
                    {row.id}
                  </td>

                  <td style={td}>
                    {formatDate(row.date_created)}
                  </td>

                  <td style={td}>
                    {formatDate(row.delivery_date)}
                  </td>

                  <td style={td}>
                    {row.billing_id ?? ''}
                  </td>

                  <td
                    style={{
                      ...td,
                      minWidth: 200,
                    }}
                  >
                    {row.project_name ??
                      row.item_name ??
                      row.name ??
                      ''}
                  </td>

                  <td style={td}>
                    {row.staff ?? ''}
                  </td>

                  <td style={td}>
                    {row.d_month}
                  </td>

                  <td style={td}>
                    {row.p_month}
                  </td>

                  {/* P */}
                  <td style={td}>
                    {money(p?.quantity)}
                  </td>

                  <td style={td}>
                    {money(p?.unit_price)}
                  </td>

                  <td style={td}>
                    0
                  </td>

                  <td
                    style={{
                      ...td,
                      background: '#ffd0e3',
                    }}
                  >
                    {money(pAmount)}
                  </td>

                  {/* D */}
                  <td style={td}>
                    {money(d?.quantity)}
                  </td>

                  <td style={td}>
                    {money(d?.unit_price)}
                  </td>

                  <td style={td}>
                    0
                  </td>

                  <td
                    style={{
                      ...td,
                      background: '#d5f7fa',
                    }}
                  >
                    {money(dAmount)}
                  </td>

                  {/* 粗利 */}
                  <td
                    style={{
                      ...td,
                      background: '#d9f7d9',
                      fontWeight: 700,
                    }}
                  >
                    {money(profit)}
                  </td>

                  <td style={td}>
                    {normalCount}
                  </td>
                </tr>
              );
            })}

            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={19}
                  style={{
                    padding: 30,
                    textAlign: 'center',
                  }}
                >
                  データなし
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
