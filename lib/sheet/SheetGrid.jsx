// lib/sheet/SheetGrid.jsx
import React, { useEffect, useRef, useState } from "react";

/**************************************************************************************************
 * (inlined) tsv
 **************************************************************************************************/
function parseTsvToMatrix(tsv) {
  if (!tsv) return [];
  return tsv
    .split(/\r?\n/)
    .map((line) => line.split("\t"))
    .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
}

function matrixToTsv(matrix, sel) {
  if (!Array.isArray(matrix) || !matrix.length) return "";

  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  const r1 = sel?.r1 ?? 0;
  const c1 = sel?.c1 ?? 0;
  const r2 = sel?.r2 ?? rows - 1;
  const c2 = sel?.c2 ?? cols - 1;

  const lines = [];
  for (let r = r1; r <= r2; r++) {
    const row = [];
    for (let c = c1; c <= c2; c++) row.push(matrix[r]?.[c] ?? "");
    lines.push(row.join("\t"));
  }
  return lines.join("\n");
}

const deepClone = (v) => JSON.parse(JSON.stringify(v));

/**************************************************************************************************
 * (inlined) Cell
 **************************************************************************************************/
function Cell({
  r,
  c,
  value,
  config = {},
  selected,
  isEditing,
  editValue,

  rowCount,
  colCount,

  onEditValueChange,
  onFinishEdit,
  onCancelEdit,
  onMoveAfterEdit,
  onStartEdit,

  onCellMouseDown,
  onCellMouseEnter,

  renderContent,
}) {
  const isAction = config.type === "action";

  return (
    <td
      style={{
        border: "1px solid #ddd",
        padding: 0,
        background: selected ? "#dbeafe" : "white",
        width: config.width,
        minWidth: config.width,
      }}
      onMouseDown={(e) => {
        if (isAction) return;
        onCellMouseDown?.(e, r, c);
      }}
      onMouseEnter={(e) => {
        if (isAction) return;
        onCellMouseEnter?.(e, r, c);
      }}
      onDoubleClick={() => {
        if (isAction) return;
        onStartEdit?.(r, c, value ?? "");
      }}
    >
      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => onEditValueChange?.(e.target.value)}
          onBlur={() => onFinishEdit?.()}
          onKeyDown={(e) => {
            const moveAndClose = (nr, nc) => {
              onFinishEdit?.();
              onMoveAfterEdit?.(nr, nc);
            };

            if (e.key === "Enter") {
              e.preventDefault();
              moveAndClose(Math.min(rowCount - 1, r + 1), c);
            } else if (e.key === "Escape") {
              e.preventDefault();
              onCancelEdit?.();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              moveAndClose(Math.min(rowCount - 1, r + 1), c);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              moveAndClose(Math.max(0, r - 1), c);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              moveAndClose(r, Math.min(colCount - 1, c + 1));
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
              moveAndClose(r, Math.max(0, c - 1));
            }
          }}
          style={{
            width: "100%",
            padding: "6px 8px",
            border: "2px solid #2563eb",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <div
          style={{
            padding: "6px 8px",
            cursor: isAction ? "default" : "cell",
            textAlign: config.align || "left",
            boxShadow: selected ? "inset 0 0 0 1px #2563eb" : "none",
          }}
          onMouseDown={(e) => {
            // action列のボタン操作を邪魔しない
            if (isAction) e.stopPropagation();
          }}
        >
          {renderContent ? renderContent() : value ?? ""}
        </div>
      )}
    </td>
  );
}

/**************************************************************************************************
 * (inlined) HeaderRow
 **************************************************************************************************/
