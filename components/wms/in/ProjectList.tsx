'use client';

import ProjectCard from './ProjectCard';
import ProjectCreateCard from './ProjectCreateCard';
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
    deleteProject,
  } = useProjects(projectType);

  return (
    <div
      style={{
        width: 340,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: '1px solid #eee',
          fontWeight: 'bold',
        }}
      >
        {projectType}一覧
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {loading && <div>読込中...</div>}

        {error && (
          <div style={{ color: 'red' }}>
            {error}
          </div>
        )}

        {!loading &&
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSave={saveProject}
              onDelete={deleteProject}
            />
          ))}

        <ProjectCreateCard
          projectType={projectType}
          onSave={saveProject}
        />
      </div>
    </div>
  );
}
