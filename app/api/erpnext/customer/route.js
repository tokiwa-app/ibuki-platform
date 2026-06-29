import { erpnextRequest } from '../../../../lib/erpnextClient';

export async function GET() {
  try {
    const result = await erpnextRequest(
      '/api/resource/Customer?fields=["name","customer_name","customer_group","territory"]&limit_page_length=200'
    );

    return Response.json(result.data || []);
  } catch (error) {
    console.error('Customer list error:', error);

    return Response.json(
      {
        error: error.message || 'Customer一覧の取得に失敗しました',
      },
      {
        status: 500,
      }
    );
  }
}
