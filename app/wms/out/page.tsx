'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react';

import type {
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  GridReadyEvent,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { supabase } from '../../../lib/supabaseClient';

// ============================================================
// 型
// ============================================================

interface TransactionDetail {
  id: number;
  transaction_id: number | null;

  detail_type: string | null;
  product_attribute: string | null;

  product_id: number | null;
  item_name: string | null;

  quantity: number | null;
  unit_price: number | null;
  amount: number | null;
  invoice_amount: number | null;

  warehouse_id: number | null;
  storage_location: string | null;
  lot_no: string | null;
}

interface Transaction {
  id: number;

  date_created: string | null;
  delivery_source: string | null;
  staff: string | null;

  billing_id: number | null;
  delivery_destination_id: number | null;
  payment_destination_id: number | null;

  delivery_date: string | null;
  delivery_time: string | null;

  slip_no: string | null;
  client_staff: string | null;

  order_no: string | null;

  d_quantity: number | null;
  p_quantity: number | null;

  d_unit_price: number | null;
  p_unit_price: number | null;

  d_premium: number | null;
  p_premium: number | null;

  d_weight: number | null;
  p_weight: number | null;

  d_month: string;
  p_month: string;

  project_name: string | null;
  item_name: string | null;
  name: string | null;

  unit: string | null;

  status: string | null;
  category: number;

  prefecture: string | null;

  t_transaction_details: TransactionDetail[];
}

interface GridRow {
  id: number;

  category: number;

  date_created: string | null;
  delivery_date: string | null;
  delivery_time: string | null;

  delivery_source: string | null;

  staff: string | null;
  client_staff: string | null;

  billing_id: number | null;
  delivery_destination_id: number | null;
  payment_destination_id: number | null;

  project_name: string | null;
  item_name: string | null;
  name: string | null;

  unit: string | null;

  d_month: string;
  p_month: string;

  slip_no: string | null;
  order_no: string | null;

  prefecture: string | null;

  status: string | null;

  // 支払
  pDetailId: number | null;

  pQuantity: number;
  pWeight: number;
  pUnitPrice: number;
  pPremium: number;
  pAmount: number;

  // 請求
  dDetailId: number | null;

  dQuantity: number;
  dWeight: number;
  dUnitPrice: number;
  dPremium: number;
  dAmount: number;

  profit: number;

  normalDetailCount: number;
}

// ============================================================
// Utility
// ============================================================

function n(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0;
  }

  const valueNumber = Number(value);

  return Number.isFinite(valueNumber)
    ? valueNumber
    : 0;
}

function formatNumber(value: unknown) {
  const valueNumber = n(value);

  if (valueNumber === 0) {
    return '';
  }

  return valueNumber.toLocaleString('ja-JP');
}

function categoryLabel(value: number) {
  switch (value) {
    case 1:
      return '外注';

    case 2:
      return '加工';

    case 3:
      return '出庫';

    default:
      return String(value ?? '');
  }
}

// ============================================================
// PAGE
// ============================================================

