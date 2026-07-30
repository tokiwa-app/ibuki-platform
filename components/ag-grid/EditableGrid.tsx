'use client';

import { AgGridReact } from 'ag-grid-react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

interface EditableGridProps<T> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCellValueChanged: (event: CellValueChangedEvent<T>) => void;
  getRowId: (params: { data: T }) => string;
}

export default function EditableGrid<T>({
  rowData,
  columnDefs,
  loading,
  error,
  selectedId,
  onSelect,
  onCellValueChanged,
  getRowId,
}: EditableGridProps<T>) {
  if (loading) {
    return <div style={{ padding: 16 }}>読込中...</div>;
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
      className="ag-theme-quartz"
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      <AgGridReact<T>
        rowData={rowData}
        columnDefs={columnDefs}
        enableCellTextSelection
        enableRangeSelection
        copyHeadersToClipboard={false}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        rowSelection="single"
        
        {/* === Access風のサクサクした操作感にするための設定 === */}
        singleClickEdit={true}                   {/* 1クリックで即座に編集状態にする */}
        enterNavigatesVertically={true}         {/* Enterキーで上下に移動する */}
        enterNavigatesVerticallyAfterEdit={true} {/* 編集完了後にEnterで下の行に移動する */}
        stopEditingWhenCellsLoseFocus={true}     {/* フォーカスが外れたら編集を確定 */}
        {/* =================================================== */}

        getRowId={getRowId}
        onRowClicked={(event) => {
          if (event.data) {
            // @ts-ignore
            onSelect(event.data.id);
          }
        }}
        onCellValueChanged={onCellValueChanged}
        getRowClass={(params) => {
          // @ts-ignore
          return params.data?.id === selectedId ? 'selected-row' : '';
        }}
      />
    </div>
  );
}
