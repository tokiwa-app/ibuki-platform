import { erpnextRequest } from '../../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

// 1. GET: 詳細データ取得 (提供されたコードのママ)
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const name = decodeURIComponent(params.name);
    const path = `/api/resource/Delivery Note/${encodeURIComponent(name)}`;
    const result = await erpnextRequest(path);
    return Response.json(result.data || null);
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Delivery Note詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 2. PUT: データの更新 (ERPNextへの送信処理を追加)
export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const name = decodeURIComponent(params.name);
    const body = await request.json(); // フロントから送られてきた更新オブジェクト

    // ERPNextの標準仕様に沿って PUT メソッドで更新リクエストを送信
    const path = `/api/resource/Delivery Note/${encodeURIComponent(name)}`;
    
    const result = await erpnextRequest(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return Response.json(result.data || null);
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Delivery Noteの更新に失敗しました' },
      { status: 500 }
    );
  }
}
