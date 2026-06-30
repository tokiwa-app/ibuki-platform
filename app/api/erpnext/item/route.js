import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

function getCustomerCode(customerCode) {
  return String(customerCode || '').padStart(4, '0');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerCode = getCustomerCode(searchParams.get('customer_code') || '');

    if (!customerCode) {
      return Response.json([]);
    }

    const fields =
      '["name","item_code","item_name","item_group","stock_uom","disabled"]';

    const filters = [
      ['Item', 'item_code', 'like', `${customerCode}-%`],
    ];

    const path =
      `/api/resource/Item?fields=${encodeURIComponent(fields)}` +
      `&filters=${encodeURIComponent(JSON.stringify(filters))}` +
      `&limit_page_length=500`;

    const result = await erpnextRequest(path);

    return Response.json(result.data || []);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Item検索に失敗しました' },
      { status: 500 }
    );
  }
}

async function getWarehouseCompany(defaultWarehouse) {
  const result = await erpnextRequest(
    `/api/resource/Warehouse/${encodeURIComponent(defaultWarehouse)}`
  );

  return result?.data?.company;
}

export async function POST(request) {
  try {
    const body = await request.json();

    const customerCode = getCustomerCode(body.customer_code);
    const customerItemCode = String(body.customer_item_code || '').trim();

    if (!body.customer_code) {
      return Response.json(
        { error: 'customer_code is required' },
        { status: 400 }
      );
    }

    if (!customerItemCode) {
      return Response.json(
        { error: 'customer_item_code is required' },
        { status: 400 }
      );
    }

    if (!body.item_name) {
      return Response.json(
        { error: 'item_name is required' },
        { status: 400 }
      );
    }

    if (!body.default_warehouse) {
      return Response.json(
        { error: 'default_warehouse is required' },
        { status: 400 }
      );
    }

    const company = await getWarehouseCompany(body.default_warehouse);
    const itemCode = `${customerCode}-${customerItemCode}`;

    const payload = {
      item_code: itemCode,
      item_name: body.item_name,
      item_group: body.item_group || 'Products',
      stock_uom: body.stock_uom || 'Nos',
      is_stock_item: 1,
      disabled: 0,
      item_defaults: [
        {
          company,
          default_warehouse: body.default_warehouse,
        },
      ],
      customer_items: [
        {
          customer_name: body.customer_code,
          ref_code: customerItemCode,
        },
      ],
    };

    const result = await erpnextRequest('/api/resource/Item', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return Response.json(result.data || result);
  } catch (error) {
    return Response.json(
      { error: error.message || 'Item作成に失敗しました' },
      { status: 500 }
    );
  }
}
