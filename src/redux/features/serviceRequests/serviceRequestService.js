// src/redux/features/serviceRequests/serviceRequestService.js
import { API_URL } from "../../../../utils/apiConfig";

const getAuthHeader = (getState) => {
  const token =
    getState()?.auth?.user?.token ||
    getState()?.users?.user?.token ||
    localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const qs = (params = {}) =>
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v).length > 0)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

// --- POST /api/service-requests
export const createServiceRequestApi = async (payload, getState) => {
  const res = await fetch(`${API_URL}/api/service-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create service request");
  return data; // { message, request }
};

// --- GET /api/service-requests (filtered/paginated)
export const getServiceRequestsApi = async (params, getState) => {
  const query = qs(params);
  const res = await fetch(`${API_URL}/api/service-requests${query ? `?${query}` : ""}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch service requests");
  return data; // array (from your controller) OR {items,total,...} if you swap to paginated
};

// --- GET /api/service-requests/all (paginated summary)
export const getAllServiceRequestsApi = async (params, getState) => {
  const query = qs(params);
  const res = await fetch(`${API_URL}/api/service-requests/all${query ? `?${query}` : ""}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch all service requests");
  return data; // { items, total, page, pageSize, ... }
};

// --- GET /api/service-requests/:id
export const getServiceRequestByIdApi = async (id, getState) => {
  const res = await fetch(`${API_URL}/api/service-requests/${id}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch service request");
  return data; // object
};

// --- PUT /api/service-requests/:id/status
export const updateServiceRequestStatusApi = async ({ id, updates }, getState) => {
  const res = await fetch(`${API_URL}/api/service-requests/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update service request");
  return data; // { message, request }
};

// --- DELETE /api/service-requests/:id
export const deleteServiceRequestApi = async (id, getState) => {
  const res = await fetch(`${API_URL}/api/service-requests/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to delete service request");
  return data; // { message }
};

// --- GET /api/service-requests/history/list
export const getServiceHistoryApi = async (params, getState) => {
  const query = qs(params);
  const res = await fetch(`${API_URL}/api/service-requests/history/list${query ? `?${query}` : ""}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch service history");
  return data; // array
};


// --- GET /api/service-requests/user/:userId (paginated/filtered)
export const getServiceRequestsByUserIdApi = async ({ userId, ...params }, getState) => {
  if (!userId) throw new Error("userId is required");
  const query = qs(params);
  const res = await fetch(
    `${API_URL}/api/service-requests/user/${encodeURIComponent(userId)}${query ? `?${query}` : ""}`,
    { headers: { "Content-Type": "application/json", ...getAuthHeader(getState) } }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch user's service requests");
  return data; // your controller returns { items, total, page, pageSize, totalPages, ... }
};

// --- GET /api/service-requests/due
export const getServiceDueApi = async (params, getState) => {
  const query = qs(params);
  const res = await fetch(`${API_URL}/api/service-requests/due${query ? `?${query}` : ""}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch service due");
  return data; // array of history docs with nextServiceDate
};

// --- PUT /api/service-requests/:id/seen
export const markServiceRequestSeenApi = async ({ id, seenBy }, getState) => {
  const res = await fetch(`${API_URL}/api/service-requests/${id}/seen`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
    body: JSON.stringify({ seenBy }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to mark as seen");
  return data; // { message, request }
};
