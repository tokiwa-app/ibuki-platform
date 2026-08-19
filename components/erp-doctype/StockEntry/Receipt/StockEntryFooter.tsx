'use client';

interface Props {

  loading: boolean;

  isSubmitted: boolean;

  onSave: () => void;

  onSubmit: () => void;

}

export default function StockEntryFooter({

  loading,

  isSubmitted,

  onSave,

  onSubmit,

}: Props) {

  return (

    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid #ddd',
      }}
    >

      <button
        onClick={onSave}
        disabled={loading}
        style={{
          padding: '8px 18px',
          borderRadius: 6,
          border: '1px solid #1976d2',
          background: '#1976d2',
          color: '#fff',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        保存
      </button>

      <button
        onClick={onSubmit}
        disabled={
          loading ||
          isSubmitted
        }
        style={{
          padding: '8px 18px',
          borderRadius: 6,
          border: '1px solid #2e7d32',
          background: isSubmitted
            ? '#bdbdbd'
            : '#2e7d32',
          color: '#fff',
          cursor:
            loading || isSubmitted
              ? 'default'
              : 'pointer',
        }}
      >
        ERP Submit
      </button>

    </div>

  );

}
