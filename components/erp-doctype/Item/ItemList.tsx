'use client';

import {
  useEffect,
  useState,
} from 'react';


interface Item {
  name: string;

  item_code: string;

  item_name: string;

  item_group?: string;

  stock_uom?: string;

  company?: string;

  default_warehouse?: string;

  maintain_stock?: boolean;

  has_batch_no?: boolean;

  has_expiry_date?: boolean;
}


interface Props {
  selectedId: string | null;

  onSelect: (id: string) => void;
}


export default function ItemList({
  selectedId,
  onSelect,
}: Props) {

  const [items, setItems] =
    useState<Item[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState('');



  useEffect(() => {

    async function loadItems() {

      setLoading(true);

      setError('');


      try {

        const res =
          await fetch(
            '/api/erpnext/item',
            {
              cache: 'no-store',
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


        setItems(
          data.data ?? data ?? []
        );


      } catch (e) {

        setError(
          e instanceof Error
            ? e.message
            : '商品取得失敗',
        );


      } finally {

        setLoading(false);

      }

    }


    void loadItems();


  }, []);



  if (loading) {

    return (
      <div
        style={{
          padding:16,
        }}
      >
        商品読込中...
      </div>
    );

  }



  if (error) {

    return (
      <div
        style={{
          padding:16,
          color:'#c62828',
        }}
      >
        {error}
      </div>
    );

  }



  return (

    <div
      style={{
        height:'100%',
        background:'#fff',
        overflowY:'auto',
      }}
    >


      <div
        style={{
          padding:16,
          fontWeight:'bold',
          borderBottom:
            '1px solid #ddd',
        }}
      >
        商品一覧
      </div>



      {
        items.map((item)=>(

          <div

            key={item.name}

            onClick={() =>
              onSelect(item.name)
            }

            style={{
              padding:12,
              cursor:'pointer',

              borderBottom:
                '1px solid #eee',

              backgroundColor:
                selectedId === item.name
                  ? '#e5e7eb'
                  : '#fff',
            }}

          >

            <div
              style={{
                fontWeight:'bold',
                fontSize:14,
              }}
            >
              {item.item_code}
            </div>


            <div
              style={{
                fontSize:13,
                color:'#444',
              }}
            >
              {item.item_name}
            </div>


            <div
              style={{
                marginTop:4,
                fontSize:12,
                color:'#777',
              }}
            >

              {item.item_group ?? '-'}

              {' / '}

              {item.stock_uom ?? '-'}

            </div>


            <div
              style={{
                marginTop:4,
                fontSize:12,
                color:'#777',
              }}
            >

              倉庫:
              {' '}
              {item.default_warehouse ?? '-'}

              {' / '}

              ロット:
              {' '}
              {
                item.has_batch_no
                  ? '有'
                  : '無'
              }

            </div>


          </div>

        ))

      }


    </div>

  );
}
