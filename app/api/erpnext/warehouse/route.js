import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentWarehouse = searchParams.get('parent_warehouse') || '';

    const fields =
      '["name","warehouse_name","parent_warehouse","company","disabled","is_group"]';

    let path =
      `/api/resource/Warehouse?fields=${encodeURIComponent(
        fields
      )}&limit_page_length=100`;

    if (parentWarehouse.trim()) {
      const filters = [
        ['Warehouse', 'parent_warehouse', '=', parentWarehouse.trim()],
      ];

      path += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }

    const result = await erpnextRequest(path);

    return Response.json(result.data || []);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Warehouse検索に失敗しました' },
      { status: 500 }
    );
  }
}
