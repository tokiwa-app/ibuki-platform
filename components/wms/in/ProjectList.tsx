'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface Project {
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

interface ProjectListProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  refreshTrigger: number;
  projectType: string;
}

export default function ProjectList({
  selectedId,
  onSelect,
  refreshTrigger,
  projectType,
}: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      setError('');

      try {
        let query = supabase
          .from('projects')
          .select('*')
          .order('updated_at', { ascending: false });

        const normalizedProjectType = projectType?.trim();

        if (normalizedProjectType) {
          query = query.eq(
            'project_type',
            normalizedProjectType,
          );
        }

        const { data, error: supabaseError } =
          await query;

        if (supabaseError) {
          throw supabaseError;
        }

        setProjects(data ?? []);

        console.log('Projects:', data);
      } catch (err: unknown) {
        console.error(
          '案件一覧の取得に失敗しました',
          err,
        );

        setProjects([]);

        setError(
          err instanceof Error
            ? err.message
            : '案件一覧の取得に失敗しました',
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchProjects();
  }, [refreshTrigger, projectType]);

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: 6,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
          backgroundColor: '#fafafa',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 'bold',
          }}
        >
          {projectType}一覧
        </h3>

        <button
          type="button"
          onClick={() => onSelect(null)}
          style={{
            padding: '4px 8px',
            backgroundColor: '#2e7d32',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          ＋ 新規作成
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
        }}
      >
        {loading ? (
          <div
            style={{
              padding: 16,
              textAlign: 'center',
              color: '#666',
            }}
          >
            読込中...
          </div>
        ) : error ? (
          <div
            style={{
              padding: 16,
              textAlign: 'center',
              color: '#c62828',
            }}
          >
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div
            style={{
              padding: 16,
              textAlign: 'center',
              color: '#999',
            }}
          >
            案件がありません
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {projects.map((project) => {
              const isSelected =
                project.id === selectedId;

              return (
                <div
                  key={project.id}
                  onClick={() =>
                    onSelect(project.id)
                  }
                  style={{
                    padding: 12,
                    borderRadius: 4,
                    border: isSelected
                      ? '1.5px solid #2e7d32'
                      : '1px solid #e0e0e0',
                    backgroundColor: isSelected
                      ? '#e8f5e9'
                      : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold',
                        fontSize: 13,
                        color: isSelected
                          ? '#1b5e20'
                          : '#333',
                      }}
                    >
                      {project.project_name}
                    </span>

                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 11,
                        color: '#888',
                      }}
                    >
                      {project.expected_start_date ??
                        ''}
                    </span>
                  </div>

                  <div
                    style={{
                      marginBottom: 4,
                      fontSize: 11,
                      color: '#777',
                    }}
                  >
                    ERP Project ID:{' '}
                    <strong>
                      {project.erp_project_id ??
                        '未連携'}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      fontSize: 12,
                      color: '#555',
                    }}
                  >
                    <span
                      style={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      荷主:{' '}
                      <strong>
                        {project.customer ??
                          '未設定'}
                      </strong>
                    </span>

                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: 11,
                        color: '#777',
                      }}
                    >
                      {project.status ?? ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
