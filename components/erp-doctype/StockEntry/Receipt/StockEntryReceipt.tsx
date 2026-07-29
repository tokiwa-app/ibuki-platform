'use client';

import {
  useEffect,
  useState,
} from 'react';


interface StockEntryReceiptProps {
  stockEntryName: string | null;
}


interface StockEntryItem {
  targetWarehouse: string;
  itemCode: string;
  qty: number;
}


interface StockEntryResponse {
  name?: string;
  stock_entry_type?: string;
  posting_date?: string;
  items?: {
    target_warehouse?: string;
    item_code?: string;
    qty?: number;
  }[];
}



const emptyRow = (): StockEntryItem => ({
  targetWarehouse: '',
  itemCode: '',
  qty: 0,
});



export default function StockEntryReceipt({
  stockEntryName,
}: StockEntryReceiptProps) {


  const [items, setItems] =
    useState<StockEntryItem[]>([
      emptyRow(),
    ]);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState('');



  useEffect(() => {

    if (!stockEntryName) {
      setItems([
        emptyRow(),
      ]);
      return;
    }


    async function fetchStockEntry() {

      setLoading(true);
      setError('');


      try {

        const response =
          await fetch(
            `/api/erpnext/stock-entry/receipt/${encodeURIComponent(
              stockEntryName,
            )}`,
            {
              method: 'GET',
              cache: 'no-store',
            },
          );


        const result =
          await response.json() as StockEntryResponse;



        if (!response.ok) {
          throw new Error(
            'Stock Entry取得失敗',
          );
        }



        const rows =
          result.items?.map(
            (item) => ({
              targetWarehouse:
                item.target_warehouse ?? '',

              itemCode:
                item.item_code ?? '',

              qty:
                item.qty ?? 0,
            }),
          ) ?? [];



        setItems([
          ...rows,
          emptyRow(),
        ]);



      } catch (e) {

        setError(
          e instanceof Error
            ? e.message
            : 'Stock Entry取得失敗',
        );


        setItems([
          emptyRow(),
        ]);


      } finally {

        setLoading(false);

      }

    }


    void fetchStockEntry();


  }, [stockEntryName]);




  function updateRow(
    index: number,
    key: keyof StockEntryItem,
    value: string | number,
  ) {


    const next =
      [...items];


    next[index] = {
      ...next[index],
      [key]: value,
    };



    const last =
      next[next.length - 1];



    // 最終行に入力されたら空行追加
    if (
      last.targetWarehouse ||
      last.itemCode ||
      last.qty > 0
    ) {

      next.push(
        emptyRow(),
      );

    }



    setItems(next);

  }




  function deleteRow(
    index: number,
  ) {

    const next =
      items.filter(
        (_, i) =>
          i !== index,
      );



    if (
      next.length === 0 ||
      (
        next.length > 0 &&
        (
          next[next.length - 1].targetWarehouse ||
          next[next.length - 1].itemCode ||
          next[next.length - 1].qty > 0
        )
      )
    ) {

      next.push(
        emptyRow(),
      );

    }



    setItems(next);

  }





  if (loading) {
    return (
      <div
        style={{
          padding: 12,
        }}
      >
        入庫情報読込中...
      </div>
    );
  }



  if (error) {
    return (
      <div
        style={{
          padding: 12,
          color: '#c62828',
        }}
      >
        {error}
      </div>
    );
  }




  return (
    <div
      style={{
        padding: 12,
      }}
    >

      <h3
        style={{
          margin: '0 0 12px',
          fontSize: 15,
        }}
      >
        在庫入庫
      </h3>



      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
        }}
      >

        <thead>

          <tr>

            <th style={th}>
              Target Warehouse
            </th>


            <th style={th}>
              Item Code
            </th>


            <th style={th}>
              Qty
            </th>


            <th style={th}>
              操作
            </th>

          </tr>

        </thead>



        <tbody>

          {items.map(
            (item, index) => (

              <tr
                key={index}
              >

                <td style={td}>

                  <input
                    value={
                      item.targetWarehouse
                    }
                    onChange={(e) =>
                      updateRow(
                        index,
                        'targetWarehouse',
                        e.target.value,
                      )
                    }
                    style={input}
                  />

                </td>



                <td style={td}>

                  <input
                    value={
                      item.itemCode
                    }
                    onChange={(e) =>
                      updateRow(
                        index,
                        'itemCode',
                        e.target.value,
                      )
                    }
                    style={input}
                  />

                </td>



                <td style={td}>

                  <input
                    type="number"
                    value={
                      item.qty
                    }
                    onChange={(e) =>
                      updateRow(
                        index,
                        'qty',
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    style={{
                      ...input,
                      width: 80,
                    }}
                  />

                </td>



                <td style={td}>

                  {
                    (
                      item.targetWarehouse ||
                      item.itemCode ||
                      item.qty > 0
                    ) && (
                      <button
                        onClick={() =>
                          deleteRow(index)
                        }
                      >
                        ×
                      </button>
                    )
                  }

                </td>


              </tr>

            ),
          )}

        </tbody>

      </table>


    </div>
  );
}




const th = {
  borderBottom:
    '1px solid #ddd',
  padding: 6,
  textAlign: 'left' as const,
};


const td = {
  borderBottom:
    '1px solid #eee',
  padding: 4,
};


const input = {
  width: '100%',
  padding: '4px 6px',
  boxSizing: 'border-box' as const,
};
