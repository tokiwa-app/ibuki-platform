'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { AgGridReact } from 'ag-grid-react';

import type {
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  ICellRendererParams,
  ValueFormatterParams,
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
  client_staff: string | null;

  billing_id: number | null;
  delivery_destination_id: number | null;
  payment_destination_id: number | null;

  delivery_date: string | null;
  delivery_time: string | null;

  slip_no: string | null;
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

  pDetailId: number | null;

  pQuantity: number;
  pWeight: number;
  pUnitPrice: number;
  pPremium: number;
  pAmount: number;

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

function num(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0;
  }

  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
}

function numberFormatter(
  params: ValueFormatterParams<GridRow>
) {
  const value = num(params.value);

  if (value === 0) {
    return '';
  }

  return value.toLocaleString('ja-JP');
}

function categoryLabel(value: unknown) {
  const category = Number(value);

  switch (category) {
    case 1:
      return '外注';

    case 2:
      return '加工';

    case 3:
      return '出庫';

    default:
      return value === null ||
        value === undefined
        ? ''
        : String(value);
  }
}

// ============================================================
// ボタンRenderer
// ============================================================

function GridButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      style={gridButtonStyle}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      {label}
    </button>
  );
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
          client_staff,

          billing_id,
          delivery_destination_id,
          payment_destination_id,

          delivery_date,
          delivery_time,

          slip_no,
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
        transactions.map(
          (transaction) => {
            const details =
              transaction.t_transaction_details ??
              [];

            // D代表
            const dDetail =
              details.find(
                (detail) =>
                  detail.detail_type ===
                  'D'
              ) ?? null;

            // P代表
            const pDetail =
              details.find(
                (detail) =>
                  detail.detail_type ===
                  'P'
              ) ?? null;

            // 通常明細
            const normalDetails =
              details.filter(
                (detail) =>
                  !detail.detail_type ||
                  detail.detail_type ===
                    'normal'
              );

            // =================================
            // P 支払
            // =================================

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
                ? num(pDetail.amount)
                : num(pQuantity) *
                    num(pUnitPrice) +
                  num(pPremium);

            // =================================
            // D 請求
            // =================================

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
                ? num(dDetail.amount)
                : num(dQuantity) *
                    num(dUnitPrice) +
                  num(dPremium);

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
                num(pQuantity),

              pWeight:
                num(pWeight),

              pUnitPrice:
                num(pUnitPrice),

              pPremium:
                num(pPremium),

              pAmount,

              dDetailId:
                dDetail?.id ?? null,

              dQuantity:
                num(dQuantity),

              dWeight:
                num(dWeight),

              dUnitPrice:
                num(dUnitPrice),

              dPremium:
                num(dPremium),

              dAmount,

              profit:
                dAmount - pAmount,

              normalDetailCount:
                normalDetails.length,
            };
          }
        );

      setRows(gridRows);
    } catch (e) {
      console.error(
        'loadData error:',
        e
      );

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
  // 初回
  // ==========================================================

  useEffect(() => {
    void loadData();

    // 初回だけ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // UPDATE
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

  async function updateDetail(
    id: number,
    field: string,
    value: unknown
  ) {
    const { error } = await supabase
      .from('t_transaction_details')
      .update({
        [field]: value,
      })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // ==========================================================
  // 編集
  // ==========================================================

  const handleCellValueChanged =
    useCallback(
      async (
        event: CellValueChangedEvent<GridRow>
      ) => {
        const row = event.data;

        if (!row) {
          return;
        }

        const field =
          event.colDef.field;

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
          // =================================
          // P代表
          // =================================

          if (
            field === 'pQuantity' ||
            field === 'pUnitPrice' ||
            field === 'pAmount'
          ) {
            if (row.pDetailId) {
              const detailField =
                field === 'pQuantity'
                  ? 'quantity'
                  : field ===
                      'pUnitPrice'
                    ? 'unit_price'
                    : 'amount';

              await updateDetail(
                row.pDetailId,
                detailField,
                num(event.newValue)
              );
            } else {
              // 旧データ
              if (
                field === 'pQuantity'
              ) {
                await updateTransaction(
                  row.id,
                  'p_quantity',
                  num(event.newValue)
                );
              }

              if (
                field === 'pUnitPrice'
              ) {
                await updateTransaction(
                  row.id,
                  'p_unit_price',
                  num(event.newValue)
                );
              }
            }

            await loadData();
            return;
          }

          // =================================
          // D代表
          // =================================

          if (
            field === 'dQuantity' ||
            field === 'dUnitPrice' ||
            field === 'dAmount'
          ) {
            if (row.dDetailId) {
              const detailField =
                field === 'dQuantity'
                  ? 'quantity'
                  : field ===
                      'dUnitPrice'
                    ? 'unit_price'
                    : 'amount';

              await updateDetail(
                row.dDetailId,
                detailField,
                num(event.newValue)
              );
            } else {
              // 旧データ
              if (
                field === 'dQuantity'
              ) {
                await updateTransaction(
                  row.id,
                  'd_quantity',
                  num(event.newValue)
                );
              }

              if (
                field === 'dUnitPrice'
              ) {
                await updateTransaction(
                  row.id,
                  'd_unit_price',
                  num(event.newValue)
                );
              }
            }

            await loadData();
            return;
          }

          // =================================
          // P親側
          // =================================

          if (field === 'pWeight') {
            await updateTransaction(
              row.id,
              'p_weight',
              num(event.newValue)
            );

            await loadData();
            return;
          }

          if (field === 'pPremium') {
            await updateTransaction(
              row.id,
              'p_premium',
              num(event.newValue)
            );

            await loadData();
            return;
          }

          // =================================
          // D親側
          // =================================

          if (field === 'dWeight') {
            await updateTransaction(
              row.id,
              'd_weight',
              num(event.newValue)
            );

            await loadData();
            return;
          }

          if (field === 'dPremium') {
            await updateTransaction(
              row.id,
              'd_premium',
              num(event.newValue)
            );

            await loadData();
            return;
          }

          // =================================
          // 親の通常項目
          // =================================

          const parentMap: Record<
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
            parentMap[field];

          if (!dbField) {
            return;
          }

          const newValue =
            event.newValue === ''
              ? null
              : event.newValue;

          await updateTransaction(
            row.id,
            dbField,
            newValue
          );

          await loadData();
        } catch (e) {
          console.error(
            'update error:',
            e
          );

          alert(
            e instanceof Error
              ? `保存失敗: ${e.message}`
              : '保存失敗'
          );

          await loadData();
        }
      },
      [loadData]
    );

  // ==========================================================
  // ボタン処理
  // ==========================================================

  const openDetail =
    useCallback((row: GridRow) => {
      alert(
        `詳細 ID: ${row.id}`
      );
    }, []);

  const openData =
    useCallback((row: GridRow) => {
      alert(
        `データ ID: ${row.id}`
      );
    }, []);

  const openWork =
    useCallback((row: GridRow) => {
      alert(
        `作業 ID: ${row.id}`
      );
    }, []);

  // ==========================================================
  // Columns
  // ==========================================================

  const columnDefs = useMemo<
    (
      | ColDef<GridRow>
      | ColGroupDef<GridRow>
    )[]
  >(
    () => [
      {
        headerName: '区分',
        field: 'category',
        width: 75,
        pinned: 'left',

        valueFormatter: (
          params
        ) =>
          categoryLabel(
            params.value
          ),
      },

      {
        headerName: 'ID',
        field: 'id',
        width: 90,
        pinned: 'left',
      },

      {
        headerName: '出荷日',
        field: 'date_created',
        width: 105,
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
        // 現時点では仮割当
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
        width: 240,
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
        // 現時点ではunitを仮割当
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
        headerName: '',
        width: 72,
        sortable: false,
        filter: false,
        resizable: false,

        cellRenderer: (
          params: ICellRendererParams<GridRow>
        ) => {
          if (!params.data) {
            return null;
          }

          return (
            <GridButton
              label="詳細"
              onClick={() =>
                openDetail(
                  params.data!
                )
              }
            />
          );
        },
      },

      {
        headerName: '',
        width: 72,
        sortable: false,
        filter: false,
        resizable: false,

        cellRenderer: (
          params: ICellRendererParams<GridRow>
        ) => {
          if (!params.data) {
            return null;
          }

          return (
            <GridButton
              label="データ"
              onClick={() =>
                openData(
                  params.data!
                )
              }
            />
          );
        },
      },

      {
        headerName: '',
        width: 72,
        sortable: false,
        filter: false,
        resizable: false,

        cellRenderer: (
          params: ICellRendererParams<GridRow>
        ) => {
          if (!params.data) {
            return null;
          }

          return (
            <GridButton
              label="作業"
              onClick={() =>
                openWork(
                  params.data!
                )
              }
            />
          );
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
            field: 'pQuantity',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '重量',
            field: 'pWeight',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '単価',
            field: 'pUnitPrice',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '割増',
            field: 'pPremium',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '金額',
            field: 'pAmount',
            width: 105,
            editable: true,
            valueFormatter:
              numberFormatter,

            cellStyle: {
              textAlign: 'right',
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
            field: 'dQuantity',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '重量',
            field: 'dWeight',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '単価',
            field: 'dUnitPrice',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '割増',
            field: 'dPremium',
            width: 85,
            editable: true,
            valueFormatter:
              numberFormatter,
            cellStyle: {
              textAlign: 'right',
            },
          },

          {
            headerName: '金額',
            field: 'dAmount',
            width: 105,
            editable: true,
            valueFormatter:
              numberFormatter,

            cellStyle: {
              textAlign: 'right',
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
        width: 105,

        valueFormatter:
          numberFormatter,

        cellStyle: (
          params
        ) => ({
          textAlign: 'right',

          backgroundColor:
            num(params.value) < 0
              ? '#ffd6d6'
              : '#d9f7d9',

          fontWeight: 'bold',
        }),
      },

      {
        headerName: '明細数',
        field:
          'normalDetailCount',
        width: 85,
      },

      {
        headerName: '状態',
        field: 'status',
        width: 110,
        editable: true,
      },
    ],
    [
      openData,
      openDetail,
      openWork,
    ]
  );

  // ==========================================================
  // Default column
  // ==========================================================

  const defaultColDef =
    useMemo<ColDef<GridRow>>(
      () => ({
        sortable: true,
        filter: true,
        resizable: true,

        cellStyle: {
          fontSize: '12px',
        },
      }),
      []
    );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden',

        backgroundColor:
          '#f3f4f6',

        fontFamily:
          '"Yu Gothic", "Meiryo", sans-serif',
      }}
    >
      {/* 上部ボタン */}

      <div
        style={{
          flexShrink: 0,

          display: 'flex',
          alignItems: 'center',

          gap: 5,

          padding: 6,

          flexWrap: 'wrap',

          backgroundColor:
            '#eef1f5',

          borderBottom:
            '1px solid #aaa',
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
          onClick={() => {
            void loadData();
          }}
        >
          更新
        </button>
      </div>

      {/* 検索 */}

      <div
        style={{
          flexShrink: 0,

          minHeight: 42,

          display: 'flex',
          alignItems: 'center',

          gap: 8,

          padding: '4px 8px',

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
          onChange={(event) =>
            setDateFrom(
              event.target.value
            )
          }
        />

        <span>～</span>

        <input
          type="date"
          value={dateTo}
          onChange={(event) =>
            setDateTo(
              event.target.value
            )
          }
        />

        <button
          style={searchButtonStyle}
          onClick={() => {
            void loadData();
          }}
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

      {/* AG Grid */}

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

          onCellValueChanged={
            handleCellValueChanged
          }

          rowHeight={28}
          headerHeight={30}
          groupHeaderHeight={30}

          animateRows={false}

          stopEditingWhenCellsLoseFocus={
            true
          }

          enableCellTextSelection={
            true
          }

          suppressRowClickSelection={
            false
          }
        />
      </div>

      {/* 下部 */}

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
          ? '読み込み中...'
          : `${rows.length} 件`}
      </div>
    </main>
  );
}

// ============================================================
// Style
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

const gridButtonStyle:
  React.CSSProperties = {
  height: 23,

  padding: '0 8px',

  border:
    '1px solid #24508f',

  borderRadius: 4,

  backgroundColor:
    '#4472c4',

  color: '#fff',

  cursor: 'pointer',

  fontSize: 11,

  lineHeight: '21px',
};
