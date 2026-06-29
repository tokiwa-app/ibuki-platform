// components/masters/ProductMasterGrid.js
import MasterSheet from "../../lib/sheet/MasterSheet";

export default function ProductMasterGrid({ partnerId }) {
  if (!partnerId) {
    return (
      <div className="p-4 text-sm text-gray-600">
        取引先が選択されていません。取引先マスタから取引先を選択してください。
      </div>
    );
  }

  // =========================================================
  // Sheet 定義（製品）
  // =========================================================
  const sheetDef = {
    table: "products",
    orderBy: "created_at",
    orderAsc: false,

    // スコープ定義
    scope: {
      tenantId: { source: "localStorage", key: "active_tenant_id" },
      partnerId: { source: "props", key: "partnerId" },
    },

    columns: [
      { key: "legacy_id", label: "旧ID", type: "number", width: "3cm", align: "right" },
      { key: "access_id", label: "Access ID", type: "number", width: "3cm", align: "right" },

      { key: "code", label: "商品コード", type: "text", width: "3.5cm" },
      { key: "name", label: "商品名", type: "text", width: "6cm" },
      { key: "short_name", label: "略称", type: "text", width: "3.5cm" },

      // 追加
      { key: "int1", label: "int1", type: "number", width: "3cm", align: "right" },

      { key: "name_inbound", label: "入庫時名", type: "text", width: "5cm" },
      { key: "jan_code", label: "JANコード", type: "text", width: "4cm" },
      { key: "note", label: "備考", type: "text", width: "6cm" },

      { key: "big_category", label: "大分類", type: "text", width: "3cm" },
      { key: "middle_category", label: "中分類", type: "text", width: "3cm" },
      { key: "small_category", label: "小分類", type: "text", width: "3cm" },
      { key: "segment3", label: "セグメント3", type: "text", width: "3cm" },

      { key: "unit", label: "単位", type: "text", width: "2.5cm" },
      {
        key: "base_inbound_fee",
        label: "基本入庫料金",
        type: "number",
        width: "3.5cm",
        align: "right",
      },
      {
        key: "base_storage_fee",
        label: "基本保管料金",
        type: "number",
        width: "3.5cm",
        align: "right",
      },
      {
        key: "base_outbound_fee",
        label: "基本出庫料金",
        type: "number",
        width: "3.5cm",
        align: "right",
      },

      { key: "case_weight", label: "ケース重量", type: "number", width: "3cm", align: "right" },
      {
        key: "case_length_cm",
        label: "ケース長(cm)",
        type: "number",
        width: "3cm",
        align: "right",
      },
      {
        key: "case_width_cm",
        label: "ケース幅(cm)",
        type: "number",
        width: "3cm",
        align: "right",
      },
      {
        key: "case_height_cm",
        label: "ケース高(cm)",
        type: "number",
        width: "3cm",
        align: "right",
      },
      {
        key: "case_quantity",
        label: "ケース入数",
        type: "number",
        width: "3cm",
        align: "right",
      },

      {
        key: "is_inventory_managed",
        label: "在庫管理対象",
        type: "boolean",
        width: "3cm",
      },
    ],

    maxHeight: "72vh",

    search: {
      ops: {
        text: ["contains", "eq", "notContains"],
        number: ["eq", "gte", "lte"],
        boolean: ["eq"],
      },
    },
  };

  return (
    <MasterSheet
      defJson={sheetDef}
      ctx={{ partnerId }}
      title="製品マスタ"
    />
  );
}
