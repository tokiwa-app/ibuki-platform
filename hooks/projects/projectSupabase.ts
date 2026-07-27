import { supabase } from '../../lib/supabaseClient';


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


  if (error) {
    throw error;
  }


  return data ?? [];

}





export async function insertProject(
  input:any
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



  const project_id =
    `I${String(data.id).padStart(8,'0')}`;



  const {
    data: updated,
    error:updateError
  } =
    await supabase
      .from('projects')
      .update({

        project_id,

      })
      .eq(
        'id',
        data.id
      )
      .select()
      .single();



  if(updateError){
    throw updateError;
  }



  return updated;

}





export async function updateProject(
  input:any
) {


  const {
    data,
    error
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


  return data;

}
