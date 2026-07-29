'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  company: string | null;
  project_type: string | null;
  status: string | null;
  priority: string | null;
  expected_start_date: string | null;
  expected_end_date: string | null;
  percent_complete: number | null;
}

interface ProjectListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;

  // 入庫案件、出庫案件など画面側から指定
  projectType?: string;

  refreshTrigger?: number;
}

export default function ProjectList({
  selectedId,
  onSelect,
  projectType,
  refreshTrigger,
}: ProjectListProps) {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError('');

      try {
        let query = supabase
          .from('projects')
          .select(`
            id,
            project_name,
            customer,
            company,
            project_type,
            status,
            priority,
            expected_start_date,
            expected_end_date,
            percent_complete
          `)
          .order(
            'updated_at',
            {
              ascending: false,
            },
          );


        if (projectType) {
          query = query.eq(
            'project_type',
            projectType,
          );
        }


        const {
          data,
          error,
        } = await query;


        if (error) {
          throw error;
        }


        setProjects(
          data ?? [],
        );

      } catch (e) {

        console.error(
          'プロジェクト取得失敗',
          e,
        );

        setProjects([]);

        setError(
          e instanceof Error
            ? e.message
            : 'プロジェクト取得失敗',
        );

      } finally {

        setLoading(false);

      }
    }


    void fetchProjects();

  }, [
    projectType,
    refreshTrigger,
  ]);


  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      <div
        style={{
          padding: 12,
          borderBottom:
            '1px solid #ddd',
          fontSize: 14,
          fontWeight: 'bold',
          backgroundColor: '#fafafa',
        }}
      >
        {projectType ?? 'プロジェクト'}一覧
      </div>


      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >

        {loading && (
          <div style={{ padding: 12 }}>
            読込中...
          </div>
        )}


        {error && (
          <div
            style={{
              padding: 12,
              color: '#c62828',
            }}
          >
            {error}
          </div>
        )}


        {!loading &&
          projects.map((project) => {

            const selected =
              project.id === selectedId;


            return (
              <div
                key={project.id}
                onClick={() =>
                  onSelect(project.id)
                }
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '100px 120px 120px 1fr',
                  gap: 8,
                  padding:
                    '10px 12px',
                  borderBottom:
                    '1px solid #eee',
                  cursor: 'pointer',
                  backgroundColor:
                    selected
                      ? '#e8f5e9'
                      : '#fff',
                }}
              >

                <div>
                  {project.status ?? '-'}
                </div>


                <div>
                  {project.customer ?? '-'}
                </div>


                <div>
                  {project.company ?? '-'}
                </div>


                <div
                  style={{
                    fontWeight: 'bold',
                  }}
                >
                  {project.project_name}
                </div>

              </div>
            );
          })}


        {!loading &&
          !error &&
          projects.length === 0 && (
            <div
              style={{
                padding: 12,
                color: '#777',
              }}
            >
              案件がありません
            </div>
          )}

      </div>
    </div>
  );
}
