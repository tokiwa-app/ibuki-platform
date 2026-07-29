'use client';

import {
  useEffect,
  useState,
} from 'react';

interface Customer {
  name: string;
  customer_name?: string;
  customer_group?: string;
  territory?: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}


export default function CustomerList({
  selectedId,
  onSelect,
}: Props) {

  const [customers, setCustomers] =
    useState<Customer[]>([]);


  useEffect(() => {

    async function fetchCustomers() {

      const res =
        await fetch(
          '/api/erpnext/customer',
        );


      const data =
        await res.json();


      setCustomers(
        data.data ?? data,
      );

    }


    void fetchCustomers();

  }, []);


  return (
    <div
      style={{
        height:'100%',
        overflowY:'auto',
      }}
    >

      <h3
        style={{
          padding:16,
          margin:0,
        }}
      >
        Customer
      </h3>


      {customers.map((customer)=>(

        <div
          key={customer.name}
          onClick={() =>
            onSelect(customer.name)
          }
          style={{
            padding:12,
            cursor:'pointer',
            backgroundColor:
              selectedId === customer.name
                ? '#e5e7eb'
                : '#fff',
            borderBottom:
              '1px solid #eee',
          }}
        >

          <div>
            {customer.name}
          </div>

          <div
            style={{
              fontSize:12,
              color:'#666',
            }}
          >
            {customer.customer_name}
          </div>

        </div>

      ))}

    </div>
  );
}
