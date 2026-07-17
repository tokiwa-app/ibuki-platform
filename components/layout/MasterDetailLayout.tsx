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
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          background: titleBackground,
          color: titleColor,
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 12,
          fontWeight: 'bold',
          fontSize: 18,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {left}
        </div>

        <div
          style={{
            flex: 1,
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
