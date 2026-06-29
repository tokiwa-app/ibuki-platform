import { erpnextRequest } from '../../../../../lib/erpnextClient';

export async function GET(request, { params }) {
  try {
    const code = decodeURIComponent(params.code);

    const result = await erpnextRequest(
      `/api/resource/Customer/${encodeURIComponent(code)}`
    );

    return Response.json(result.data);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const code = decodeURIComponent(params.code);
    const body = await request.json();

    const payload = {
      customer_name: body.customer_name,
      customer_group: body.customer_group || undefined,
      territory: body.territory || undefined,
    };

    const result = await erpnextRequest(
      `/api/resource/Customer/${encodeURIComponent(code)}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );

    return Response.json(result.data);
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
