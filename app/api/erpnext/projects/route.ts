import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';


export async function POST(
  request: Request
) {

  try {

    const body =
      await request.json();


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



    // ERPNext存在確認

    let exists = false;


    try {

      const check =
        await erpnextRequest(
          `/api/resource/Project/${name}`
        );


      exists =
        !!check?.data?.name;


    } catch {

      exists = false;

    }




    let result;




    // 更新

    if (exists) {


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


    // 新規作成

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
      result
    );



  } catch (error: any) {


    console.error(
      'ERP PROJECT ERROR',
      error
    );


    return Response.json(
      {
        error:
          error.message ||
          'ERPNext Project同期失敗',
      },
      {
        status: 500,
      }
    );

  }

}
