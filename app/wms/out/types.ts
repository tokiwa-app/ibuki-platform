export interface Transaction {
  id: number;

  date_created: string | null;
  delivery_source: string | null;

  staff: string | null;
  client_staff: string | null;

  billing_id: number | null;
  delivery_destination_id: number | null;
  payment_destination_id: number | null;

  delivery_date: string | null;
  delivery_time: string | null;

  slip_no: string | null;
  order_no: string | null;

  d_quantity: number | null;
  p_quantity: number | null;

  d_unit_price: number | null;
  p_unit_price: number | null;

  d_premium: number | null;
  p_premium: number | null;

  d_weight: number | null;
  p_weight: number | null;

  d_month: string;
  p_month: string;

  project_name: string | null;
  item_name: string | null;
  name: string | null;

  unit: string | null;

  status: string | null;
  category: number;

  prefecture: string | null;
}

export interface GridRow {
  id: number;

  category: number;

  date_created: string | null;
  delivery_date: string | null;
  delivery_time: string | null;

  delivery_source: string | null;

  staff: string | null;
  client_staff: string | null;

  billing_id: number | null;
  delivery_destination_id: number | null;
  payment_destination_id: number | null;

  project_name: string | null;
  item_name: string | null;
  name: string | null;

  unit: string | null;

  d_month: string;
  p_month: string;

  slip_no: string | null;
  order_no: string | null;

  prefecture: string | null;
  status: string | null;

  pQuantity: number;
  pWeight: number;
  pUnitPrice: number;
  pPremium: number;
  pAmount: number;

  dQuantity: number;
  dWeight: number;
  dUnitPrice: number;
  dPremium: number;
  dAmount: number;

  profit: number;
}
