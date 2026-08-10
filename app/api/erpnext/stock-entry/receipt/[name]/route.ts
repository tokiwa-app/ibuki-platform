import { erpnextRequest } from '../../../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    name: string;
  };
}

export async function GET(
  _request: Request,
  { params }: RouteParams,
) {
  try {

    const name =
      params.name;

    if (!name) {
      return Response.json(
        {
          error: 'Stock Entry名がありません',
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await erpnextRequest(
        `/api/resource/Stock Entry/${encodeURIComponent(
          name,
        )}`,
        {
          method: 'GET',
        },
      );

    const data =
      result?.data;

    return Response.json({

      name:
        data?.name,

      docstatus:
        data?.docstatus,

      status:
        data?.status,

      posting_date:
        data?.posting_date,

      stock_entry_type:
        data?.stock_entry_type,

      purpose:
        data?.purpose,

      items:
        data?.items?.map(
          (item: any) => ({

            name:
              item.name,

            idx:
              item.idx,

            batch_no:
              item.batch_no,

            serial_no:
              item.serial_no,

            item_code:
              item.item_code,

            item_name:
              item.item_name,

            description:
              item.description,

            qty:
              item.qty,

            transfer_qty:
              item.transfer_qty,

            uom:
              item.uom,

            stock_uom:
              item.stock_uom,

            conversion_factor:
              item.conversion_factor,

            s_warehouse:
              item.s_warehouse,

            t_warehouse:
              item.t_warehouse,

            basic_rate:
              item.basic_rate,

            valuation_rate:
              item.valuation_rate,

          }),
        ) ?? [],

    });

  } catch (error: unknown) {

    console.error(
      'Stock Entry Receipt取得エラー',
      error,
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Stock Entry取得失敗',
      },
      {
        status: 500,
      },
    );

  }
}
