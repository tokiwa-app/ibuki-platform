'use client';

interface Props {
  itemId: string | null;
}


export default function ItemDetail({
  itemId,
}: Props) {


  if (!itemId) {

    return (
      <div
        style={{
          padding:16,
          color:'#666',
        }}
      >
        商品を選択してください。
      </div>
    );

  }


  return (
    <div
      style={{
        padding:16,
        background:'#fff',
        height:'100%',
      }}
    >

      <h2>
        商品詳細
      </h2>


      <div>
        Item ID : {itemId}
      </div>


    </div>
  );
}