function HeaderRow({
  cols,
  columns = [],
  columnConfig = [],

  onHeaderAction,
  headerActionIcon = "🔍",
  showHeaderAction,

  thStickyStyle,
}) {
  return (
    <tr>
      <th
        style={{
          ...thStickyStyle,
          width: 28,
          minWidth: 28,
          border: "1px solid #ddd",
        }}
      >
        #
      </th>

      {Array.from({ length: cols }).map((_, c) => {
        const cfg = columnConfig[c] || {};
        const label = columns[c]?.label ?? `Col${c + 1}`;

        const canShow =
          typeof onHeaderAction === "function" &&
          cfg.type !== "action" &&
          (typeof showHeaderAction !== "function" || showHeaderAction(c));

        return (
          <th
            key={c}
            style={{
              ...thStickyStyle,
              border: "1px solid #ddd",
              padding: "6px 8px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              width: cfg.width,
              minWidth: cfg.width,
              textAlign: cfg.align || "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                {label}
              </span>

              {canShow && (
                <button
                  type="button"
                  title="検索"
                  onMouseDown={(e) => {
                    // クリック成立のために「フォーカス奪い」やセル選択を抑止
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const field = columns?.[c]?.key ?? null;
                    onHeaderAction({
                      colIndex: c,
                      field,
                      label,
                      type: columns?.[c]?.type || "text",
                      anchorEl: e.currentTarget,
                    });
                  }}
                  style={{
                    width: 18,
                    height: 18,
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 11,
                    lineHeight: "16px",
                    textAlign: "center",
                  }}
                >
                  {headerActionIcon}
                </button>
              )}
            </div>
          </th>
        );
      })}
    </tr>
  );
}

/**************************************************************************************************
 * SheetGrid
 **************************************************************************************************/
export default function SheetGrid({
  matrix,
  onChangeMatrix,
  columns = [],
  columnConfig = [],
  className = "",
  maxHeight = "70vh",

  onHeaderAction,
  headerActionIcon = "🔍",
  showHeaderAction,
}) {
  const rootRef = useRef(null);
  const dragRef = useRef(false);
  const anchorRef = useRef(null);

  const [draft, setDraft] = useState(matrix);
  useEffect(() => setDraft(matrix), [matrix]);

  const rowCount = draft?.length ?? 0;
  const colCount = draft?.[0]?.length ?? 0;

  const [selection, setSelection] = useState(null); // {r1,c1,r2,c2}
  const [editing, setEditing] = useState(null); // {r,c}|null
  const [editValue, setEditValue] = useState("");
  const [undoStack, setUndoStack] = useState([]);

  /************************************************************************************************
   * Focus / Utils
   ************************************************************************************************/
  const focusRoot = () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch {
      el.focus();
    }
  };

  const normalize = (r1, c1, r2, c2) => ({
    r1: Math.max(0, Math.min(r1, r2)),
    c1: Math.max(0, Math.min(c1, c2)),
    r2: Math.min(rowCount - 1, Math.max(r1, r2)),
    c2: Math.min(colCount - 1, Math.max(c1, c2)),
  });

  const isSelected = (r, c) =>
    selection &&
    r >= selection.r1 &&
    r <= selection.r2 &&
    c >= selection.c1 &&
    c <= selection.c2;

  const isEditableElement = (target) => {
    if (!target) return false;
    const tag = target.tagName;
    if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag)) return true;
    if (target.isContentEditable) return true;
    return false;
  };

  const isActionCol = (c) => (columnConfig?.[c]?.type ?? "") === "action";

  const isInsideInteractive = (target) => {
    if (!target) return false;
    const el = target.closest?.("button,a,input,select,textarea,[role='button']");
    return !!el;
  };

  /************************************************************************************************
   * Undo / Commit
   ************************************************************************************************/
  const saveUndo = () => setUndoStack([deepClone(draft)]);

  const commitWhole = (next) => {
    setDraft(next);
    onChangeMatrix?.(deepClone(next));
  };

  const commitCell = (r, c, value) => {
    const next = draft.map((row) => [...row]);
    next[r][c] = value;
    saveUndo();
    commitWhole(next);
  };

  /************************************************************************************************
   * Selection / Edit
   ************************************************************************************************/
  const moveSelection = (r, c) => setSelection(normalize(r, c, r, c));

  const selectRow = (r) => {
    if (rowCount <= 0 || colCount <= 0) return;
    setSelection(normalize(r, 0, r, colCount - 1));
  };

  const startEdit = (r, c, initial) => {
    if (isActionCol(c)) return;
    setEditing({ r, c });
    setEditValue(initial ?? "");
  };

  const finishEdit = () => {
    if (!editing) return;
    const { r, c } = editing;
    commitCell(r, c, editValue);
    setEditing(null);
    requestAnimationFrame(focusRoot);
  };

  const cancelEdit = () => {
    setEditing(null);
    requestAnimationFrame(focusRoot);
  };

  const clearSelectionCells = () => {
    if (!selection) return;
    const { r1, c1, r2, c2 } = selection;

    const next = draft.map((row) => [...row]);
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        if (isActionCol(c)) continue;
        next[r][c] = "";
      }
    }
    saveUndo();
    commitWhole(next);
  };

  /************************************************************************************************
   * Copy / Paste
   ************************************************************************************************/
  const handleCopy = () => {
    if (!selection) return;
    const text = matrixToTsv(draft, selection);
    navigator.clipboard?.writeText?.(text).catch(() => {});
  };

  const applyPasteText = (text) => {
    if (!selection) return;
    if (!text) return;

    const block = parseTsvToMatrix(text);
    if (!block.length) return;

    const { r1, c1 } = selection;
    const next = draft.map((row) => [...row]);

    for (let br = 0; br < block.length; br++) {
      for (let bc = 0; bc < block[br].length; bc++) {
        const rr = r1 + br;
        const cc = c1 + bc;
        if (rr < rowCount && cc < colCount) {
          if (isActionCol(cc)) continue;
          next[rr][cc] = block[br][bc] ?? "";
        }
      }
    }

    saveUndo();
    commitWhole(next);

    setSelection(
      normalize(
        r1,
        c1,
        r1 + block.length - 1,
        c1 + (block[0]?.length ?? 1) - 1
      )
    );
  };

  const handlePaste = (e) => {
    if (!selection) return;
    const text = e.clipboardData?.getData("text");
    if (!text) return;
    e.preventDefault();
    applyPasteText(text);
  };

  /************************************************************************************************
   * Keyboard
   ************************************************************************************************/
  const onKeyDown = (e) => {
    if (isEditableElement(e.target)) return;

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (!undoStack.length) return;
      const prev = undoStack[0];
      setUndoStack([]);
      commitWhole(deepClone(prev));
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "c") {
      e.preventDefault();
      handleCopy();
      return;
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "v") {
      if (!selection) return;
      e.preventDefault();

      navigator.clipboard
        ?.readText?.()
        .then((text) => {
          if (text) applyPasteText(text);
        })
        .catch(() => {});

      return;
    }

    if (!selection) return;
    if (editing) return;

    const { r1, c1, r2, c2 } = selection;
    const r = r1;
    const c = c1;

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      clearSelectionCells();
      return;
    }

    if (e.key === "F2") {
      e.preventDefault();
      startEdit(r, c, draft[r]?.[c] ?? "");
      return;
    }

    if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      !e.isComposing
    ) {
      if (isActionCol(c)) return;
      e.preventDefault();
      startEdit(r, c, e.key);
      return;
    }

    const shift = e.shiftKey;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (shift) setSelection(normalize(r1, c1, r2 + 1, c2));
      else moveSelection(Math.min(rowCount - 1, r + 1), c);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (shift) setSelection(normalize(r1, c1, r2 - 1, c2));
      else moveSelection(Math.max(0, r - 1), c);
      return;
    }

    if (e.key === "ArrowRight" || e.key === "Tab") {
      e.preventDefault();
      if (shift) setSelection(normalize(r1, c1, r2, c2 + 1));
      else moveSelection(r, Math.min(colCount - 1, c + 1));
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (shift) setSelection(normalize(r1, c1, r2, c2 - 1));
      else moveSelection(r, Math.max(0, c - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      moveSelection(Math.min(rowCount - 1, r + 1), c);
      return;
    }
  };

  /************************************************************************************************
   * Mouse: drag selection reset
   ************************************************************************************************/
  const resetDrag = () => {
    dragRef.current = false;
    anchorRef.current = null;
  };

  /************************************************************************************************
   * Render
   ************************************************************************************************/
  if (!Array.isArray(draft) || draft.length === 0) {
    return <div>No Data</div>;
  }

  const rootStyle = {
    width: "100%",
    height: "100%",
    maxHeight,
    overflow: "auto",
    border: "1px solid #ccc",
    background: "#fff",
    outline: "none",
    userSelect: "none",
  };

  const thStickyStyle = {
    position: "sticky",
    top: 0,
    zIndex: 5,
    background: "#f3f4f6",
  };

  const isRowSelected = (r) =>
    selection &&
    r >= selection.r1 &&
    r <= selection.r2 &&
    selection.c1 === 0 &&
    selection.c2 === colCount - 1;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      style={rootStyle}
      className={className}
      onKeyDown={onKeyDown}
      onPaste={handlePaste}
      onMouseUp={resetDrag}
      onMouseLeave={resetDrag}
      // ✅ クリック無反応の主因になりがちなので、インタラクティブ要素では奪わない
      onMouseDownCapture={(e) => {
        if (isInsideInteractive(e.target)) return;
        focusRoot();
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          tableLayout: "fixed",
          fontSize: 13,
        }}
      >
        <thead>
          <HeaderRow
            cols={colCount}
            columns={columns}
            columnConfig={columnConfig}
            onHeaderAction={onHeaderAction}
            headerActionIcon={headerActionIcon}
            showHeaderAction={showHeaderAction}
            thStickyStyle={thStickyStyle}
          />
        </thead>

        <tbody>
          {draft.map((row, r) => (
            <tr key={r}>
              {/* 左の # 列：クリックで行選択 */}
              <td
                style={{
                  width: 28,
                  minWidth: 28,
                  border: "1px solid #ddd",
                  background: isRowSelected(r) ? "#bfdbfe" : "#f8fafc",
                  textAlign: "center",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditing(null);
                  selectRow(r);
                  dragRef.current = false;
                  anchorRef.current = null;
                  requestAnimationFrame(focusRoot);
                }}
              >
                {isRowSelected(r) ? "▶" : ""}
              </td>

              {row.map((cell, c) => {
                const cfg = columnConfig[c] || {};
                const selected = isSelected(r, c);
                const isEditingNow = editing && editing.r === r && editing.c === c;

                const renderFn = typeof cfg.render === "function" ? cfg.render : null;

                const renderContent = () => {
                  if (!renderFn) return cell ?? "";
                  return renderFn({ rowIndex: r, colIndex: c, value: cell });
                };

                const isAction = isActionCol(c);

                return (
                  <Cell
                    key={c}
                    r={r}
                    c={c}
                    value={cell}
                    config={cfg}
                    selected={selected}
                    isEditing={!!isEditingNow}
                    editValue={editValue}
                    rowCount={rowCount}
                    colCount={colCount}
                    onEditValueChange={setEditValue}
                    onFinishEdit={finishEdit}
                    onCancelEdit={cancelEdit}
                    onMoveAfterEdit={(nr, nc) => moveSelection(nr, nc)}
                    onStartEdit={startEdit}
                    onCellMouseDown={(e, rr, cc) => {
                      if (isInsideInteractive(e.target)) return;
                      if (isAction) return;

                      e.preventDefault();
                      dragRef.current = true;
                      anchorRef.current = { r: rr, c: cc };
                      setSelection(normalize(rr, cc, rr, cc));
                    }}
                    onCellMouseEnter={(e, rr, cc) => {
                      if (isAction) return;
                      if (e.buttons === 1 && dragRef.current && anchorRef.current) {
                        window.getSelection?.().removeAllRanges?.();
                        setSelection(
                          normalize(anchorRef.current.r, anchorRef.current.c, rr, cc)
                        );
                      }
                    }}
                    renderContent={renderContent}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ height: 12 }} />
    </div>
  );
}
