import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  erpnextRequest,
} from '../../../../../lib/erpnextClient';



export async function GET(
  request: NextRequest,
  context: {
    params: {
      name: string;
    };
  },
) {

  try {


    const name =
      decodeURIComponent(
        context.params.name,
      );



    const item =
      await erpnextRequest(
        `/api/resource/Item/${encodeURIComponent(name)}`,
      );



    return NextResponse.json(
      item.data ?? {},
    );



  } catch (error) {


    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Item取得失敗',
      },
      {
        status:500,
      },
    );

  }

}
