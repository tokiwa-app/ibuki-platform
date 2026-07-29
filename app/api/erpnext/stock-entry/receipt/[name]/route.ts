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
          error: 'Stock Entry名が指定されていません',
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


    return Response.json(
      result?.data ?? result,
    );


  } catch (error: unknown) {

    console.error(
      'Stock Entry Receipt取得エラー:',
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
