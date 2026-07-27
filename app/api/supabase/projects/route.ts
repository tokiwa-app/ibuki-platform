import { supabaseAdmin } from '../../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

type ProjectPostBody = {
  erp_project_id?: string | null;
  project_name?: string;
  project_type?: string;
  customer?: string | null;
  company?: string | null;
  status?: string;
  priority?: string | null;
  expected_start_date?: string | null;
  expected_end_date?: string | null;
  notes?: string | null;
};

// -------------------------------------------------------------
// GET: SupabaseからProjectを検索
//
// /api/projects
// /api/projects?project_type=入庫案件
// /api/projects?project_type=入庫案件&q=ABC
// /api/projects?id=1
// -------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get('id')?.trim();
    const projectType =
      searchParams.get('project_type')?.trim();
    const q = searchParams.get('q')?.trim();

    const limit = parseLimit(searchParams.get('limit'));

    // ---------------------------------------------------------
    // ID指定による1件取得
    // ---------------------------------------------------------
    if (id) {
      const projectId = Number(id);

      if (!Number.isInteger(projectId) || projectId <= 0) {
        return Response.json(
          {
            error: 'idが正しくありません',
          },
          {
            status: 400,
          },
        );
      }

      const { data, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return Response.json(
            {
              error: 'プロジェクトが見つかりません',
            },
            {
              status: 404,
            },
          );
        }

        throw error;
      }

      return Response.json(data);
    }

    // ---------------------------------------------------------
    // 一覧検索
    // ---------------------------------------------------------
    let query = supabaseAdmin
      .from('projects')
      .select(
        `
          id,
          erp_project_id,
          project_name,
          project_type,
          customer,
          company,
          status,
          priority,
          expected_start_date,
          expected_end_date,
          is_active,
          erp_sync_status,
          erp_synced_at,
          created_at,
          updated_at
        `,
      )
      .order('updated_at', {
        ascending: false,
      })
      .limit(limit);

    if (projectType) {
      query = query.eq('project_type', projectType);
    }

    if (q) {
      const escapedKeyword = escapePostgrestSearch(q);

      query = query.or(
        [
          `project_name.ilike.%${escapedKeyword}%`,
          `erp_project_id.ilike.%${escapedKeyword}%`,
          `customer.ilike.%${escapedKeyword}%`,
          `company.ilike.%${escapedKeyword}%`,
          `status.ilike.%${escapedKeyword}%`,
        ].join(','),
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return Response.json(data || []);
  } catch (error: unknown) {
    console.error('Projects GET error:', error);

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
// POST: SupabaseにProjectを作成
//
// ERPNextへのProject作成とは分離する
// -------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ProjectPostBody;

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

    const payload = {
      erp_project_id:
        body.erp_project_id?.trim() || null,

      project_name: projectName,
      project_type: projectType,

      customer: body.customer?.trim() || null,
      company: body.company?.trim() || null,

      status: body.status?.trim() || 'Open',
      priority: body.priority?.trim() || null,

      expected_start_date:
        body.expected_start_date || null,

      expected_end_date:
        body.expected_end_date || null,

      notes: body.notes?.trim() || null,

      is_active: true,

      erp_sync_status: body.erp_project_id
        ? 'synced'
        : 'pending',

      erp_synced_at: body.erp_project_id
        ? new Date().toISOString()
        : null,
    };

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return Response.json(data, {
      status: 201,
    });
  } catch (error: unknown) {
    console.error('Projects POST error:', error);

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

function parseLimit(value: string | null): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 100;
  }

  return Math.min(parsed, 500);
}

function escapePostgrestSearch(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_')
    .replaceAll(',', '\\,')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
}
