import { supabase } from '../../lib/supabaseClient';
import {
  Project,
  SaveProjectInput,
} from './useProjects';



export async function getProjects(
  projectType: string
) {

  let query =
    supabase
      .from('projects')
      .select('*')
      .order(
        'updated_at',
        {
          ascending: false,
        }
      );


  if (projectType.trim()) {
    query =
      query.eq(
        'project_type',
        projectType.trim()
      );
  }


  const {
    data,
    error,
  } =
    await query;


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


        // 新方式
        erp_sync_status:
          'pending',

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


        erp_sync_status:
          'pending',

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
