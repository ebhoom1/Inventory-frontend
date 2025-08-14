// src/redux/features/equipment/equipmentService.js
import { API_URL } from "../../../../utils/apiConfig";

const getAuthHeader = (getState) => {
  const token =
    getState()?.auth?.user?.token ||
    getState()?.users?.user?.token ||
    localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// POST /api/equipment
export const createEquipmentApi = async (payload, getState) => {
  const res = await fetch(`${API_URL}/api/equipment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create equipment");
  return data; // { message, equipment }
};

// GET /api/equipment
export const getEquipmentsApi = async (getState) => {
  const res = await fetch(`${API_URL}/api/equipment`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch equipments");
  return data; // array
};

// GET /api/equipment/:id
export const getEquipmentByIdApi = async (id, getState) => {
  const res = await fetch(`${API_URL}/api/equipment/${id}`, {
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch equipment");
  return data; // equipment object
};

// PUT /api/equipment/:id
export const updateEquipmentApi = async ({ id, updates }, getState) => {
  const res = await fetch(`${API_URL}/api/equipment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader(getState) },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update equipment");
  return data; // { message, equipment }
};

// DELETE /api/equipment/:id
export const deleteEquipmentApi = async (id, getState) => {
  const res = await fetch(`${API_URL}/api/equipment/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader(getState) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to delete equipment");
  return data; // { message }
};
