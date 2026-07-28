import { supabase } from '../../lib/supabaseClient';
import type {
  Project,
  SaveProjectInput,
} from './projectTypes';

function createProjectPayload(input: SaveProjectInput) {
  return {
    project_name: input.project_name,
    project_type: input.project_type,

    customer: input.customer,
    company: input.company,

    status: input.status,
    priority: input.priority,

    expected_start_date: input.expected_start_date,
    expected_end_date: input.expected_end_date,

    actual_start_date: input.actual_start_date,
    actual_end_date: input.actual_end_date,

    percent_complete: input.percent_complete,
    collect_progress: input.collect_progress,

    notes: input.notes,
    is_active: input.is_active,
  };
}

export async function getProjects(
  projectType?: string,
): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .order('updated_at', {
      ascending: false,
    });

  if (projectType) {
    query = query.eq('project_type', projectType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as Project[];
}

export async function insertProject(
  input: SaveProjectInput,
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(createProjectPayload(input))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Project;
}

export async function updateProject(
  input: SaveProjectInput,
): Promise<Project> {
  if (input.id == null) {
    throw new Error('更新対象のプロジェクトIDがありません');
  }

  const { data, error } = await supabase
    .from('projects')
    .update(createProjectPayload(input))
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as Project;
}
