import { supabase } from '../../lib/supabaseClient';
import {
  Project,
  SaveProjectInput,
} from './useProjects';


export async function getProjects(
  projectType: string
) {
  let query = supabase
    .from('projects')
    .select('*')
    .order(
      'updated_at',
      {
        ascending: false,
      }
    );


  if (projectType.trim()) {
    query = query.eq(
      'project_type',
      projectType.trim()
    );
  }


  const {
    data,
    error,
  } = await query;


  if (error) {
    throw error;
  }


  return (data ?? []) as Project[];
}



export async function insertProject(
  input: SaveProjectInput
) {

  const {
    data,
    error,
  } =
    await supabase
      .from('projects')
      .insert({
        project_name:
          input.project_name,

        customer:
          input.customer,

        company:
          input.company,

        project_type:
          input.project_type,

        status:
          input.status,

        priority:
          input.priority,

        expected_start_date:
          input.expected_start_date,

        expected_end_date:
          input.expected_end_date,

        actual_start_date:
          input.actual_start_date,

        actual_end_date:
          input.actual_end_date,

        percent_complete:
          input.percent_complete ?? 0,

        collect_progress:
          input.collect_progress ?? false,

        notes:
          input.notes,

        is_active:
          input.is_active ?? true,

        erp_sync_status:
          input.erp_sync_status ?? 'pending',

        erp_synced_at:
          input.erp_synced_at,

        erp_project_id:
          input.erp_project_id,
      })
      .select()
      .single();


  if (error) {
    throw error;
  }


  return data as Project;
}



export async function updateProject(
  input: SaveProjectInput
) {

  if (!input.id) {
    throw new Error(
      'Project ID is required'
    );
  }


  const {
    data,
    error,
  } =
    await supabase
      .from('projects')
      .update({
        project_name:
          input.project_name,

        customer:
          input.customer,

        company:
          input.company,

        project_type:
          input.project_type,

        status:
          input.status,

        priority:
          input.priority,

        expected_start_date:
          input.expected_start_date,

        expected_end_date:
          input.expected_end_date,

        actual_start_date:
          input.actual_start_date,

        actual_end_date:
          input.actual_end_date,

        percent_complete:
          input.percent_complete,

        collect_progress:
          input.collect_progress,

        notes:
          input.notes,

        is_active:
          input.is_active,

        erp_project_id:
          input.erp_project_id,

        erp_sync_status:
          input.erp_sync_status,

        erp_synced_at:
          input.erp_synced_at,
      })
      .eq(
        'id',
        input.id
      )
      .select()
      .single();


  if (error) {
    throw error;
  }


  return data as Project;
}



export async function updateERPInfo(
  id: number,
  data: {
    erp_project_id: string;
    erp_sync_status: string;
    erp_synced_at: string;
  }
) {

  const {
    error,
  } =
    await supabase
      .from('projects')
      .update({
        erp_project_id:
          data.erp_project_id,

        erp_sync_status:
          data.erp_sync_status,

        erp_synced_at:
          data.erp_synced_at,
      })
      .eq(
        'id',
        id
      );


  if (error) {
    throw error;
  }
}
