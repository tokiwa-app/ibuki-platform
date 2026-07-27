'use client';

import ProjectCard from './ProjectCard';
import ProjectCreateCard from './ProjectCreateCard';
import ProjectEditor from './ProjectEditor';
import { useProjects, Project } from '@/hooks/useProjects';
import { useState } from 'react';

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

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [isCreating, setIsCreating] =
    useState(false);

  function handleNew() {
    setSelectedProject(null);
    setIsCreating(true);
  }

  function handleSelect(project: Project) {
    setSelectedProject(project);
    setIsCreating(false);
  }

  function handleClose() {
    setSelectedProject(null);
    setIsCreating(false);
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: '#fff',
      }}
    >
      {/* 左 */}
      <div
        style={{
          width: 340,
          borderRight: '1px solid #eee',
          display: 'flex',
          flexDirection: 'column',
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
            gap: 6,
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
                selected={
                  selectedProject?.id === project.id
                }
                onClick={() =>
                  handleSelect(project)
                }
              />
            ))}

          <ProjectCreateCard
            projectType={projectType}
            onSave={saveProject}
            onClick={handleNew}
          />
        </div>
      </div>

      {/* 右 */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
        }}
      >
        <ProjectEditor
          projectType={projectType}
          project={selectedProject}
          isCreating={isCreating}
          onSave={saveProject}
          onDelete={deleteProject}
          onCancel={handleClose}
        />
      </div>
    </div>
  );
}
