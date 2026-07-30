'use client';

import { useState } from 'react';
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
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>; // ★ データを増やすために必要です
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function ProjectList({
  projects,
  setProjects, // ★ 追加
  loading,
  error,
  selectedId,
  onSelect,
}: ProjectListProps) {
  const [gridApi, setGridApi] = useState<any>(null); // ★ 追加：グリッドのAPI保持用

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

  // ★ 追加：チェックされた行を複製して下に追加する処理
  const handleDuplicate = () => {
    if (!gridApi) return;

    const selectedNodes = gridApi.getSelectedNodes();
    if (selectedNodes.length === 0) {
      alert('複製する行にチェックを入れてください。');
      return;
    }

    setProjects((prevData) => {
      let newData = [...prevData];

      // 下の行から順番に処理するとインデックスがズレにくい
      const sortedNodes = [...selectedNodes].sort((a, b) => b.rowIndex - b.rowIndex);

      sortedNodes.forEach((node) => {
        const originalRow = node.data;
        const index = newData.findIndex((row) => row.id === originalRow.id);

        if (index !== -1) {
          // 新しい行データを作成（IDの重複を防ぐため一時的なユニークIDを付与）
          const duplicatedRow: Project = {
            ...originalRow,
            id: Date.now() + Math.random(), // 実際の保存時にDB側で発番されるまでの仮ID
            project_name: `${originalRow.project_name} (コピー)`,
          };

          // 元の行のすぐ下（index + 1）に挿入
          newData.splice(index + 1, 0, duplicatedRow);
        }
      });

      return newData;
    });
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
      {/* ★ 追加：複製ボタンの配置 */}
      <div style={{ marginBottom: '8px' }}>
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
          onGridReady={(params) => setGridApi(params.api)} // ★ 追加：APIを受け取る
        />
      </div>
    </div>
  );
}
