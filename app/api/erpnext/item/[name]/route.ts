import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  erpnextRequest,
} from '../../../../../lib/erpnextClient';



export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: {
      name: string;
    };
  },
) {


  try {


    const itemName =
      decodeURIComponent(
        params.name,
      );



    const item =
      await erpnextRequest(
        `/api/resource/Item/${encodeURIComponent(itemName)}`,
      );



    const data =
      item.data;



    const defaults =
      data.item_defaults ?? [];



    const defaultData =
      defaults.length > 0
        ? defaults[0]
        : {};



    return NextResponse.json({

      name:
        data.name ?? '',


      item_code:
        data.item_code ?? '',


      item_name:
        data.item_name ?? '',


      item_group:
        data.item_group ?? '',


      stock_uom:
        data.stock_uom ?? '',



      custom_customer:
        data.custom_customer ?? '',



      maintain_stock:
        data.is_stock_item ?? 0,


      has_batch_no:
        data.has_batch_no ?? 0,


      has_expiry_date:
        data.has_expiry_date ?? 0,



      company:
        defaultData.company ?? '',


      default_warehouse:
        defaultData.default_warehouse ?? '',


    });



  } catch(error) {


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Item取得失敗',
      },
      {
        status:500,
      },
    );


  }

}
