'use client';

import React from 'react';

interface MasterDetailLayoutProps {
  title: React.ReactNode;

  leftTitle: React.ReactNode;
  left?: React.ReactNode;

  rightTitle: React.ReactNode;
  right?: React.ReactNode;
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
        overflow: 'hidden',
        gap: 12,
      }}
    >
      {/* ページタイトル */}
      <div
        style={{
          padding: '8px 4px',
          fontSize: 20,
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
          gap: 12,
          flex: 1,
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
            border: '1px solid #ddd',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: '#f5f5f5',
              borderBottom: '1px solid #ddd',
              fontWeight: 'bold',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {leftTitle}
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
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
            border: '1px solid #ddd',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: '#f5f5f5',
              borderBottom: '1px solid #ddd',
              fontWeight: 'bold',
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {rightTitle}
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