export default function WmsOutPage() {
  const [rows, setRows] =
    useState<GridRow[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [dateFrom, setDateFrom] =
    useState('');

  const [dateTo, setDateTo] =
    useState('');

  // ==========================================================
  // データ取得
  // ==========================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('t_transactions')
        .select(`
          id,
          date_created,
          delivery_source,
          staff,

          billing_id,
          delivery_destination_id,
          payment_destination_id,

          delivery_date,
          delivery_time,

          slip_no,
          client_staff,
          order_no,

          d_quantity,
          p_quantity,

          d_unit_price,
          p_unit_price,

          d_premium,
          p_premium,

          d_weight,
          p_weight,

          d_month,
          p_month,

          project_name,
          item_name,
          name,

          unit,

          status,
          category,

          prefecture,

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
        .limit(1000);

      if (dateFrom) {
        query = query.gte(
          'delivery_date',
          dateFrom
        );
      }

      if (dateTo) {
        query = query.lte(
          'delivery_date',
          dateTo
        );
      }

      const {
        data,
        error: queryError,
      } = await query;

      if (queryError) {
        throw queryError;
      }

      const transactions =
        (data ?? []) as Transaction[];

      const gridRows: GridRow[] =
        transactions.map((transaction) => {
          const details =
            transaction.t_transaction_details ??
            [];

          const dDetail =
            details.find(
              (detail) =>
                detail.detail_type === 'D'
            ) ?? null;

          const pDetail =
            details.find(
              (detail) =>
                detail.detail_type === 'P'
            ) ?? null;

          const normalDetails =
            details.filter(
              (detail) =>
                !detail.detail_type ||
                detail.detail_type ===
                  'normal'
            );

          // ----------------------------------
          // 支払
          // ----------------------------------

          const pQuantity =
            pDetail?.quantity ??
            transaction.p_quantity ??
            0;

          const pUnitPrice =
            pDetail?.unit_price ??
            transaction.p_unit_price ??
            0;

          const pWeight =
            transaction.p_weight ?? 0;

          const pPremium =
            transaction.p_premium ?? 0;

          const pAmount =
            pDetail?.amount !== null &&
            pDetail?.amount !== undefined
              ? n(pDetail.amount)
              : n(pQuantity) *
                    n(pUnitPrice) +
                n(pPremium);

          // ----------------------------------
          // 請求
          // ----------------------------------

          const dQuantity =
            dDetail?.quantity ??
            transaction.d_quantity ??
            0;

          const dUnitPrice =
            dDetail?.unit_price ??
            transaction.d_unit_price ??
            0;

          const dWeight =
            transaction.d_weight ?? 0;

          const dPremium =
            transaction.d_premium ?? 0;

          const dAmount =
            dDetail?.amount !== null &&
            dDetail?.amount !== undefined
              ? n(dDetail.amount)
              : n(dQuantity) *
                    n(dUnitPrice) +
                n(dPremium);

          return {
            id: transaction.id,

            category:
              transaction.category,

            date_created:
              transaction.date_created,

            delivery_date:
              transaction.delivery_date,

            delivery_time:
              transaction.delivery_time,

            delivery_source:
              transaction.delivery_source,

            staff:
              transaction.staff,

            client_staff:
              transaction.client_staff,

            billing_id:
              transaction.billing_id,

            delivery_destination_id:
              transaction.delivery_destination_id,

            payment_destination_id:
              transaction.payment_destination_id,

            project_name:
              transaction.project_name,

            item_name:
              transaction.item_name,

            name:
              transaction.name,

            unit:
              transaction.unit,

            d_month:
              transaction.d_month,

            p_month:
              transaction.p_month,

            slip_no:
              transaction.slip_no,

            order_no:
              transaction.order_no,

            prefecture:
              transaction.prefecture,

            status:
              transaction.status,

            pDetailId:
              pDetail?.id ?? null,

            pQuantity:
              n(pQuantity),

            pWeight:
              n(pWeight),

            pUnitPrice:
              n(pUnitPrice),

            pPremium:
              n(pPremium),

            pAmount,

            dDetailId:
              dDetail?.id ?? null,

            dQuantity:
              n(dQuantity),

            dWeight:
              n(dWeight),

            dUnitPrice:
              n(dUnitPrice),

            dPremium:
              n(dPremium),

            dAmount,

            profit:
              dAmount - pAmount,

            normalDetailCount:
              normalDetails.length,
          };
        });

      setRows(gridRows);
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
  }, [dateFrom, dateTo]);

  // ==========================================================
  // 初回読込
  // ==========================================================

  useEffect(() => {
    void loadData();
  }, []);

  // ==========================================================
  // 親テーブル更新
  // ==========================================================

  async function updateTransaction(
    id: number,
    field: string,
    value: unknown
  ) {
    const { error } = await supabase
      .from('t_transactions')
      .update({
        [field]: value,
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ==========================================================
  // D/P更新
  // ==========================================================

  async function updateDetail(
    detailId: number,
    field: string,
    value: unknown
  ) {
    const { error } = await supabase
      .from('t_transaction_details')
      .update({
        [field]: value,
      })
      .eq('id', detailId);

    if (error) {
      throw error;
    }
  }

  // ==========================================================
  // セル編集
  // ==========================================================

  async function onCellValueChanged(
    event: CellValueChangedEvent<GridRow>
  ) {
    const row = event.data;

    if (!row) {
      return;
    }

    const field =
      event.colDef.field as
        | keyof GridRow
        | undefined;

    if (!field) {
      return;
    }

    if (
      event.newValue ===
      event.oldValue
    ) {
      return;
    }

    try {
      // ======================================
      // 支払 P
      // ======================================

      const pFieldMap: Record<
        string,
        string
      > = {
        pQuantity: 'quantity',
        pUnitPrice: 'unit_price',
        pAmount: 'amount',
      };

      if (pFieldMap[field]) {
        if (row.pDetailId) {
          await updateDetail(
            row.pDetailId,
            pFieldMap[field],
            n(event.newValue)
          );
        } else {
          // まだP代表明細が無い旧データ
          const legacyMap: Record<
            string,
            string
          > = {
            pQuantity:
              'p_quantity',

            pUnitPrice:
              'p_unit_price',
          };

          const legacyField =
            legacyMap[field];

          if (legacyField) {
            await updateTransaction(
              row.id,
              legacyField,
              n(event.newValue)
            );
          }
        }

        await loadData();

        return;
      }

      // ======================================
      // 請求 D
      // ======================================

      const dFieldMap: Record<
        string,
        string
      > = {
        dQuantity: 'quantity',
        dUnitPrice: 'unit_price',
        dAmount: 'amount',
      };

      if (dFieldMap[field]) {
        if (row.dDetailId) {
          await updateDetail(
            row.dDetailId,
            dFieldMap[field],
            n(event.newValue)
          );
        } else {
          // まだD代表明細が無い旧データ
          const legacyMap: Record<
            string,
            string
          > = {
            dQuantity:
              'd_quantity',

            dUnitPrice:
              'd_unit_price',
          };

          const legacyField =
            legacyMap[field];

          if (legacyField) {
            await updateTransaction(
              row.id,
              legacyField,
              n(event.newValue)
            );
          }
        }

        await loadData();

        return;
      }

      // ======================================
      // 旧親側 P
      // ======================================

      const legacyPMap: Record<
        string,
        string
      > = {
        pWeight: 'p_weight',
        pPremium: 'p_premium',
      };

      if (legacyPMap[field]) {
        await updateTransaction(
          row.id,
          legacyPMap[field],
          n(event.newValue)
        );

        await loadData();

        return;
      }

      // ======================================
      // 旧親側 D
      // ======================================

      const legacyDMap: Record<
        string,
        string
      > = {
        dWeight: 'd_weight',
        dPremium: 'd_premium',
      };

      if (legacyDMap[field]) {
        await updateTransaction(
          row.id,
          legacyDMap[field],
          n(event.newValue)
        );

        await loadData();

        return;
      }

      // ======================================
      // 親テーブル
      // ======================================

      const parentFields: Record<
        string,
        string
      > = {
        delivery_date:
          'delivery_date',

        delivery_time:
          'delivery_time',

        delivery_source:
          'delivery_source',

        staff:
          'staff',

        client_staff:
          'client_staff',

        billing_id:
          'billing_id',

        delivery_destination_id:
          'delivery_destination_id',

        payment_destination_id:
          'payment_destination_id',

        project_name:
          'project_name',

        item_name:
          'item_name',

        unit:
          'unit',

        d_month:
          'd_month',

        p_month:
          'p_month',

        slip_no:
          'slip_no',

        order_no:
          'order_no',

        prefecture:
          'prefecture',

        status:
          'status',
      };

      const dbField =
        parentFields[field];

      if (!dbField) {
        return;
      }

      await updateTransaction(
        row.id,
        dbField,
        event.newValue === ''
          ? null
          : event.newValue
      );

      await loadData();
    } catch (e) {
      console.error(
        '保存エラー:',
        e
      );

      alert(
        e instanceof Error
          ? `保存失敗: ${e.message}`
          : '保存失敗'
      );

      await loadData();
    }
  }

  // ==========================================================
  // ボタン
  // ==========================================================

  function openDetail(row: GridRow) {
    console.log(
      '詳細',
      row.id
    );

    // 後で詳細画面 / modal
    alert(
      `詳細 ID: ${row.id}`
    );
  }

  function openData(row: GridRow) {
    console.log(
      'データ',
      row.id
    );

    alert(
      `データ ID: ${row.id}`
    );
  }

  function openWork(row: GridRow) {
    console.log(
      '作業',
      row.id
    );

    alert(
      `作業 ID: ${row.id}`
    );
  }

  // ==========================================================
  // 列
  // ==========================================================

  const columnDefs = useMemo<
    (ColDef<GridRow> |
      ColGroupDef<GridRow>)[]
  >(
    () => [
      {
        headerName: '区分',
        field: 'category',
        width: 75,
        pinned: 'left',
        editable: false,

        valueFormatter: (
          params
        ) =>
          categoryLabel(
            Number(
              params.value
            )
          ),
      },

      {
        headerName: 'ID',
        field: 'id',
        width: 90,
        pinned: 'left',
        editable: false,
      },

      {
        headerName: '出荷日',
        field: 'date_created',
        width: 105,
        editable: false,
      },

      {
        headerName: '納品日',
        field: 'delivery_date',
        width: 105,
        editable: true,
      },

      {
        headerName: '時間',
        field: 'delivery_time',
        width: 80,
        editable: true,
      },

      {
        headerName: 'PID',
        field:
          'delivery_destination_id',
        width: 85,
        editable: true,
      },

      {
        headerName: '請求先',
        field: 'billing_id',
        width: 95,
        editable: true,
      },

      {
        headerName: '名称',
        field: 'project_name',
        width: 250,
        editable: true,
      },

      {
        headerName: '支払先ID',
        field:
          'payment_destination_id',
        width: 95,
        editable: true,
      },

      {
        headerName: '使用便',
        field: 'unit',
        width: 100,
        editable: true,
      },

      {
        headerName: 'D月',
        field: 'd_month',
        width: 90,
        editable: true,
      },

      {
        headerName: 'P月',
        field: 'p_month',
        width: 90,
        editable: true,
      },

      {
        headerName: '先方担当',
        field: 'client_staff',
        width: 105,
        editable: true,
      },

      {
        headerName: '担当',
        field: 'staff',
        width: 90,
        editable: true,
      },

      // ======================================================
      // ボタン
      // ======================================================

      {
        headerName: '詳細',
        width: 75,
        sortable: false,
        filter: false,
        editable: false,

        cellRenderer: (
          params: any
        ) => {
          const button =
            document.createElement(
              'button'
            );

          button.innerText =
            '詳細';

          button.style.background =
            '#4472c4';

          button.style.color =
            '#fff';

          button.style.border =
            '1px solid #24508f';

          button.style.borderRadius =
            '4px';

          button.style.cursor =
            'pointer';

          button.style.height =
            '24px';

          button.style.padding =
            '0 8px';

          button.onclick = () =>
            openDetail(
              params.data
            );

          return button;
        },
      },

      {
        headerName: 'データ',
        width: 75,
        sortable: false,
        filter: false,
        editable: false,

        cellRenderer: (
          params: any
        ) => {
          const button =
            document.createElement(
              'button'
            );

          button.innerText =
            'データ';

          button.style.background =
            '#4472c4';

          button.style.color =
            '#fff';

          button.style.border =
            '1px solid #24508f';

          button.style.borderRadius =
            '4px';

          button.style.cursor =
            'pointer';

          button.style.height =
            '24px';

          button.onclick = () =>
            openData(
              params.data
            );

          return button;
        },
      },

      {
        headerName: '作業',
        width: 75,
        sortable: false,
        filter: false,
        editable: false,

        cellRenderer: (
          params: any
        ) => {
          const button =
            document.createElement(
              'button'
            );

          button.innerText =
            '作業';

          button.style.background =
            '#4472c4';

          button.style.color =
            '#fff';

          button.style.border =
            '1px solid #24508f';

          button.style.borderRadius =
            '4px';

          button.style.cursor =
            'pointer';

          button.style.height =
            '24px';

          button.onclick = () =>
            openWork(
              params.data
            );

          return button;
        },
      },

      {
        headerName: '都道府県',
        field: 'prefecture',
        width: 100,
        editable: true,
      },

      {
        headerName: '伝票No',
        field: 'slip_no',
        width: 110,
        editable: true,
      },

      {
        headerName: '注文No',
        field: 'order_no',
        width: 110,
        editable: true,
      },

      // ======================================================
      // 支払
      // ======================================================

      {
        headerName: '支払',

        marryChildren: true,

        children: [
          {
            headerName: '数量',
            field:
              'pQuantity',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '重量',
            field: 'pWeight',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '単価',
            field:
              'pUnitPrice',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '割増',
            field:
              'pPremium',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '金額',
            field: 'pAmount',
            width: 110,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),

            cellStyle: {
              backgroundColor:
                '#ffd0e3',
              fontWeight: 'bold',
            },
          },
        ],
      },

      // ======================================================
      // 請求
      // ======================================================

      {
        headerName: '請求',

        marryChildren: true,

        children: [
          {
            headerName: '数量',
            field:
              'dQuantity',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '重量',
            field: 'dWeight',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '単価',
            field:
              'dUnitPrice',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '割増',
            field:
              'dPremium',
            width: 90,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),
          },

          {
            headerName: '金額',
            field: 'dAmount',
            width: 110,
            editable: true,

            valueFormatter: (
              params
            ) =>
              formatNumber(
                params.value
              ),

            cellStyle: {
              backgroundColor:
                '#d5f7fa',
              fontWeight: 'bold',
            },
          },
        ],
      },

      {
        headerName: '粗利',
        field: 'profit',
        width: 110,
        editable: false,

        valueFormatter: (
          params
        ) =>
          formatNumber(
            params.value
          ),

        cellStyle: (
          params
        ) => ({
          backgroundColor:
            n(params.value) < 0
              ? '#ffd6d6'
              : '#d9f7d9',

          fontWeight: 'bold',
          textAlign: 'right',
        }),
      },

      {
        headerName: '明細数',
        field:
          'normalDetailCount',
        width: 90,
        editable: false,
      },

      {
        headerName: '状態',
        field: 'status',
        width: 110,
        editable: true,
      },
    ],
    []
  );

  // ==========================================================
  // デフォルト列設定
  // ==========================================================

  const defaultColDef =
    useMemo<ColDef<GridRow>>(
      () => ({
        sortable: true,
        filter: true,
        resizable: true,

        suppressHeaderMenuButton:
          false,

        cellStyle: {
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
        },
      }),
      []
    );

  // ==========================================================
  // Grid ready
  // ==========================================================

  function onGridReady(
    event: GridReadyEvent<GridRow>
  ) {
    // 必要ならここで列状態復元など
    console.log(
      'AG Grid ready'
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,

        display: 'flex',
        flexDirection: 'column',

        backgroundColor:
          '#f3f4f6',

        overflow: 'hidden',

        fontFamily:
          '"Yu Gothic", "Meiryo", sans-serif',
      }}
    >
      {/* ======================================================
          上部
      ====================================================== */}

      <div
        style={{
          flexShrink: 0,

          display: 'flex',
          alignItems: 'center',

          gap: 6,

          padding: 6,

          backgroundColor:
            '#eef1f5',

          borderBottom:
            '1px solid #aaa',

          flexWrap: 'wrap',
        }}
      >
        <button
          style={topButtonStyle}
        >
          入庫・加工・調整・参照
        </button>

        <button
          style={topButtonStyle}
        >
          本日の出荷
        </button>

        <button
          style={topButtonStyle}
        >
          取引先マスタ
        </button>

        <button
          style={topButtonStyle}
        >
          CSVデータ取込
        </button>

        <button
          style={topButtonStyle}
        >
          製品マスタ
        </button>

        <button
          style={topButtonStyle}
        >
          構成マスタ
        </button>

        <button
          style={{
            ...topButtonStyle,
            marginLeft: 15,
          }}
          onClick={() =>
            void loadData()
          }
        >
          更新
        </button>
      </div>

      {/* ======================================================
          検索
      ====================================================== */}

      <div
        style={{
          flexShrink: 0,

          height: 42,

          display: 'flex',
          alignItems: 'center',

          gap: 8,

          padding: '0 8px',

          backgroundColor:
            '#fff',

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
          style={searchButtonStyle}
          onClick={() =>
            void loadData()
          }
        >
          検索
        </button>

        <span
          style={{
            marginLeft: 10,
            fontWeight: 700,
          }}
        >
          {loading
            ? '読込中...'
            : `${rows.length}件`}
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

      {/* ======================================================
          AG GRID
      ====================================================== */}

      <div
        className="ag-theme-quartz"
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <AgGridReact<GridRow>
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={
            defaultColDef
          }

          onGridReady={
            onGridReady
          }

          onCellValueChanged={
            onCellValueChanged
          }

          rowSelection="single"

          animateRows={false}

          rowHeight={28}

          headerHeight={30}

          groupHeaderHeight={30}

          suppressRowClickSelection={
            false
          }

          stopEditingWhenCellsLoseFocus={
            true
          }

          enableCellTextSelection={
            true
          }

          pagination={false}
        />
      </div>

      {/* ======================================================
          下部
      ====================================================== */}

      <div
        style={{
          flexShrink: 0,

          height: 28,

          display: 'flex',
          alignItems: 'center',

          padding: '0 10px',

          backgroundColor:
            '#eef1f5',

          borderTop:
            '1px solid #aaa',

          fontSize: 12,
        }}
      >
        {loading
          ? '読み込み中'
          : `${rows.length} 件`}
      </div>
    </main>
  );
}

// ============================================================
// BUTTON STYLE
// ============================================================

const topButtonStyle:
  React.CSSProperties = {
  height: 30,

  padding: '0 12px',

  border:
    '1px solid #24508f',

  borderRadius: 4,

  backgroundColor:
    '#4472c4',

  color: '#fff',

  cursor: 'pointer',

  fontSize: 12,

  fontWeight: 700,
};

const searchButtonStyle:
  React.CSSProperties = {
  ...topButtonStyle,

  height: 27,

  padding: '0 15px',
};
