import { erpnextRequest } from '../../../../../lib/erpnextClient';

interface RouteParams {
  params: {
    projectId: string;
  };
}

export async function GET(
  _request: Request,
  { params }: RouteParams,
) {
  try {
    const projectId = Number(params.projectId);

    if (
      !Number.isInteger(projectId) ||
      projectId <= 0
    ) {
      return Response.json(
        {
          error: '正しいプロジェクトIDを指定してください',
        },
        {
          status: 400,
        },
      );
    }

    // Supabase ID: 1
    // ERPNext ID: I00000001
    const erpProjectId =
      `I${String(projectId).padStart(8, '0')}`;

    const result = await erpnextRequest(
      `/api/resource/Project/${encodeURIComponent(erpProjectId)}`,
      {
        method: 'GET',
      },
    );

    // ERPNextのレスポンスが { data: {...} } の場合は
    // data部分だけをクライアントへ返す
    return Response.json(
      result?.data ?? result,
    );
  } catch (error: unknown) {
    console.error(
      'ERPNext project fetch error:',
      error,
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'ERPNextからプロジェクトを取得できませんでした',
      },
      {
        status: 500,
      },
    );
  }
}
