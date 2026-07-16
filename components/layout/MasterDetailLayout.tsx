'use client';

import React from 'react';

interface MasterDetailLayoutProps {
  title: React.ReactNode;

  leftTitle: React.ReactNode;
  left: React.ReactNode;

  rightTitle: React.ReactNode;
  right: React.ReactNode;
}

export default function MasterDetailLayout({
  title,
  leftTitle,
  left,
  rightTitle,
  right,
}: MasterDetailLayoutProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 12,
        overflow: 'hidden',
      }}
    >
      {/* ページタイトル */}
      <div
        style={{
          padding: '4px 2px',
          fontSize: 22,
          fontWeight: 'bold',
          color: '#2b579a',
          flexShrink: 0,
        }}
      >
        {title}
      </div>

      {/* 左右エリア */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: 12,
          minHeight: 0,
        }}
      >
        {/* 左 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              padding: '10px 14px',
              background: '#f5f5f5',
              borderBottom: '1px solid #d9d9d9',
              fontSize: 14,
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {leftTitle}
          </div>

          {/* 本文 */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {left}
          </div>
        </div>

        {/* 右 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {/* ヘッダー */}
          <div
            style={{
              padding: '10px 14px',
              background: '#f5f5f5',
              borderBottom: '1px solid #d9d9d9',
              fontSize: 14,
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {rightTitle}
          </div>

          {/* 本文 */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
