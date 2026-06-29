'use client';

export default function NumberRangeSearch({
  label,
  min,
  max,
  onChangeMin,
  onChangeMax,
  placeholderMin = '最小',
  placeholderMax = '最大',
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>
        {label}
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number"
          value={min}
          placeholder={placeholderMin}
          onChange={(e) => onChangeMin(e.target.value)}
          style={inputStyle}
        />

        <span>～</span>

        <input
          type="number"
          value={max}
          placeholder={placeholderMax}
          onChange={(e) => onChangeMax(e.target.value)}
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
