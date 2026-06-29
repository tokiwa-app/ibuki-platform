// components/Layout.js
import { useState } from 'react';
import StatusBar from './StatusBar';
import Sidebar from './Sidebar';

const HEADER_HEIGHT = 40;

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >

      {/* 左: サイドバー (オーバーレイ方式そのまま) */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 右側メイン画面 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >

        {/* 上バー固定 */}
        <div
          style={{
            height: HEADER_HEIGHT,
            flexShrink: 0,
            background: "#fff",
            borderBottom: "1px solid #ddd",
          }}
        >
          <StatusBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>

        {/* ---- ここがコンテンツ領域 (全面表示) ---- */}
        <main
          style={{
            flex: 1,
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
