'use client';

import React from 'react';

interface Props {
  title: React.ReactNode;
  titleBackground?: string;
  titleColor?: string;
  left: React.ReactNode;
  right: React.ReactNode;
}

export default function MasterDetailLayout({
  title,
  titleBackground = '#2b579a',
  titleColor = '#fff',
  left,
  right,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // 画面いっぱいに固定
        width: '100vw',
        overflow: 'hidden', // 全体のスクロールを禁止
        boxSizing: 'border-box',
        padding: 0,
        margin: 0,
      }}
    >
      <header
        style={{
          background: titleBackground,
          color: titleColor,
          padding: '8px 12px', // 余白最小化
          fontSize: '16px',
          fontWeight: 'bold',
          flexShrink: 0, // ヘッダーサイズ固定
        }}
      >
        {title}
      </header>

      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: 0, // 左右間の隙間なし
          minHeight: 0, // 重要: flex内スクロール制御
        }}
      >
        <div style={{ flex: '0 0 400px', overflowY: 'auto' }}>
          {left}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {right}
        </div>
      </div>
    </div>
  );
}
