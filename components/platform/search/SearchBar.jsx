'use client';

export default function SearchBar({
  children,
  onSearch,
  onClear,
}) {
  return (
    <div
      style={{
        marginBottom: 16,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 12,
          alignItems: 'end',
        }}
      >
        {children}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onSearch}>検索</button>
          <button onClick={onClear}>クリア</button>
        </div>
      </div>
    </div>
  );
}
