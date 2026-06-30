'use client';

import { useState } from 'react';
import DataGrid from '../../components/platform/grid/DataGrid';
import SearchBar from '../../components/platform/search/SearchBar';
import TextSearch from '../../components/platform/search/TextSearch';

const columns = [
  { field: 'name', headerName: 'Delivery Note', width: 180 },
  { field: 'customer', headerName: '荷主', width: 180 },
  { field: 'customer_name', headerName: '荷主名', flex: 1 },
  { field: 'posting_date', headerName: '出庫日', width: 140 },
  { field: 'status', headerName: '状態', width: 140 },
  { field: 'set_warehouse', headerName: '出庫倉庫', width: 180 },
  { field: 'total_qty', headerName: '数量', width: 100 },
];

export default function WmsPage() {
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  function handleSearch() {
    setSearchKeyword(keyword);
  }

  function handleClear() {
    setKeyword('');
    setSearchKeyword('');
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>出庫一覧</h1>

      <SearchBar onSearch={handleSearch} onClear={handleClear}>
        <TextSearch
          label="出庫検索"
          value={keyword}
          onChange={setKeyword}
          placeholder="Delivery Note・荷主・納品先"
        />
      </SearchBar>

      <DataGrid
        endpoint={`/api/erpnext/delivery-note?q=${encodeURIComponent(
          searchKeyword
        )}`}
        columns={columns}
        editPath={(row) => `/wms/delivery/${row.name}`}
      />
    </main>
  );
}
