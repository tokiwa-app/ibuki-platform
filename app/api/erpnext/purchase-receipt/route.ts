import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

// -------------------------------------------------------------
// GET: 入庫履歴一覧、またはID指定による詳細データの取得
// -------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (name) {
      // 詳細取得: /api/erpnext/purchase-receipt?name=PR-XXXXX
      const result = await erpnextRequest(`/api/resource/Purchase Receipt/${name}`, {
        method: 'GET',
      });
      return Response.json(result.data || result);
    } else {
      // 一覧取得: /api/erpnext/purchase-receipt
      const fields = encodeURIComponent(JSON.stringify(["name", "supplier", "posting_date", "docstatus"]));
      const result = await erpnextRequest(
        `/api/resource/Purchase Receipt?fields=${fields}&order_by=creation desc&limit_page_length=50`,
        { method: 'GET' }
      );
      return Response.json(result.data || []);
    }
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'データ取得に失敗しました' },
      { status: 500 }
    );
  }
}

// -------------------------------------------------------------
// POST: 直接入庫（Purchase Receipt）の新規作成
// -------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.supplier || !body.items || body.items.length === 0) {
      return Response.json(
        { error: '必須項目（supplier, items）が不足しています' },
        { status: 400 }
      );
    }

    const payload = {
      supplier: body.supplier,
      posting_date: body.posting_date || new Date().toISOString().split('T')[0],
      company: body.company || 'Akiyama Shearing',
      items: body.items.map((item: any) => ({
        item_code: item.item_code,
        item_name: item.item_name,
        qty: Number(item.qty),
        uom: item.uom || 'Nos',
        warehouse: item.warehouse || 'Stores - HP',
        rate: item.rate || 0,
      })),
    };

    const result = await erpnextRequest('/api/resource/Purchase Receipt', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return Response.json(result.data || result);
  } catch (error: any) {
    return Response.json(
      { error: error.message || '入庫登録に失敗しました' },
      { status: 500 }
    );
  }
}
