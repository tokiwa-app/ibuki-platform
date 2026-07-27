'use client';

import React, { useState } from 'react';
import { SaveProjectInput } from '@/hooks/useProjects';

interface ProjectCreateCardProps {
  projectType: string;
  onSave: (data: SaveProjectInput) => Promise<void>;
}

export default function ProjectCreateCard({
  projectType,
  onSave,
}: ProjectCreateCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [customer, setCustomer] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Medium');
  const [expectedStartDate, setExpectedStartDate] =
    useState('');
  const [expectedEndDate, setExpectedEndDate] =
    useState('');

  async function handleSave() {
    if (!projectName.trim()) {
      alert('案件名を入力してください');
      return;
    }

    setSaving(true);

    try {
      await onSave({
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
      });

      setProjectName('');
      setCustomer('');
      setCompany('');
      setStatus('Open');
      setPriority('Medium');
      setExpectedStartDate('');
      setExpectedEndDate('');

      setEditing(false);
    } catch (e) {
      console.error(e);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        style={{
          padding: 16,
          border: '2px dashed #bdbdbd',
          borderRadius: 4,
          background: '#fafafa',
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: '#2e7d32',
            fontWeight: 'bold',
            lineHeight: 1,
          }}
        >
          ＋
        </div>

        <div
          style={{
            marginTop: 6,
            fontWeight: 'bold',
          }}
        >
          新規案件を追加
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 16,
        border: '1px solid #2e7d32',
        borderRadius: 4,
        background: '#fff',
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div>案件名</div>
        <input
          value={projectName}
          onChange={(e) =>
            setProjectName(e.target.value)
          }
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <div>荷主</div>
        <input
          value={customer}
          onChange={(e) =>
            setCustomer(e.target.value)
          }
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <div>会社</div>
        <input
          value={company}
          onChange={(e) =>
            setCompany(e.target.value)
          }
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <div>開始予定日</div>
        <input
          type="date"
          value={expectedStartDate}
          onChange={(e) =>
            setExpectedStartDate(e.target.value)
          }
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div>終了予定日</div>
        <input
          type="date"
          value={expectedEndDate}
          onChange={(e) =>
            setExpectedEndDate(e.target.value)
          }
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
        >
          保存
        </button>

        <button
          onClick={() => setEditing(false)}
        >
          キャンセル
        </button>
      </div>
    </div>
  );
}
