import { erpnextRequest } from '../../../../lib/erpnextClient';

export const dynamic = 'force-dynamic';

type ProjectRequestBody = {
  project_name?: string;
  project_type?: string;
  customer?: string;
  company?: string;
  status?: string;
  priority?: string;
  expected_start_date?: string;
  expected_end_date?: string;
  notes?: string;
};

// -------------------------------------------------------------
// GET: ERPNext ProjectをID指定で1件だけ取得
//
// GET /api/erpnext/project?name=PROJ-00001
// -------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name')?.trim();

    if (!name) {
      return Response.json(
        {
          error: 'nameは必須です',
        },
        {
          status: 400,
        },
      );
    }

    const path =
      `/api/resource/Project/${encodeURIComponent(name)}`;

    const result = await erpnextRequest(path, {
      method: 'GET',
    });

    return Response.json(result.data || result);
  } catch (error: unknown) {
    console.error('Project GET error:', error);

    return Response.json(
      {
        error: getErrorMessage(
          error,
          'プロジェクトの取得に失敗しました',
        ),
      },
      {
        status: 500,
      },
    );
  }
}

// -------------------------------------------------------------
// POST: ERPNextにProjectを新規作成
//
// ERPNextが発行したProject IDを返す
// -------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ProjectRequestBody;

    const projectName = body.project_name?.trim();
    const projectType = body.project_type?.trim();

    if (!projectName) {
      return Response.json(
        {
          error: 'project_nameは必須です',
        },
        {
          status: 400,
        },
      );
    }

    if (!projectType) {
      return Response.json(
        {
          error: 'project_typeは必須です',
        },
        {
          status: 400,
        },
      );
    }

    const payload: Record<string, unknown> = {
      project_name: projectName,
      project_type: projectType,
      status: body.status?.trim() || 'Open',
    };

    if (body.customer?.trim()) {
      payload.customer = body.customer.trim();
    }

    if (body.company?.trim()) {
      payload.company = body.company.trim();
    }

    if (body.priority?.trim()) {
      payload.priority = body.priority.trim();
    }

    if (body.expected_start_date) {
      payload.expected_start_date =
        body.expected_start_date;
    }

    if (body.expected_end_date) {
      payload.expected_end_date =
        body.expected_end_date;
    }

    if (body.notes?.trim()) {
      payload.notes = body.notes.trim();
    }

    const result = await erpnextRequest(
      '/api/resource/Project',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    const project = result.data || result;

    return Response.json(
      {
        erp_project_id: project.name,
      },
      {
        status: 201,
      },
    );
  } catch (error: unknown) {
    console.error('Project POST error:', error);

    return Response.json(
      {
        error: getErrorMessage(
          error,
          'プロジェクトの作成に失敗しました',
        ),
      },
      {
        status: 500,
      },
    );
  }
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
