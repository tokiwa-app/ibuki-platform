'use client';

import {
  AgGridReact,
} from 'ag-grid-react';

import {
  ColDef,
  CellValueChangedEvent,
} from 'ag-grid-community';

import {
  StockEntryItem,
} from './types';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

interface Props {

  items: StockEntryItem[];

  setItems: React.Dispatch<
    React.SetStateAction<
      StockEntryItem[]
    >
  >;

  onOpenItemModal: (
    rowIndex: number,
  ) => void;

}

export default function StockEntryGrid({

  items,

  setItems,

  onOpenItemModal,

}: Props) {

  const columnDefs: ColDef<StockEntryItem>[] = [

    {
      headerName: '',
      width: 50,
      editable: false,
      sortable: false,
      filter: false,
      cellRenderer: (params: any) => (

        <button
          onClick={() =>
            onOpenItemModal(
              params.rowIndex,
            )
          }
          style={{
            width: 28,
            height: 28,
            cursor: 'pointer',
          }}
        >
          ▶
        </button>

      ),
    },

    {
      field: 'lot',
      headerName: 'ロット',
      width: 180,
      editable: true,
    },

    {
      field: 'item_code',
      headerName: '商品コード',
      width: 160,
    },

    {
      field: 'item_name',
      headerName: '商品名',
      flex: 1,
    },

    {
      field: 'qty',
      headerName: '数量',
      width: 100,
      editable: true,
      type: 'numericColumn',
    },

    {
      field: 'uom',
      headerName: '単位',
      width: 80,
    },

    {
      field: 'target_warehouse',
      headerName: '入庫倉庫',
      width: 180,
    },

  ];

  function handleCellValueChanged(

    event: CellValueChangedEvent<StockEntryItem>,

  ) {

    if (!event.data) {
      return;
    }

    const next = [...items];

    next[event.rowIndex!] =
      event.data;

    setItems(next);

  }

  return (

    <div
      className="ag-theme-quartz"
      style={{
        height: 500,
        width: '100%',
      }}
    >

      <AgGridReact<StockEntryItem>

        rowData={items}

        columnDefs={columnDefs}

        onCellValueChanged={
          handleCellValueChanged
        }

        rowSelection="single"

        suppressRowClickSelection

      />

    </div>

  );

}
