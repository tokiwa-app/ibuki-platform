export async function syncERPProject(
  data: {
    id: number;

    project_name: string;

    status: string | null;

    priority: string | null;
  }
) {


  const response =
    await fetch(
      '/api/erpnext/projects',
      {

        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify(data),

      }
    );



  if (!response.ok) {

    const error =
      await response.json();


    throw new Error(
      error.error ??
      'ERP sync failed'
    );

  }



  return response.json();

}
