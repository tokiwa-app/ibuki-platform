'use client';

import { useState } from 'react';

import MasterDetailLayout from '../../../components/layout/MasterDetailLayout';
import ItemList from '../../../components/erp-doctype/Item/ItemList';
import ItemDetail from '../../../components/erp-doctype/Item/ItemDetail';


export default function ItemPage() {

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

        title="商品管理"

        titleBackground="#7c3aed"

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
