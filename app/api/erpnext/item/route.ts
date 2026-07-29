import { NextRequest, NextResponse } from 'next/server';

import {
  erpnextGet,
} from '../../../../lib/erpnextClient';


export async function GET(
  request: NextRequest,
) {

  try {

    const items =
      await erpnextGet(
        '/api/resource/Item',
        {
          fields: JSON.stringify([
            'name',
            'item_code',
            'item_name',
            'item_group',
            'stock_uom',
            'maintain_stock',
            'has_batch_no',
            'has_expiry_date',
          ]),

          limit_page_length: 1000,
        },
      );


    const itemList =
      items.data ?? [];



    const result = await Promise.all(

      itemList.map(
        async (item: any) => {


          let company = '';
          let defaultWarehouse = '';



          try {

            const detail =
              await erpnextGet(
                `/api/resource/Item/${encodeURIComponent(
                  item.name,
                )}`,
              );


            const defaults =
              detail.data?.item_defaults ?? [];



            if (defaults.length > 0) {

              company =
                defaults[0].company ?? '';

              defaultWarehouse =
                defaults[0].default_warehouse ?? '';

            }


          } catch {

            // Item Default取得失敗は無視

          }



          return {

            name:
              item.name,

            item_code:
              item.item_code,

            item_name:
              item.item_name,

            item_group:
              item.item_group,

            stock_uom:
              item.stock_uom,


            company,

            default_warehouse:
              defaultWarehouse,


            maintain_stock:
              item.maintain_stock,

            has_batch_no:
              item.has_batch_no,

            has_expiry_date:
              item.has_expiry_date,

          };

        },
      ),
    );



    return NextResponse.json(
      result,
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
        status:500,
      },
    );

  }

}
