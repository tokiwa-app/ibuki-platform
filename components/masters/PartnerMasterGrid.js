// components/masters/PartnerMasterGrid.js
import MasterSheet from "../../lib/sheet/MasterSheet";

export default function PartnerMasterGrid({ onSelectPartner }) {
  // =========================================================
  // 製品マスタを開くアクション
  // =========================================================
  const openProductMaster = (partnerId) => {
    // 親コンポーネントから渡された処理を呼ぶ
    if (typeof onSelectPartner === "function") {
      onSelectPartner(partnerId);
    }
  };

  // =========================================================
  // Sheet 定義（取引先）
  // =========================================================
  const sheetDef = {
    table: "partners",
    orderBy: "created_at",
    orderAsc: false,
    maxHeight: "72vh",

    columns: [
      { key: "name", label: "取引先名", type: "text", width: "5cm" },
      { key: "short_name", label: "略称", type: "text", width: "5cm" },
      {
        key: "access_id",
        label: "旧ID",
        type: "number",
        width: "5cm",
        align: "right",
      },
    ],

    // 操作列（最後に自動追加）
    actions: [
      {
        key: "openProducts",
        label: "製品マスタ",
        onClick: "openProductMaster", // ctx の関数名
      },
    ],

    actionWidth: "4cm",

    // 🔍 列検索
    search: {
      ops: {
        text: ["contains", "eq", "notContains"],
        number: ["eq", "gte", "lte"],
      },
    },
  };

  return (
    <MasterSheet
      defJson={sheetDef}
      ctx={{
        onSelectPartner,
        openProductMaster, // ← これが無いとボタンは動かない
      }}
      title="取引先マスタ"
    />
  );
}
