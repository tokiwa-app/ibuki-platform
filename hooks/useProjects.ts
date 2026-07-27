'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Project {
  id: number;
  erp_project_id: string | null;
  project_name: string;
  project_type: string;
  customer: string | null;
  company: string | null;
  status: string | null;
  priority: string | null;
  expected_start_date: string | null;
  expected_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveProjectInput {
  id?: number;
  project_name: string;
  project_type: string;
  customer: string | null;
  company: string | null;
  status: string | null;
  priority: string | null;
  expected_start_date: string | null;
  expected_end_date: string | null;
}

export function useProjects(projectType: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (projectType.trim()) {
        query = query.eq('project_type', projectType.trim());
      }

      const { data, error } = await query;

      if (error) throw error;

      setProjects(data ?? []);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error ? e.message : '取得に失敗しました',
      );
    } finally {
      setLoading(false);
    }
  }, [projectType]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  async function saveProject(input: SaveProjectInput) {
    if (input.id) {
      const { error } = await supabase
        .from('projects')
        .update({
          project_name: input.project_name,
          project_type: input.project_type,
          customer: input.customer,
          company: input.company,
          status: input.status,
          priority: input.priority,
          expected_start_date:
            input.expected_start_date,
          expected_end_date:
            input.expected_end_date,
        })
        .eq('id', input.id);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('projects')
        .insert({
          project_name: input.project_name,
          project_type: input.project_type,
          customer: input.customer,
          company: input.company,
          status: input.status,
          priority: input.priority,
          expected_start_date:
            input.expected_start_date,
          expected_end_date:
            input.expected_end_date,
        });

      if (error) throw error;
    }

    await fetchProjects();
  }

  async function deleteProject(id: number) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await fetchProjects();
  }

  return {
    projects,
    loading,
    error,
    fetchProjects,
    saveProject,
    deleteProject,
  };
}
