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
  
  // 複製処理中であることを示すフラグ（不要なイベントの暴発を防ぐため）
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

  // 選択された行のID配列を渡して一括複製し、画面を更新する処理
  const handleDuplicate = async () => {
    if (!gridApi) return;

    // 現在のセルの編集を強制終了してフォーカスを外す
    gridApi.stopEditing();

    const selectedNodes = gridApi.getSelectedNodes();
    if (selectedNodes.length === 0) {
      alert('複製する行にチェックを入れてください。');
      return;
    }

    if (isDuplicatingRef.current) return;
    isDuplicatingRef.current = true;

    try {
      // 1. 選択された行のIDを配列として抽出
      const targetIds = selectedNodes.map((node) => node.data.id);

      // 2. 指定された複数のIDの元データを取得
      const { data: originals, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .in('id', targetIds);

      if (fetchError || !originals || originals.length === 0) {
        throw new Error('複製元のデータが見つかりません');
      }

      // 3. 各データの id を除外して、(コピー) を付与した新しいデータの配列を作る
      const newRowsData = originals.map((original) => {
        const clone = { ...original };
        delete (clone as any).id;

        return {
          ...clone,
          project_name: `${original.project_name || ''} (コピー)`,
          updated_at: new Date().toISOString(),
        };
      });

      // 4. 新しいデータをインサートする
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

      // 5. フロント側のstateを更新
      setProjects((prevData) => [...prevData, ...insertedRows]);

    } catch (error: any) {
      console.error('複製失敗', error);
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
