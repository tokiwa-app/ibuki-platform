import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

// -------------------------------------------------------------
// GET: 入庫履歴一覧、またはname指定による詳細取得
// -------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name');
    const q = searchParams.get('q') || '';

    // ---------------------------------------------------------
    // 詳細取得
    // ---------------------------------------------------------
    if (name) {
      const path = `/api/resource/Purchase Receipt/${encodeURIComponent(name)}`;

      const result = await erpnextRequest(path, {
        method: 'GET',
      });

      return Response.json(result.data || result);
    }

    // ---------------------------------------------------------
    // 一覧取得
    // ---------------------------------------------------------
    const fields = [
      'name',
      'supplier',
      'supplier_name',
      'posting_date',
      'posting_time',
      'status',
      'docstatus',
      'total_qty',
      'grand_total',
      'currency',
      'per_billed',
      'company',
      'creation',
      'modified',
    ];

    // 送信済みのPurchase Receiptだけを取得
    const filters: Array<[string, string, string, string | number]> = [
      ['Purchase Receipt', 'docstatus', '=', 1],
    ];

    const params = new URLSearchParams();

    params.set('fields', JSON.stringify(fields));
    params.set('filters', JSON.stringify(filters));
    params.set('limit_page_length', '100');
    params.set('order_by', 'posting_date desc, creation desc');

    // キーワード検索
    if (q.trim()) {
      const keyword = q.trim();

      const orFilters: Array<[string, string, string, string]> = [
        ['Purchase Receipt', 'name', 'like', `%${keyword}%`],
        ['Purchase Receipt', 'supplier', 'like', `%${keyword}%`],
        ['Purchase Receipt', 'supplier_name', 'like', `%${keyword}%`],
      ];

      params.set('or_filters', JSON.stringify(orFilters));
    }

    const path = `/api/resource/Purchase Receipt?${params.toString()}`;

    const result = await erpnextRequest(path, {
      method: 'GET',
    });

    return Response.json(result.data || []);
  } catch (error: any) {
    console.error('Purchase Receipt GET error:', error);

    return Response.json(
      {
        error: error?.message || '入庫履歴の取得に失敗しました',
      },
      {
        status: 500,
      },
    );
  }
}

// -------------------------------------------------------------
// POST: 直接入庫（Purchase Receipt）の新規作成
// -------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.supplier) {
      return Response.json(
        {
          error: 'supplierは必須です',
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return Response.json(
        {
          error: 'itemsは1件以上必要です',
        },
        {
          status: 400,
        },
      );
    }

    const invalidItem = body.items.find(
      (item: any) =>
        !item.item_code ||
        !Number.isFinite(Number(item.qty)) ||
        Number(item.qty) <= 0,
    );

    if (invalidItem) {
      return Response.json(
        {
          error: 'item_codeと0より大きいqtyを指定してください',
        },
        {
          status: 400,
        },
      );
    }

    const payload = {
      supplier: body.supplier,
      posting_date:
        body.posting_date || new Date().toISOString().slice(0, 10),
      company: body.company || 'Akiyama Shearing',

      items: body.items.map((item: any) => ({
        item_code: item.item_code,
        qty: Number(item.qty),
        uom: item.uom || 'Nos',
        stock_uom: item.stock_uom || item.uom || 'Nos',
        warehouse: item.warehouse || 'Stores - HP',
        rate: Number(item.rate || 0),

        // Purchase Order経由の場合だけ設定
        ...(item.purchase_order
          ? { purchase_order: item.purchase_order }
          : {}),

        ...(item.purchase_order_item
          ? { purchase_order_item: item.purchase_order_item }
          : {}),
      })),
    };

    const result = await erpnextRequest(
      '/api/resource/Purchase Receipt',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    return Response.json(result.data || result, {
      status: 201,
    });
  } catch (error: any) {
    console.error('Purchase Receipt POST error:', error);

    return Response.json(
      {
        error: error?.message || '入庫登録に失敗しました',
      },
      {
        status: 500,
      },
    );
  }
}

