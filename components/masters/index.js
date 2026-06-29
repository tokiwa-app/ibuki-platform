// components/masters/index.js

import { useState } from "react";
import PartnerMasterGrid from "./PartnerMasterGrid";
import ProductMasterGrid from "./ProductMasterGrid";

export default function MastersIndex() {
  const [activeMaster, setActiveMaster] = useState("partner"); // "partner" | "product"
  const [selectedPartnerId, setSelectedPartnerId] = useState("");

  const handleSelectPartner = (partnerId) => {
    setSelectedPartnerId(partnerId);
    setActiveMaster("product");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%", // Dashboard から渡された高さを丸ごと使う
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* タブ切り替え */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={() => setActiveMaster("partner")}
          style={{
            padding: "6px 10px",
            borderRadius: 20,
            border:
              activeMaster === "partner"
                ? "1px solid #2563eb"
                : "1px solid #ddd",
            background:
              activeMaster === "partner" ? "#eff6ff" : "transparent",
            color: activeMaster === "partner" ? "#1d4ed8" : "#444",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          👤 顧客マスタ
        </button>
        <button
          onClick={() => setActiveMaster("product")}
          style={{
            padding: "6px 10px",
            borderRadius: 20,
            border:
              activeMaster === "product"
                ? "1px solid #2563eb"
                : "1px solid #ddd",
            background:
              activeMaster === "product" ? "#eff6ff" : "transparent",
            color: activeMaster === "product" ? "#1d4ed8" : "#444",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          📦 製品マスタ
        </button>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0, // ← ここが重要：子要素がスクロールできるように縮む
        }}
      >
        {activeMaster === "partner" ? (
          <PartnerMasterGrid onSelectPartner={handleSelectPartner} />
        ) : (
          <ProductMasterGrid partnerId={selectedPartnerId} />
        )}
      </div>
    </div>
  );
}
