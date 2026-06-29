// lib/sheet/MasterSheet.jsx
import { useCallback, useMemo, useRef, useState } from "react";
import useSave from "./useSave";
import SheetGrid from "./SheetGrid";
import SearchKit from "./SearchKit";

/************************************************************************************************
 * MasterSheet.jsx（useSave版）
 * - SheetGrid（セル操作） + SearchKit（列検索） + useSave（DB load/save）を統合
 * - defJson.actions がある場合、最後に「操作列」を追加してボタンを描画
 * - ✅ 常に末尾に「空行」を1行追加（DBとは無関係）
 *   - 空行に入力が入ったら INSERT
 ************************************************************************************************/

const DEFAULT_OP_LABELS = {
  "-": "-",
  contains: "含む",
  notContains: "含まない",
  eq: "等しい",
  notEq: "等しくない",
  gte: "以上",
  lte: "以下",
};

/************************************************************************************************
 * scope 解決
 ************************************************************************************************/
function resolveScope(defJson, ctx) {
  const scopeDef = defJson?.scope || {};
  const out = {};

  Object.keys(scopeDef).forEach((k) => {
    const s = scopeDef[k];

    if (s && typeof s === "object") {
      if (s.source === "props") {
        out[k] = ctx?.[s.key] ?? null;
        return;
      }
      if (s.source === "localStorage") {
        if (typeof window !== "undefined") {
          out[k] = localStorage.getItem(s.key) || null;
        } else {
          out[k] = null;
        }
        return;
      }
      if (s.source === "static") {
        out[k] = s.value ?? null;
        return;
      }
    }

    if (s === true) {
      out[k] = ctx?.[k] ?? null;
    }
  });

  return out;
}

/************************************************************************************************
 * filters -> query 変換（useSave に渡す）
 ************************************************************************************************/
function buildFilterBuilder(columns) {
  return (q, filters) => {
    if (!Array.isArray(filters)) return q;

    const parseBool = (v) => {
      const s = String(v ?? "").trim().toLowerCase();
      if (["true", "1", "t", "yes", "y"].includes(s)) return true;
      if (["false", "0", "f", "no", "n"].includes(s)) return false;
      return null;
    };

    filters.forEach((f, index) => {
      if (!f) return;
      const raw = (f.value ?? "").toString().trim();
      const op = f.op;

      if (!op || op === "-" || raw === "") return;

      const col = columns[index];
      if (!col) return;

      const field = col.key;
      const type = col.type || "text";

      if (type === "boolean") {
        const b = parseBool(raw);
        if (b === null) return;
        if (op === "eq") q = q.eq(field, b);
        else if (op === "notEq" || op === "notContains") q = q.neq(field, b);
        return;
      }

      if (type === "number") {
        const num = Number(raw);
        if (Number.isNaN(num)) return;
        if (op === "eq") q = q.eq(field, num);
        else if (op === "gte") q = q.gte(field, num);
        else if (op === "lte") q = q.lte(field, num);
        return;
      }

      // text
      if (op === "contains") q = q.ilike(field, `%${raw}%`);
      else if (op === "eq") q = q.eq(field, raw);
      else if (op === "notContains") q = q.not(field, "ilike", `%${raw}%`);

      return q;
    });

    return q;
  };
}

/************************************************************************************************
 * Main
 ************************************************************************************************/
