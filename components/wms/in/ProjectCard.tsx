'use client';

import { useEffect, useState } from 'react';
import {
  Project,
  SaveProjectInput,
} from '../../../hooks/projects/projectTypes';

interface ProjectCardProps {
  project?: Project;
  projectType: string;
  onSave: (data: SaveProjectInput) => Promise<void>;
  onSelect?: () => void;
}

export default function ProjectCard({
  project,
  projectType,
  onSave,
  onSelect,
}: ProjectCardProps) {
  const isNew = !project;

  const [editing, setEditing] = useState(isNew);
  const [saving, setSaving] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [customer, setCustomer] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');

  useEffect(() => {
    if (!project) return;

    setProjectName(project.project_name ?? '');
    setCustomer(project.customer ?? '');
    setCompany(project.company ?? '');
    setStatus(project.status ?? null);
    setPriority(project.priority ?? null);
    setExpectedStartDate(project.expected_start_date ?? '');
    setExpectedEndDate(project.expected_end_date ?? '');
  }, [project]);

  const cancelEdit = () => {
    if (!project) return;

    setProjectName(project.project_name ?? '');
    setCustomer(project.customer ?? '');
    setCompany(project.company ?? '');
    setStatus(project.status ?? null);
    setPriority(project.priority ?? null);
    setExpectedStartDate(project.expected_start_date ?? '');
    setExpectedEndDate(project.expected_end_date ?? '');

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

        project_name: projectName,
        project_type: projectType,

        customer: customer || null,
        company: company || null,

        status,
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
      });

      setEditing(false);
    } catch (e) {
      console.error(e);

      alert(
        e instanceof Error
          ? e.message
          : String(e),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      onClick={() => {
        if (project && !editing) {
          onSelect?.();
        }
      }}
      style={{
        display: 'grid',
        gridTemplateColumns:
          '70px 120px 120px 120px 1fr',
        gap: 8,
        alignItems: 'center',
        padding: '6px 8px',
        borderBottom: '1px solid #eee',
        backgroundColor: editing
          ? '#f8fff8'
          : '#fff',
        cursor:
          project && !editing
            ? 'pointer'
            : 'default',
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
              onClick={(e) => {
                e.stopPropagation();
                void handleSave();
              }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  cancelEdit();
                }}
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
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            style={{
              padding: '2px 8px',
              fontSize: 12,
            }}
          >
            編集
          </button>
        )}
      </div>

      {editing ? (
        <input
          type="date"
          value={expectedStartDate}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            setExpectedStartDate(
              e.target.value,
            )
          }
        />
      ) : (
        <div>{expectedStartDate || '-'}</div>
      )}

      {editing ? (
        <input
          value={customer}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            setCustomer(e.target.value)
          }
        />
      ) : (
        <div>{customer || '-'}</div>
      )}

      {editing ? (
        <input
          value={company}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            setCompany(e.target.value)
          }
        />
      ) : (
        <div>{company || '-'}</div>
      )}

      {editing ? (
        <input
          value={projectName}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            setProjectName(
              e.target.value,
            )
          }
        />
      ) : (
        <div>{projectName}</div>
      )}
    </div>
  );
}
