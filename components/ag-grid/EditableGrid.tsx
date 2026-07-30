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
