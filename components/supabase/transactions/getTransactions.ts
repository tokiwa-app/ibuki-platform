import { supabase } from '../../../lib/supabaseClient';

export interface TransactionDetail {
  id: number;
  transaction_id: number | null;

  detail_type: string | null;
  product_attribute: string | null;

  product_id: number | null;
  item_name: string | null;

  quantity: number | null;
  unit_price: number | null;
  amount: number | null;
  invoice_amount: number | null;

  warehouse_id: number | null;
  storage_location: string | null;
  lot_no: string | null;
}

export interface Transaction {
  id: number;

  date_created: string | null;
  delivery_date: string | null;

  category: number;
  delivery_source: string | null;
  staff: string | null;

  billing_id: number | null;
  payment_destination_id: number | null;

  project_name: string | null;
  item_name: string | null;
  name: string | null;

  d_month: string;
  p_month: string;

  status: string | null;
  notes: string | null;

  // 旧 t_transactions 側
  d_quantity: number | null;
  d_unit_price: number | null;
  d_premium: number | null;
  d_weight: number | null;

  p_quantity: number | null;
  p_unit_price: number | null;
  p_premium: number | null;
  p_weight: number | null;

  t_transaction_details: TransactionDetail[];
}

export async function getTransactions(
  dateFrom?: string,
  dateTo?: string
): Promise<Transaction[]> {
  let query = supabase
    .from('t_transactions')
    .select(`
      id,
      date_created,
      delivery_date,
      category,
      delivery_source,
      staff,
      billing_id,
      payment_destination_id,
      project_name,
      item_name,
      name,
      d_month,
      p_month,
      status,
      notes,

      d_quantity,
      d_unit_price,
      d_premium,
      d_weight,

      p_quantity,
      p_unit_price,
      p_premium,
      p_weight,

      t_transaction_details (
        id,
        transaction_id,
        detail_type,
        product_attribute,
        product_id,
        item_name,
        quantity,
        unit_price,
        amount,
        invoice_amount,
        warehouse_id,
        storage_location,
        lot_no
      )
    `)
    .order('delivery_date', {
      ascending: false,
      nullsFirst: false,
    })
    .order('id', {
      ascending: false,
    })
    .limit(500);

  if (dateFrom) {
    query = query.gte(
      'delivery_date',
      dateFrom
    );
  }

  if (dateTo) {
    query = query.lte(
      'delivery_date',
      dateTo
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      'getTransactions error:',
      error
    );

    throw new Error(error.message);
  }

  return (data ?? []) as Transaction[];
}
