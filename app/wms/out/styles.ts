import type React from 'react';
import type { ColDef } from 'ag-grid-community';

import type { GridRow } from './types';

export const topButtonStyle: React.CSSProperties = {
  height: 30,
  padding: '0 12px',

  border: '1px solid #24508f',
  borderRadius: 4,

  backgroundColor: '#4472c4',
  color: '#fff',

  cursor: 'pointer',

  fontSize: 12,
  fontWeight: 700,
};

export const searchButtonStyle: React.CSSProperties = {
  ...topButtonStyle,

  height: 27,
  padding: '0 15px',
};

export const gridButtonStyle: React.CSSProperties = {
  height: 23,
  padding: '0 8px',

  border: '1px solid #24508f',
  borderRadius: 4,

  backgroundColor: '#4472c4',
  color: '#fff',

  cursor: 'pointer',

  fontSize: 11,
  lineHeight: '21px',
};

export const defaultColDef: ColDef<GridRow> = {
  sortable: true,
  filter: true,
  resizable: true,

  cellStyle: {
    fontSize: '12px',
  },
};
