'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  StockEntry,
  StockEntryItem,
} from './types';

import StockEntryHeader from './StockEntryHeader';
import StockEntryGrid from './StockEntryGrid';
import StockEntryFooter from './StockEntryFooter';

import ItemModal from '../../../Item/ItemModal';

interface ProjectContext {

  projectId: number;

  customer: string | null;

  company: string | null;

  expected_start_date: string | null;

}

interface Props {

  stockEntryName: string | null;

  project: ProjectContext | null;

}

export default function StockEntryReceipt({

  stockEntryName,

  project,

}: Props) {

  const [doc, setDoc] =
    useState<StockEntry | null>(null);

  const [items, setItems] =
    useState<StockEntryItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [itemModalOpen, setItemModalOpen] =
    useState(false);

  useEffect(() => {

    if (!stockEntryName) {

      setDoc(null);

      setItems([]);

      return;

    }

    async function fetchDoc() {

      setLoading(true);

      setError('');

      try {

        const response =
          await fetch(
            `/api/erpnext/stock-entry/receipt/${encodeURIComponent(
              stockEntryName,
            )}`,
            {
              cache: 'no-store',
            },
          );

        if (!response.ok) {

          throw new Error(
            'Stock Entry取得失敗',
          );

        }

        const result =
          await response.json();

        setDoc(result);

        setItems(
          result.items ?? [],
        );

      } catch (e) {

        setError(
          e instanceof Error
            ? e.message
            : '読込失敗',
        );

      } finally {

        setLoading(false);

      }

    }

    void fetchDoc();

  }, [stockEntryName]);

  async function handleSave() {

    console.log(
      '保存',
      items,
    );

  }

  async function handleSubmit() {

    console.log(
      'Submit',
    );

  }

  if (loading) {

    return (
      <div
        style={{
          padding: 16,
        }}
      >
        読込中...
      </div>
    );

  }

  if (error) {

    return (
      <div
        style={{
          padding: 16,
          color: 'red',
        }}
      >
        {error}
      </div>
    );

  }

  return (

    <>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >

        <StockEntryHeader
          doc={doc}
        />

        <StockEntryGrid
          items={items}
          setItems={setItems}
          onOpenItemModal={() =>
            setItemModalOpen(true)
          }
        />

        <StockEntryFooter
          loading={loading}
          isSubmitted={
            doc?.docstatus === 1
          }
          onSave={
            handleSave
          }
          onSubmit={
            handleSubmit
          }
        />

      </div>

      <ItemModal

        open={itemModalOpen}

        customer={
          project?.customer ?? ''
        }

        onClose={() =>
          setItemModalOpen(false)
        }

        onSelect={(item) => {

          console.log(item);

          setItemModalOpen(false);

        }}

      />

    </>

  );

}
