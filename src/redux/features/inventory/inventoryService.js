// src/redux/features/inventory/inventoryService.js
import { API_URL } from '../../../../utils/apiConfig';

const getAuthHeader = (getState) => {
  // Fixed: Correct path to token in users slice (userInfo, not user)
  // Fallback to localStorage 'userInfo' for robustness
  let token = getState()?.users?.userInfo?.token;
  
  if (!token) {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      try {
        token = JSON.parse(userInfoStr).token;
      } catch (e) {
        console.warn('Failed to parse userInfo from localStorage');
      }
    }
  }

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
export const listSummaryApi = async (getState, userId = "all") => {
  const url =
    userId && userId !== "all"
      ? `${API_URL}/api/inventory/summary/${encodeURIComponent(userId)}`
      : `${API_URL}/api/inventory/summary`;
  const res = await fetch(url, {
    headers: { ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Failed to fetch summary');
  return data; // [{ skuName, totalAdded, totalUsed, left, lastAddDate, lastUseDate, lastUsedBy }]
};