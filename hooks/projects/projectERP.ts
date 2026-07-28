export interface SyncERPProjectInput {
  id: number;
  project_name: string;
  status: string | null;
  priority: string | null;
}

export async function syncERPProject(
  data: SyncERPProjectInput,
) {
  const response = await fetch('/api/erpnext/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  let result: unknown;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok) {
    let message = `ERPNext同期に失敗しました（${response.status}）`;

    if (
      result &&
      typeof result === 'object' &&
      'error' in result &&
      typeof result.error === 'string'
    ) {
      message = result.error;
    }

    throw new Error(message);
  }

  return result;
}
