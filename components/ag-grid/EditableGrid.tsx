'use client';

import React, { useCallback } from 'react';
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
  // 一括ペーストされたときに、データをまとめて更新するためのコールバック（必要に応じて親で受け取る）
  onBatchDataChanged?: (updatedData: T[]) => void;
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
  onBatchDataChanged,
}: EditableGridProps<T>) {

  // グリッド内での Ctrl + V（貼り付け）をフックして、Excel等の列データを縦・横に流し込むロジック
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        // 編集中のインプット要素にフォーカスがある場合は通常のペーストを優先
        if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
          return;
        }

        event.preventDefault();

        // クリップボードからデータを取得
        navigator.clipboard.readText().then((clipboardText) => {
          if (!clipboardText) return;

          // 行ごと、タブ（またはカンマ）ごとに分解
          const rows = clipboardText.split(/\r\n|\n|\r/).filter((r) => r !== '');
          const matrix = rows.map((r) => r.split('\t'));

          if (matrix.length === 0 || !onBatchDataChanged) return;

          // 現在フォーカスされているセルを取得（AG GridのAPI）
          const focusedCell = (event.target as any).__agGrid?.api?.getFocusedCell();
          if (!focusedCell) return;

          const startRowIndex = focusedCell.rowIndex;
          const startColId = focusedCell.column.getColId();

          // カラムの並び順から、対象の列インデックスを特定
          const visibleColumns = (event.target as any).__agGrid?.api?.getAllDisplayedColumns();
          const colIndex = visibleColumns.findIndex((col: any) => col.getColId() === startColId);
          if (colIndex === -1) return;

          // データをディープコピーして書き換え準備
          const newData = [...rowData];

          matrix.forEach((rowValues, rIdx) => {
            const targetRowIdx = startRowIndex + rIdx;
            if (targetRowIdx >= newData.length) return; // 範囲外ならスキップ

            const targetRow = { ...newData[targetRowIdx] };

            rowValues.forEach((val, cIdx) => {
              const targetCol = visibleColumns[colIndex + cIdx];
              if (!targetCol) return;

              const field = targetCol.getColId();
              if (field && field !== 'id') {
                // @ts-ignore
                targetRow[field] = val;
              }
            });

            newData[targetRowIdx] = targetRow;
          });

          // 親コンポーネントへ一括更新を通知
          onBatchDataChanged(newData);
        }).catch((err) => {
          console.error('クリップボードの読み取りに失敗しました:', err);
        });
      }
    },
    [rowData, onBatchDataChanged]
  );

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
      onKeyDown={handleKeyDown}
      tabIndex={0} // キーボードイベントを確実にキャッチするため
    >
      <AgGridReact<T>
        rowData={rowData}
        columnDefs={columnDefs}
        enableCellTextSelection
        enableRangeSelection={false} // 自前ペーストと競合しないようオフに
        copyHeadersToClipboard={false}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        rowSelection="single"
        singleClickEdit={true}
        enterNavigatesVertically={true}
        enterNavigatesVerticallyAfterEdit={true}
        stopEditingWhenCellsLoseFocus={true}
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
