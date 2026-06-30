import { erpnextRequest } from '../../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

async function warehouseExists(name) {
  try {
    await erpnextRequest(`/api/resource/Warehouse/${encodeURIComponent(name)}`);
    return true;
  } catch {
    return false;
  }
}

async function createWarehouse({ name, warehouse_name, parent_warehouse, is_group }) {
  const body = {
    warehouse_name: warehouse_name || name,
    is_group,
  };

  if (parent_warehouse) {
    body.parent_warehouse = parent_warehouse;
  }

  return erpnextRequest('/api/resource/Warehouse', {
    method: 'POST',
    body: JSON.stringify(body),
  });
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

    const rootWarehouse = rootCode;
    const hirakataWarehouse = `${rootCode}-hirakata`;
    const normalWarehouse = `${rootCode}-hirakata-normal`;
    const ngWarehouse = `${rootCode}-hirakata-ng`;
    const workRequiredWarehouse = `${rootCode}-hirakata-work-required`;

    const alreadyExists = await warehouseExists(rootWarehouse);

    if (alreadyExists) {
      return Response.json(
        { error: `Warehouse ${rootWarehouse} already exists` },
        { status: 409 }
      );
    }

    await createWarehouse({
      name: rootWarehouse,
      warehouse_name: rootWarehouse,
      is_group: 1,
    });

    await createWarehouse({
      name: hirakataWarehouse,
      warehouse_name: hirakataWarehouse,
      parent_warehouse: rootWarehouse,
      is_group: 1,
    });

    await createWarehouse({
      name: normalWarehouse,
      warehouse_name: normalWarehouse,
      parent_warehouse: hirakataWarehouse,
      is_group: 0,
    });

    await createWarehouse({
      name: ngWarehouse,
      warehouse_name: ngWarehouse,
      parent_warehouse: hirakataWarehouse,
      is_group: 0,
    });

    await createWarehouse({
      name: workRequiredWarehouse,
      warehouse_name: workRequiredWarehouse,
      parent_warehouse: hirakataWarehouse,
      is_group: 0,
    });

    return Response.json({
      ok: true,
      warehouses: [
        rootWarehouse,
        hirakataWarehouse,
        normalWarehouse,
        ngWarehouse,
        workRequiredWarehouse,
      ],
    });
  } catch (error) {
    return Response.json(
      { error: error.message || 'Warehouse作成に失敗しました' },
      { status: 500 }
    );
  }
}
