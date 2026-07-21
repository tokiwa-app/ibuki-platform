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
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          flexShrink: 0,
          padding: '12px 16px',
          backgroundColor: titleBackground,
          color: titleColor,
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

      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 12,
          paddingTop: 12,
          overflow: 'hidden',
        }}
      >
        <section
          style={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {left}
        </section>

        <section
          style={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
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
