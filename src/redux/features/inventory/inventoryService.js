// src/redux/features/inventory/inventoryService.js
import { API_URL } from '../../../../utils/apiConfig';

const getAuthHeader = (getState) => {
  // Adjust this to wherever you store the token (e.g. auth.user.token or users.user.token)
  const token =
    getState()?.auth?.user?.token ||
    getState()?.users?.user?.token ||
    localStorage.getItem('token');

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const addInventoryApi = async (payload, getState) => {
  const res = await fetch(`${API_URL}/api/inventory`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(getState),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to add inventory');
  return data;
};

export const listInventoryApi = async (getState) => {
  const res = await fetch(`${API_URL}/api/inventory`, {
    headers: {
      ...getAuthHeader(getState),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch inventory');
  return data;
};
// NEW: log usage
export const logUsageApi = async (payload, getState) => {
  const res = await fetch(`${API_URL}/api/inventory/use`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(getState),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to log usage');
  return data; // { message, usage }
};

// NEW: summary (added, used, left) per SKU
export const listSummaryApi = async (getState) => {
  const res = await fetch(`${API_URL}/api/inventory/summary`, {
    headers: { ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch summary');
  return data; // [{ skuName, totalAdded, totalUsed, left, lastAddDate, lastUseDate, lastUsedBy }]
};