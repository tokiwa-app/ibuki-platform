import { createSupabaseServerClient } from
  '../../../../lib/supabaseServer';

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
// GET: SupabaseからProjectを取得
//
// GET /api/supabase/projects
// GET /api/supabase/projects?project_type=入庫案件
// GET /api/supabase/projects?project_type=入庫案件&q=ABC
// GET /api/supabase/projects?id=1
// -------------------------------------------------------------
export async function GET(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    // ログイン確認
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        {
          error: 'ログインが必要です',
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } = new URL(request.url);

    const id =
      searchParams.get('id')?.trim() || '';

    const projectType =
      searchParams.get('project_type')?.trim() || '';

    const q =
      searchParams.get('q')?.trim() || '';

    const limit = parseLimit(
      searchParams.get('limit'),
    );

    // ---------------------------------------------------------
    // Supabase ID指定による1件取得
    // ---------------------------------------------------------
    if (id) {
      const projectId = Number(id);

      if (
        !Number.isInteger(projectId) ||
        projectId <= 0
      ) {
        return Response.json(
          {
            error: 'idが正しくありません',
          },
          {
            status: 400,
          },
        );
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) {
        return Response.json(
          {
            error: 'プロジェクトが見つかりません',
          },
          {
            status: 404,
          },
        );
      }

      return Response.json(data);
    }

    // ---------------------------------------------------------
    // 一覧取得
    // ---------------------------------------------------------
    let query = supabase
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

    // Project Typeが指定された場合のみ絞り込む
    if (projectType) {
      query = query.eq(
        'project_type',
        projectType,
      );
    }

    // キーワード検索
    if (q) {
      const keyword =
        escapePostgrestSearch(q);

      query = query.or(
        [
          `project_name.ilike.%${keyword}%`,
          `erp_project_id.ilike.%${keyword}%`,
          `customer.ilike.%${keyword}%`,
          `company.ilike.%${keyword}%`,
          `status.ilike.%${keyword}%`,
        ].join(','),
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return Response.json(data || []);
  } catch (error: unknown) {
    console.error(
      'Projects GET error:',
      error,
    );

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
// RLSポリシーはログインユーザーに対して適用される
// -------------------------------------------------------------
export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    // ログイン確認
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        {
          error: 'ログインが必要です',
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as ProjectPostBody;

    const projectName =
      body.project_name?.trim() || '';

    const projectType =
      body.project_type?.trim() || '';

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

    if (
      body.expected_start_date &&
      body.expected_end_date &&
      body.expected_start_date >
        body.expected_end_date
    ) {
      return Response.json(
        {
          error:
            '終了予定日は開始予定日以降にしてください',
        },
        {
          status: 400,
        },
      );
    }

    const erpProjectId =
      body.erp_project_id?.trim() || null;

    const payload = {
      erp_project_id: erpProjectId,
      project_name: projectName,
      project_type: projectType,

      customer:
        body.customer?.trim() || null,

      company:
        body.company?.trim() || null,

      status:
        body.status?.trim() || 'Open',

      priority:
        body.priority?.trim() || null,

      expected_start_date:
        body.expected_start_date || null,

      expected_end_date:
        body.expected_end_date || null,

      notes:
        body.notes?.trim() || null,

      is_active: true,

      erp_sync_status: erpProjectId
        ? 'synced'
        : 'pending',

      erp_synced_at: erpProjectId
        ? new Date().toISOString()
        : null,

      // projectsテーブルにcreated_by列がある場合のみ使用
      // created_by: user.id,
    };

    const { data, error } = await supabase
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
    console.error(
      'Projects POST error:',
      error,
    );

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

// -------------------------------------------------------------
// limit変換
// -------------------------------------------------------------
function parseLimit(
  value: string | null,
): number {
  if (!value) {
    return 100;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return 100;
  }

  return Math.min(parsed, 500);
}

// -------------------------------------------------------------
// PostgREST検索文字列のエスケープ
// -------------------------------------------------------------
function escapePostgrestSearch(
  value: string,
): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('%', '\\%')
    .replaceAll('_', '\\_')
    .replaceAll(',', '\\,')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)');
}

// -------------------------------------------------------------
// エラーメッセージ取得
// -------------------------------------------------------------
function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    const message = (
      error as {
        message?: unknown;
      }
    ).message;

    if (typeof message === 'string') {
      return message;
    }
  }

  return fallback;
}
