'use client';

import EditableGrid from '../../../grid/EditableGrid';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  customer_name: string | null;
  expected_start_date: string | null;
}

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  // 親から更新イベントや一括変更を受け取るプロパティ（必要に応じて）
  onProjectsChange?: (newProjects: Project[]) => void;
}

export default function ProjectList({
  projects,
  loading,
  error,
  selectedId,
  onSelect,
  onProjectsChange,
}: ProjectListProps) {
  // 自作 EditableGrid 用の columns 定義に変換
  const columns = [
    { key: 'expected_start_date' as keyof Project, label: '予定開始日' },
    { key: 'customer' as keyof Project, label: '顧客コード' },
    { key: 'customer_name' as keyof Project, label: '顧客名' },
    { key: 'project_name' as keyof Project, label: '案件名' },
  ];

  if (loading) {
    return <div className="p-4">読込中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="h-full w-full">
      <EditableGrid<Project>
        data={projects}
        columns={columns}
        onChange={(updatedData) => {
          if (onProjectsChange) {
            onProjectsChange(updatedData);
          }
        }}
        selectedId={selectedId}
        onSelect={onSelect}
      />
    </div>
  );
}
