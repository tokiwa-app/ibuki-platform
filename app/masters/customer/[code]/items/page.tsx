'use client';

import {
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import MasterDetailLayout from '../../../../../components/layout/MasterDetailLayout';

import ItemList from '../../../../../components/erp-doctype/Item/ItemList';

import ItemDetail from '../../../../../components/erp-doctype/Item/ItemDetail';



export default function CustomerItemPage() {

  const params = useParams();


  const customerCode =
    params?.code as string;



  const [itemId, setItemId] =
    useState<string | null>(null);



  return (

    <main
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >

      <MasterDetailLayout

        title={`荷主商品マスター (${customerCode})`}

        titleBackground="#2563eb"

        titleColor="#fff"



        left={
          <ItemList

            selectedId={itemId}

            onSelect={setItemId}

          />
        }



        right={
          <ItemDetail

            itemId={itemId}

          />
        }


      />

    </main>

  );
}
