'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  AgGridReact,
} from 'ag-grid-react';

import {
  ColDef,
  GridReadyEvent,
} from 'ag-grid-community';


import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';



interface Item {

  name: string;

  item_code?: string;

  item_name?: string;

  item_group?: string;

  stock_uom?: string;

  custom_customer?: string;

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




  const columnDefs: ColDef<Item>[] = [

    {
      field: 'item_code',
      headerName: '商品コード',
      width: 150,
    },


    {
      field: 'item_name',
      headerName: '商品名',
      flex: 1,
    },


    {
      field: 'item_group',
      headerName: '商品分類',
      width: 160,
    },


    {
      field: 'stock_uom',
      headerName: '単位',
      width: 100,
    },


    {
      field: 'custom_customer',
      headerName: '荷主',
      width: 120,
    },

  ];





  useEffect(() => {


    async function loadItems() {


      setLoading(true);

      setError('');



      try {


        const res =
          await fetch(
            '/api/erpnext/item',
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



        setItems(
          Array.isArray(data)
            ? data
            : data.data ?? []
        );



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



    void loadItems();



  }, []);







  if (loading) {

    return (
      <div style={{padding:16}}>
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
      className="ag-theme-quartz"

      style={{
        height:'100%',
        width:'100%',
      }}
    >

      <AgGridReact<Item>

        rowData={items}

        columnDefs={columnDefs}


        defaultColDef={{
          sortable:true,
          filter:true,
          resizable:true,
        }}


        rowSelection="single"



        onRowClicked={(event)=>{

          if(event.data){

            onSelect(
              event.data.name,
            );

          }

        }}



        getRowClass={(params)=>{

          return params.data?.name === selectedId
            ? 'selected-row'
            : '';

        }}


      />


    </div>

  );

}
