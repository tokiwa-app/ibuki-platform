'use client';

import {
  useEffect,
  useState,
} from 'react';

import PurchaseReceiptDetail from '../../../erp-doctype/PurchaseReceipt/PurchaseReceiptDetail';
import StockEntryReceipt from '../../../erp-doctype/StockEntry/Receipt/StockEntryReceipt';

import { supabase } from '../../../../lib/supabaseClient';

interface ProjectContext {
  projectId: number;
  customer: string | null;
  company: string | null;
  expected_start_date: string | null;
}

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

  const [project, setProject] =
    useState<ProjectContext | null>(null);

  const [erpLinks, setErpLinks] =
    useState<ProjectErpLink[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {

    if (projectId == null) {

      setProject(null);
      setErpLinks([]);

      return;

    }

    async function fetchData() {

      setLoading(true);

      try {

        const [
          projectResult,
          linkResult,
        ] = await Promise.all([

          supabase
            .from('projects')
            .select(`
              id,
              customer,
              company,
              expected_start_date
            `)
            .eq(
              'id',
              projectId,
            )
            .single(),

          supabase
            .from('project_erp_links')
            .select(`
              doctype,
              role,
              erp_id
            `)
            .eq(
              'project_id',
              projectId,
            ),

        ]);

        if (
          projectResult.error
        ) {
          throw projectResult.error;
        }

        if (
          linkResult.error
        ) {
          throw linkResult.error;
        }

        setProject({
          projectId:
            projectResult.data.id,
          customer:
            projectResult.data.customer,
          company:
            projectResult.data.company,
          expected_start_date:
            projectResult.data.expected_start_date,
        });

        setErpLinks(
          linkResult.data ?? [],
        );

      } catch (e) {

        console.error(
          'Project取得失敗',
          e,
        );

        setProject(null);
        setErpLinks([]);

      } finally {

        setLoading(false);

      }

    }

    void fetchData();

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
            project={project}
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
            project={project}
          />
        </div>

      </div>
    </div>
  );
}
