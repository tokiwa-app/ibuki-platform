'use client';

import { useState } from 'react';
import DataGrid from '../../../components/platform/grid/DataGrid';
import SearchBar from '../../../components/platform/search/SearchBar';
import TextSearch from '../../../components/platform/search/TextSearch';

const columns = [
  { field: 'name', headerName: 'Customer', width: 140 },
  { field: 'customer_name', headerName: 'Customer Name', flex: 1 },
  { field: 'customer_group', headerName: 'Customer Group', width: 180 },
  { field: 'territory', headerName: 'Territory', width: 140 },
];

export default function CustomerPage() {
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
      <h1>Customer</h1>

      <SearchBar onSearch={handleSearch} onClear={handleClear}>
        <TextSearch
          label="Customer検索"
          value={keyword}
          onChange={setKeyword}
          placeholder="Customerコード・Customer Name"
        />
      </SearchBar>

      <DataGrid
        endpoint={`/api/erpnext/customer?q=${encodeURIComponent(searchKeyword)}`}
        columns={columns}
        editPath={(row) => `/masters/customer/${row.name}`}
      />
    </main>
  );
}
