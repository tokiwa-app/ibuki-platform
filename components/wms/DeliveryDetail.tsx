'use client';

export default function DeliveryDetail({ name }) {
  if (!name) {
    return (
      <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
        出庫を選択してください。
      </section>
    );
  }

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: 12, padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>出庫詳細</h2>
      <p>{name}</p>
    </section>
  );
}
