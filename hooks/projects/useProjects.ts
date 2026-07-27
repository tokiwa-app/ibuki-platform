'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Project,
  SaveProjectInput,
} from './types';

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

      // ① Supabase保存
      const project =
        await insertProject(input);


      // ② ERP作成
      const erp =
        await createERPProject(
          project.project_name
        );


      const erpProjectId =
        erp?.data?.name;


      // ③ ERP情報だけ更新
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

      // ① Supabase更新
      await updateProject(
        input
      );


      // ② ERP更新
      if (
        input.erp_project_id
      ) {

        await updateERPProject({
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
        });

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
