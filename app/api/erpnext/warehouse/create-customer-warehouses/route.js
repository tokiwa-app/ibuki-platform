import { erpnextRequest } from '../../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

const COMPANY_ABBR = 'T';

function getWarehouseId(warehouseName) {
  return `${warehouseName} - ${COMPANY_ABBR}`;
}

async function warehouseExists(warehouseId) {
  try {
    await erpnextRequest(
      `/api/resource/Warehouse/${encodeURIComponent(warehouseId)}`
    );
    return true;
  } catch {
    return false;
  }
}

async function createWarehouseIfMissing({
  warehouse_name,
  parent_warehouse,
  is_group,
}) {
  const warehouseId = getWarehouseId(warehouse_name);

  const exists = await warehouseExists(warehouseId);

  if (exists) {
    return {
      name: warehouseId,
      created: false,
    };
  }

  const body = {
    warehouse_name,
    is_group,
  };

  if (parent_warehouse) {
    body.parent_warehouse = parent_warehouse;
  }

  const result = await erpnextRequest('/api/resource/Warehouse', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return {
    name: result?.data?.name || warehouseId,
    created: true,
  };
}

export async function POST(request) {
  try {
    const { customer_code } = await request.json();

    if (!customer_code) {
      return Response.json(
        { error: 'customer_code is required' },
        { status: 400 }
      );
    }

    const rootCode = String(customer_code).padStart(4, '0');

    const rootWarehouseName = rootCode;
    const rootWarehouseId = getWarehouseId(rootWarehouseName);

    const hirakataWarehouseName = `${rootCode}-hirakata`;
    const hirakataWarehouseId = getWarehouseId(hirakataWarehouseName);

    const normalWarehouseName = `${rootCode}-hirakata-normal`;
    const ngWarehouseName = `${rootCode}-hirakata-ng`;
    const workRequiredWarehouseName = `${rootCode}-hirakata-work-required`;

    const created = [];

    const root = await createWarehouseIfMissing({
      warehouse_name: rootWarehouseName,
      is_group: 1,
    });
    created.push(root);

    const hirakata = await createWarehouseIfMissing({
      warehouse_name: hirakataWarehouseName,
      parent_warehouse: rootWarehouseId,
      is_group: 1,
    });
    created.push(hirakata);

    const normal = await createWarehouseIfMissing({
      warehouse_name: normalWarehouseName,
      parent_warehouse: hirakataWarehouseId,
      is_group: 0,
    });
    created.push(normal);

    const ng = await createWarehouseIfMissing({
      warehouse_name: ngWarehouseName,
      parent_warehouse: hirakataWarehouseId,
      is_group: 0,
    });
    created.push(ng);

    const workRequired = await createWarehouseIfMissing({
      warehouse_name: workRequiredWarehouseName,
      parent_warehouse: hirakataWarehouseId,
      is_group: 0,
    });
    created.push(workRequired);

    return Response.json({
      ok: true,
      root: rootWarehouseId,
      warehouses: created,
    });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Warehouse作成に失敗しました' },
      { status: 500 }
    );
  }
}
