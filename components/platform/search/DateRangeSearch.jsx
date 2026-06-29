'use client';

export default function DateRangeSearch({
  label,
  from,
  to,
  onChangeFrom,
  onChangeTo,
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="date"
          value={from}
          onChange={(e) => onChangeFrom(e.target.value)}
          style={inputStyle}
        />

        <span>～</span>

        <input
          type="date"
          value={to}
          onChange={(e) => onChangeTo(e.target.value)}
          style={inputStyle}
        />
      </div>
    </label>
  );
}

const inputStyle = {
  flex: 1,
  padding: '8px 10px',
  border: '1px solid #ccc',
  borderRadius: 6,
  outline: 'none',
};
