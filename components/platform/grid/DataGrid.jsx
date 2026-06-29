'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function DataGrid({
  title,
  endpoint,
  columns,
  editPath,
}) {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(endpoint);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : data.data || []);
    }

    load();
  }, [endpoint]);

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 20 }}>{title}</h1>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <button>＋新規</button>

        <button
          disabled={!selected}
          onClick={() => router.push(editPath(selected))}
        >
          編集
        </button>

        <button disabled={!selected}>削除</button>
      </div>

      <div
        className="ag-theme-quartz"
        style={{ height: 600, width: '100%' }}
      >
        <AgGridReact
          rowData={rows}
          columnDefs={columns}
          rowSelection="single"
          pagination
          paginationPageSize={50}
          onSelectionChanged={(e) => {
            const row = e.api.getSelectedRows()[0];
            setSelected(row || null);
          }}
          onRowDoubleClicked={(e) => {
            if (editPath) {
              router.push(editPath(e.data));
            }
          }}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            editable: false,
          }}
        />
      </div>
    </main>
  );
}
