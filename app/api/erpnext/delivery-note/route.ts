import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    const fields =
      '["name","customer","customer_name","posting_date","status","total_qty","transporter","transporter_name","custom_delivery_name","custom_delivery_zip","custom_delivery_address","custom_delivery_tel","custom_delivery_date","custom_delivery_time"]';

    let path =
      `/api/resource/Delivery Note?fields=${encodeURIComponent(fields)}&limit_page_length=100`;

    if (q.trim()) {
      const keyword = q.trim();

      const filters = [
        ['Delivery Note', 'name', 'like', `%${keyword}%`],
        ['Delivery Note', 'customer', 'like', `%${keyword}%`],
        ['Delivery Note', 'customer_name', 'like', `%${keyword}%`],
        ['Delivery Note', 'custom_delivery_name', 'like', `%${keyword}%`],
        ['Delivery Note', 'custom_delivery_address', 'like', `%${keyword}%`],
      ];

      path += `&or_filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }

    path += '&order_by=posting_date desc, creation desc';

    const result = await erpnextRequest(path);

    return Response.json(result.data || []);
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Delivery Note検索に失敗しました' },
      { status: 500 }
    );
  }
}
