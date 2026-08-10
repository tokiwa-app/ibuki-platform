'use client';

import {
  useState,
} from 'react';

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

  const [selectedItem, setSelectedItem] =
    useState<Item | null>(null);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  if (!open) {

    return null;

  }

  return (

    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >

      <div
        style={{
          width: '95vw',
          height: '92vh',
          background: '#fff',
          borderRadius: 8,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >

        <div
          style={{
            height: 48,
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #ddd',
            fontWeight: 'bold',
          }}
        >

          <span>
            商品マスター
          </span>

          <button
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
          }}
        >

          <div
            style={{
              width: '45%',
              borderRight: '1px solid #ddd',
            }}
          >

            <ItemList

              customer={customer}

              selectedId={selectedId}

              onSelect={(item) => {

                setSelectedItem(item);

                setSelectedId(item.name);

              }}

            />

          </div>

          <div
            style={{
              flex: 1,
            }}
          >

            <ItemDetail
              itemId={selectedId}
            />

          </div>

        </div>

        <div
          style={{
            height: 56,
            borderTop: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 8,
            padding: '0 16px',
          }}
        >

          <button
            onClick={() => {

              if (
                selectedItem
              ) {

                onSelect(
                  selectedItem,
                );

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

    </div>

  );

}
