export async function syncERPProject(
  data: {
    id: number;
    project_name: string;
    status: string | null;
    priority: string | null;
  }
) {
  const res = await fetch('/api/erpnext/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  console.log('ERP RESPONSE', result);

  if (!res.ok) {
    throw new Error(
      result.error ??
      JSON.stringify(result)
    );
  }

  return result;
}
