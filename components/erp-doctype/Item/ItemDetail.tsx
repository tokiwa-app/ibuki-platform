'use client';

import {
  useEffect,
  useState,
} from 'react';



interface Props {

  itemId: string | null;

}



interface Item {

  name?: string;

  item_code?: string;

  item_name?: string;

  item_group?: string;

  stock_uom?: string;

  custom_customer?: string;

}



export default function ItemDetail({

  itemId,

}: Props) {


  const [item, setItem] =
    useState<Item | null>(null);



  const [loading, setLoading] =
    useState(false);



  const [error, setError] =
    useState('');




  useEffect(() => {


    async function loadItem() {


      if (!itemId) {

        setItem(null);

        return;

      }



      setLoading(true);

      setError('');



      try {


        const res =
          await fetch(
            `/api/erpnext/item/${encodeURIComponent(itemId)}`,
            {
              cache:'no-store',
            },
          );



        const data =
          await res.json();



        if (!res.ok) {

          throw new Error(
            data?.error ??
            '商品取得失敗',
          );

        }



        setItem(data);



      } catch(e) {


        setError(
          e instanceof Error
            ? e.message
            : '商品取得失敗',
        );


      } finally {


        setLoading(false);


      }


    }



    void loadItem();



  }, [itemId]);





  if (!itemId) {

    return (

      <div style={boxStyle}>

        商品を選択してください。

      </div>

    );

  }





  if (loading) {

    return (

      <div style={boxStyle}>

        Loading...

      </div>

    );

  }





  if (error) {

    return (

      <div
        style={{
          ...boxStyle,
          color:'#c62828',
        }}
      >

        {error}

      </div>

    );

  }





  return (

    <div style={boxStyle}>


      <h2 style={titleStyle}>
        商品詳細
      </h2>



      <div style={rowStyle}>

        <label>
          商品コード
        </label>

        <span>
          {item?.item_code ?? '-'}
        </span>

      </div>



      <div style={rowStyle}>

        <label>
          商品名
        </label>

        <span>
          {item?.item_name ?? '-'}
        </span>

      </div>



      <div style={rowStyle}>

        <label>
          商品分類
        </label>

        <span>
          {item?.item_group ?? '-'}
        </span>

      </div>



      <div style={rowStyle}>

        <label>
          単位
        </label>

        <span>
          {item?.stock_uom ?? '-'}
        </span>

      </div>



      <div style={rowStyle}>

        <label>
          荷主
        </label>

        <span>
          {item?.custom_customer ?? '-'}
        </span>

      </div>



      <div style={rowStyle}>

        <label>
          Item ID
        </label>

        <span>
          {item?.name ?? '-'}
        </span>

      </div>



    </div>

  );

}



const boxStyle = {

  padding:16,

  background:'#fff',

  height:'100%',

  overflowY:'auto' as const,

};



const titleStyle = {

  fontSize:20,

  marginBottom:24,

};



const rowStyle = {

  display:'grid',

  gridTemplateColumns:'140px 1fr',

  padding:'10px 0',

  borderBottom:'1px solid #eee',

};
