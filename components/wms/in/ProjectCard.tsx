'use client';

import { useEffect, useState } from 'react';
import {
  Project,
  SaveProjectInput,
} from '../../../hooks/useProjects';

interface ProjectCardProps {
  project?: Project;
  projectType: string;
  isNew?: boolean;
  onSave: (data: SaveProjectInput) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function ProjectCard({
  project,
  projectType,
  isNew = false,
  onSave,
  onDelete,
}: ProjectCardProps) {
  const [editing, setEditing] = useState(isNew);
  const [saving, setSaving] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [customer, setCustomer] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Medium');
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');

  useEffect(() => {
    if (!project) return;

    setProjectName(project.project_name ?? '');
    setCustomer(project.customer ?? '');
    setCompany(project.company ?? '');
    setStatus(project.status ?? 'Open');
    setPriority(project.priority ?? 'Medium');
    setExpectedStartDate(project.expected_start_date ?? '');
    setExpectedEndDate(project.expected_end_date ?? '');
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
        status,
        priority,
        expected_start_date: expectedStartDate || null,
        expected_end_date: expectedEndDate || null,
      });

      setEditing(false);
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!project || !onDelete) return;

    if (!confirm('削除しますか？')) return;

    await onDelete(project.id);
  }

  if (!editing) {
    if (isNew) {
      return (
        <div
          onClick={() => setEditing(true)}
          style={{
            padding: 16,
            border: '2px dashed #bbb',
            borderRadius: 4,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 28 }}>＋</div>
          <div>新規案件を追加</div>
        </div>
      );
    }

    return (
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: 12,
          background: '#fff',
        }}
      >
        <div style={{ fontWeight: 'bold' }}>
          {projectName}
        </div>

        <div>荷主：{customer || '-'}</div>
        <div>会社：{company || '-'}</div>

        <div style={{ marginTop: 8 }}>
          <button onClick={() => setEditing(true)}>
            編集
          </button>

          <button
            onClick={handleDelete}
            style={{ marginLeft: 8 }}
          >
            削除
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #2e7d32',
        borderRadius: 4,
        padding: 12,
        background: '#fff',
      }}
    >
      <div>
        <div>案件名</div>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <div>荷主</div>
        <input
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <div>会社</div>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div>
        <div>開始予定日</div>
        <input
          type="date"
          value={expectedStartDate}
          onChange={(e) => setExpectedStartDate(e.target.value)}
        />
      </div>

      <div>
        <div>終了予定日</div>
        <input
          type="date"
          value={expectedEndDate}
          onChange={(e) => setExpectedEndDate(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleSave}
          disabled={saving}
        >
          保存
        </button>

        {!isNew && (
          <button
            onClick={() => setEditing(false)}
            style={{ marginLeft: 8 }}
          >
            キャンセル
          </button>
        )}
      </div>
    </div>
  );
}
