'use client';

import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import type {
  CellValueChangedEvent,
} from 'ag-grid-community';

import { supabase } from '../../../lib/supabaseClient';

import type {
  GridRow,
  Transaction,
} from './types';

function num(value: unknown): number {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 0;
  }

  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : 0;
}

export function useOutTransactions() {
  const [rows, setRows] =
    useState<GridRow[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [dateFrom, setDateFrom] =
    useState('');

  const [dateTo, setDateTo] =
    useState('');

  // ==========================================================
  // SELECT
  // ==========================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let query = supabase
        .from('t_transactions')
        .select(`
          id,
          date_created,
          delivery_source,

          staff,
          client_staff,

          billing_id,
          delivery_destination_id,
          payment_destination_id,

          delivery_date,
          delivery_time,

          slip_no,
          order_no,

          d_quantity,
          p_quantity,

          d_unit_price,
          p_unit_price,

          d_premium,
          p_premium,

          d_weight,
          p_weight,

          d_month,
          p_month,

          project_name,
          item_name,
          name,

          unit,

          status,
          category,

          prefecture
        `)

        // 出荷のみ
        .eq('category', 1)

        .order('delivery_date', {
          ascending: false,
          nullsFirst: false,
        })

        .order('id', {
          ascending: false,
        })

        .limit(1000);

      if (dateFrom) {
        query = query.gte(
          'delivery_date',
          dateFrom
        );
      }

      if (dateTo) {
        query = query.lte(
          'delivery_date',
          dateTo
        );
      }

      const {
        data,
        error: queryError,
      } = await query;

      if (queryError) {
        throw queryError;
      }

      const transactions =
        (data ?? []) as Transaction[];

      const gridRows: GridRow[] =
        transactions.map((transaction) => {
          const pQuantity =
            num(transaction.p_quantity);

          const pWeight =
            num(transaction.p_weight);

          const pUnitPrice =
            num(transaction.p_unit_price);

          const pPremium =
            num(transaction.p_premium);

          const dQuantity =
            num(transaction.d_quantity);

          const dWeight =
            num(transaction.d_weight);

          const dUnitPrice =
            num(transaction.d_unit_price);

          const dPremium =
            num(transaction.d_premium);

          // 現在の画面計算を維持
          const pAmount =
            pQuantity * pUnitPrice +
            pPremium;

          const dAmount =
            dQuantity * dUnitPrice +
            dPremium;

          return {
            id: transaction.id,

            category:
              transaction.category,

            date_created:
              transaction.date_created,

            delivery_date:
              transaction.delivery_date,

            delivery_time:
              transaction.delivery_time,

            delivery_source:
              transaction.delivery_source,

            staff:
              transaction.staff,

            client_staff:
              transaction.client_staff,

            billing_id:
              transaction.billing_id,

            delivery_destination_id:
              transaction.delivery_destination_id,

            payment_destination_id:
              transaction.payment_destination_id,

            project_name:
              transaction.project_name,

            item_name:
              transaction.item_name,

            name:
              transaction.name,

            unit:
              transaction.unit,

            d_month:
              transaction.d_month,

            p_month:
              transaction.p_month,

            slip_no:
              transaction.slip_no,

            order_no:
              transaction.order_no,

            prefecture:
              transaction.prefecture,

            status:
              transaction.status,

            pQuantity,
            pWeight,
            pUnitPrice,
            pPremium,
            pAmount,

            dQuantity,
            dWeight,
            dUnitPrice,
            dPremium,
            dAmount,

            profit:
              dAmount - pAmount,
          };
        });

      setRows(gridRows);
    } catch (e) {
      console.error(
        'loadData error:',
        e
      );

      setRows([]);

      setError(
        e instanceof Error
          ? e.message
          : '取得失敗'
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  // ==========================================================
  // 初回
  // ==========================================================

  useEffect(() => {
    void loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================
  // UPDATE
  // ==========================================================

  const updateTransaction =
    useCallback(
      async (
        id: number,
        field: string,
        value: unknown
      ) => {
        const { error } = await supabase
          .from('t_transactions')
          .update({
            [field]: value,
          })
          .eq('id', id);

        if (error) {
          throw error;
        }
      },
      []
    );

  // ==========================================================
  // CELL UPDATE
  // ==========================================================

  const handleCellValueChanged =
    useCallback(
      async (
        event:
          CellValueChangedEvent<GridRow>
      ) => {
        const row = event.data;

        if (!row) {
          return;
        }

        const field =
          event.colDef.field;

        if (!field) {
          return;
        }

        if (
          event.newValue ===
          event.oldValue
        ) {
          return;
        }

        try {
          // ------------------------------------------
          // Grid名 → t_transactions列名
          // ------------------------------------------

          const numericMap:
            Record<string, string> = {
              pQuantity:
                'p_quantity',

              pWeight:
                'p_weight',

              pUnitPrice:
                'p_unit_price',

              pPremium:
                'p_premium',

              dQuantity:
                'd_quantity',

              dWeight:
                'd_weight',

              dUnitPrice:
                'd_unit_price',

              dPremium:
                'd_premium',
            };

          const numericDbField =
            numericMap[field];

          if (numericDbField) {
            await updateTransaction(
              row.id,
              numericDbField,
              num(event.newValue)
            );

            await loadData();
            return;
          }

          // ------------------------------------------
          // 通常項目
          // ------------------------------------------

          const parentMap:
            Record<string, string> = {
              delivery_date:
                'delivery_date',

              delivery_time:
                'delivery_time',

              delivery_source:
                'delivery_source',

              staff:
                'staff',

              client_staff:
                'client_staff',

              billing_id:
                'billing_id',

              delivery_destination_id:
                'delivery_destination_id',

              payment_destination_id:
                'payment_destination_id',

              project_name:
                'project_name',

              item_name:
                'item_name',

              unit:
                'unit',

              d_month:
                'd_month',

              p_month:
                'p_month',

              slip_no:
                'slip_no',

              order_no:
                'order_no',

              prefecture:
                'prefecture',

              status:
                'status',
            };

          const dbField =
            parentMap[field];

          if (!dbField) {
            return;
          }

          const newValue =
            event.newValue === ''
              ? null
              : event.newValue;

          await updateTransaction(
            row.id,
            dbField,
            newValue
          );

          await loadData();
        } catch (e) {
          console.error(
            'update error:',
            e
          );

          alert(
            e instanceof Error
              ? `保存失敗: ${e.message}`
              : '保存失敗'
          );

          await loadData();
        }
      },
      [
        loadData,
        updateTransaction,
      ]
    );

  return {
    rows,
    loading,
    error,

    dateFrom,
    dateTo,

    setDateFrom,
    setDateTo,

    loadData,
    handleCellValueChanged,
  };
}
