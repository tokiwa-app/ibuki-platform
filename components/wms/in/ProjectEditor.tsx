'use client';

import React, { useEffect, useState } from 'react';
import { Project, SaveProjectInput } from '@/hooks/useProjects';

interface ProjectEditorProps {
  projectType: string;
  project: Project | null;
  isCreating: boolean;
  onSave: (data: SaveProjectInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCancel: () => void;
}

const emptyForm = {
  project_name: '',
  customer: '',
  company: '',
  status: 'Open',
  priority: 'Medium',
  expected_start_date: '',
  expected_end_date: '',
};

export default function ProjectEditor({
  projectType,
  project,
  isCreating,
  onSave,
  onDelete,
  onCancel,
}: ProjectEditorProps) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        project_name: project.project_name ?? '',
        customer: project.customer ?? '',
        company: project.company ?? '',
        status: project.status ?? 'Open',
        priority: project.priority ?? 'Medium',
        expected_start_date:
          project.expected_start_date ?? '',
        expected_end_date:
          project.expected_end_date ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [project]);

  if (!project && !isCreating) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: 'center',
          color: '#888',
        }}
      >
        左から案件を選択するか
        <br />
        「＋ 新規案件を追加」を押してください。
      </div>
    );
  }

  async function handleSave() {
    if (!form.project_name.trim()) {
      alert('案件名を入力してください');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        id: project?.id,
        project_name: form.project_name,
        project_type: projectType,
        customer: form.customer || null,
        company: form.company || null,
        status: form.status || null,
        priority: form.priority || null,
        expected_start_date:
          form.expected_start_date || null,
        expected_end_date:
          form.expected_end_date || null,
      });

      onCancel();
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!project) return;

    if (!confirm('削除しますか？')) {
      return;
    }

    await onDelete(project.id);

    onCancel();
  }

  return (
    <div
      style={{
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h3 style={{ margin: 0 }}>
        {project ? '案件編集' : '新規案件'}
      </h3>

      <label>
        <div>案件名</div>
        <input
          value={form.project_name}
          onChange={(e) =>
            setForm({
              ...form,
              project_name: e.target.value,
            })
          }
          style={{ width: '100%' }}
        />
      </label>

      <label>
        <div>荷主</div>
        <input
          value={form.customer}
          onChange={(e) =>
            setForm({
              ...form,
              customer: e.target.value,
            })
          }
          style={{ width: '100%' }}
        />
      </label>

      <label>
        <div>会社</div>
        <input
          value={form.company}
          onChange={(e) =>
            setForm({
              ...form,
              company: e.target.value,
            })
          }
          style={{ width: '100%' }}
        />
      </label>

      <label>
        <div>開始予定日</div>
        <input
          type="date"
          value={form.expected_start_date}
          onChange={(e) =>
            setForm({
              ...form,
              expected_start_date: e.target.value,
            })
          }
        />
      </label>

      <label>
        <div>終了予定日</div>
        <input
          type="date"
          value={form.expected_end_date}
          onChange={(e) =>
            setForm({
              ...form,
              expected_end_date: e.target.value,
            })
          }
        />
      </label>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
        >
          保存
        </button>

        {project && (
          <button
            onClick={handleDelete}
            style={{
              background: '#d32f2f',
              color: '#fff',
            }}
          >
            削除
          </button>
        )}

        <button onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
}
