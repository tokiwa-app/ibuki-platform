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
    const name = params.name;

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
      name: data?.name,
      stock_entry_type:
        data?.stock_entry_type,
      posting_date:
        data?.posting_date,
      status:
        data?.status,

      items:
        data?.items?.map(
          (item: any) => ({
            target_warehouse:
              item.t_warehouse,

            item_code:
              item.item_code,

            qty:
              item.qty,
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
