'use client';

import { useEffect, useState } from 'react';

import {
  getTransactions,
  Transaction,
} from '../../../components/supabase/transactions/getTransactions';

const th: React.CSSProperties = {
  border: '1px solid #666',
  padding: '3px 5px',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  fontSize: 12,
  fontWeight: 700,
  backgroundColor: '#e5e7eb',
};

const td: React.CSSProperties = {
  border: '1px solid #aaa',
  padding: '2px 5px',
  whiteSpace: 'nowrap',
  fontSize: 12,
  height: 25,
};

const tdNumber: React.CSSProperties = {
  ...td,
  textAlign: 'right',
};

const buttonStyle: React.CSSProperties = {
  height: 28,
  padding: '0 12px',
  border: '1px solid #24508f',
  borderRadius: 4,
  backgroundColor: '#4472c4',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 700,
};

function num(
  value: number | null | undefined
) {
  return Number(value ?? 0);
}

function numberFormat(
  value: number | null | undefined
) {
  const n = num(value);

  if (n === 0) {
    return '';
  }

  return n.toLocaleString('ja-JP');
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) {
    return '';
  }

  const parts = value.split('-');

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;

  return `${year.slice(2)}/${month}/${day}`;
}

export default function WmsOutPage() {
  const [rows, setRows] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [dateFrom, setDateFrom] =
    useState('');

  const [dateTo, setDateTo] =
    useState('');

  async function fetchTransactions() {
    setLoading(true);
    setError('');

    try {
      const data =
        await getTransactions(
          dateFrom,
          dateTo
        );

      setRows(data);
    } catch (e) {
      console.error(e);

      setRows([]);

      setError(
        e instanceof Error
          ? e.message
          : '取得失敗'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchTransactions();
  }, []);

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        boxSizing: 'border-box',
        fontFamily:
          '"Yu Gothic", "Meiryo", sans-serif',
      }}
    >
      {/* 上部操作 */}

      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: 5,
          padding: 6,
          backgroundColor: '#eef1f5',
          borderBottom:
            '1px solid #999',
          flexWrap: 'wrap',
        }}
      >
        <button style={buttonStyle}>
          入庫・加工・調整・参照
        </button>

        <button style={buttonStyle}>
          本日の出荷
        </button>

        <button style={buttonStyle}>
          取引先マスタ
        </button>

        <button style={buttonStyle}>
          CSVデータ取込
        </button>

        <button style={buttonStyle}>
          製品マスタ
        </button>

        <button style={buttonStyle}>
          構成マスタ
        </button>

        <button
          style={{
            ...buttonStyle,
            marginLeft: 15,
          }}
          onClick={() =>
            void fetchTransactions()
          }
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
          backgroundColor: '#fff',
          borderBottom:
            '1px solid #aaa',
          fontSize: 12,
        }}
      >
        <span>納品日</span>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) =>
            setDateFrom(
              e.target.value
            )
          }
        />

        <span>～</span>

        <input
          type="date"
          value={dateTo}
          onChange={(e) =>
            setDateTo(
              e.target.value
            )
          }
        />

        <button
          style={buttonStyle}
          onClick={() =>
            void fetchTransactions()
          }
        >
          検索
        </button>

        <span
          style={{
            marginLeft: 15,
            fontWeight: 700,
          }}
        >
          {loading
            ? '読込中...'
            : `${rows.length} 件`}
        </span>

        {error && (
          <span
            style={{
              color: '#c00',
              fontWeight: 700,
            }}
          >
            {error}
          </span>
        )}
      </div>

      {/* 一覧 */}

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#fff',
        }}
      >
        <table
          style={{
            borderCollapse:
              'collapse',
            minWidth: 1900,
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
              <th
                rowSpan={2}
                style={th}
              >
                区分
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                ID
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                登録日
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                納品日
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                請求先
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                名称
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                担当
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                D月
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                P月
              </th>

              {/* 支払 */}

              <th
                colSpan={5}
                style={{
                  ...th,
                  backgroundColor:
                    '#f5b5d2',
                }}
              >
                支払
              </th>

              {/* 請求 */}

              <th
                colSpan={5}
                style={{
                  ...th,
                  backgroundColor:
                    '#b9e8f0',
                }}
              >
                請求
              </th>

              <th
                rowSpan={2}
                style={{
                  ...th,
                  backgroundColor:
                    '#c6efce',
                }}
              >
                粗利
              </th>

              <th
                rowSpan={2}
                style={th}
              >
                明細
              </th>
            </tr>

            <tr>
              {/* P */}

              <th style={th}>
                数量
              </th>

              <th style={th}>
                重量
              </th>

              <th style={th}>
                単価
              </th>

              <th style={th}>
                割増
              </th>

              <th style={th}>
                金額
              </th>

              {/* D */}

              <th style={th}>
                数量
              </th>

              <th style={th}>
                重量
              </th>

              <th style={th}>
                単価
              </th>

              <th style={th}>
                割増
              </th>

              <th style={th}>
                金額
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const details =
                row.t_transaction_details ??
                [];

              /*
               * 新方式
               *
               * transaction 1件
               *   D 最大1件
               *   P 最大1件
               *   normal 複数
               */

              const dDetail =
                details.find(
                  (detail) =>
                    detail.detail_type ===
                    'D'
                );

              const pDetail =
                details.find(
                  (detail) =>
                    detail.detail_type ===
                    'P'
                );

              const normalDetails =
                details.filter(
                  (detail) =>
                    !detail.detail_type ||
                    detail.detail_type ===
                      'normal'
                );

              /*
               * 支払
               *
               * P代表行が存在すれば
               * 新方式を優先。
               *
               * 無ければ旧
               * t_transactions.p_*
               * を使用。
               */

              const pQuantity =
                pDetail?.quantity ??
                row.p_quantity;

              const pUnitPrice =
                pDetail?.unit_price ??
                row.p_unit_price;

              const pWeight =
                row.p_weight;

              const pPremium =
                row.p_premium;

              let pAmount = 0;

              if (
                pDetail?.amount !==
                  null &&
                pDetail?.amount !==
                  undefined
              ) {
                pAmount = num(
                  pDetail.amount
                );
              } else {
                pAmount =
                  num(row.p_quantity) *
                    num(
                      row.p_unit_price
                    ) +
                  num(row.p_premium);
              }

              /*
               * 請求
               */

              const dQuantity =
                dDetail?.quantity ??
                row.d_quantity;

              const dUnitPrice =
                dDetail?.unit_price ??
                row.d_unit_price;

              const dWeight =
                row.d_weight;

              const dPremium =
                row.d_premium;

              let dAmount = 0;

              if (
                dDetail?.amount !==
                  null &&
                dDetail?.amount !==
                  undefined
              ) {
                dAmount = num(
                  dDetail.amount
                );
              } else {
                dAmount =
                  num(row.d_quantity) *
                    num(
                      row.d_unit_price
                    ) +
                  num(row.d_premium);
              }

              const profit =
                dAmount - pAmount;

              const selected =
                selectedId === row.id;

              return (
                <tr
                  key={row.id}
                  onClick={() =>
                    setSelectedId(
                      row.id
                    )
                  }
                  style={{
                    backgroundColor:
                      selected
                        ? '#fff4b8'
                        : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {/* 区分 */}

                  <td style={td}>
                    {row.category ??
                      ''}
                  </td>

                  {/* ID */}

                  <td
                    style={tdNumber}
                  >
                    {row.id}
                  </td>

                  {/* 登録日 */}

                  <td style={td}>
                    {formatDate(
                      row.date_created
                    )}
                  </td>

                  {/* 納品日 */}

                  <td style={td}>
                    {formatDate(
                      row.delivery_date
                    )}
                  </td>

                  {/* 請求先 */}

                  <td
                    style={tdNumber}
                  >
                    {row.billing_id ??
                      ''}
                  </td>

                  {/* 名称 */}

                  <td
                    style={{
                      ...td,
                      minWidth: 220,
                      maxWidth: 350,
                      overflow:
                        'hidden',
                      textOverflow:
                        'ellipsis',
                    }}
                  >
                    {row.project_name ||
                      row.item_name ||
                      row.name ||
                      ''}
                  </td>

                  {/* 担当 */}

                  <td style={td}>
                    {row.staff || ''}
                  </td>

                  {/* D月 */}

                  <td style={td}>
                    {row.d_month ||
                      ''}
                  </td>

                  {/* P月 */}

                  <td style={td}>
                    {row.p_month ||
                      ''}
                  </td>

                  {/* P 数量 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      pQuantity
                    )}
                  </td>

                  {/* P 重量 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      pWeight
                    )}
                  </td>

                  {/* P 単価 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      pUnitPrice
                    )}
                  </td>

                  {/* P 割増 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      pPremium
                    )}
                  </td>

                  {/* P 金額 */}

                  <td
                    style={{
                      ...tdNumber,
                      backgroundColor:
                        '#ffd0e3',
                      fontWeight: 700,
                    }}
                  >
                    {numberFormat(
                      pAmount
                    )}
                  </td>

                  {/* D 数量 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      dQuantity
                    )}
                  </td>

                  {/* D 重量 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      dWeight
                    )}
                  </td>

                  {/* D 単価 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      dUnitPrice
                    )}
                  </td>

                  {/* D 割増 */}

                  <td
                    style={tdNumber}
                  >
                    {numberFormat(
                      dPremium
                    )}
                  </td>

                  {/* D 金額 */}

                  <td
                    style={{
                      ...tdNumber,
                      backgroundColor:
                        '#d5f7fa',
                      fontWeight: 700,
                    }}
                  >
                    {numberFormat(
                      dAmount
                    )}
                  </td>

                  {/* 粗利 */}

                  <td
                    style={{
                      ...tdNumber,
                      backgroundColor:
                        profit < 0
                          ? '#ffd6d6'
                          : '#d9f7d9',
                      fontWeight: 700,
                    }}
                  >
                    {numberFormat(
                      profit
                    )}
                  </td>

                  {/* 通常明細数 */}

                  <td
                    style={{
                      ...td,
                      textAlign:
                        'center',
                    }}
                  >
                    {normalDetails.length}
                  </td>
                </tr>
              );
            })}

            {!loading &&
              rows.length === 0 && (
                <tr>
                  <td
                    colSpan={21}
                    style={{
                      padding: 30,
                      textAlign:
                        'center',
                      fontSize: 14,
                    }}
                  >
                    {error
                      ? 'データを取得できませんでした'
                      : 'データがありません'}
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>

      {/* 下部 */}

      <div
        style={{
          flexShrink: 0,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          borderTop:
            '1px solid #aaa',
          backgroundColor: '#eef1f5',
          fontSize: 12,
        }}
      >
        {selectedId
          ? `選択中 ID: ${selectedId}`
          : `${rows.length} 件`}
      </div>
    </main>
  );
}
