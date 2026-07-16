import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 3PL入庫に必要な必須項目バリデーション
    if (!body.supplier) {
      return Response.json(
        { error: 'supplier（荷主、または仕入先）は必須項目です' },
        { status: 400 }
      );
    }
    if (!body.items || body.items.length === 0) {
      return Response.json(
        { error: '入庫する商品（items）がありません' },
        { status: 400 }
      );
    }

    // POなしでダイレクトにPRを作成するペイロード
    const payload = {
      supplier: body.supplier,
      posting_date: body.posting_date || new Date().toISOString().split('T')[0], // 本日日付
      company: body.company || 'Akiyama Shearing', // 対象の会社名
      
      // 3PLではロットや賞味期限、倉庫の指定が極めて重要
      items: body.items.map((item: any) => ({
        item_code: item.item_code,
        item_name: item.item_name,
        qty: Number(item.qty),
        uom: item.uom || 'Nos',
        warehouse: item.warehouse || 'Stores - HP', // 格納先倉庫（必須）
        rate: item.rate || 0, // 3PL受託在庫の場合は評価単価を0、または荷主指定の単価をセット
        
        // ロットや棚番などの拡張情報（必要に応じて有効化）
        // batch_no: item.batch_no || undefined,
      })),
    };

    // ERPNextへ直接PRをポスト（これでBinに実在庫が生まれます）
    const result = await erpnextRequest('/api/resource/Purchase Receipt', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return Response.json(result.data || result);
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'PR（直接入庫）の作成に失敗しました' },
      { status: 500 }
    );
  }
}
