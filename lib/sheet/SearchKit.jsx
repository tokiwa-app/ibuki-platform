// lib/sheet/SearchKit.jsx
import { useEffect, useMemo, useState } from "react";

/************************************************************************************************
 * SearchKit
 * - “列検索”専用のモーダル
 * - op(含む/等しい/以上/以下/含まない) を列typeに応じて出す
 * - onSearch({op,value}) ではなく、MasterSheetの都合で onSearch(value, op) にしてもOK
 *   → ここは {op,value} を返すようにしている
 ************************************************************************************************/
export default function SearchKit({
  open,
  target, // { colIndex, field, label, type }
  initialText = "",
  initialOp = "contains",
  onClose,
  onSearch, // ({op,value})
  onClear,
}) {
  const [value, setValue] = useState(initialText || "");
  const [op, setOp] = useState(initialOp || "contains");

  useEffect(() => {
    if (!open) return;
    setValue(initialText || "");
    setOp(initialOp || "contains");
  }, [open, initialText, initialOp]);

  const type = target?.type || "text";

  const ops = useMemo(() => {
    if (type === "number") {
      return [
        { value: "eq", label: "＝ 等しい" },
        { value: "gte", label: "≥ 以上" },
        { value: "lte", label: "≤ 以下" },
      ];
    }
    if (type === "boolean") {
      return [
        { value: "eq", label: "等しい" },
        { value: "notEq", label: "等しくない" },
      ];
    }
    // text
    return [
      { value: "contains", label: "含む" },
      { value: "eq", label: "等しい" },
      { value: "notContains", label: "含まない" },
    ];
  }, [type]);

  const title = target?.label ? `検索：${target.label}` : "検索";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => onClose?.()}
      />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="text-sm font-semibold text-gray-800">{title}</div>
          <button
            type="button"
            className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            onClick={() => onClose?.()}
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="text-xs text-gray-500 mb-2">
            条件（op）を選んで、検索値を入力してください。
          </div>

          {/* op buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            {ops.map((x) => (
              <button
                key={x.value}
                type="button"
                onClick={() => setOp(x.value)}
                className={
                  "h-8 rounded border px-3 text-sm " +
                  (op === x.value
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50")
                }
              >
                {x.label}
              </button>
            ))}
          </div>

          {/* value input */}
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSearch?.({ op, value });
              }
              if (e.key === "Escape") {
                e.preventDefault();
                onClose?.();
              }
            }}
            placeholder={
              type === "boolean"
                ? "true / false"
                : type === "number"
                ? "例: 100"
                : "例: キーワード"
            }
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSearch?.({ op, value })}
              className="h-9 rounded bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            >
              検索
            </button>

            <button
              type="button"
              onClick={() => {
                setValue("");
                // op は維持。クリアは別ボタン
              }}
              className="h-9 rounded border border-gray-300 bg-white px-4 text-sm hover:bg-gray-50"
            >
              入力クリア
            </button>

            <button
              type="button"
              onClick={() => onClear?.()}
              className="ml-auto h-9 rounded border border-gray-300 bg-white px-4 text-sm hover:bg-gray-50"
            >
              全検索クリア
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
