'use client';

import { useState, useRef } from 'react';
import { ColDef, CellValueChangedEvent } from 'ag-grid-community';
import EditableGrid from '../../../grid/EditableGrid';
import { updateProject } from '../../../supabase/projects/updateProject';
import { supabase } from '../../../../lib/supabaseClient';

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
  
  const isDuplicatingRef = useRef(false);

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

  const handleDuplicate = async () => {
    if (!gridApi) return;

    gridApi.stopEditing();

    const selectedNodes = gridApi.getSelectedNodes();
    if (selectedNodes.length === 0) {
      alert('複製する行にチェックを入れてください。');
      return;
    }

    if (isDuplicatingRef.current) return;
    isDuplicatingRef.current = true;

    try {
      console.log('STEP 1: 処理開始');
      const targetIds = selectedNodes.map((node) => node.data.id);

      console.log('STEP 2: データ取得中', targetIds);
      const { data: originals, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .in('id', targetIds);

      if (fetchError || !originals || originals.length === 0) {
        throw new Error('複製元のデータが見つかりません');
      }

      console.log('STEP 3: データ加工中');
      const newRowsData = originals.map((original) => {
        const clone = { ...original };
        delete (clone as any).id;

        return {
          ...clone,
          project_name: `${original.project_name || ''} (コピー)`,
          updated_at: new Date().toISOString(),
        };
      });

      console.log('STEP 4: インサート中');
      const { data: insertedRows, error: insertError } = await supabase
        .from('projects')
        .insert(newRowsData)
        .select();

      if (insertError) {
        throw insertError;
      }

      if (!insertedRows || insertedRows.length === 0) {
        throw new Error('行の追加に失敗しました');
      }

      console.log('STEP 5: ステート更新');
      // 関数型アップデートを使わず、直接現在の projects に結合する
      setProjects([...projects, ...insertedRows]);
      console.log('STEP 6: 完了');

    } catch (error: any) {
      console.error('複製失敗詳細:', error);
      alert('複製に失敗しました: ' + (error.message || error));
    } finally {
      isDuplicatingRef.current = false;
    }
  };

  async function handleCellValueChanged(
    event: CellValueChangedEvent<Project>,
  ) {
    if (isDuplicatingRef.current) {
      return;
    }

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
          選択した行を複製して追加
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
