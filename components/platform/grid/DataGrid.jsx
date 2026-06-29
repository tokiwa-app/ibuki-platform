'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function DataGrid({
  title,
  endpoint,
  columns,
  editPath,
  search = [],
}) {
  const router = useRouter();

  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const url = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      params.set(key, value);
    });

    const qs = params.toString();
    return qs ? `${endpoint}?${qs}` : endpoint;
  }, [endpoint, filters]);

  async function load() {
    setLoading(true);

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'データ取得に失敗しました');
        setRows([]);
        return;
      }

      setRows(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(error);
      alert('データ取得に失敗しました');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [url]);

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function clearFilters() {
    setFilters({});
  }

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginBottom: 20 }}>{title}</h1>

      {search.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginBottom: 16,
            padding: 16,
            border: '1px solid #ddd',
            borderRadius: 8,
            background: '#fff',
          }}
        >
          {search.map((field) => (
            <label key={field.name}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {field.label}
              </div>

              {field.type === 'select' ? (
                <select
                  value={filters[field.name] || ''}
                  onChange={(e) => updateFilter(field.name, e.target.value)}
                  style={inputStyle}
                >
                  <option value="">すべて</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value || opt} value={opt.value || opt}>
                      {opt.label || opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'date-range' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="date"
                    value={filters[`${field.name}_from`] || ''}
                    onChange={(e) =>
                      updateFilter(`${field.name}_from`, e.target.value)
                    }
                    style={inputStyle}
                  />
                  <input
                    type="date"
                    value={filters[`${field.name}_to`] || ''}
                    onChange={(e) =>
                      updateFilter(`${field.name}_to`, e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              ) : (
                <input
                  value={filters[field.name] || ''}
                  onChange={(e) => updateFilter(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={inputStyle}
                />
              )}
            </label>
          ))}

          <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
            <button onClick={load}>検索</button>
            <button onClick={clearFilters}>クリア</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button>＋新規</button>

        {editPath && (
          <button
            disabled={!selected}
            onClick={() => router.push(editPath(selected))}
          >
            編集
          </button>
        )}

        <button disabled={!selected}>削除</button>

        <button onClick={load} disabled={loading}>
          {loading ? '読込中...' : '再読込'}
        </button>
      </div>

      <div className="ag-theme-quartz" style={{ height: 600, width: '100%' }}>
        <AgGridReact
          rowData={rows}
          columnDefs={columns}
          rowSelection={{ mode: 'singleRow' }}
          pagination
          paginationPageSize={50}
          onSelectionChanged={(e) => {
            const row = e.api.getSelectedRows()[0];
            setSelected(row || null);
          }}
          onRowDoubleClicked={(e) => {
            if (editPath) router.push(editPath(e.data));
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

const inputStyle = {
  width: '100%',
  padding: 8,
  border: '1px solid #ccc',
  borderRadius: 6,
};
