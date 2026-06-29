'use client';

export default function SelectSearch({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'すべて',
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #ccc',
          borderRadius: 6,
          outline: 'none',
          background: '#fff',
        }}
      >
        <option value="">{placeholder}</option>

        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value;
          const label = typeof opt === 'string' ? opt : opt.label;

          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
