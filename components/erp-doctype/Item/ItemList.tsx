'use client';

import {
  useEffect,
  useState,
} from 'react';


interface Item {
  name: string;
  item_code?: string;
  item_name?: string;
  item_group?: string;
  stock_uom?: string;
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
    useState(false);


  useEffect(() => {

    async function loadItems() {

      setLoading(true);


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


        setItems(
          data.data ?? data ?? []
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



  return (
    <div
      style={{
        height:'100%',
        overflowY:'auto',
        background:'#fff',
      }}
    >

      <div
        style={{
          padding:16,
          fontWeight:'bold',
          borderBottom:'1px solid #ddd',
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
              }}
            >
              {item.item_code ?? item.name}
            </div>


            <div
              style={{
                fontSize:13,
                color:'#666',
              }}
            >
              {item.item_name ?? '-'}
            </div>


            <div
              style={{
                fontSize:12,
                color:'#999',
              }}
            >
              {item.item_group ?? ''}
            </div>


          </div>

        ))

      }

    </div>
  );
}
