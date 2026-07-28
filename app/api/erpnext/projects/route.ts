import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';


export async function POST(
  request: Request
) {
  try {

    const body = await request.json();


    const {
      id,
      project_name,
      status,
      priority,
    } = body;



    if (!id) {

      return Response.json(
        {
          error: 'id is required',
        },
        {
          status: 400,
        }
      );

    }



    const name =
      `I${String(id).padStart(8, '0')}`;



    // 存在確認

    const check =
      await erpnextRequest(
        `/api/resource/Project/${name}`
      );



    let result;



    // UPDATE

    if (check?.data?.name) {


      result =
        await erpnextRequest(
          `/api/resource/Project/${name}`,
          {
            method: 'PUT',

            body: JSON.stringify({
              data: {

                project_name,

                status,

                priority,

              },
            }),
          }
        );


    }


    // CREATE

    else {


      result =
        await erpnextRequest(
          '/api/resource/Project',
          {
            method: 'POST',

            body: JSON.stringify({
              data: {

                name,

                project_name,

                status,

                priority,

              },
            }),
          }
        );


    }



    return Response.json(
      result.data
    );



  } catch (error: any) {


    console.error(
      error
    );


    return Response.json(
      {
        error:
          error.message ||
          'Project同期に失敗しました',
      },
      {
        status:500,
      }
    );


  }
}
