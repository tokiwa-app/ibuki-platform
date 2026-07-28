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
  'stock_entry_type',
  'posting_date',
  'status',
  'project',
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
      '&order_by=posting_date desc, creation desc';


    const result =
      await erpnextRequest(path);


    return Response.json(
      result.data ?? []
    );


catch (error:any) {

  console.error(
    'Stock Entry GET error:',
    error
  );

  return Response.json(
    {
      error: String(error),
      message: error?.message,
      stack: error?.stack,
    },
    {
      status:500,
    }
  );
}
}
