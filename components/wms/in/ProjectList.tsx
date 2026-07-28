'use client';

import ProjectCard from './ProjectCard';
import { useProjects } from '../../../hooks/projects/useProjects';

interface ProjectListProps {
  projectType: string;
}

export default function ProjectList({
  projectType,
}: ProjectListProps) {
  const {
    projects,
    loading,
    error,
    saveProject,
  } = useProjects(projectType);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px 120px 120px 120px 1fr',
          gap: 8,
          padding: '8px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fafafa',
          fontSize: 12,
          fontWeight: 'bold',
        }}
      >
        <div>操作</div>
        <div>開始予定日</div>
        <div>荷主</div>
        <div>会社</div>
        <div>プロジェクト名</div>
      </div>

      {/* 一覧 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {loading && (
          <div
            style={{
              padding: 12,
            }}
          >
            読込中...
          </div>
        )}

        {!loading && error && (
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
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              projectType={projectType}
              onSave={saveProject}
            />
          ))}

        {!loading && !error && (
          <ProjectCard
            projectType={projectType}
            onSave={saveProject}
          />
        )}

        {!loading && !error && projects.length === 0 && (
          <div
            style={{
              padding: 12,
              color: '#777',
              fontSize: 12,
            }}
          >
            登録済みのプロジェクトはありません。
            下の入力欄から新規登録できます。
          </div>
        )}
      </div>
    </div>
  );
}
