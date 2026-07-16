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
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 12,
        overflow: 'hidden',
      }}
    >
      {/* タイトルバー */}
      <div
        style={{
          backgroundColor: titleBackground,
          color: titleColor,
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 18,
          fontWeight: 'bold',
          flexShrink: 0,
        }}
      >
        {title}
      </div>

      {/* 左右 */}
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
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
          }}
        >
          {left}
        </div>

        {/* 右 */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 8,
          }}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
