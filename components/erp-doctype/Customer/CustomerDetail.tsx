'use client';

import {
  useEffect,
  useState,
} from 'react';

import CustomerEditForm from './CustomerEditForm';
import CustomerWarehouses from './CustomerWarehouses';
import CustomerItems from './CustomerItems';


interface Props {
  customerId: string | null;
}


export default function CustomerDetail({
  customerId,
}: Props) {


  const [form, setForm] =
    useState<any>({});


  const [loading, setLoading] =
    useState(false);



  async function loadCustomer() {

    if (!customerId) {
      return;
    }


    setLoading(true);


    const res =
      await fetch(
        `/api/erpnext/customer/${customerId}`,
      );


    const data =
      await res.json();



    setForm({

      name:
        data?.name ?? '',

      customer_name:
        data?.customer_name ?? '',

      customer_type:
        data?.customer_type ?? '',

      customer_group:
        data?.customer_group ?? '',

      territory:
        data?.territory ?? '',

      tax_id:
        data?.tax_id ?? '',

      tax_category:
        data?.tax_category ?? '',

      billing_currency:
        data?.billing_currency ?? '',

      default_price_list:
        data?.default_price_list ?? '',

      payment_terms:
        data?.payment_terms ?? '',

      website:
        data?.website ?? '',

      disabled:
        data?.disabled ?? 0,

      is_frozen:
        data?.is_frozen ?? 0,

    });


    setLoading(false);

  }



  useEffect(() => {

    loadCustomer();

  }, [customerId]);



  if (!customerId) {

    return (
      <div
        style={{
          padding:16,
        }}
      >
        Customerを選択してください。
      </div>
    );

  }



  if (loading) {

    return (
      <div
        style={{
          padding:16,
        }}
      >
        Loading...
      </div>
    );

  }



  return (

    <div
      style={{
        padding:16,
        overflowY:'auto',
        height:'100%',
      }}
    >

      <h2>
        Customer
      </h2>


      <CustomerEditForm
        code={customerId}
        form={form}
        setForm={setForm}
      />


      <CustomerWarehouses
        customerCode={
          form.name || customerId
        }
      />


      <CustomerItems
        customerCode={
          form.name || customerId
        }
      />


    </div>

  );
}
