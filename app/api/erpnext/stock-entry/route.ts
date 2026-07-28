import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const projectId =
      searchParams.get('projectId');


    let path =
      '/api/resource/Stock Entry?';


    const fields = [
      'name',
      'project',
      'stock_entry_type',
      'posting_date',
    ];


    path +=
      `fields=${encodeURIComponent(
        JSON.stringify(fields)
      )}`;


    path +=
      '&limit_page_length=100';


    if (projectId) {

      const project =
        `I${String(projectId).padStart(8, '0')}`;


      const filters = [
        [
          'Stock Entry',
          'project',
          '=',
          project,
        ],
      ];


      path +=
        `&filters=${encodeURIComponent(
          JSON.stringify(filters)
        )}`;
    }


    path +=
      '&order_by=posting_date desc';


    console.log(
      'STOCK ENTRY PATH:',
      path
    );


    const result =
      await erpnextRequest(path);


    return Response.json(
      result?.data ?? []
    );


  } catch (error: unknown) {

    console.error(
      'Stock Entry GET error:',
      error
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
      }
    );
  }
}
