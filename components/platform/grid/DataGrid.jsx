'use client';

import { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function DataGrid({ title, endpoint, columns }) {
  const [rows, setRows] = useState([]);

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
      <h1>{title}</h1>

      <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          rowData={rows}
          columnDefs={columns}
          pagination={true}
          paginationPageSize={50}
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
