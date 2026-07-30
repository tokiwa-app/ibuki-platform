'use client';

import { useState, useEffect, useCallback } from 'react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import EditableGrid from '../../../grid/EditableGrid';
import { updateProject } from '../../../supabase/projects/updateProject';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  customer_name: string | null;
  expected_start_date: string | null;
  project_type?: string | null;
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
  loading: initialLoading,
  error: initialError,
  selectedId,
  onSelect,
}: ProjectListProps) {
  // 1. すべての Hooks はコンポーネントのトップレベルで確実に同じ順序で呼び出す
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [loading, setLoading] = useState<boolean>(initialLoading);
  const [error, setError] = useState<string>(initialError);

  // props の変更をステートに同期
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  useEffect(() => {
    setLoading(initialLoading);
  }, [initialLoading]);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  // カラム定義
  const columnDefs: ColDef<Project>[] = [
    {
      field: 'expected_start_date',
      headerName: '予定開始日',
      width: 140,
      editable: true,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString('ja-JP');
      },
    },
    {
      field: 'customer',
      headerName: '顧客コード',
      width: 180,
      editable: true,
    },
    {
      field: 'customer_name',
      headerName: '顧客名',
      width: 250,
      editable: false,
    },
    {
      field: 'project_name',
      headerName: '案件名',
      flex: 1,
      editable: true,
    },
  ];

  // セル値変更時のハンドラー
  const handleCellValueChanged = useCallback(
    async (event: CellValueChangedEvent<Project>) => {
      if (!event.data) return;

      const field = event.colDef.field;
      if (!field) return;

      if (event.oldValue === event.newValue) {
        return;
      }

      const updatedProjects = [...projects];
      const targetIndex = updatedProjects.findIndex((p) => p.id === event.data!.id);
      if (targetIndex === -1) return;

      const updatedRow = { ...updatedProjects[targetIndex] };
      updatedRow[field as keyof Project] = event.newValue;

      // 顧客コード変更時の追加フェッチ
      if (field === 'customer') {
        try {
          const res = await fetch(
            `/api/erpnext/customer/${encodeURIComponent(
              String(event.newValue),
            )}`,
          );

          if (!res.ok) {
            throw new Error('顧客が見つかりません');
          }

          const customer = await res.json();
          updatedRow.customer_name = customer.customer_name;
        } catch (err) {
          console.error(err);
          updatedRow.customer = event.oldValue;
          updatedRow.customer_name = null;
          updatedProjects[targetIndex] = updatedRow;
          setProjects(updatedProjects);
          return;
        }
      }

      try {
        await updateProject(updatedRow);
        updatedProjects[targetIndex] = updatedRow;
        setProjects(updatedProjects);
      } catch (err) {
        console.error('保存失敗', err);
        updatedRow[field as keyof Project] = event.oldValue;
        updatedProjects[targetIndex] = updatedRow;
        setProjects(updatedProjects);
      }
    },
    [projects]
  );

  // ❌ 早期リターン（if文での条件分岐）は「すべての Hooks の宣言が終わった後」に記述する
  if (loading) {
    return <div className="p-4 text-gray-500">読み込み中...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">エラー: {error}</div>;
  }

  return (
    <div className="w-full h-full">
      <EditableGrid<Project>
        rowData={projects}
        columnDefs={columnDefs}
        loading={loading}
        error={error}
        selectedId={selectedId}
        onSelect={onSelect}
        onCellValueChanged={handleCellValueChanged}
        getRowId={(params) => params.data.id.toString()}
      />
    </div>
  );
}
