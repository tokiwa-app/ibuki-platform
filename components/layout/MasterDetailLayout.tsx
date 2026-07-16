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
        height: '100%',
      }}
    >
      <div
        style={{
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
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
          }}
        >
          {left}
        </div>

        <div
          style={{
            flex: 1,
          }}
        >
          {right}
        </div>
      </div>
    </div>
  );
}
