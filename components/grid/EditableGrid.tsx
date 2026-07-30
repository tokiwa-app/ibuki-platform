'use client';

import React, { useRef, useState } from "react";

// TSVを2次元配列にパース
export function parseTsvToMatrix(tsv: string): string[][] {
  if (!tsv) return [];
  return tsv
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter((row) => row.some((cell) => cell.trim() !== ""));
}

interface EditableGridProps<T extends Record<string, any>> {
  data: T[];
  columns: { key: keyof T; label: string }[];
  onChange: (newData: T[]) => void;
  selectedId?: number | null;
  onSelect?: (id: number) => void;
}

export default function EditableGrid<T extends Record<string, any>>({
  data = [],
  columns,
  onChange,
  selectedId,
  onSelect,
}: EditableGridProps<T>) {
  // 安全保障：dataが万が一undefinedやnullでもビルドエラーや実行時エラーにならないようにする
  const safeData = Array.isArray(data) ? data : [];

  // 1. オブジェクトの配列を、自作テーブル用の2次元配列（マトリックス）に変換
  const matrix = safeData.map((row) =>
    columns.map((col) => String(row[col.key] ?? ""))
  );

  // 2次元配列の変更を、元のオブジェクト配列に戻して親に通知するヘルパー
  const updateMatrixToObjects = (newMatrix: string[][]) => {
    const updatedData = newMatrix.map((rowValues, rIdx) => {
      const existing = safeData[rIdx] || { id: null };
      const newObj: any = { ...existing };

      columns.forEach((col, cIdx) => {
        newObj[col.key] = rowValues[cIdx] ?? "";
      });

      return newObj as T;
    });

    const filtered = updatedData.filter((row) =>
      columns.some((col) => String(row[col.key] ?? "").trim() !== "")
    );

    onChange(filtered);
  };

  const totalRows = matrix.length;
  const totalCols = columns.length;
  const viewRows = totalRows + 1; // 常に一番下に空行を表示

  const createEmptyRow = (cols: number) => Array.from({ length: cols }, () => "");
  const getRow = (r: number) => (r < totalRows ? matrix[r] : createEmptyRow(totalCols));

  const normalize = (r1: number, c1: number, r2: number, c2: number) => ({
    r1: Math.max(0, Math.min(r1, r2)),
    c1: Math.max(0, Math.min(c1, c2)),
    r2: Math.min(viewRows - 1, Math.max(r1, r2)),
    c2: Math.min(totalCols - 1, Math.max(c1, c2)),
  });

  const [selection, setSelection] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState("");

  const dragRef = useRef(false);
  const anchorRef = useRef<{ r: number; c: number } | null>(null);
  const dragRowRef = useRef<number | null>(null);
  const dragColRef = useRef<number | null>(null);

  const [dragRowFrom, setDragRowFrom] = useState<number | null>(null);
  const [dragRowTo, setDragRowTo] = useState<number | null>(null);

  const isSingle = selection && selection.r1 === selection.r2 && selection.c1 === selection.c2;
  const active = isSingle ? { r: selection.r1, c: selection.c1 } : null;

  const commit = (r: number, c: number, value: string) => {
    const next = matrix.map((row) => [...row]);
    if (r >= next.length) {
      for (let i = next.length; i <= r; i++) {
        next.push(createEmptyRow(totalCols));
      }
    }
    next[r][c] = value;
    updateMatrixToObjects(next);
  };

  const deleteRow = (rowIndex: number) => {
    if (rowIndex >= totalRows) return;
    const next = matrix.filter((_, i) => i !== rowIndex);
    updateMatrixToObjects(next);
    setSelection(null);
  };

  const reorderRows = (from: number, to: number) => {
    if (from === to || from >= totalRows || to >= totalRows) return;
    const next = [...matrix];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    updateMatrixToObjects(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selection) return;
    const { r1, c1, r2, c2 } = selection;
    const r = r1;
    const c = c1;

    // コピー (Ctrl + C)
    if ((e.key === "c" || e.key === "C") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const rows: string[] = [];
      for (let rr = r1; rr <= r2; rr++) {
        const row = getRow(rr);
        rows.push(row.slice(c1, c2 + 1).join("\t"));
      }
      navigator.clipboard.writeText(rows.join("\n")).catch(() => {});
      return;
    }

    if (editMode) return;

    // 文字入力開始
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setEditValue(e.key);
      setEditMode(true);
      return;
    }

    // 矢印キー・Tab・Enter移動
    if (!e.shiftKey) {
      if (e.key === "ArrowRight" || e.key === "Tab") {
        setSelection(normalize(r, c + 1, r, c + 1));
      } else if (e.key === "ArrowLeft") {
        setSelection(normalize(r, c - 1, r, c - 1));
      } else if (e.key === "ArrowDown" || e.key === "Enter") {
        setSelection(normalize(r + 1, c, r + 1, c));
      } else if (e.key === "ArrowUp") {
        setSelection(normalize(r - 1, c, r - 1, c));
      } else {
        return;
      }
      e.preventDefault();
    }
  };

  // 貼り付け (Ctrl + V)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (!selection) return;
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    e.preventDefault();

    const block = parseTsvToMatrix(text);
    if (!block.length) return;

    const { r1, c1 } = selection;
    const blockRows = block.length;
    const blockCols = block[0].length;

    const oldRows = matrix.length;
    const oldCols = totalCols;
    const newRows = Math.max(oldRows, r1 + blockRows);
    const newCols = Math.max(oldCols, c1 + blockCols);

    const next = Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => matrix[r]?.[c] ?? "")
    );

    for (let br = 0; br < blockRows; br++) {
      for (let bc = 0; bc < blockCols; bc++) {
        if (c1 + bc < totalCols) {
          next[r1 + br][c1 + bc] = block[br][bc] ?? "";
        }
      }
    }

    updateMatrixToObjects(next);

    setSelection({
      r1,
      c1,
      r2: r1 + blockRows - 1,
      c2: Math.min(c1 + blockCols - 1, totalCols - 1),
    });
  };

  const resetDrags = () => {
    dragRef.current = false;
    dragRowRef.current = null;
    dragColRef.current = null;
    setDragRowFrom(null);
    setDragRowTo(null);
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onMouseUp={resetDrags}
      onMouseLeave={resetDrags}
      className="overflow-auto border rounded bg-white p-2 focus:outline-none h-full w-full"
    >
      <table className="border border-gray-400 border-collapse text-sm bg-white leading-none w-full">
        <thead>
          <tr>
            <th className="border border-gray-300 bg-gray-100 w-10 p-0" />
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="border border-gray-300 bg-gray-100 px-2 py-1 select-none text-left font-semibold text-gray-700"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: viewRows }, (_, r) => {
            const row = getRow(r);
            const isBlankRow = r >= totalRows;
            const isRowDropTarget = dragRowFrom !== null && dragRowTo === r;
            const rowId = safeData[r]?.id;

            return (
              <tr
                key={r}
                className={
                  (isRowDropTarget ? "border-t-4 border-red-500 " : "") +
                  (rowId && rowId === selectedId ? "bg-blue-50 " : "")
                }
                onClick={() => {
                  if (rowId && onSelect) onSelect(rowId);
                }}
              >
                {/* 行ヘッダー（行番号 ＆ 削除ボタン） */}
                <th
                  className="border border-gray-300 bg-gray-100 text-right pr-2 w-12 select-none cursor-pointer"
                  onMouseDown={() => {
                    dragRowRef.current = r;
                    setDragRowFrom(r);
                    setDragRowTo(r);
                    setSelection({ r1: r, c1: 0, r2: r, c2: totalCols - 1 });
                  }}
                  onMouseEnter={() => {
                    if (dragRowFrom !== null) setDragRowTo(r);
                  }}
                  onMouseUp={() => {
                    if (dragRowFrom !== null && dragRowTo !== null && dragRowFrom !== dragRowTo) {
                      reorderRows(dragRowFrom, dragRowTo);
                    }
                    resetDrags();
                  }}
                >
                  <div className="flex items-center justify-between px-1">
                    <span>{r + 1}</span>
                    {!isBlankRow && (
                      <button
                        className="text-red-500 text-xs hover:text-red-700 font-bold"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`${r + 1}行目を削除しますか？`)) {
                            deleteRow(r);
                          }
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>

                {row.map((cell, c) => {
                  const selected =
                    selection &&
                    r >= selection.r1 &&
                    r <= selection.r2 &&
                    c >= selection.c1 &&
                    c <= selection.c2;

                  const isActive = active && active.r === r && active.c === c;

                  return (
                    <td key={c} className="border border-gray-300 p-0 h-8">
                      {isActive && editMode ? (
                        <input
                          autoFocus
                          className="w-full h-full px-1 outline outline-2 outline-blue-500 bg-white"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => {
                            if (active) {
                              commit(active.r, active.c, editValue);
                            }
                            setEditMode(false);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              commit(active!.r, active!.c, editValue);
                              setEditMode(false);
                              setSelection(normalize(active!.r + 1, active!.c, active!.r + 1, active!.c));
                            }
                          }}
                        />
                      ) : (
                        <div
                          className={
                            "px-2 py-1 h-full flex items-center " +
                            (selected ? "bg-blue-100 " : "") +
                            (isActive ? "outline outline-2 outline-blue-500 bg-white z-10 relative " : "")
                          }
                          onMouseDown={() => {
                            dragRef.current = true;
                            anchorRef.current = { r, c };
                            setSelection({ r1: r, c1: c, r2: r, c2: c });
                          }}
                          onMouseEnter={() => {
                            if (dragRef.current && anchorRef.current) {
                              setSelection(
                                normalize(anchorRef.current.r, anchorRef.current.c, r, c)
                              );
                            }
                          }}
                          onDoubleClick={() => {
                            setEditValue(cell ?? "");
                            setEditMode(true);
                          }}
                        >
                          {cell}
                        </div>
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
