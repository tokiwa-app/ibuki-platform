'use client';

import {
  useCallback,
  useMemo,
} from 'react';

import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import type { GridRow } from './types';

import {
  createColumnDefs,
} from './columns';

import {
  useOutTransactions,
} from './useOutTransactions';

import {
  defaultColDef,
  searchButtonStyle,
  topButtonStyle,
} from './styles';

export default function WmsOutPage() {
  const {
    rows,
    loading,
    error,

    dateFrom,
    dateTo,

    setDateFrom,
    setDateTo,

    loadData,
    handleCellValueChanged,
  } = useOutTransactions();

  // ==========================================================
  // ボタン
  // ==========================================================

  const openDetail =
    useCallback((row: GridRow) => {
      alert(`詳細 ID: ${row.id}`);
    }, []);

  const openData =
    useCallback((row: GridRow) => {
      alert(`データ ID: ${row.id}`);
    }, []);

  const openWork =
    useCallback((row: GridRow) => {
      alert(`作業 ID: ${row.id}`);
    }, []);

  // ==========================================================
  // Columns
  // ==========================================================

  const columnDefs = useMemo(
    () =>
      createColumnDefs({
        openDetail,
        openData,
        openWork,
      }),
    [
      openDetail,
      openData,
      openWork,
    ]
  );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,

        display: 'flex',
        flexDirection: 'column',

        overflow: 'hidden',

        backgroundColor:
          '#f3f4f6',

        fontFamily:
          '"Yu Gothic", "Meiryo", sans-serif',
      }}
    >
      {/* =====================================================
          上部ボタン
      ===================================================== */}

      <div
        style={{
          flexShrink: 0,

          display: 'flex',
          alignItems: 'center',

          gap: 5,

          padding: 6,

          flexWrap: 'wrap',

          backgroundColor:
            '#eef1f5',

          borderBottom:
            '1px solid #aaa',
        }}
      >
        <button
          style={topButtonStyle}
        >
          入庫・加工・調整・参照
        </button>

        <button
          style={topButtonStyle}
        >
          本日の出荷
        </button>

        <button
          style={topButtonStyle}
        >
          取引先マスタ
        </button>

        <button
          style={topButtonStyle}
        >
          CSVデータ取込
        </button>

        <button
          style={topButtonStyle}
        >
          製品マスタ
        </button>

        <button
          style={topButtonStyle}
        >
          構成マスタ
        </button>

        <button
          style={{
            ...topButtonStyle,
            marginLeft: 15,
          }}
          onClick={() => {
            void loadData();
          }}
        >
          更新
        </button>
      </div>

      {/* =====================================================
          検索
      ===================================================== */}

      <div
        style={{
          flexShrink: 0,

          minHeight: 42,

          display: 'flex',
          alignItems: 'center',

          gap: 8,

          padding: '4px 8px',

          backgroundColor: '#fff',

          borderBottom:
            '1px solid #aaa',

          fontSize: 12,
        }}
      >
        <span>納品日</span>

        <input
          type="date"
          value={dateFrom}
          onChange={(event) =>
            setDateFrom(
              event.target.value
            )
          }
        />

        <span>～</span>

        <input
          type="date"
          value={dateTo}
          onChange={(event) =>
            setDateTo(
              event.target.value
            )
          }
        />

        <button
          style={searchButtonStyle}
          onClick={() => {
            void loadData();
          }}
        >
          検索
        </button>

        <span
          style={{
            marginLeft: 10,
            fontWeight: 700,
          }}
        >
          {loading
            ? '読込中...'
            : `${rows.length} 件`}
        </span>

        {error && (
          <span
            style={{
              color: '#c00',
              fontWeight: 700,
            }}
          >
            {error}
          </span>
        )}
      </div>

      {/* =====================================================
          AG Grid
      ===================================================== */}

      <div
        className="ag-theme-quartz"
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <AgGridReact<GridRow>
          rowData={rows}

          columnDefs={columnDefs}

          defaultColDef={
            defaultColDef
          }

          onCellValueChanged={
            handleCellValueChanged
          }

          rowHeight={28}
          headerHeight={30}
          groupHeaderHeight={30}

          animateRows={false}

          stopEditingWhenCellsLoseFocus={
            true
          }

          enableCellTextSelection={
            true
          }

          suppressRowClickSelection={
            false
          }
        />
      </div>

      {/* =====================================================
          下部
      ===================================================== */}

      <div
        style={{
          flexShrink: 0,

          height: 28,

          display: 'flex',
          alignItems: 'center',

          padding: '0 10px',

          backgroundColor:
            '#eef1f5',

          borderTop:
            '1px solid #aaa',

          fontSize: 12,
        }}
      >
        {loading
          ? '読み込み中...'
          : `${rows.length} 件`}
      </div>
    </main>
  );
}
