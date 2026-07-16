'use client';

import React from 'react';

type Props = {
  leftHeader: React.ReactNode;
  leftBody: React.ReactNode;
  rightHeader: React.ReactNode;
  rightBody: React.ReactNode;
};

export default function SplitLayout({
  leftHeader,
  leftBody,
  rightHeader,
  rightBody,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        height: '100%',
        overflow: 'hidden',
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
          borderRadius: 6,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            borderBottom: '1px solid #ddd',
            padding: 12,
            background: '#fafafa',
          }}
        >
          {leftHeader}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            padding: 8,
          }}
        >
          {leftBody}
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
          borderRadius: 6,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            borderBottom: '1px solid #ddd',
            padding: 12,
            background: '#fafafa',
          }}
        >
          {rightHeader}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            padding: 8,
          }}
        >
          {rightBody}
        </div>
      </div>
    </div>
  );
}
