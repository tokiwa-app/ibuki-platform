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


interface Project {
  id: number;
  project_name: string;
  erp_stock_entry_receipt_id: string | null;
}


export default function ProjectDetail({
  projectId,
}: ProjectDetailProps) {

  const [project, setProject] =
    useState<Project | null>(null);


  const [loading, setLoading] =
    useState(false);


  useEffect(() => {

    if (projectId == null) {
      setProject(null);
      return;
    }


    async function fetchProject() {

      setLoading(true);


      try {

        const {
          data,
          error,
        } = await supabase
          .from('projects')
          .select(`
            id,
            project_name,
            erp_stock_entry_receipt_id
          `)
          .eq(
            'id',
            projectId,
          )
          .single();


        if (error) {
          throw error;
        }


        setProject(data);


      } catch (e) {

        console.error(
          'Project取得失敗',
          e,
        );

        setProject(null);


      } finally {

        setLoading(false);

      }

    }


    void fetchProject();


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



  if (!project) {
    return (
      <div style={{ padding: 16 }}>
        プロジェクトがありません。
      </div>
    );
  }



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
          padding: 16,
          borderBottom:
            '1px solid #ddd',
          flexShrink: 0,
        }}
      >

        <h2
          style={{
            margin: 0,
            marginBottom: 8,
            fontSize: 18,
          }}
        >
          {project.project_name}
        </h2>


      </div>



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
            projectId={projectId}
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
              project.erp_stock_entry_receipt_id
            }
          />

        </div>


      </div>

    </div>
  );
}
