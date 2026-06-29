'use client';

import DataGrid from '../../../components/platform/grid/DataGrid';

const columns = [
  { field: 'name', headerName: 'Customer', width: 140 },
  { field: 'customer_name', headerName: 'Customer Name', flex: 1 },
  { field: 'customer_group', headerName: 'Customer Group', width: 180 },
  { field: 'territory', headerName: 'Territory', width: 140 },
];

export default function CustomerPage() {
  return (
    <DataGrid
      title="Customer"
      endpoint="/api/erpnext/Customer"
      columns={columns}
      editPath={(row) => `/masters/Customer/${row.name}`}
    />
  );
}
