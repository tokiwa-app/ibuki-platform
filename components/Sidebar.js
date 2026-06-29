// components/Sidebar.js
import { useRouter } from "next/router";

const MODULES = [
  { key: "sales", label: "🛒 販売管理", path: "/sales" },
  { key: "purchasing", label: "🛍️ 購買管理（仕入）", path: "/purchasing" },
  { key: "inbound", label: "📥 入荷管理", path: "/inbound" },
  { key: "outbound", label: "📤 出庫（Outbound）", path: "/dashboard?view=movement" },
  { key: "inventory", label: "📊 在庫管理", path: "/inventory" },
  { key: "manufacturing", label: "🏭 生産管理", path: "/manufacturing" },
  { key: "accounting", label: "💰 会計", path: "/accounting" },
  { key: "inbox", label: "📨 Inbox", path: "/inbox" },
  { key: 'import', label: '📥 データ取り込み', path: '/dashboard?view=import',
},
  // 👇 マスタは1個だけ。中で partner / product を切り替える
  {
    key: "master",
    label: "🗂️ マスタ管理",
    path: "/dashboard?view=master&master=partner",
  },
  { key: "archive", label: "📚 書庫", path: "/archive" },
  { key: "hr", label: "🧑‍💼 HR", path: "/hr" },
];

export default function Sidebar({ open, onClose }) {
  const router = useRouter();

  function handleNavigate(path) {
    router.push(path);
    if (onClose) onClose();
  }

  // 開いていないときは何も描画しない
  if (!open) return null;

  return (
    <>
      {/* 背景の半透明オーバーレイ（クリックで閉じる） */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.15)",
          zIndex: 900,
        }}
      />

      {/* サイドバー本体 */}
      <nav
        style={{
          position: "fixed",
          top: 40, // ステータスバーの高さ分
          left: 0,
          bottom: 0,
          width: 260,
          background: "#ffffff",
          borderRight: "1px solid #ddd",
          boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
          zIndex: 950,
          padding: "12px 12px 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#666",
            marginBottom: 8,
          }}
        >
          業務モジュール
        </div>

        {MODULES.map((m) => (
          <button
            key={m.key}
            onClick={() => handleNavigate(m.path)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              borderRadius: 6,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              marginBottom: 4,
              color: "#222",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {m.label}
          </button>
        ))}
      </nav>
    </>
  );
}
