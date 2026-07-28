components/wms/in/Detail/ProjectDetail.tsx'use client';

interface ProjectDetailProps {
  projectId: number | null;
}

export default function ProjectDetail({
  projectId,
}: ProjectDetailProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: 16,
        backgroundColor: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: 16,
          fontSize: 18,
        }}
      >
        プロジェクト明細
      </h2>

      <div>Project ID : {projectId ?? '-'}</div>
    </div>
  );
}
