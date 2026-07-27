'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  getProjects,
  insertProject,
  updateProject,
  updateERPInfo,
} from './projectSupabase';

import {
  createERPProject,
  updateERPProject,
} from './projectERP';


export interface Project {
  id: number;
  erp_project_id: string | null;
  project_name: string;
  customer: string | null;
  company: string | null;
  project_type: string;

  status: string | null;
  priority: string | null;

  expected_start_date: string | null;
  expected_end_date: string | null;

  actual_start_date: string | null;
  actual_end_date: string | null;

  percent_complete: number | null;
  collect_progress: boolean | null;

  notes: string | null;
  is_active: boolean | null;

  erp_sync_status: string | null;
  erp_synced_at: string | null;

  created_at: string;
  updated_at: string;
}


export interface SaveProjectInput {
  id?: number;

  erp_project_id?: string | null;

  project_name: string;
  customer: string | null;
  company: string | null;
  project_type: string;

  status: string | null;
  priority: string | null;

  expected_start_date: string | null;
  expected_end_date: string | null;

  actual_start_date: string | null;
  actual_end_date: string | null;

  percent_complete: number | null;
  collect_progress: boolean | null;

  notes: string | null;
  is_active: boolean | null;

  erp_sync_status: string | null;
  erp_synced_at: string | null;
}


export function useProjects(
  projectType: string
) {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');


  const fetchProjects =
    useCallback(async () => {

      setLoading(true);
      setError('');

      try {

        const data =
          await getProjects(
            projectType
          );

        setProjects(data);

      } catch (e) {

        console.error(e);

        setError(
          e instanceof Error
            ? e.message
            : '取得に失敗しました'
        );

      } finally {

        setLoading(false);

      }

    }, [projectType]);


  useEffect(() => {

    void fetchProjects();

  }, [fetchProjects]);



  async function saveProject(
    input: SaveProjectInput
  ) {

    // 新規
    if (!input.id) {

      // Supabase保存
      const project =
        await insertProject(
          input
        );


      // ERPNext作成
      const erp =
        await createERPProject(
          project.project_name
        );


      const erpProjectId =
        erp?.data?.name;


      // ERP IDだけSupabaseへ反映
      if (erpProjectId) {

        await updateERPInfo(
          project.id,
          {
            erp_project_id:
              erpProjectId,

            erp_sync_status:
              'synced',

            erp_synced_at:
              new Date()
                .toISOString(),
          }
        );

      }


    } else {

      // Supabase更新
      await updateProject(
        input
      );


      // ERPNext更新
      if (
        input.erp_project_id
      ) {

        await updateERPProject(
          {
            erp_project_id:
              input.erp_project_id,

            project_name:
              input.project_name,

            company:
              input.company,

            status:
              input.status,

            priority:
              input.priority,

            expected_start_date:
              input.expected_start_date,

            expected_end_date:
              input.expected_end_date,

            percent_complete:
              input.percent_complete,

            collect_progress:
              input.collect_progress,

            notes:
              input.notes,
          }
        );

      }

    }


    await fetchProjects();
  }



  return {
    projects,
    loading,
    error,
    fetchProjects,
    saveProject,
  };
}
