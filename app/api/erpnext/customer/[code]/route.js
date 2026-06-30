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
      customer_type: body.customer_type,
      customer_group: body.customer_group,
      territory: body.territory,
      tax_id: body.tax_id,
      tax_category: body.tax_category,
      billing_currency: body.billing_currency,
      default_price_list: body.default_price_list,
      payment_terms: body.payment_terms,
      website: body.website,
      disabled: body.disabled,
      is_frozen: body.is_frozen,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

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
