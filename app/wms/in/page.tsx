'use client';

import { useEffect, useState } from 'react';

import MasterDetailLayout from '../../../components/layout/MasterDetailLayout';
import ProjectList from '../../../components/wms/in/list/ProjectList';
import ProjectDetail from '../../../components/wms/in/Detail/ProjectDetail';

import { getProjects } from '../../../components/supabase/projects/getProjects';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  company: string | null;
  status: string | null;
}

export default function PurchaseReceiptPage() {

  const [projectId, setProjectId] =
    useState<number | null>(null);

  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {

    async function fetchProjects() {

      setLoading(true);
      setError("");

      try {

        const data =
          await getProjects("入庫案件");

        setProjects(data);

      } catch (e) {

        setProjects([]);

        setError(
          e instanceof Error
            ? e.message
            : "取得失敗"
        );

      } finally {

        setLoading(false);

      }
    }

    void fetchProjects();

  }, []);

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <MasterDetailLayout
        title="入庫管理"
        titleBackground="#2e7d32"
        titleColor="#fff"

        headerRight={
          <button
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #fff',
              backgroundColor: 'transparent',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            取引先コード 🔍
          </button>
        }

        left={
          <ProjectList
            projects={projects}
            setProjects={setProjects} {/* ★ ここを追加しました */}
            loading={loading}
            error={error}
            selectedId={projectId}
            onSelect={setProjectId}
          />
        }

        right={
          <ProjectDetail
            projectId={projectId}
          />
        }
      />
    </main>
  );
}
