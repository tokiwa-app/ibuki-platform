import { NextResponse } from 'next/server';



export async function POST(
  req: Request
) {


  try {


    const body =
      await req.json();



    const {
      id,
      project_name,
      status,
      priority,
    } = body;




    if (!id) {

      return NextResponse.json(
        {
          error:
            'id is required',
        },
        {
          status:400,
        }
      );

    }




    const erpProjectName =
      `I${String(id).padStart(8,'0')}`;




    const ERP_URL =
      process.env.ERP_URL;


    const API_KEY =
      process.env.ERP_API_KEY;


    const API_SECRET =
      process.env.ERP_API_SECRET;



    if (
      !ERP_URL ||
      !API_KEY ||
      !API_SECRET
    ) {

      return NextResponse.json(
        {
          error:
            'ERP secrets missing',
        },
        {
          status:500,
        }
      );

    }





    const headers = {

      Authorization:
        `token ${API_KEY}:${API_SECRET}`,

      "Content-Type":
        "application/json",

    };







    // =====================
    // 存在確認
    // =====================


    const checkResponse =
      await fetch(

        `${ERP_URL}/api/resource/Project/${erpProjectName}`,

        {
          method:'GET',
          headers,
        }

      );




    let response;






    // =====================
    // UPDATE
    // =====================


    if(checkResponse.ok){


      response =
        await fetch(

          `${ERP_URL}/api/resource/Project/${erpProjectName}`,

          {

            method:'PUT',

            headers,


            body:JSON.stringify({

              data:{

                project_name,

                status,

                priority,

              }

            })

          }

        );



    }







    // =====================
    // CREATE
    // =====================


    else{


      response =
        await fetch(

          `${ERP_URL}/api/resource/Project`,

          {

            method:'POST',

            headers,


            body:JSON.stringify({

              data:{

                name:
                  erpProjectName,

                project_name,

                status,

                priority,

              }

            })

          }

        );


    }







    const result =
      await response.json();




    return NextResponse.json(

      result,

      {
        status:
          response.status,
      }

    );




  } catch(error){


    console.error(
      error
    );



    return NextResponse.json(

      {
        error:
          String(error),
      },

      {
        status:500,
      }

    );


  }

}
