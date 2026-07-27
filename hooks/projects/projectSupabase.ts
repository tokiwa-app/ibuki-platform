import { supabase } from '../../lib/supabaseClient';

import {
  Project,
  SaveProjectInput,
} from './useProjects';




// ===============================
// 一覧取得
// ===============================

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






// ===============================
// 新規作成
// ===============================

export async function insertProject(
  input: SaveProjectInput
) {


  // ① Supabase保存

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
          'pending',


      })
      .select()
      .single();



  if (error) {
    throw error;
  }





  // ② Ibuki ID生成
  // 1 → I00000001

  const projectId =
    `I${String(data.id).padStart(8, '0')}`;




  // ③ project_id保存

  const {
    data: updated,
    error: updateError,
  } =
    await supabase
      .from('projects')
      .update({

        project_id:
          projectId,

      })
      .eq(
        'id',
        data.id
      )
      .select()
      .single();



  if (updateError) {
    throw updateError;
  }



  return updated as Project;

}







// ===============================
// 更新
// ===============================

export async function updateProject(
  input: SaveProjectInput
) {


  if (!input.id) {

    throw new Error(
      'Project ID is required'
    );

  }



  const {
    error,
  } =
    await supabase
      .from('projects')
      .update({

        // ★追加
        project_id:
          input.project_id,


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
      );



  if (error) {
    throw error;
  }





  // ★最新データ取得
  // project_idを確実に取得

  const {
    data: latest,
    error: latestError,
  } =
    await supabase
      .from('projects')
      .select('*')
      .eq(
        'id',
        input.id
      )
      .single();



  if (latestError) {
    throw latestError;
  }



  return latest as Project;

}
