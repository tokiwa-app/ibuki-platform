'use client';

import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import EditableGrid from '../../../grid/EditableGrid';
import { updateProject } from '../../../supabase/projects/updateProject';

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
  // データ全体を更新するためのコールバックを親から受け取る想定
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

  async function handleCellValueChanged(
    event: CellValueChangedEvent<Project>,
  ) {
    if (!event.data) return;

    const field = event.colDef.field;
    if (!field) return;

    if (event.oldValue === event.newValue) {
      return;
    }

    let updatedProjects = [...projects];
    const targetIndex = updatedProjects.findIndex((p) => p.id === event.data!.id);
    if (targetIndex === -1) return;

    // データのコピーを作成
    const updatedRow = { ...updatedProjects[targetIndex] };
    updatedRow[field as keyof Project] = event.newValue;

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
      } catch (error) {
        console.error(error);
        // エラー時は元の値に戻す
        updatedRow.customer = event.oldValue;
        updatedRow.customer_name = null;
        
        updatedProjects[targetIndex] = updatedRow;
        if (onProjectsChange) onProjectsChange(updatedProjects);
        return;
      }
    }

    try {
      await updateProject(updatedRow);
      updatedProjects[targetIndex] = updatedRow;
      if (onProjectsChange) onProjectsChange(updatedProjects);
    } catch (error) {
      console.error('保存失敗', error);
      // 失敗時は元の値に戻す
      updatedRow[field as keyof Project] = event.oldValue;
      updatedProjects[targetIndex] = updatedRow;
      if (onProjectsChange) onProjectsChange(updatedProjects);
    }
  }

  return (
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
  );
}
