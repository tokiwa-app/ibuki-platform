'use client';

export default function TextSearch({
  label,
  value,
  onChange,
  placeholder = '',
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {label}
      </span>

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #ccc',
          borderRadius: 6,
          outline: 'none',
        }}
      />
    </label>
  );
}
