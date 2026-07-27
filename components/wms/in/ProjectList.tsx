'use client';

import ProjectCard from './ProjectCard';
import { useProjects } from '../../../hooks/useProjects';

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
          gridTemplateColumns:
            '70px 140px 120px 120px 1fr',
          gap: 8,
          padding: '8px',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#fafafa',
          fontSize: 12,
          fontWeight: 'bold',
        }}
      >
        <div>操作</div>
        <div>ERP Project ID</div>
        <div>開始予定日</div>
        <div>荷主</div>
        <div>プロジェクト名</div>
      </div>

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
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              projectType={projectType}
              onSave={saveProject}
            />
          ))}

        {/* 常時表示する新規行 */}
        <ProjectCard
          projectType={projectType}
          onSave={saveProject}
        />
      </div>
    </div>
  );
}
