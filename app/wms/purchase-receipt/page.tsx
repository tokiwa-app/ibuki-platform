'use client';

import { useState } from 'react';
import ReceiptList from '../../../components/wms/ReceiptList';
import ReceiptDetail from '../../../components/wms/ReceiptDetail';

export default function PurchaseReceiptPage() {
  const [selectedName, setSelectedName] = useState(''); // 選択されたPR（入庫）のID

  // 新規登録完了時や、新規作成ボタンが押されたときに一覧を更新するためのトリガー
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateNew = () => {
    setSelectedName(''); // 選択をクリアして右側を新規作成フォームにする
  };

  return (
    <main
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
        backgroundColor: '#f3f4f6',
        color: '#333',
        overflow: 'hidden',
      }}
    >
      {/* 上部ツールバー */}
      <header
        style={{
          padding: '12px 16px',
          backgroundColor: '#2e7d32', // 入庫なので緑系のテーマカラーに
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 'bold' }}>入庫一覧・直接登録（WMS）</h1>
          <div style={{ fontSize: 13, backgroundColor: '#1b5e20', padding: '4px 8px', borderRadius: 4 }}>
            3PL ダイレクト入庫モード
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={buttonStyle} onClick={handleCreateNew}>➕ 新規入庫登録</button>
          <button style={{ ...buttonStyle, backgroundColor: '#d9534f', color: '#fff' }}>終了</button>
        </div>
      </header>

      {/* メインエリア（50:50等分割） */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          padding: 12,
          overflow: 'hidden',
        }}
      >
        {/* 左側：入庫実績一覧 */}
        <ReceiptList 
          selectedName={selectedName} 
          onSelect={setSelectedName} 
          refreshTrigger={refreshTrigger}
        />
        
        {/* 右側：詳細表示 ＆ 新規登録フォーム */}
        <ReceiptDetail 
          name={selectedName} 
          onSaveSuccess={() => {
            handleRefresh();
            setSelectedName(''); // 登録完了したらフォームをクリア
          }}
        />
      </div>
    </main>
  );
}

const buttonStyle = {
  padding: '6px 12px',
  backgroundColor: '#f0f0f0',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 'bold' as const,
};
