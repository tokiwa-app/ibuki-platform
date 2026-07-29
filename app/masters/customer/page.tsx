'use client';

import {
  useState,
} from 'react';

import MasterDetailLayout from '../../../components/layout/MasterDetailLayout';
import CustomerList from '../../../components/erp-doctype/Customer/CustomerList';
import CustomerDetail from '../../../components/erp-doctype/Customer/CustomerDetail';


export default function CustomerPage() {

  const [customerId, setCustomerId] =
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

        title="カスタマー管理"

        titleBackground="#2563eb"

        titleColor="#fff"


        left={
          <CustomerList
            selectedId={customerId}
            onSelect={setCustomerId}
          />
        }


        right={
          <CustomerDetail
            customerId={customerId}
          />
        }

      />

    </main>
  );
}
