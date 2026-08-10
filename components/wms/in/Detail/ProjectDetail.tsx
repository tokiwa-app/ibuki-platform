'use client';

import {
  useEffect,
  useState,
} from 'react';

import PurchaseReceiptDetail from '../../../erp-doctype/PurchaseReceipt/PurchaseReceiptDetail';
import StockEntryReceipt from '../../../erp-doctype/StockEntry/Receipt/StockEntryReceipt';

import { supabase } from '../../../../lib/supabaseClient';

interface ProjectDetailProps {
  projectId: number | null;
}

interface ProjectErpLink {
  doctype: string;
  role: string;
  erp_id: string;
}

function getErpId(
  links: ProjectErpLink[],
  doctype: string,
  role: string,
) {
  return (
    links.find(
      (x) =>
        x.doctype === doctype &&
        x.role === role,
    )?.erp_id ?? null
  );
}

export default function ProjectDetail({
  projectId,
}: ProjectDetailProps) {

  const [erpLinks, setErpLinks] =
    useState<ProjectErpLink[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    if (projectId == null) {
      setErpLinks([]);
      return;
    }

    async function fetchLinks() {

      setLoading(true);

      try {

        const {
          data,
          error,
        } = await supabase
          .from('project_erp_links')
          .select(`
            doctype,
            role,
            erp_id
          `)
          .eq(
            'project_id',
            projectId,
          );

        if (error) {
          throw error;
        }

        setErpLinks(
          data ?? [],
        );

      } catch (e) {

        console.error(
          'ERP Link取得失敗',
          e,
        );

        setErpLinks([]);

      } finally {

        setLoading(false);

      }

    }

    void fetchLinks();

  }, [projectId]);

  if (projectId == null) {
    return (
      <div style={{ padding: 16 }}>
        プロジェクトを選択してください。
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        読込中...
      </div>
    );
  }

  const purchaseReceiptName =
    getErpId(
      erpLinks,
      'Purchase Receipt',
      'main',
    );

  const stockEntryReceiptName =
    getErpId(
      erpLinks,
      'Stock Entry',
      'receipt',
    );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <PurchaseReceiptDetail
            purchaseReceiptName={
              purchaseReceiptName
            }
          />
        </div>

        <div
          style={{
            borderTop:
              '1px solid #ddd',
            paddingTop: 16,
          }}
        >
          <StockEntryReceipt
            stockEntryName={
              stockEntryReceiptName
            }
          />
        </div>

      </div>
    </div>
  );
}
