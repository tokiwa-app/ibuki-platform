'use client';

import React from 'react';

interface MasterDetailLayoutProps {
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
}: MasterDetailLayoutProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 固定タイトルバー */}
      <div
        style={{
          flex: '0 0 auto',
          backgroundColor: titleBackground,
          color: titleColor,
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 18,
          fontWeight: 'bold',
          boxSizing: 'border-box',
        }}
      >
        {title}
      </div>

      {/* 左右ペイン */}
      <div
        style={{
          flex: '1 1 0',
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          gap: 12,
          paddingTop: 12,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* 左ペインだけスクロール */}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 0,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            boxSizing: 'border-box',
          }}
        >
          {left}
        </div>

        {/* 右ペインだけスクロール */}
        <div
          style={{
            flex: '1 1 0',
            minWidth: 0,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            boxSizing: 'border-box',
          }}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
