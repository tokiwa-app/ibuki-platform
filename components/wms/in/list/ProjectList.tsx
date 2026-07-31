'use client';

import { useState } from 'react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import EditableGrid from '../../../grid/EditableGrid';
import { updateProject } from '../../../supabase/projects/updateProject';
import { supabase } from '../../../lib/supabaseClient'; // 画面内で直接Supabaseを叩くためインポート

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

  // 選択された行を複製してSupabaseに追加し、画面に即時反映する処理
  const handleDuplicate = async () => {
    if (!gridApi) return;

    const selectedNodes = gridApi.getSelectedNodes();
    if (selectedNodes.length === 0) {
      alert('複製する行にチェックを入れてください。');
      return;
    }

    try {
      const targetId = selectedNodes[0].data.id;

      // 1. 元のデータを取得
      const { data: original, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', targetId)
        .single();

      if (fetchError || !original) {
        throw new Error('複製元のデータが見つかりません');
      }

      // 2. idを除外してコピー用データを作成
      const { id: _, ...rest } = original;
      const newRowData = {
        ...rest,
        project_name: `${original.project_name || ''} (コピー)`,
        updated_at: new Date().toISOString(),
      };

      // 3. Supabaseにインサートして新しい行データを取得
      const { data: newRow, error: insertError } = await supabase
        .from('projects')
        .insert([newRowData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // 4. フロント側のstate（projects配列）を更新して画面に即座に反映
      setProjects((prevData) => {
        let newData = [...prevData];
        const index = newData.findIndex((row) => row.id === targetId);

        if (index !== -1) {
          newData.splice(index + 1, 0, newRow);
        } else {
          newData.push(newRow);
        }

        return newData;
      });

    } catch (error: any) {
      console.error('複製失敗', error);
      alert('複製に失敗しました: ' + (error.message || error));
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
          選択した行を複製して下に追加
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
