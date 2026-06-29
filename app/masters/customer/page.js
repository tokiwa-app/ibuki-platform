'use client';

import DataGrid from '../../../../components/platform/grid/DataGrid';

const columns = [
  { field: 'name', headerName: '顧客コード', width: 140 },
  { field: 'customer_name', headerName: '顧客名', flex: 1 },
  { field: 'customer_group', headerName: '顧客グループ', width: 180 },
  { field: 'territory', headerName: '地域', width: 140 },
];

export default function CustomerMasterPage() {
  return (
    <DataGrid
      title="顧客マスター"
      endpoint="/api/erpnext/customer"
      columns={columns}
    />
  );
}
