'use client';

import React, { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react';

// カラム定義の型
export interface ColumnDef<T> {
  field: keyof T | string;
  headerName: string;
  width?: string;
}

interface EditableTableProps<T> {
  rowData: T[];
  columnDefs: ColumnDef<T>[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  // セル単体の変更（簡易的に用意）
  onCellValueChanged?: (updatedRow: T, field: string, value: any) => void;
  getRowId: (item: T) => number | string;
  onBatchDataChanged?: (updatedData: T[]) => void;
}

export default function EditableTable<T extends Record<string, any>>({
  rowData,
  columnDefs,
  loading,
  error,
  selectedId,
  onSelect,
  onCellValueChanged,
  getRowId,
  onBatchDataChanged,
}: EditableTableProps<T>) {
  // 現在フォーカス（選択）されているセル座標 { rowIndex, colIndex }
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  
  // 現在インライン編集中のセル座標
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const tableRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return <div style={{ padding: 16 }}>読込中...</div>;
  }

  if (error) {
    return <div style={{ padding: 16, color: '#c62828' }}>{error}</div>;
  }

  // -----------------------------------------------------------------
  // キーボードイベント処理（矢印キー移動、Enterで編集、Ctrl+Vペースト）
  // -----------------------------------------------------------------
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // 編集中のインプット要素にフォーカスがある場合は、通常の挙動を優先
      if (editingCell) {
        if (event.key === 'Enter') {
          event.preventDefault();
          commitEdit();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setEditingCell(null);
        }
        return;
      }

      // --- Ctrl + V（一括ペースト） ---
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();

        if (!focusedCell || !onBatchDataChanged) return;

        navigator.clipboard
          .readText()
          .then((clipboardText) => {
            if (!clipboardText) return;

            const rows = clipboardText.split(/\r\n|\n|\r/).filter((r) => r !== '');
            const matrix = rows.map((r) => r.split('\t'));

            if (matrix.length === 0) return;

            const newData = [...rowData];
            const startRowIndex = focusedCell.rowIndex;
            const startColIndex = focusedCell.colIndex;

            matrix.forEach((rowValues, rIdx) => {
              const targetRowIdx = startRowIndex + rIdx;
              if (targetRowIdx >= newData.length) return;

              const targetRow = { ...newData[targetRowIdx] };

              rowValues.forEach((val, cIdx) => {
                const targetColIdx = startColIndex + cIdx;
                const targetCol = columnDefs[targetColIdx];
                if (!targetCol) return;

                const field = String(targetCol.field);
                if (field && field !== 'id') {
                  targetRow[field] = val;
                }
              });

              newData[targetRowIdx] = targetRow;
            });

            onBatchDataChanged(newData);
          })
          .catch((err) => {
            console.error('クリップボードの読み取りに失敗しました:', err);
          });
        return;
      }

      // --- セル選択中のキーボード移動・操作 ---
      if (!focusedCell) {
        if (rowData.length > 0 && columnDefs.length > 0) {
          setFocusedCell({ rowIndex: 0, colIndex: 0 });
        }
        return;
      }

      const { rowIndex, colIndex } = focusedCell;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          if (rowIndex > 0) setFocusedCell({ rowIndex: rowIndex - 1, colIndex });
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (rowIndex < rowData.length - 1) setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (colIndex > 0) setFocusedCell({ rowIndex, colIndex: colIndex - 1 });
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (colIndex < columnDefs.length - 1) setFocusedCell({ rowIndex, colIndex: colIndex + 1 });
          break;
        case 'Enter':
          event.preventDefault();
          // Enterで編集モードへ移行
          startEditing(rowIndex, colIndex);
          break;
        default:
          // 通常の文字入力が始まったらそのまま編集モードにする場合などの処理（簡易的に省略）
          break;
      }
    },
    [focusedCell, editingCell, rowData, columnDefs, onBatchDataChanged]
  );

  // 編集開始
  const startEditing = (rowIndex: number, colIndex: number) => {
    const col = columnDefs[colIndex];
    if (String(col.field) === 'id') return; // ID列は編集不可

    const row = rowData[rowIndex];
    setEditingCell({ rowIndex, colIndex });
    setEditValue(row[col.field] ?? '');
  }

  // 編集確定
  const commitEdit = () => {
    if (!editingCell) return;
    const { rowIndex, colIndex } = editingCell;
    const col = columnDefs[colIndex];
    const field = String(col.field);
    const row = rowData[rowIndex];

    if (onCellValueChanged) {
      onCellValueChanged(row, field, editValue);
    }

    setEditingCell(null);
    // 編集完了後に下へフォーカスを移動する挙動（EnterNavigatesVertically相当）
    if (rowIndex < rowData.length - 1) {
      setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
    }
  };

  // セルクリック時の処理
  const handleCellClick = (rowIndex: number, colIndex: number, item: T) => {
    setFocusedCell({ rowIndex, colIndex });
    onSelect(getRowId(item) as number);
  };

  // セルダブルクリックで編集開始（シングルクリック編集にしたい場合は変更可）
  const handleCellDoubleClick = (rowIndex: number, colIndex: number) => {
    startEditing(rowIndex, colIndex);
  };

  return (
    <div
      ref={tableRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        outline: 'none',
        height: '100%',
        width: '100%',
        overflow: 'auto',
        border: '1px solid #e0e0e0',
        fontFamily: 'sans-serif',
        fontSize: '14px',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            {columnDefs.map((col, idx) => (
              <th
                key={String(col.field) || idx}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  width: col.width || 'auto',
                  borderRight: '1px solid #e0e0e0',
                  userSelect: 'none',
                }}
              >
                {col.headerName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData.map((row, rIdx) => {
            const rowId = getRowId(row);
            const isSelectedRow = rowId === selectedId;

            return (
              <tr
                key={rowId}
                style={{
                  backgroundColor: isSelectedRow ? '#e3f2fd' : '#fff',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                {columnDefs.map((col, cIdx) => {
                  const field = String(col.field);
                  const isFocused =
                    focusedCell?.rowIndex === rIdx && focusedCell?.colIndex === cIdx;
                  const isEditing =
                    editingCell?.rowIndex === rIdx && editingCell?.colIndex === cIdx;

                  return (
                    <td
                      key={field || cIdx}
                      onClick={() => handleCellClick(rIdx, cIdx, row)}
                      onDoubleClick={() => handleCellDoubleClick(rIdx, cIdx)}
                      style={{
                        padding: '8px 12px',
                        borderRight: '1px solid #eee',
                        outline: isFocused ? '2px solid #1976d2' : 'none',
                        outlineOffset: '-2px',
                        cursor: 'cell',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          style={{
                            width: '100%',
                            boxSizing: 'border-box',
                            padding: '2px 4px',
                            border: '1px solid #1976d2',
                            outline: 'none',
                          }}
                        />
                      ) : (
                        row[field]
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
