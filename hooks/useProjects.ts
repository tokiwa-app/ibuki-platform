'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Project {
  id: number;
  erp_project_id: string | null;
  project_name: string;
  customer: string | null;
  company: string | null;
  project_type: string;
  status: string | null;
  priority: string | null;
  expected_start_date: string | null;
  expected_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  percent_complete: number | null;
  collect_progress: boolean | null;
  notes: string | null;
  is_active: boolean | null;
  erp_sync_status: string | null;
  erp_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaveProjectInput {
  id?: number;
  erp_project_id?: string | null;
  project_name: string;
  customer: string | null;
  company: string | null;
  project_type: string;
  status: string | null;
  priority: string | null;
  expected_start_date: string | null;
  expected_end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  percent_complete: number | null;
  collect_progress: boolean | null;
  notes: string | null;
  is_active: boolean | null;
  erp_sync_status: string | null;
  erp_synced_at: string | null;
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

      setProjects((data ?? []) as Project[]);
    } catch (e) {
      console.error(e);
      setError(
        e instanceof Error
          ? e.message
          : '取得に失敗しました'
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
          erp_project_id: input.erp_project_id,
          project_name: input.project_name,
          customer: input.customer,
          company: input.company,
          project_type: input.project_type,
          status: input.status,
          priority: input.priority,
          expected_start_date: input.expected_start_date,
          expected_end_date: input.expected_end_date,
          actual_start_date: input.actual_start_date,
          actual_end_date: input.actual_end_date,
          percent_complete: input.percent_complete,
          collect_progress: input.collect_progress,
          notes: input.notes,
          is_active: input.is_active,
          erp_sync_status: input.erp_sync_status,
          erp_synced_at: input.erp_synced_at,
        })
        .eq('id', input.id);

      if (error) throw error;
} else {
  // ERPNextへ新規Project作成
  const { data, error } =
    await supabase.functions.invoke(
      'sync-project',
      {
        body: {
          project_name:
            input.project_name,
        },
      }
    );


  if (error) {
    throw error;
  }


  const erpProjectId =
    data?.data?.name ?? null;


  // ERP ID取得後にSupabase保存
  const { error: insertError } =
    await supabase
      .from('projects')
      .insert({
        erp_project_id:
          erpProjectId,

        project_name:
          input.project_name,

        customer:
          input.customer,

        company:
          input.company,

        project_type:
          input.project_type,

        status:
          data?.data?.status ??
          input.status,

        priority:
          data?.data?.priority ??
          input.priority,

        expected_start_date:
          input.expected_start_date,

        expected_end_date:
          input.expected_end_date,

        actual_start_date:
          input.actual_start_date,

        actual_end_date:
          input.actual_end_date,

        percent_complete:
          input.percent_complete ?? 0,

        collect_progress:
          input.collect_progress ?? false,

        notes:
          input.notes,

        is_active:
          input.is_active ?? true,

        erp_sync_status:
          'synced',

        erp_synced_at:
          new Date().toISOString(),
      });


  if (insertError) {
    throw insertError;
  }
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
