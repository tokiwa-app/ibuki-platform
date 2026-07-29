import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  erpnextRequest,
} from '../../../../../lib/erpnextClient';



export async function PUT(
  request:NextRequest,
) {

  try {

    const body =
      await request.json();


    const result =
      await erpnextRequest(
        `/api/resource/Item/${encodeURIComponent(body.name)}`,
        {
          method:'PUT',

          body:JSON.stringify({
            item_code:body.item_code,
            item_name:body.item_name,
            item_group:body.item_group,
            stock_uom:body.stock_uom,
            custom_customer:body.custom_customer,
          }),
        },
      );


    return NextResponse.json(
      result.data,
    );


  } catch(error){

    return NextResponse.json(
      {
        error:
          error instanceof Error
          ? error.message
          : '更新失敗',
      },
      {
        status:500,
      },
    );

  }

}
