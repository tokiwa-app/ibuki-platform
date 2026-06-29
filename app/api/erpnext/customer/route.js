import { erpnextRequest } from '../../../../lib/erpnextClient';

export async function GET() {
  try {
    const result = await erpnextRequest(
      '/api/resource/Customer?fields=["name","customer_name","customer_group","territory"]&limit_page_length=100'
    );

    return Response.json(result.data);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
