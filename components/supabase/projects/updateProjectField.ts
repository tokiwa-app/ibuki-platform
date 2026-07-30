import { supabase } from "../../../lib/supabaseClient";

export async function updateProject<T extends { id: number }>(
  project: T,
) {
  const { id, ...data } = project;

  const { error } = await supabase
    .from("projects")
    .update(data)
    .eq("id", id);

  if (error) {
    throw error;
  }
}
