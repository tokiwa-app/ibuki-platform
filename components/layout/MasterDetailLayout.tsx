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
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: titleBackground,
          color: titleColor,
          padding: '12px 16px',
          borderRadius: 8,
          fontSize: 18,
          fontWeight: 'bold',
          flexShrink: 0,
          marginBottom: 12,
        }}
      >
        {title}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {left}
        </div>

        <div
          style={{
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
