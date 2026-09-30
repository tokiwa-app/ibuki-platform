'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

// ========================================
// 共通スタイル
// ========================================

const th = {
  border: '1px solid #555',
  padding: '3px 5px',
  whiteSpace: 'nowrap',
  textAlign: 'center',
  fontSize: 12,
  fontWeight: 700,
  background: '#e5e7eb',
};

const td = {
  border: '1px solid #aaa',
  padding: '2px 5px',
  whiteSpace: 'nowrap',
  fontSize: 12,
  height: 25,
};

const tdNumber = {
  ...td,
  textAlign: 'right',
};

const buttonStyle = {
  height: 28,
  padding: '0 12px',
  border: '1px solid #24508f',
  borderRadius: 4,
  background: '#4472c4',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 12,
};

// ========================================
// Utility
// ========================================

function num(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const n = Number(value);

  return Number.isFinite(n) ? n : 0;
}

function numberFormat(value) {
  const n = num(value);

  if (n === 0) {
    return '';
  }

  return n.toLocaleString('ja-JP');
}

function formatDate(value) {
  if (!value) return '';

  const parts = value.split('-');

  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;

  return `${year.slice(2)}/${month}/${day}`;
}

// ========================================
// Page
// ========================================

export default function WmsPage() {
  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ========================================
  // Supabase取得
  // ========================================

  async function loadData() {
    setLoading(true);
    setError('');

    try {
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

          d_quantity,
          d_unit_price,
          d_premium,
          d_weight,

          p_quantity,
          p_unit_price,
          p_premium,
          p_weight,

          t_transaction_details (
            id,
            transaction_id,
            detail_type,
            product_attribute,
            product_id,
            item_name,
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

      // 日付検索
      if (dateFrom) {
        query = query.gte('delivery_date', dateFrom);
      }

      if (dateTo) {
        query = query.lte('delivery_date', dateTo);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setRows(data || []);
    } catch (err) {
      console.error('Supabase load error:', err);

      setError(
        err?.message ||
        'データの取得に失敗しました'
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  // ========================================
  // 初回読込
  // ========================================

  useEffect(() => {
    loadData();
  }, []);

  // ========================================
  // Render
  // ========================================

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f3f4f6',
        overflow: 'hidden',
        fontFamily:
          '"Yu Gothic", "Meiryo", sans-serif',
      }}
    >
      {/* ====================================
          上部ボタン
      ==================================== */}

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
          onClick={loadData}
        >
          更新
        </button>
      </div>

      {/* ====================================
          検索エリア
      ==================================== */}

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
        <span>納品日</span>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) =>
            setDateFrom(e.target.value)
          }
        />

        <span>～</span>

        <input
          type="date"
          value={dateTo}
          onChange={(e) =>
            setDateTo(e.target.value)
          }
        />

        <button
          style={buttonStyle}
          onClick={loadData}
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
              marginLeft: 15,
              color: '#c00',
              fontWeight: 700,
            }}
          >
            {error}
          </span>
        )}
      </div>

      {/* ====================================
          一覧
      ==================================== */}

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
            minWidth: 1900,
            width: '100%',
          }}
        >
          {/* =================================
              HEADER
          ================================= */}

          <thead
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
            }}
          >
            <tr>
              <th rowSpan={2} style={th}>
                区分
              </th>

              <th rowSpan={2} style={th}>
                ID
              </th>

              <th rowSpan={2} style={th}>
                登録日
              </th>

              <th rowSpan={2} style={th}>
                納品日
              </th>

              <th rowSpan={2} style={th}>
                請求先
              </th>

              <th rowSpan={2} style={th}>
                名称
              </th>

              <th rowSpan={2} style={th}>
                担当
              </th>

              <th rowSpan={2} style={th}>
                D月
              </th>

              <th rowSpan={2} style={th}>
                P月
              </th>

              {/* 支払 */}

              <th
                colSpan={5}
                style={{
                  ...th,
                  background: '#f5b5d2',
                }}
              >
                支払
              </th>

              {/* 請求 */}

              <th
                colSpan={5}
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
              {/* P */}

              <th style={th}>数量</th>
              <th style={th}>重量</th>
              <th style={th}>単価</th>
              <th style={th}>割増</th>
              <th style={th}>金額</th>

              {/* D */}

              <th style={th}>数量</th>
              <th style={th}>重量</th>
              <th style={th}>単価</th>
              <th style={th}>割増</th>
              <th style={th}>金額</th>
            </tr>
          </thead>

          {/* =================================
              BODY
          ================================= */}

          <tbody>
            {rows.map((row) => {
              const details =
                row.t_transaction_details || [];

              // --------------------------------
              // D / P 代表明細
              // --------------------------------

              const dDetail = details.find(
                (detail) =>
                  detail.detail_type === 'D'
              );

              const pDetail = details.find(
                (detail) =>
                  detail.detail_type === 'P'
              );

              // --------------------------------
              // 通常明細
              // --------------------------------

              const normalDetails =
                details.filter(
                  (detail) =>
                    !detail.detail_type ||
                    detail.detail_type ===
                      'normal'
                );

              // --------------------------------
              // P
              //
              // 新しいP代表行があればそちら優先。
              // まだ移行していない既存データは
              // t_transactions.p_* を使う。
              // --------------------------------

              const pQuantity =
                pDetail?.quantity ??
                row.p_quantity;

              const pWeight =
                row.p_weight;

              const pUnitPrice =
                pDetail?.unit_price ??
                row.p_unit_price;

              const pPremium =
                row.p_premium;

              let pAmount;

              if (
                pDetail &&
                pDetail.amount !== null &&
                pDetail.amount !== undefined
              ) {
                pAmount = num(
                  pDetail.amount
                );
              } else {
                pAmount =
                  num(row.p_quantity) *
                    num(row.p_unit_price) +
                  num(row.p_premium);
              }

              // --------------------------------
              // D
              // --------------------------------

              const dQuantity =
                dDetail?.quantity ??
                row.d_quantity;

              const dWeight =
                row.d_weight;

              const dUnitPrice =
                dDetail?.unit_price ??
                row.d_unit_price;

              const dPremium =
                row.d_premium;

              let dAmount;

              if (
                dDetail &&
                dDetail.amount !== null &&
                dDetail.amount !== undefined
              ) {
                dAmount = num(
                  dDetail.amount
                );
              } else {
                dAmount =
                  num(row.d_quantity) *
                    num(row.d_unit_price) +
                  num(row.d_premium);
              }

              // --------------------------------
              // 粗利
              // --------------------------------

              const profit =
                dAmount - pAmount;

              const selected =
                selectedId === row.id;

              return (
                <tr
                  key={row.id}
                  onClick={() =>
                    setSelectedId(row.id)
                  }
                  style={{
                    background: selected
                      ? '#fff4b8'
                      : '#fff',
                    cursor: 'pointer',
                  }}
                >
                  {/* 区分 */}

                  <td style={td}>
                    {row.category ?? ''}
                  </td>

                  {/* ID */}

                  <td style={tdNumber}>
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

                  <td style={tdNumber}>
                    {row.billing_id ?? ''}
                  </td>

                  {/* 名称 */}

                  <td
                    style={{
                      ...td,
                      minWidth: 220,
                      maxWidth: 350,
                      overflow: 'hidden',
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
                    {row.d_month || ''}
                  </td>

                  {/* P月 */}

                  <td style={td}>
                    {row.p_month || ''}
                  </td>

                  {/* =========================
                      P 支払
                  ========================= */}

                  <td style={tdNumber}>
                    {numberFormat(
                      pQuantity
                    )}
                  </td>

                  <td style={tdNumber}>
                    {numberFormat(
                      pWeight
                    )}
                  </td>

                  <td style={tdNumber}>
                    {numberFormat(
                      pUnitPrice
                    )}
                  </td>

                  <td style={tdNumber}>
                    {numberFormat(
                      pPremium
                    )}
                  </td>

                  <td
                    style={{
                      ...tdNumber,
                      background: '#ffd0e3',
                      fontWeight: 700,
                    }}
                  >
                    {numberFormat(
                      pAmount
                    )}
                  </td>

                  {/* =========================
                      D 請求
                  ========================= */}

                  <td style={tdNumber}>
                    {numberFormat(
                      dQuantity
                    )}
                  </td>

                  <td style={tdNumber}>
                    {numberFormat(
                      dWeight
                    )}
                  </td>

                  <td style={tdNumber}>
                    {numberFormat(
                      dUnitPrice
                    )}
                  </td>

                  <td style={tdNumber}>
                    {numberFormat(
                      dPremium
                    )}
                  </td>

                  <td
                    style={{
                      ...tdNumber,
                      background: '#d5f7fa',
                      fontWeight: 700,
                    }}
                  >
                    {numberFormat(
                      dAmount
                    )}
                  </td>

                  {/* =========================
                      粗利
                  ========================= */}

                  <td
                    style={{
                      ...tdNumber,
                      background:
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

                  {/* =========================
                      明細件数
                  ========================= */}

                  <td
                    style={{
                      ...tdNumber,
                      textAlign: 'center',
                    }}
                  >
                    {normalDetails.length}
                  </td>
                </tr>
              );
            })}

            {/* データなし */}

            {!loading &&
              rows.length === 0 && (
                <tr>
                  <td
                    colSpan={21}
                    style={{
                      padding: 30,
                      textAlign: 'center',
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

      {/* ====================================
          FOOTER
      ==================================== */}

      <div
        style={{
          flexShrink: 0,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          borderTop: '1px solid #aaa',
          background: '#eef1f5',
          fontSize: 12,
        }}
      >
        {selectedId
          ? `選択中 ID : ${selectedId}`
          : `${rows.length} 件`}
      </div>
    </main>
  );
}
