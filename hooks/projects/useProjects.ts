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

import { syncERPProject } from './projectERP';

import type {
  Project,
  SaveProjectInput,
} from './projectTypes';

export type {
  Project,
  SaveProjectInput,
} from './projectTypes';

export function useProjects(projectType?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProjects(projectType);
      setProjects(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'プロジェクトの取得に失敗しました',
      );
    } finally {
      setLoading(false);
    }
  }, [projectType]);

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const saveProject = useCallback(
    async (input: SaveProjectInput) => {
      setError('');

      try {
        const project =
          input.id == null
            ? await insertProject(input)
            : await updateProject(input);

        await syncERPProject({
          id: project.id,
          project_name: project.project_name,
          status: project.status,
          priority: project.priority,
        });

        await fetchProjects();
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : 'プロジェクトの保存に失敗しました';

        setError(message);
        throw e;
      }
    },
    [fetchProjects],
  );

  return {
    projects,
    loading,
    error,
    fetchProjects,
    saveProject,
  };
}
