import { erpnextRequest } from '../../../../../lib/erpnextClient'; // 相対パスは階層に合わせて調整してください

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const { name } = params; // ここで URL パラメータから ID を受け取る
    
    const result = await erpnextRequest(`/api/resource/Purchase Receipt/${name}`, {
      method: 'GET',
    });

    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
