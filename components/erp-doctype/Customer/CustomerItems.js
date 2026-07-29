'use client';

import { useRouter } from 'next/navigation';


interface Props {
  customerCode: string | null;
}


export default function CustomerItems({
  customerCode,
}: Props) {

  const router = useRouter();


  if (!customerCode) {
    return null;
  }


  return (
    <section style={cardStyle}>

      <div>

        <h2 style={titleStyle}>
          荷主商品マスター
        </h2>

        <p style={textStyle}>
          この荷主で管理する商品情報を登録・管理します。
        </p>

      </div>


      <button
        onClick={() =>
          router.push(
            `/masters/customer/${customerCode}/items`,
          )
        }
        style={buttonStyle}
      >
        商品マスターを開く
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
