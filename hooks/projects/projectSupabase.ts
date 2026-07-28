import { supabase } from '../../lib/supabaseClient';

import {
  Project,
  SaveProjectInput,
} from './useProjects';





export async function getProjects() {


  const {
    data,
    error,
  } =
    await supabase
      .from('projects')
      .select('*')
      .order(
        'updated_at',
        {
          ascending:false,
        }
      );



  if(error){
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


        status:
          input.status,


        priority:
          input.priority,


      })
      .select()
      .single();




  if(error){
    throw error;
  }



  return data as Project;

}








export async function updateProject(
  input: SaveProjectInput
) {


  const {
    data,
    error,
  } =
    await supabase
      .from('projects')
      .update({

        project_name:
          input.project_name,


        status:
          input.status,


        priority:
          input.priority,


      })
      .eq(
        'id',
        input.id
      )
      .select()
      .single();




  if(error){
    throw error;
  }



  return data as Project;

}
