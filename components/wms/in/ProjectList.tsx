'use client';

import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';

import {
  ColDef,
  GridApi,
  CellValueChangedEvent,
} from 'ag-grid-community';

import { useProjects } from '../../../hooks/projects/useProjects';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface ProjectListProps {
  projectType: string;
  onSelectProjectId: (projectId: number) => void;
}

export default function ProjectList({
  projectType,
  onSelectProjectId,
}: ProjectListProps) {
  const {
    projects,
    loading,
    error,
    saveProject,
  } = useProjects(projectType);

  const gridApiRef = useRef<GridApi | null>(null);

  const columnDefs = useMemo<
    ColDef[]
  >(
    () => [
      {
        headerName: '開始予定日',
        field: 'expected_start_date',
        editable: true,
        width: 130,
      },
      {
        headerName: '荷主',
        field: 'customer',
        editable: true,
        width: 160,
      },
      {
        headerName: '会社',
        field: 'company',
        editable: true,
        width: 160,
      },
      {
        headerName: 'プロジェクト名',
        field: 'project_name',
        editable: true,
        flex: 1,
      },
      {
        headerName: '状態',
        field: 'status',
        editable: true,
        width: 120,
      },
      {
        headerName: 'ERP ID',
        field: 'erp_project_id',
        width: 150,
      },
    ],
    [],
  );

  async function handleCellChanged(
    event: CellValueChangedEvent,
  ) {
    if (!event.data?.id) {
      return;
    }

    await saveProject(event.data);
  }

  function handleRowClicked(event: any) {
    if (event.data?.id) {
      onSelectProjectId(event.data.id);
    }
  }

  function handleGridReady(params: any) {
    gridApiRef.current = params.api;
  }

  function addNewRow() {
    const newRow = {
      project_name: '新規プロジェクト',
      project_type: projectType,
      customer: '',
      company: '',
      status: 'Open',
      priority: null,
      expected_start_date: null,
      expected_end_date: null,
      is_active: true,
    };

    gridApiRef.current?.applyTransaction({
      add: [newRow],
      addIndex: projects.length,
    });
  }

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        読込中...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: 20,
          color: '#c62828',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
      }}
    >
      <div
        style={{
          padding: 8,
          borderBottom: '1px solid #ddd',
        }}
      >
        <button
          onClick={addNewRow}
          style={{
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          ＋ 新規を追加
        </button>
      </div>

      <div
        className="ag-theme-alpine"
        style={{
          flex: 1,
          width: '100%',
        }}
      >
        <AgGridReact
          rowData={projects}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            sortable: true,
            editable: false,
          }}
          rowSelection="single"
          onGridReady={handleGridReady}
          onCellValueChanged={
            handleCellChanged
          }
          onRowClicked={handleRowClicked}
          animateRows
        />
      </div>
    </div>
  );
}
