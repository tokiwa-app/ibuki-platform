'use client';

import {
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import MasterDetailLayout from '../../../../../components/layout/MasterDetailLayout';

import CustomerItemList from '../../../../../components/erp-doctype/CustomerItem/CustomerItemList';

import CustomerItemDetail from '../../../../../components/erp-doctype/CustomerItem/CustomerItemDetail';



export default function CustomerItemPage() {

  const params = useParams();


  const customerCode =
    params?.code as string;



  const [itemId, setItemId] =
    useState<string | null>(null);



  return (

    <main
      style={{
        position:'fixed',
        inset:0,
        backgroundColor:'#f3f4f6',
        overflow:'hidden',
        boxSizing:'border-box',
      }}
    >

      <MasterDetailLayout

        title="荷主商品マスター"

        titleBackground="#2563eb"

        titleColor="#fff"



        left={

          <CustomerItemList

            customerCode={customerCode}

            selectedId={itemId}

            onSelect={setItemId}

          />

        }



        right={

          <CustomerItemDetail

            itemId={itemId}

          />

        }


      />


    </main>

  );

}
