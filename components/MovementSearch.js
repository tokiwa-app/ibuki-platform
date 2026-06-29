// components/MovementSearch.js
import { useMemo, useState, useCallback } from "react";
import MasterSheet from "../lib/sheet/MasterSheet";

export default function MovementSearch() {
  // フォーム条件だけ残す（これ以外の “検索ロジック” は消える）
  const [typesStockIn, setTypesStockIn] = useState(true);
  const [typesStockOut, setTypesStockOut] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [externalRefId, setExternalRefId] = useState("");
  const [waybillNo, setWaybillNo] = useState("");

  // types を作る
  const types = useMemo(() => {
    const t = [];
    if (typesStockIn) t.push("STOCK_IN");
    if (typesStockOut) t.push("STOCK_OUT");
    return t;
  }, [typesStockIn, typesStockOut]);

  // Sheet定義（PartnerMasterGrid の書き方に合わせる）
  const sheetDef = useMemo(() => {
    return {
      table: "actions",
      orderBy: "occurred_at",
      orderAsc: false,
      maxHeight: "72vh",

      columns: [
        { key: "occurred_at", label: "発生日", type: "text", width: "4.2cm" },
        { key: "action_type", label: "種別", type: "text", width: "3.0cm" },
        { key: "status", label: "ステータス", type: "text", width: "3.0cm" },
        { key: "main_target_name", label: "納入会社", type: "text", width: "6.0cm" },
        { key: "external_ref_id", label: "外部参照ID", type: "text", width: "5.0cm" },
        { key: "main_qty", label: "数量", type: "number", width: "2.5cm", align: "right" },
        { key: "ship_waybill_no", label: "送り状", type: "text", width: "4.0cm" },
      ],

      // ✅ 従来フォーム条件を Supabase クエリに適用
      // q は supabase query builder
      extraWhere: (q, { ctx }) => {
        const { types, dateFrom, dateTo, externalRefId, waybillNo } = ctx;

        // 種別：1つだけ選択なら eq、2つなら無条件（元コード踏襲）
        if (Array.isArray(types) && types.length === 1) {
          q = q.eq("action_type", types[0]);
        }

        // 日付範囲
        if (dateFrom) q = q.gte("occurred_at", `${dateFrom}T00:00:00`);
        if (dateTo) q = q.lte("occurred_at", `${dateTo}T23:59:59`);

        // 外部参照ID
        if (externalRefId) q = q.ilike("external_ref_id", `%${externalRefId}%`);

        // 送り状番号
        if (waybillNo) q = q.ilike("ship_waybill_no", `%${waybillNo}%`);

        // 最大件数（元コードの limit(500) 相当）
        q = q.limit(500);

        return q;
      },

      // 🔍列検索（MasterSheet 内蔵 SearchKit）を使うならこれでOK
      // text/number は MasterSheet 側の buildFilterBuilder が対応済み
      search: {
        ops: {
          text: ["contains", "eq", "notContains"],
          number: ["eq", "gte", "lte"],
        },
      },
    };
  }, []);

  // ctxにフォーム値を渡す（extraWhere が参照）
  const ctx = useMemo(
    () => ({
      types,
      dateFrom,
      dateTo,
      externalRefId,
      waybillNo,
    }),
    [types, dateFrom, dateTo, externalRefId, waybillNo]
  );

  // 「検索」ボタンは MasterSheet の reload を押したい
  // でも MasterSheet は外から reload を呼べないので、
  // いったん簡単に「キーを変えて MasterSheet を再マウント」方式にする（最小実装）
  const [reloadKey, setReloadKey] = useState(0);
  const triggerSearch = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* フォーム */}
      <div className="rounded border border-gray-200 bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={typesStockIn}
              onChange={(e) => setTypesStockIn(e.target.checked)}
            />
            入庫
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={typesStockOut}
              onChange={(e) => setTypesStockOut(e.target.checked)}
            />
            出庫
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-9 rounded border border-gray-300 px-2 text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-9 rounded border border-gray-300 px-2 text-sm"
          />

          <input
            placeholder="外部参照ID"
            value={externalRefId}
            onChange={(e) => setExternalRefId(e.target.value)}
            className="h-9 w-56 rounded border border-gray-300 px-2 text-sm"
          />

          <input
            placeholder="送り状番号"
            value={waybillNo}
            onChange={(e) => setWaybillNo(e.target.value)}
            className="h-9 w-56 rounded border border-gray-300 px-2 text-sm"
          />

          <button
            type="button"
            onClick={triggerSearch}
            className="h-9 rounded bg-blue-600 px-4 text-sm font-medium text-white"
          >
            検索
          </button>
        </div>
      </div>

      {/* 結果 */}
      <div className="flex-1 min-h-0">
        <MasterSheet
          key={reloadKey}
          defJson={sheetDef}
          ctx={ctx}
          title="Movement Search"
        />
      </div>
    </div>
  );
}
