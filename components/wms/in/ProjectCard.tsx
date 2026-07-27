'use client';

import { useEffect, useState } from 'react';
import {
  Project,
  SaveProjectInput,
} from '../../../hooks/useProjects';

interface ProjectCardProps {
  project?: Project;
  projectType: string;
  onSave: (data: SaveProjectInput) => Promise<void>;
}

export default function ProjectCard({
  project,
  projectType,
  onSave,
}: ProjectCardProps) {
  const isNew = !project;

  const [editing, setEditing] = useState(isNew);
  const [saving, setSaving] = useState(false);

  const erpProjectId = project?.erp_project_id ?? '';
  const [projectName, setProjectName] = useState('');
  const [customer, setCustomer] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [expectedStartDate, setExpectedStartDate] =
    useState('');
  const [expectedEndDate, setExpectedEndDate] =
    useState('');

  useEffect(() => {
    if (!project) return;


    setProjectName(
      project.project_name ?? '',
    );
    setCustomer(
      project.customer ?? '',
    );
    setCompany(
      project.company ?? '',
    );
    setStatus(
      project.status ?? null,
    );
    setPriority(
      project.priority ?? null,
    );
    setExpectedStartDate(
      project.expected_start_date ?? '',
    );
    setExpectedEndDate(
      project.expected_end_date ?? '',
    );
  }, [project]);

  const cancelEdit = () => {
    if (!project) return;

    setErpProjectId(
      project.erp_project_id ?? '',
    );
    setProjectName(
      project.project_name ?? '',
    );
    setCustomer(
      project.customer ?? '',
    );
    setCompany(
      project.company ?? '',
    );
    setExpectedStartDate(
      project.expected_start_date ?? '',
    );
    setExpectedEndDate(
      project.expected_end_date ?? '',
    );

    setEditing(false);
  };

  async function handleSave() {
    if (!projectName.trim()) {
      alert('プロジェクト名を入力してください');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        id: project?.id,

erp_project_id:
  project?.erp_project_id ?? null,

        project_name:
          projectName,

        project_type:
          projectType,

        customer:
          customer || null,

        company:
          company || null,

        status:
          status,

        priority:
          priority,

        expected_start_date:
          expectedStartDate || null,

        expected_end_date:
          expectedEndDate || null,

        actual_start_date:
          project?.actual_start_date ?? null,

        actual_end_date:
          project?.actual_end_date ?? null,

        percent_complete:
          project?.percent_complete ?? 0,

        collect_progress:
          project?.collect_progress ?? false,

        notes:
          project?.notes ?? null,

        is_active:
          project?.is_active ?? true,

        erp_sync_status:
          project?.erp_sync_status ?? 'pending',

        erp_synced_at:
          project?.erp_synced_at ?? null,
      });

      setEditing(false);
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          '70px 140px 120px 120px 1fr',
        gap: 8,
        alignItems: 'center',
        padding: '6px 8px',
        borderBottom:
          '1px solid #eee',
        backgroundColor:
          editing ? '#f8fff8' : '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 4,
        }}
      >
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '2px 8px',
                fontSize: 12,
              }}
            >
              保存
            </button>

            {!isNew && (
              <button
                onClick={cancelEdit}
                style={{
                  width: 26,
                  padding: 0,
                  fontSize: 12,
                }}
              >
                ×
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() =>
              setEditing(true)
            }
            style={{
              padding: '2px 8px',
              fontSize: 12,
            }}
          >
            編集
          </button>
        )}
      </div>

<div>
  {erpProjectId || '未連携'}
</div>
      
      {editing ? (
        <input
          type="date"
          value={expectedStartDate}
          onChange={(e) =>
            setExpectedStartDate(
              e.target.value,
            )
          }
        />
      ) : (
        <div>
          {expectedStartDate || '-'}
        </div>
      )}

      {editing ? (
        <input
          value={customer}
          onChange={(e) =>
            setCustomer(e.target.value)
          }
        />
      ) : (
        <div>
          {customer || '-'}
        </div>
      )}

      {editing ? (
        <input
          value={projectName}
          onChange={(e) =>
            setProjectName(e.target.value)
          }
        />
      ) : (
        <div>
          {projectName}
        </div>
      )}
    </div>
  );
}
