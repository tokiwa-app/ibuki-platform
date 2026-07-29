import { NextResponse } from 'next/server';

import {
  erpnextRequest,
} from '../../../../lib/erpnextClient';



export async function GET() {

  try {

    const items =
      await erpnextRequest(
        `/api/resource/Item?fields=${encodeURIComponent(
          JSON.stringify([
            'name',
            'item_code',
            'item_name',
            'item_group',
            'stock_uom',
            'custom_customer',
          ])
        )}&limit_page_length=1000`
      );


    return NextResponse.json(
      items.data ?? [],
    );


  } catch (error) {


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Item取得失敗',
      },
      {
        status: 500,
      },
    );

  }

}
