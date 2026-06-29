const BASE_URL = process.env.ERPNEXT_BASE_URL;
const API_KEY = process.env.ERPNEXT_API_KEY;
const API_SECRET = process.env.ERPNEXT_API_SECRET;

export async function erpnextRequest(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `token ${API_KEY}:${API_SECRET}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || data?.exception || 'ERPNext API error');
  }

  return data;
}

export async function getErpnextItems() {
  return erpnextRequest(
    '/api/resource/Item?fields=["name","item_name","item_group","stock_uom"]&limit_page_length=20'
  );
}
