import { erpnextRequest } from '../../../../../lib/erpnextClient';

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


    const fields = [
      'name',
      'project',
      'stock_entry_type',
      'posting_date',
      'items',
    ];


    const path =
      `/api/resource/Stock Entry/${encodeURIComponent(name)}`;


    const result =
      await erpnextRequest(path);


    return Response.json(
      result?.data ?? result,
    );


  } catch (error: unknown) {

    console.error(
      'Stock Entry detail error:',
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
