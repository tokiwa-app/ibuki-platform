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
  onGridReady?: (params: any) => void; // ★ 追加：API受渡し用
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
  onGridReady, // ★ 追加
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

  const defaultColDef: ColDef<T> = {
    sortable: true,
    filter: true,
    resizable: true,
  };

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
        defaultColDef={defaultColDef}
        rowSelection={{
          mode: 'multiRow',
          checkboxes: true,
          headerCheckbox: true,
          selectTextOnFocus: false,
        }}
        stopEditingWhenCellsLoseFocus={true}
        suppressKeyboardEvent={(params) => {
          const event = params.event;
          const key = event.key;
          const isEditing = params.editing;

          if (isEditing && (key === 'ArrowUp' || key === 'ArrowDown')) {
            return false;
          }
          return false;
        }}
        getRowId={getRowId}
        onGridReady={onGridReady} // ★ 追加：AgGridReactにバインド
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
