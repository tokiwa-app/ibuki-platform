'use client';

import { useState } from 'react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import EditableGrid from '../../../grid/EditableGrid';
import { updateProject } from '../../../supabase/projects/updateProject';
import { insertProject } from '../../../supabase/projects/insertProject'; // ★ 追加：インサート用関数

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

  // 選択された行を複製して画面上に追加する処理
  const handleDuplicate = () => {
    if (!gridApi) return;

    const selectedNodes = gridApi.getSelectedNodes();
    if (selectedNodes.length === 0) {
      alert('複製する行にチェックを入れてください。');
      return;
    }

    setProjects((prevData) => {
      let newData = [...prevData];
      const sortedNodes = [...selectedNodes].sort((a, b) => b.rowIndex - b.rowIndex);

      sortedNodes.forEach((node) => {
        const originalRow = node.data;
        const index = newData.findIndex((row) => row.id === originalRow.id);

        if (index !== -1) {
          const duplicatedRow: Project = {
            ...originalRow,
            id: Date.now() + Math.random(), // 仮ID
            project_name: `${originalRow.project_name} (コピー)`,
          };

          newData.splice(index + 1, 0, duplicatedRow);
        }
      });

      return newData;
    });
  };

  // ★ 追加：選択した行をSupabaseに新規追加（インサート）する処理
  const handleInsertToSupabase = async () => {
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows();
    if (selectedRows.length === 0) {
      alert('Supabaseに追加する行にチェックを入れてください。');
      return;
    }

    try {
      // 選択された行の先頭（または複数対応ならループ）をインサート
      // ※仮ID（Date.nowなど）が含まれているとDB側でエラーになる場合は除外するか、DB側の自動採番に任せます
      const targetRow = selectedRows[0];
      
      // IDを外す（データベース側で自動採番される場合）
      const { id, ...dataToInsert } = targetRow;

      await insertProject(dataToInsert);

      alert('Supabaseにデータを追加しました！');
      // 必要に応じてデータを再取得・更新する処理をここに挟むとより確実です
    } catch (error: any) {
      console.error('追加失敗', error);
      alert('追加に失敗しました: ' + error.message);
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
      {/* ボタンエリア */}
      <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
        <button onClick={handleDuplicate} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          選択した行を複製して下に追加
        </button>
        {/* ★ 追加：Supabase追加ボタン */}
        <button onClick={handleInsertToSupabase} style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#e0f2fe' }}>
          選択した行をSupabaseに追加
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
