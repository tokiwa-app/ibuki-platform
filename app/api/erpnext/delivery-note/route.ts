import { NextResponse } from 'next/server';

const ERPNEXT_URL = process.env.ERPNEXT_URL;
const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY;
const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!ERPNEXT_URL || !ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
    return NextResponse.json(
      { error: 'ERPNext environment variables are missing' },
      { status: 500 }
    );
  }

  const filters = q
    ? [
        [
          'Delivery Note',
          'name',
          'like',
          `%${q}%`,
        ],
      ]
    : [];

  const params = new URLSearchParams({
    fields: JSON.stringify([
      'name',
      'customer',
      'customer_name',
      'posting_date',
      'status',
      'set_warehouse',
      'total_qty',
    ]),
    filters: JSON.stringify(filters),
    order_by: 'posting_date desc, creation desc',
    limit_page_length: '100',
  });

  const res = await fetch(
    `${ERPNEXT_URL}/api/resource/Delivery Note?${params.toString()}`,
    {
      headers: {
        Authorization: `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: text },
      { status: res.status }
    );
  }

  const json = await res.json();

  return NextResponse.json({
    rows: json.data ?? [],
  });
}
