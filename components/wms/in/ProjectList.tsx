'use client';

import ProjectCard from './ProjectCard';
import ProjectCreateCard from './ProjectCreateCard';
import { useProjects } from '../../../hooks/useProjects';

interface ProjectListProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  projectType: string;
}

export default function ProjectList({
  selectedId,
  onSelect,
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
            }}
          >
            読込中...
          </div>
        ) : error ? (
          <div
            style={{
              padding: 16,
              color: '#c62828',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                selected={project.id === selectedId}
                onClick={() => onSelect(project.id)}
              />
            ))}

            <ProjectCreateCard
              projectType={projectType}
              onSave={saveProject}
            />
          </div>
        )}
      </div>
    </div>
  );
}
