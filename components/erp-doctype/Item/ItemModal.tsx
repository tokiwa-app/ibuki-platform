'use client';

import {
  Dialog,
  DialogContent,
} from '@mui/material';

import { useState } from 'react';

import ItemList from './ItemList';
import ItemDetail from './ItemDetail';

interface Item {
  name: string;
  item_code?: string;
  item_name?: string;
}

interface Props {
  open: boolean;
  customer: string;
  onClose: () => void;
  onSelect: (item: Item) => void;
}

export default function ItemModal({
  open,
  customer,
  onClose,
  onSelect,
}: Props) {

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [selectedItem, setSelectedItem] =
    useState<Item | null>(null);

  return (

    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: 'none',
        },
      }}
    >

      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          overflow: 'hidden',
        }}
      >

        <div
          style={{
            width: 500,
            borderRight: '1px solid #ddd',
          }}
        >
          <ItemList
            customer={customer}
            selectedId={selectedId}
            onSelect={(item) => {
              setSelectedId(item.name);
              setSelectedItem(item);
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          <div
            style={{
              flex: 1,
              overflow: 'hidden',
            }}
          >
            <ItemDetail
              itemId={selectedId}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              padding: 16,
              borderTop: '1px solid #ddd',
            }}
          >

            <button
              onClick={() => {
                if (selectedItem) {
                  onSelect(selectedItem);
                }
              }}
            >
              選択
            </button>

            <button
              onClick={onClose}
            >
              閉じる
            </button>

          </div>

        </div>

      </DialogContent>

    </Dialog>

  );

}