export default function MasterSheet({ defJson, ctx = {}, title }) {
  if (!defJson) return null;

  const table = defJson.table;
  const orderBy = defJson.orderBy || "created_at";
  const orderAsc = !!defJson.orderAsc;

  const dbColumns = defJson.columns || [];

  const actionDefs = Array.isArray(defJson.actions) ? defJson.actions : [];
  const hasActions = actionDefs.length > 0;

  const scope = useMemo(() => resolveScope(defJson, ctx), [defJson, ctx]);
  const filterBuilder = useMemo(() => buildFilterBuilder(dbColumns), [dbColumns]);

  /************************************************************************************************
   * ✅ useSave
   ************************************************************************************************/
  const {
    matrix,
    rows,
    loading,
    reload,
    loadWithQuery,
    saveMatrix,
    insertRow,
    error,
    lastErrors,
  } = useSave({
    table,
    columns: dbColumns,
    filterBuilder,
    scope,
    orderBy,
    orderAsc,
  });

  /************************************************************************************************
   * 表示用 columns / config / matrix（操作列を付ける）
   ************************************************************************************************/
  const viewColumns = useMemo(() => {
    if (!hasActions) return dbColumns;
    return [...dbColumns, { key: "__actions", label: "操作", type: "action" }];
  }, [dbColumns, hasActions]);

  const dbColumnConfig = useMemo(() => {
    return dbColumns.map((c) => ({
      width: c.width,
      align: c.align,
      type: c.type,
    }));
  }, [dbColumns]);

  const viewColumnConfig = useMemo(() => {
    if (!hasActions) return dbColumnConfig;

    const actionCol = {
      width: defJson.actionWidth || "4cm",
      type: "action",
      align: "center",
      render: ({ rowIndex }) => {
        // ✅ rows の範囲外（末尾の空行）では action を出さない
        const rowObj = rows?.[rowIndex];
        if (!rowObj) return null;

        return (
          <div className="flex items-center justify-center gap-1">
            {actionDefs.map((a) => {
              const label = a.label || "Action";
              const fnName = a.onClick; // ctx の関数名
              const key = a.key || `${label}:${fnName || ""}`;

              return (
                <button
                  key={key}
                  type="button"
                  className="inline-flex items-center justify-center rounded border border-blue-600 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const fn = ctx?.[fnName];
                    if (typeof fn === "function") {
                      fn(rowObj.id, { rowIndex, action: a });
                    }
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        );
      },
    };

    return [...dbColumnConfig, actionCol];
  }, [hasActions, dbColumnConfig, defJson.actionWidth, rows, actionDefs, ctx]);

  /************************************************************************************************
   * ✅ 表示用 matrix：DB rows + 末尾に空行（常に1行）
   ************************************************************************************************/
  const displayMatrix = useMemo(() => {
    const baseDb = Array.isArray(matrix) ? matrix : [];
    const baseView = baseDb.map((r) => {
      const row = Array.isArray(r) ? r : [];
      return hasActions ? [...row, ""] : row;
    });

    const emptyDbRow = dbColumns.map(() => "");
    const emptyViewRow = hasActions ? [...emptyDbRow, ""] : emptyDbRow;

    return [...baseView, emptyViewRow];
  }, [matrix, hasActions, dbColumns]);

  /************************************************************************************************
   * ✅ INSERT 重複防止（同じ内容で連打されないように）
   ************************************************************************************************/
  const insertingRef = useRef(false);
  const lastInsertedSigRef = useRef("");

  const makeSig = (rowArr) =>
    (Array.isArray(rowArr) ? rowArr : [])
      .map((v) => String(v ?? "").trim())
      .join("\u001F");

  /************************************************************************************************
   * ✅ onChangeMatrix
   * - 既存行：UPDATE
   * - 末尾の新規行（rows.length の行）：入力があれば INSERT → reload
   ************************************************************************************************/
  const handleChangeMatrix = useCallback(
    async (nextViewMatrix) => {
      if (!Array.isArray(nextViewMatrix)) return;

      const dbLen = rows.length;

      // action列を除いた DB 用 matrix を作る
      const stripToDb = (viewRow) => {
        const r = Array.isArray(viewRow) ? viewRow : [];
        return r.slice(0, dbColumns.length);
      };

      // ① 既存行 UPDATE
      const nextDbMatrix = nextViewMatrix
        .slice(0, dbLen)
        .map((r) => stripToDb(r));

      await saveMatrix(nextDbMatrix);

      // ② 新規行候補（ちょうど rows.length 行目）
      const newRowView = nextViewMatrix[dbLen];
      const newRowDb = stripToDb(newRowView);

      const hasAnyValue = Array.isArray(newRowDb)
        ? newRowDb.some((v) => String(v ?? "").trim() !== "")
        : false;

      if (!hasAnyValue) return;

      // 重複 insert 防止（同じ内容）
      const sig = makeSig(newRowDb);
      if (sig === lastInsertedSigRef.current) return;
      if (insertingRef.current) return;

      insertingRef.current = true;
      try {
        await insertRow(newRowDb);
        lastInsertedSigRef.current = sig;
        await reload(); // ID確定して一覧に入れる（末尾にまた空行が出る）
      } catch {
        // useSave が error を入れるのでここでは何もしない
      } finally {
        insertingRef.current = false;
      }
    },
    [rows.length, dbColumns.length, saveMatrix, insertRow, reload]
  );

  /************************************************************************************************
   * 検索モーダル
   ************************************************************************************************/
  const [searchTarget, setSearchTarget] = useState(null);
  const [lastSearch, setLastSearch] = useState({});

  const openSearch = useCallback(
    (info) => {
      if (!info || typeof info.colIndex !== "number") return;
      if (hasActions && info.colIndex === viewColumns.length - 1) return;
      setSearchTarget(info);
    },
    [hasActions, viewColumns.length]
  );

  const closeSearch = useCallback(() => setSearchTarget(null), []);

  const showHeaderAction = useCallback(
    (colIndex) => {
      if (hasActions && colIndex === viewColumns.length - 1) return false;
      return true;
    },
    [hasActions, viewColumns.length]
  );

  const handleClear = useCallback(async () => {
    await loadWithQuery(dbColumns.map(() => ({ op: "-", value: "" })));
  }, [dbColumns, loadWithQuery]);

  const initialForTarget = useMemo(() => {
    const field = searchTarget?.field;
    if (!field) return { op: "contains", value: "" };
    return lastSearch[field] || { op: "contains", value: "" };
  }, [searchTarget, lastSearch]);

  const targetForKit = useMemo(() => {
    if (!searchTarget) return null;
    return {
      ...searchTarget,
      opLabels: DEFAULT_OP_LABELS,
    };
  }, [searchTarget]);

  const handleSearch = useCallback(
    async ({ op, value }) => {
      const colIndex = searchTarget?.colIndex;
      const field = searchTarget?.field;
      const type = searchTarget?.type || "text";
      if (typeof colIndex !== "number") return;

      const t = String(value ?? "").trim();

      const pickedOp =
        t === ""
          ? "-"
          : op || (type === "number" || type === "boolean" ? "eq" : "contains");

      const filters = dbColumns.map((_, i) => ({
        op: i === colIndex ? pickedOp : "-",
        value: i === colIndex ? t : "",
      }));

      await loadWithQuery(filters);

      if (field) setLastSearch((p) => ({ ...p, [field]: { op: pickedOp, value: t } }));
      closeSearch();
    },
    [searchTarget, dbColumns, loadWithQuery, closeSearch]
  );

  /************************************************************************************************
   * Render
   ************************************************************************************************/
  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="rounded border border-gray-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-700">{title || ""}</div>

          <button
            type="button"
            onClick={reload}
            className="ml-2 h-9 rounded bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            🔄 再読み込み
          </button>

          {loading ? (
            <span className="text-xs text-gray-600 rounded border border-gray-200 bg-gray-50 px-2 py-1">
              Loading...
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleClear}
            className="ml-auto h-9 rounded border border-gray-300 bg-white px-3 text-sm hover:bg-gray-50"
          >
            検索クリア
          </button>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          ※ 各カラム右上の「🔍」から、その列だけ検索（含む/等しい/以上/以下…）
        </div>

        {/* 保存/ロードエラーが見えるように（原因追跡しやすい） */}
        {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}

        {Array.isArray(lastErrors) && lastErrors.length ? (
          <div className="mt-2 text-xs text-red-600">
            {lastErrors.slice(0, 3).map((e) => (
              <div key={e.id}>
                id={e.id}：{e.message}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex-1 min-h-0">
        <SheetGrid
          matrix={displayMatrix}
          onChangeMatrix={handleChangeMatrix}
          columns={viewColumns}
          columnConfig={viewColumnConfig}
          onHeaderAction={openSearch}
          showHeaderAction={showHeaderAction}
          headerActionIcon="🔍"
          maxHeight={defJson.maxHeight || "72vh"}
        />
      </div>

      <SearchKit
        open={!!targetForKit}
        target={targetForKit}
        initialText={initialForTarget.value}
        initialOp={initialForTarget.op}
        onClose={closeSearch}
        onSearch={handleSearch}
        onClear={handleClear}
      />
    </div>
  );
}
