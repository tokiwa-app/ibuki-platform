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

  project_id: string | null;

  project_name: string;

  status: string | null;

  priority: string | null;

  created_at: string;

  updated_at: string;

}





export interface SaveProjectInput {

  id?: number;

  project_name: string;

  status: string | null;

  priority: string | null;

}






export function useProjects() {


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
          await getProjects();


        setProjects(
          data as Project[]
        );



      } catch (e) {


        console.error(e);


        setError(
          e instanceof Error
            ? e.message
            : '取得失敗'
        );


      } finally {


        setLoading(false);


      }


    }, []);







  useEffect(() => {

    void fetchProjects();

  }, [
    fetchProjects,
  ]);









  async function saveProject(
    input: SaveProjectInput
  ) {


    let project: Project;



    // =====================
    // Supabase保存
    // =====================


    if (!input.id) {


      project =
        await insertProject(
          input
        ) as Project;


    } else {


      project =
        await updateProject(
          input
        ) as Project;


    }






    // =====================
    // ERPNext同期
    // =====================


    if (project.project_id) {


      await syncERPProject({

        project_id:
          project.project_id,


        project_name:
          project.project_name,


        status:
          project.status,


        priority:
          project.priority,

      });


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
