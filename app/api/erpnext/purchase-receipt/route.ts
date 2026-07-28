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
      '/api/resource/Purchase Receipt?';



    const fields =
      [
        'name',
        'supplier',
        'posting_date',
        'status',
        'grand_total',
        'project'
      ];



    path +=
      `fields=${encodeURIComponent(
        JSON.stringify(fields)
      )}`;


    path +=
      '&limit_page_length=100';



    if (projectId) {

      const project =
        `I${String(projectId).padStart(8,'0')}`;


      const filters = [
        [
          'Purchase Receipt',
          'project',
          '=',
          project
        ]
      ];


      path +=
        `&filters=${encodeURIComponent(
          JSON.stringify(filters)
        )}`;

    }



    path +=
      '&order_by=posting_date desc, creation desc';



    const result =
      await erpnextRequest(
        path
      );



    return Response.json(
      result.data ?? []
    );


  } catch(error:any) {


    return Response.json(
      {
        error:
          error.message ||
          'Purchase Receipt取得失敗'
      },
      {
        status:500
      }
    );

  }

}
