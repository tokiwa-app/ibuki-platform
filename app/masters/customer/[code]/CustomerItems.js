'use client';

import { useRouter } from 'next/navigation';

function getCustomerCode(customerCode) {
  return String(customerCode || '').padStart(4, '0');
}

export default function CustomerItems({ customerCode }) {
  const router = useRouter();
  const code = getCustomerCode(customerCode);

  return (
    <section style={cardStyle}>
      <div>
        <h2 style={titleStyle}>関連アイテム</h2>
        <p style={textStyle}>
          この顧客に紐づく商品マスターを管理します。
        </p>
      </div>

      <button
        onClick={() => router.push(`/masters/customer/${customerCode}/items`)}
        style={buttonStyle}
      >
        アイテムマスターを開く
      </button>
    </section>
  );
}

const cardStyle = {
  maxWidth: 980,
  marginTop: 40,
  padding: 24,
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  background: '#fff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
};

const titleStyle = {
  fontSize: 20,
  margin: 0,
};

const textStyle = {
  color: '#6b7280',
  margin: '4px 0 0',
  fontSize: 14,
};

const buttonStyle = {
  padding: '10px 20px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 600,
};
