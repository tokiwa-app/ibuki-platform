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
        width: '100%',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* タイトル */}
      <header
        style={{
          flexShrink: 0,
          padding: '12px 16px',
          backgroundColor: titleBackground,
          color: titleColor,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          {title}
        </h1>
      </header>

      {/* 左右エリア */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 12,
          paddingTop: 12,
          overflow: 'hidden',
        }}
      >
        {/* 左側：独立スクロール */}
        <section
          style={{
            minWidth: 0,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {left}
        </section>

        {/* 右側：独立スクロール */}
        <section
          style={{
            minWidth: 0,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {right}
        </section>
      </div>
    </div>
  );
}
