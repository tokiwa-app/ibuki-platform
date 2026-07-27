import { createSupabaseServerClient } from '../../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

// GET /api/supabase/projects?project_type=入庫案件
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const projectType = searchParams.get('project_type');

  let query = supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (projectType) {
    query = query.eq('project_type', projectType);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return Response.json(data ?? []);
}

// POST /api/supabase/projects
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const body = await request.json();

  if (!body.project_name || !body.project_type) {
    return Response.json(
      {
        error:
          'project_nameとproject_typeは必須です',
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...body,
      erp_sync_status: body.erp_project_id
        ? 'synced'
        : 'pending',
      erp_synced_at: body.erp_project_id
        ? new Date().toISOString()
        : null,
    })
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return Response.json(data, { status: 201 });
}
