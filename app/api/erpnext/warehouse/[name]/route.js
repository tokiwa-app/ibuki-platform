import { erpnextRequest } from '../../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const name = decodeURIComponent(params.name);

    const result = await erpnextRequest(
      `/api/resource/Warehouse/${encodeURIComponent(name)}`
    );

    return Response.json(result.data || result);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Warehouse取得に失敗しました' },
      { status: 404 }
    );
  }
}
