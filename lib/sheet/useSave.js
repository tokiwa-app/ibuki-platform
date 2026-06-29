// lib/sheet/useSave.js
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

/************************************************************************************************
 * useSave
 * - 対象テーブルを matrix で読み書きする
 * - MasterSheet 専用の「薄いDBエンジン」
 * - extraWhere により、画面固有の検索条件を外から注入できる
 * - ✅ INSERT（新規行追加）も提供
 ************************************************************************************************/

function normalizeValue(type, v) {
  // 画面上の空は null に統一（DB側制約に応じて "" にしたければここを変更）
  if (v === "" || v === undefined) return null;
  if (v === null) return null;

  if (type === "number") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  if (type === "boolean") {
    const s = String(v).trim().toLowerCase();
    if (["true", "1", "t", "yes", "y"].includes(s)) return true;
    if (["false", "0", "f", "no", "n"].includes(s)) return false;
    return null;
  }

  // text
  return String(v);
}

export default function useSave({
  table,
  columns, // [{ key, label, type }]
  filterBuilder, // (q, filters) => q   ← 🔍列検索用
  scope, // { tenantId?, partnerId? }
  orderBy = "created_at",
  orderAsc = false,
  extraWhere, // (q) => q            ← 画面固有の追加 where
}) {
  const [rows, setRows] = useState([]); // [{ id, data: [] }]
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [lastErrors, setLastErrors] = useState([]);

  /************************************************************************************************
   * rows build
   ************************************************************************************************/
  const buildRowsFromList = useCallback(
    (list) => {
      if (!Array.isArray(list)) {
        setRows([]);
        return;
      }

      setRows(
        list.map((item) => ({
          id: item.id,
          data: columns.map((c) => item?.[c.key] ?? ""),
        }))
      );
    },
    [columns]
  );

  /************************************************************************************************
   * scope apply（tenant / partner）
   ************************************************************************************************/
  const applyScope = useCallback(
    (q) => {
      if (scope?.tenantId) q = q.eq("tenant_id", scope.tenantId);
      if (scope?.partnerId) q = q.eq("partner_id", scope.partnerId);
      return q;
    },
    [scope?.tenantId, scope?.partnerId]
  );

  /************************************************************************************************
   * SELECT
   ************************************************************************************************/
  const fetchData = useCallback(
    async (filters = null) => {
      if (!table) return;

      setLoading(true);
      setError("");
      setLastErrors([]);

      try {
        let q = supabase.from(table).select("*");

        // scope（共通）
        q = applyScope(q);

        // 画面固有の where（MovementSearch など）
        if (typeof extraWhere === "function") {
          q = extraWhere(q);
        }

        // order
        try {
          q = q.order(orderBy, { ascending: orderAsc });
        } catch {
          q = q.order("id", { ascending: true });
        }

        // 🔍列検索
        if (typeof filterBuilder === "function" && Array.isArray(filters)) {
          q = filterBuilder(q, filters);
        }

        const { data, error: e } = await q;
        if (e) throw e;

        buildRowsFromList(data);
      } catch (e) {
        console.error("useSave fetch error:", e);
        setRows([]);
        setError(e?.message || "ロードに失敗しました");
      } finally {
        setLoading(false);
      }
    },
    [table, applyScope, extraWhere, filterBuilder, buildRowsFromList, orderBy, orderAsc]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /************************************************************************************************
   * matrix（SheetGrid 用）
   ************************************************************************************************/
  const matrix = useMemo(() => rows.map((r) => r.data), [rows]);

  const reload = useCallback(() => fetchData(), [fetchData]);
  const loadWithQuery = useCallback((filters) => fetchData(filters), [fetchData]);

  /************************************************************************************************
   * INSERT（新規行追加）
   ************************************************************************************************/
  const insertRow = useCallback(
    async (rowData) => {
      if (!Array.isArray(rowData)) return null;
      if (!table) return null;

      setError("");
      setLastErrors([]);

      try {
        const payload = {};

        // columns から payload を作る（空は入れない）
        columns.forEach((c, idx) => {
          const raw = rowData?.[idx];
          const trimmed = String(raw ?? "").trim();
          if (trimmed === "") return;

          const v = normalizeValue(c.type || "text", raw);
          if (v !== null) payload[c.key] = v;
        });

        // 何も入ってないなら insert しない
        if (!Object.keys(payload).length) return null;

        // scope を insert にも付与（超重要）
        if (scope?.tenantId) payload.tenant_id = scope.tenantId;
        if (scope?.partnerId) payload.partner_id = scope.partnerId;

        const { data, error: e } = await supabase
          .from(table)
          .insert(payload)
          .select("*")
          .single();

        if (e) throw e;

        return data;
      } catch (e) {
        console.error("insertRow error:", e);
        setError(e?.message || "追加に失敗しました");
        throw e;
      }
    },
    [table, columns, scope?.tenantId, scope?.partnerId]
  );

  /************************************************************************************************
   * UPDATE (save)
   ************************************************************************************************/
  const saveMatrix = useCallback(
    async (nextMatrix) => {
      if (!Array.isArray(nextMatrix)) return;
      if (!table) return;

      setError("");
      setLastErrors([]);

      const patches = [];

      // 既存行のみ UPDATE（INSERT はやらない）
      nextMatrix.slice(0, rows.length).forEach((row, i) => {
        const prev = rows[i];
        if (!prev) return;

        const patch = {};

        columns.forEach((c, idx) => {
          const type = c.type || "text";

          const prevV = normalizeValue(type, prev.data[idx]);
          const nextV = normalizeValue(type, row?.[idx]);

          // どちらも null なら変更なし
          if (prevV === null && nextV === null) return;

          if (prevV !== nextV) {
            patch[c.key] = nextV; // null の更新も許容（DB側制約に注意）
          }
        });

        if (Object.keys(patch).length) {
          // optimistic 更新用は UI 表示値（row）をそのまま保持
          patches.push({ id: prev.id, patch, newData: row });
        }
      });

      if (!patches.length) return;

      // optimistic update
      setRows((prev) => {
        const map = new Map(patches.map((p) => [p.id, p]));
        return prev.map((r) => {
          const p = map.get(r.id);
          return p ? { ...r, data: p.newData } : r;
        });
      });

      // DB update
      const errors = [];
      for (const p of patches) {
        try {
          let q = supabase.from(table).update(p.patch).eq("id", p.id);
          q = applyScope(q); // scope 再適用（誤更新防止）

          const { error: e } = await q;
          if (e) {
            console.error("saveMatrix update error:", e);
            errors.push({ id: p.id, message: e.message, patch: p.patch });
          }
        } catch (e) {
          console.error("saveMatrix update exception:", e);
          errors.push({
            id: p.id,
            message: e?.message || String(e),
            patch: p.patch,
          });
        }
      }

      if (errors.length) {
        setLastErrors(errors);
        setError("一部の更新に失敗しました（権限/スコープ/型/制約を確認）");
      }
    },
    [rows, columns, table, applyScope]
  );

  /************************************************************************************************
   * expose
   ************************************************************************************************/
  return {
    matrix,
    rows,
    loading,
    reload,
    loadWithQuery,
    saveMatrix,
    insertRow, // ✅追加
    error,
    lastErrors,
  };
}
