import { supabase } from "../../../lib/supabaseClient";

export async function insertProject<T>(project: T) {
  const { error } = await supabase
    .from("projects")
    .insert([project]);

  if (error) {
    throw error;
  }
}
