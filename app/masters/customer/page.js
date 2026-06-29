'use client';

import { useState } from 'react';
import DataGrid from '../../../components/platform/grid/DataGrid';

const columns = [
  { field: 'name', headerName: 'Customer', width: 140 },
  { field: 'customer_name', headerName: 'Customer Name', flex: 1 },
  { field: 'customer_group', headerName: 'Customer Group', width: 180 },
  { field: 'territory', headerName: 'Territory', width: 140 },
];

export default function CustomerPage() {
  const [keyword, setKeyword] = useState('');

  return (
    <main style={{ padding: 32 }}>
      <h1>Customer</h1>

      <div style={{ marginBottom: 16 }}>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Customerコード・顧客名"
          style={{
            width: 300,
            padding: 8,
            border: '1px solid #ccc',
            borderRadius: 6,
          }}
        />
      </div>

      <DataGrid
        endpoint={`/api/erpnext/customer?q=${encodeURIComponent(keyword)}`}
        columns={columns}
        editPath={(row) => `/masters/customer/${row.name}`}
      />
    </main>
  );
}
