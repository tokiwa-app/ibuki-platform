import { supabase } from '../../lib/supabaseClient';


export async function syncERPProject(
  data: {
    project_id: string;

    project_name: string;

    status?: string | null;

    priority?: string | null;
  }
) {

  const {
    data: result,
    error,
  } =
    await supabase.functions.invoke(
      'sync-project',
      {
        body: data,
      }
    );


  if (error) {
    throw error;
  }


  return result;

}
