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


    const fields = [
      'project',
    ];


    let path =
      '/api/resource/Stock Entry?';


    path +=
      `fields=${encodeURIComponent(
        JSON.stringify(fields)
      )}`;


    path +=
      '&limit_page_length=10';


    console.log(
      'STOCK ENTRY PATH:',
      path
    );


    const result =
      await erpnextRequest(path);


    console.log(
      'STOCK ENTRY RESULT:',
      JSON.stringify(result)
    );


    return Response.json(
      result?.data ?? []
    );


  } catch (error: unknown) {

    console.error(
      'STOCK ENTRY ERROR:',
      error
    );


    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 500,
      }
    );
  }
}
