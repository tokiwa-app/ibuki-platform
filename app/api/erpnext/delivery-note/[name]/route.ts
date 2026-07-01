import { erpnextRequest } from '../../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function GET(
  request,
  { params }
) {
  try {
    const name = decodeURIComponent(params.name);

    const path = `/api/resource/Delivery Note/${encodeURIComponent(name)}`;

    const result = await erpnextRequest(path);

    return Response.json(result.data || null);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Delivery Note詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}
