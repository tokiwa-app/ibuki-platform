'use client';

import { useState } from 'react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import EditableGrid from '../../../grid/EditableGrid';
import { updateProject } from '../../../supabase/projects/updateProject';
import { insertProject } from '../../../supabase/projects/insertProject';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  customer_name: string | null;
  expected_start_date: string | null;
}

interface ProjectListProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function ProjectList({
  projects,
  setProjects,
  loading,
  error,
  selectedId,
  onSelect,
}: ProjectListProps) {
  const [gridApi, setGridApi] = useState<any>(null);

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

  // ★ 修正：AG Gridから選択行のデータ（またはIDを元にしたデータ）を取得してSupabaseに追加する処理
  const handleDuplicate = async () => {
    if (!gridApi) return;

    const selectedNodes = gridApi.getSelectedNodes();
    if (selectedNodes.length === 0) {
      alert('複製する行にチェックを入れてください。');
      return;
    }

    try {
      const originalRow = selectedNodes[0].data;

      // 複製用のデータオブジェクトを作成（idは自動採番させるため除外）
      const { id, ...dataToInsert } = originalRow;
      const newProjectData = {
        ...dataToInsert,
        project_name: `${originalRow.project_name || ''} (コピー)`,
      };

      // Supabaseにインサート
      await insertProject(newProjectData);

      alert('Supabaseへの複製・追加が完了しました！ページを再読み込みしてください。');
      // ※必要に応じてここでprojectsリストの再取得などを呼び出してください
    } catch (error: any) {
      console.error('複製失敗', error);
      alert('複製に失敗しました: ' + error.message);
    }
  };

  async function handleCellValueChanged(
    event: CellValueChangedEvent<Project>,
  ) {
    if (!event.data) return;

    const field = event.colDef.field;
    if (!field) return;

    if (event.oldValue === event.newValue) {
      return;
    }

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
        event.data.customer_name = customer.customer_name;

        event.api.refreshCells({
          rowNodes: [event.node],
          columns: ['customer_name'],
        });
      } catch (error) {
        console.error(error);

        event.node.setDataValue('customer', event.oldValue);
        event.data.customer_name = null;

        event.api.refreshCells({
          rowNodes: [event.node],
          columns: ['customer_name'],
        });

        return;
      }
    }

    try {
      await updateProject(event.data);
    } catch (error) {
      console.error('保存失敗', error);
      event.node.setDataValue(field, event.oldValue);
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
        <button onClick={handleDuplicate} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          選択した行を複製してSupabaseに追加
        </button>
      </div>

      <div style={{ flex: 1 }}>
        <EditableGrid<Project>
          rowData={projects}
          columnDefs={columnDefs}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={onSelect}
          onCellValueChanged={handleCellValueChanged}
          getRowId={(params) => params.data.id.toString()}
          onGridReady={(params) => setGridApi(params.api)}
        />
      </div>
    </div>
  );
}
