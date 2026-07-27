'use client';

import React from 'react';
import { Project } from '@/hooks/useProjects';

interface ProjectCardProps {
  project: Project;
  selected: boolean;
  onClick: () => void;
}

export default function ProjectCard({
  project,
  selected,
  onClick,
}: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 12,
        borderRadius: 4,
        border: selected
          ? '1.5px solid #2e7d32'
          : '1px solid #e0e0e0',
        backgroundColor: selected ? '#e8f5e9' : '#fff',
        cursor: 'pointer',
        transition: 'all .15s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 4,
          gap: 12,
        }}
      >
        <span
          style={{
            fontWeight: 'bold',
            fontSize: 13,
            color: selected ? '#1b5e20' : '#333',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {project.project_name}
        </span>

        <span
          style={{
            fontSize: 11,
            color: '#888',
            flexShrink: 0,
          }}
        >
          {project.expected_start_date ?? ''}
        </span>
      </div>

      <div
        style={{
          marginBottom: 4,
          fontSize: 11,
          color: '#777',
        }}
      >
        ERP Project ID：
        <strong>
          {project.erp_project_id ?? '未連携'}
        </strong>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: 12,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          荷主：
          <strong>
            {project.customer ?? '未設定'}
          </strong>
        </span>

        <span
          style={{
            color: '#777',
            fontSize: 11,
            flexShrink: 0,
          }}
        >
          {project.status ?? ''}
        </span>
      </div>
    </div>
  );
}
