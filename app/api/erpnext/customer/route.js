import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const fields =
      '["name","customer_name","customer_type","customer_group","territory","mobile_no","email_id","website","disabled"]';

    let path =
      `/api/resource/Customer?fields=${encodeURIComponent(fields)}&limit_page_length=100`;

    if (q.trim()) {
      const keyword = q.trim();

      const filters = [
        ['Customer', 'name', 'like', `%${keyword}%`],
        ['Customer', 'customer_name', 'like', `%${keyword}%`],
      ];

      path += `&or_filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }

    const result = await erpnextRequest(path);

    return Response.json(result.data || []);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Customer検索に失敗しました' },
      { status: 500 }
    );
  }
}
