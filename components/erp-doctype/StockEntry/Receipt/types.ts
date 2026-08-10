export interface StockEntry {

  name: string;

  docstatus: number;

  posting_date: string;

  stock_entry_type: string;

  items: StockEntryItem[];

}

export interface StockEntryItem {

  name?: string;

  idx?: number;

  batch_no: string;

  item_code: string;

  item_name: string;

  qty: number;

  uom: string;

  target_warehouse: string;

}
