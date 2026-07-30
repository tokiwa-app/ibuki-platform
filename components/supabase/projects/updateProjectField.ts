import { supabase } from "../../../lib/supabaseClient";

export async function updateProjectField<
  K extends keyof Project
>(
  id: number,
  field: K,
  value: Project[K],
) {
  const { error } = await supabase
    .from("projects")
    .update({
      [field]: value,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
