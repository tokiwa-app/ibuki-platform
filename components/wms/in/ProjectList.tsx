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
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '70px 120px 120px 1fr',
          gap: 8,
          padding: '8px 12px',
          fontWeight: 'bold',
          borderBottom: '1px solid #ddd',
        }}
      >
        <div>操作</div>
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
        {loading && <div>読込中...</div>}

        {error && (
          <div style={{ color: 'red', padding: 8 }}>
            {error}
          </div>
        )}

        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            projectType={projectType}
            onSave={saveProject}
          />
        ))}

        {/* 常に表示する新規入力行 */}
        <ProjectCard
          projectType={projectType}
          onSave={saveProject}
        />
      </div>
    </div>
  );
}
