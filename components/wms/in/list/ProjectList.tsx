'use client';

import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  CellValueChangedEvent,
} from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { updateProjectField } from '../../../components/supabase/projects/updateProjectField';

interface Project {
  id: number;
  project_name: string;
  customer: string | null;
  expected_start_date: string | null;
}

interface ProjectListProps {
  projects: Project[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export default function ProjectList({
  projects,
  loading,
  error,
  selectedId,
  onSelect,
}: ProjectListProps) {
  const columnDefs: ColDef<Project>[] = [
    {
      field: 'expected_start_date',
      headerName: '予定開始日',
      width: 140,
      editable: true,
      valueFormatter: (params) => {
        if (!params.value) return '';

        return new Date(params.value)
          .toLocaleDateString('ja-JP');
      },
    },
    {
      field: 'customer',
      headerName: '顧客',
      width: 180,
      editable: true,
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

    try {
      await updateProjectField(
        event.data.id,
        field as keyof Project,
        event.newValue,
      );
    } catch (error) {
      console.error('保存失敗', error);

      // 保存失敗なら元の値へ戻す
      event.node.setDataValue(
        field,
        event.oldValue,
      );
    }
  }

  if (loading) {
    return <div style={{ padding: 16 }}>案件読込中...</div>;
  }

  if (error) {
    return (
      <div
        style={{
          padding: 16,
          color: '#c62828',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className="ag-theme-quartz"
      style={{
        height: '100%',
        width: '100%',
      }}
    >
      <AgGridReact<Project>
        rowData={projects}
        columnDefs={columnDefs}
        enableCellTextSelection
        enableRangeSelection
        copyHeadersToClipboard={false}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true,
        }}
        rowSelection="single"
        getRowId={(params) =>
          params.data.id.toString()
        }
        onRowClicked={(event) => {
          if (event.data) {
            onSelect(event.data.id);
          }
        }}
        onCellValueChanged={
          handleCellValueChanged
        }
        getRowClass={(params) =>
          params.data?.id === selectedId
            ? 'selected-row'
            : ''
        }
      />
    </div>
  );
}
