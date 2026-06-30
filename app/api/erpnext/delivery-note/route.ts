import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const fields =
      '["name","customer","customer_name","posting_date","status","set_warehouse","total_qty"]';

    let path =
      `/api/resource/Delivery Note?fields=${encodeURIComponent(fields)}&limit_page_length=100`;

    if (q.trim()) {
      const keyword = q.trim();

      const filters = [
        ['Delivery Note', 'name', 'like', `%${keyword}%`],
        ['Delivery Note', 'customer', 'like', `%${keyword}%`],
        ['Delivery Note', 'customer_name', 'like', `%${keyword}%`],
      ];

      path += `&or_filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }

    const result = await erpnextRequest(path);

    return Response.json(result.data || []);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Delivery Note検索に失敗しました' },
      { status: 500 }
    );
  }
}
