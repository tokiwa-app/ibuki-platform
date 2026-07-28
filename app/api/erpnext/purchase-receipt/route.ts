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
    const projectId = searchParams.get('projectId');

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
      'project',
      'creation',
      'modified',
    ];

    // 送信済みのPurchase Receiptだけを取得
    const filters: Array<[string, string, string, string | number]> = [
      ['Purchase Receipt', 'docstatus', '=', 1],
    ];

    // プロジェクトで絞り込み
    if (projectId) {
      const erpProjectId = `I${String(Number(projectId)).padStart(8, '0')}`;

      filters.push([
        'Purchase Receipt',
        'project',
        '=',
        erpProjectId,
      ]);
    }

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
