'use client';

import { useState, useEffect } from 'react';
import { updateProject } from '../../../supabase/projects/updateProject';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  customer_name: string | null;
  expected_start_date: string | null;
}

interface ProjectListProps {
  initialProjects: Project[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function ProjectList({
  initialProjects,
  loading,
  error,
  selectedId,
  onSelect,
}: ProjectListProps) {
  // すべての Hooks はコンポーネントの最上部で一貫して呼び出す
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  // 入力値変更時のハンドラー
  const handleInputChange = async (id: number, field: keyof Project, value: string) => {
    const updatedProjects = [...projects];
    const targetIndex = updatedProjects.findIndex((p) => p.id === id);
    if (targetIndex === -1) return;

    const updatedRow = { ...updatedProjects[targetIndex], [field]: value };
    updatedProjects[targetIndex] = updatedRow;
    setProjects(updatedProjects);

    // 顧客コード変更時の外部API連携
    if (field === 'customer') {
      try {
        const res = await fetch(`/api/erpnext/customer/${encodeURIComponent(value)}`);
        if (res.ok) {
          const customer = await res.json();
          updatedRow.customer_name = customer.customer_name;
          setProjects([...updatedProjects]);
        }
      } catch (err) {
        console.error('顧客情報の取得に失敗しました', err);
      }
    }

    // DB（Supabase）の更新
    try {
      await updateProject(updatedRow);
    } catch (err) {
      console.error('プロジェクトの保存に失敗しました', err);
    }
  };

  // 条件分岐による早期リターンはすべての Hooks 宣言のあとに記述する
  if (loading) {
    return <div className="p-4 text-gray-500">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full border-collapse text-left text-sm text-gray-700">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="p-3 font-semibold">予定開始日</th>
            <th className="p-3 font-semibold">顧客コード</th>
            <th className="p-3 font-semibold">顧客名</th>
            <th className="p-3 font-semibold">案件名</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const isSelected = project.id === selectedId;
            return (
              <tr
                key={project.id}
                onClick={() => onSelect(project.id)}
                className={`border-b border-gray-100 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="p-2">
                  <input
                    type="date"
                    value={project.expected_start_date ? project.expected_start_date.split('T')[0] : ''}
                    onChange={(e) => handleInputChange(project.id, 'expected_start_date', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded bg-white"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={project.customer || ''}
                    onChange={(e) => handleInputChange(project.id, 'customer', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded bg-white"
                  />
                </td>
                <td className="p-2 text-gray-500">
                  {project.customer_name || '-'}
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={project.project_name || ''}
                    onChange={(e) => handleInputChange(project.id, 'project_name', e.target.value)}
                    className="w-full p-1 border border-gray-300 rounded bg-white"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
