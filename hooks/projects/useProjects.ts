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
} from './projectSupabase';

import {
  syncERPProject,
} from './projectERP';



export interface Project {

  id: number;

  project_id: string;

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


  project_id?: string;


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


  erp_sync_status?: string | null;

  erp_synced_at?: string | null;

}




export function useProjects(
  projectType: string
) {

  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);



  const [
    loading,
    setLoading,
  ] = useState(false);



  const [
    error,
    setError,
  ] = useState('');




  const fetchProjects =
    useCallback(async () => {


      setLoading(true);

      setError('');



      try {


        const data =
          await getProjects(
            projectType
          );


        setProjects(
          data
        );


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


    }, [
      projectType,
    ]);




  useEffect(() => {


    void fetchProjects();


  }, [
    fetchProjects,
  ]);





  async function saveProject(
    input: SaveProjectInput
  ) {


    let project: Project;



    // =========================
    // ① Supabase保存
    // =========================


    if (!input.id) {


      project =
        await insertProject(
          input
        );


    } else {


      project =
        await updateProject(
          input
        );


    }





    // =========================
    // ② ERPNext同期
    // =========================


    await syncERPProject({

      project_id:
        project.project_id,


      project_name:
        project.project_name,


      status:
        project.status,


      priority:
        project.priority,


      expected_start_date:
        project.expected_start_date,


      expected_end_date:
        project.expected_end_date,


      percent_complete:
        project.percent_complete,


      collect_progress:
        project.collect_progress,


      notes:
        project.notes,

    });





    // =========================
    // ③ 同期状態更新
    // =========================


    await updateProject({

      ...project,


      erp_sync_status:
        'synced',


      erp_synced_at:
        new Date()
          .toISOString(),


    });





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
