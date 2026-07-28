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

  id:number;

  project_name:string;

  status:string|null;

  priority:string|null;


  created_at:string;

  updated_at:string;

}





export interface SaveProjectInput {


  id?:number;


  project_name:string;


  status:string|null;


  priority:string|null;

}









export function useProjects(){



  const [
    projects,
    setProjects,
  ] =
    useState<Project[]>([]);




  const [
    loading,
    setLoading,
  ] =
    useState(false);




  const [
    error,
    setError,
  ] =
    useState('');







  const fetchProjects =
    useCallback(async()=>{


      try{


        const data =
          await getProjects();


        setProjects(
          data
        );


      }catch(e){


        setError(
          e instanceof Error
          ? e.message
          : '取得失敗'
        );


      }



    },[]);






  useEffect(()=>{

    void fetchProjects();

  },[
    fetchProjects
  ]);








  async function saveProject(
    input:SaveProjectInput
  ){


    let project:Project;



    if(!input.id){


      project =
        await insertProject(
          input
        );


    }else{


      project =
        await updateProject(
          input
        );


    }






    // ERPNext同期

    await syncERPProject({

      id:
        project.id,


      project_name:
        project.project_name,


      status:
        project.status,


      priority:
        project.priority,


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
