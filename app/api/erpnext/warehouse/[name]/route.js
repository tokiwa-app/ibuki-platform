import { erpnextRequest } from '../../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

const COMPANY_ABBR = 'T';

function getWarehouseId(name) {
  if (!name) return '';

  const decodedName = decodeURIComponent(name);

  if (decodedName.includes(` - ${COMPANY_ABBR}`)) {
    return decodedName;
  }

  return `${decodedName} - ${COMPANY_ABBR}`;
}

export async function GET(request, { params }) {
  try {
    const warehouseId = getWarehouseId(params.name);

    const result = await erpnextRequest(
      `/api/resource/Warehouse/${encodeURIComponent(warehouseId)}`
    );

    return Response.json(result.data || result);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Warehouse取得に失敗しました' },
      { status: 404 }
    );
  }
}
