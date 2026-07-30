// components/supabase/projects/getProjects.ts

import { supabase } from "../../../lib/supabaseClient";

export async function getProjects(
  projectType?: string,
) {
  let query = supabase
    .from("projects")
    .select("*")
    .order("updated_at", {
      ascending: false,
    });

  if (projectType) {
    query = query.eq(
      "project_type",
      projectType,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}
