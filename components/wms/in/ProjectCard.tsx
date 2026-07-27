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

  const [saving, setSaving] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [customer, setCustomer] = useState('');
  const [company, setCompany] = useState('');
  const [expectedStartDate, setExpectedStartDate] = useState('');

  const [editing, setEditing] = useState(isNew);

  useEffect(() => {
    if (!project) return;

    setProjectName(project.project_name ?? '');
    setCustomer(project.customer ?? '');
    setCompany(project.company ?? '');
    setExpectedStartDate(project.expected_start_date ?? '');
  }, [project]);

  async function handleSave() {
    if (!projectName.trim()) {
      alert('案件名を入力してください');
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
        expected_start_date:
          expectedStartDate || null,
      });

      if (!isNew) {
        setEditing(false);
      } else {
        setProjectName('');
        setCustomer('');
        setCompany('');
        setExpectedStartDate('');
      }
    } catch (err) {
      console.error(err);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            '70px 110px 120px 1fr',
          gap: 8,
          alignItems: 'center',
          padding: '8px 4px',
          borderBottom: '1px solid #eee',
        }}
      >
        <button onClick={() => setEditing(true)}>
          編集
        </button>

        <div>
          {expectedStartDate}
        </div>

        <div>
          {customer}
        </div>

        <div>
          {projectName}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          '70px 110px 120px 1fr',
        gap: 8,
        alignItems: 'center',
        padding: '8px 4px',
        borderBottom: '1px solid #eee',
      }}
    >
      <button
        onClick={handleSave}
        disabled={saving}
      >
        保存
      </button>

      <input
        type="date"
        value={expectedStartDate}
        onChange={(e) =>
          setExpectedStartDate(e.target.value)
        }
      />

      <input
        value={customer}
        onChange={(e) =>
          setCustomer(e.target.value)
        }
      />

      <input
        value={projectName}
        onChange={(e) =>
          setProjectName(e.target.value)
        }
      />
    </div>
  );
}
