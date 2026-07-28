'use client';

import ProjectCard from './ProjectCard';
import { useProjects } from '../../../hooks/projects/useProjects';


export default function ProjectList() {

  const {
    projects,
    loading,
    error,
    saveProject,
  } = useProjects();


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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '70px 120px 120px 1fr',
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
        <div>プロジェクト名</div>
      </div>


      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >

        {loading && (
          <div style={{ padding:12 }}>
            読込中...
          </div>
        )}


        {error && (
          <div
            style={{
              padding:12,
              color:'#c62828',
            }}
          >
            {error}
          </div>
        )}



        {!loading &&
          projects.map((project)=>(
            <ProjectCard
              key={project.id}
              project={project}
              onSave={saveProject}
            />
          ))}



        <ProjectCard
          onSave={saveProject}
        />

      </div>

    </div>
  );
}
