'use client';

import type {
  ColDef,
  ColGroupDef,
  ICellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';

import type { GridRow } from './types';

import {
  gridButtonStyle,
} from './styles';

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

interface CreateColumnsOptions {
  openDetail: (row: GridRow) => void;
  openData: (row: GridRow) => void;
  openWork: (row: GridRow) => void;
}

export function createColumnDefs({
  openDetail,
  openData,
  openWork,
}: CreateColumnsOptions): (
  | ColDef<GridRow>
  | ColGroupDef<GridRow>
)[] {
  return [
    {
      headerName: '区分',
      field: 'category',
      width: 75,
      pinned: 'left',

      valueFormatter: () => '出荷',
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

    // ========================================================
    // PID
    // ========================================================

    {
      headerName: 'PID',
      field: 'delivery_destination_id',
      width: 85,
      editable: true,
    },

    // ========================================================
    // 請求先
    // ========================================================

    {
      headerName: '請求先ID',
      field: 'billing_id',
      width: 95,
      editable: true,
    },

    {
      headerName: '請求先',
      field: 'billing_partner_name',
      width: 180,
      editable: false,
    },

    // ========================================================
    // 名称
    // ========================================================

    {
      headerName: '名称',
      field: 'project_name',
      width: 240,
      editable: true,
    },

    // ========================================================
    // 支払先 / 使用便
    // ========================================================

    {
      headerName: '支払先ID',
      field: 'payment_destination_id',
      width: 95,
      editable: true,
    },

    {
      headerName: '使用便',
      field: 'payment_partner_name',
      width: 180,
      editable: false,
    },

    // ========================================================
    // D/P月
    // ========================================================

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

    // ========================================================
    // 担当
    // ========================================================

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

    // ========================================================
    // ボタン
    // ========================================================

    {
      headerName: '',
      width: 72,
      sortable: false,
      filter: false,
      resizable: false,

      cellRenderer: (
        params:
          ICellRendererParams<GridRow>
      ) => {
        if (!params.data) {
          return null;
        }

        return (
          <GridButton
            label="詳細"
            onClick={() =>
              openDetail(params.data!)
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
        params:
          ICellRendererParams<GridRow>
      ) => {
        if (!params.data) {
          return null;
        }

        return (
          <GridButton
            label="データ"
            onClick={() =>
              openData(params.data!)
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
        params:
          ICellRendererParams<GridRow>
      ) => {
        if (!params.data) {
          return null;
        }

        return (
          <GridButton
            label="作業"
            onClick={() =>
              openWork(params.data!)
            }
          />
        );
      },
    },

    // ========================================================
    // その他
    // ========================================================

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

    // ========================================================
    // 支払
    // ========================================================

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

          editable: false,

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

    // ========================================================
    // 請求
    // ========================================================

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

          editable: false,

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

    // ========================================================
    // 粗利
    // ========================================================

    {
      headerName: '粗利',
      field: 'profit',
      width: 105,

      valueFormatter:
        numberFormatter,

      cellStyle: (params) => ({
        textAlign: 'right',

        backgroundColor:
          num(params.value) < 0
            ? '#ffd6d6'
            : '#d9f7d9',

        fontWeight: 'bold',
      }),
    },

    // ========================================================
    // 状態
    // ========================================================

    {
      headerName: '状態',
      field: 'status',
      width: 110,
      editable: true,
    },
  ];
}
