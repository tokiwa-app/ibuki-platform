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
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';



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


  maintain_stock?: number;

  has_batch_no?: number;

  has_expiry_date?: number;


  company?: string;

  default_warehouse?: string;

}



interface RowData {

  category:string;

  label:string;

  value:string;

}



export default function ItemDetail({

  itemId,

}: Props) {


  const [item,setItem] =
    useState<Item | null>(null);


  const [loading,setLoading] =
    useState(false);


  const [error,setError] =
    useState('');




  useEffect(()=>{


    async function loadItem(){


      if(!itemId){

        setItem(null);

        return;

      }



      setLoading(true);

      setError('');



      try{


        const res =
          await fetch(
            `/api/erpnext/item/${encodeURIComponent(itemId)}`,
            {
              cache:'no-store',
            },
          );



        const data =
          await res.json();



        if(!res.ok){

          throw new Error(
            data?.error ??
            '商品取得失敗',
          );

        }



        setItem(data);



      }catch(e){


        setError(
          e instanceof Error
            ? e.message
            : '商品取得失敗',
        );


      }finally{


        setLoading(false);


      }


    }



    void loadItem();



  },[itemId]);






  const rowData:RowData[] = [


    {
      category:'基本情報',
      label:'商品コード',
      value:item?.item_code ?? '-',
    },

    {
      category:'基本情報',
      label:'商品名',
      value:item?.item_name ?? '-',
    },


    {
      category:'基本情報',
      label:'商品分類',
      value:item?.item_group ?? '-',
    },


    {
      category:'基本情報',
      label:'単位',
      value:item?.stock_uom ?? '-',
    },


    {
      category:'基本情報',
      label:'荷主',
      value:item?.custom_customer ?? '-',
    },


    {
      category:'在庫設定',
      label:'在庫管理',
      value:item?.maintain_stock ? '有':'無',
    },


    {
      category:'在庫設定',
      label:'ロット管理',
      value:item?.has_batch_no ? '有':'無',
    },


    {
      category:'在庫設定',
      label:'期限管理',
      value:item?.has_expiry_date ? '有':'無',
    },


    {
      category:'Item Default',
      label:'会社',
      value:item?.company ?? '-',
    },


    {
      category:'Item Default',
      label:'デフォルト倉庫',
      value:item?.default_warehouse ?? '-',
    },


    {
      category:'システム',
      label:'Item ID',
      value:item?.name ?? '-',
    },


  ];





  const columnDefs:ColDef<RowData>[]=[


    {
      field:'category',
      headerName:'区分',
      width:120,
    },


    {
      field:'label',
      headerName:'項目',
      width:180,
    },


    {
      field:'value',
      headerName:'値',
      flex:1,
    },


  ];






  if(!itemId){

    return (

      <div style={boxStyle}>
        商品を選択してください。
      </div>

    );

  }





  if(loading){

    return (

      <div style={boxStyle}>
        Loading...
      </div>

    );

  }





  if(error){

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

    <div
      className="ag-theme-quartz"

      style={{
        height:'100%',
        width:'100%',
      }}
    >


      <AgGridReact<RowData>

        rowData={rowData}

        columnDefs={columnDefs}


        defaultColDef={{
          resizable:true,
        }}


        domLayout="normal"


      />


    </div>

  );

}





const boxStyle={

  padding:16,

  background:'#fff',

  height:'100%',

};
