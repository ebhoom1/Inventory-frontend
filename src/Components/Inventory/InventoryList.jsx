// src/pages/InventoryList/InventoryList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { fetchInventorySummary, fetchInventory, updateInventory } from "../../redux/features/inventory/inventorySlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import { API_URL } from "../../../utils/apiConfig";
import EditInventoryModal from "./EditInventoryModal";

function InventoryList() {
  const dispatch = useDispatch();

  // Redux states
  const {
    summary: reduxSummary = [],
    items: rawItems = [], // raw inventory records for edit
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((s) => s.inventory || {});

  // Local state
  const [filter, setFilter] = useState({ month: "all", year: "all" });
  const [editModal, setEditModal] = useState({ open: false, item: null });

  // ---------- Data fetching ----------
  useEffect(() => {
  
    dispatch(fetchInventory()); // Fetch raw list for edit
  }, [dispatch]);

  // ...existing code...

  
  const loading = reduxLoading;

  const parseDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  // ...existing code...

 const availableYears = useMemo(() => {
    const years = new Set(
      (rawItems || []).flatMap((item) => {
        const d = parseDate(item.date);
        return [d?.getFullYear()].filter(Boolean);
      })
    );
    return ["all", ...Array.from(years).sort((a, b) => b - a)];
  }, [rawItems]);

  const availableMonths = [
    { value: "all", label: "All Months" },
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

 const filteredRawItems = useMemo(() => {
    const base = Array.isArray(rawItems) ? rawItems : [];
    let result = base;

    if (filter.year !== "all") {
      result = result.filter((item) => {
        const d = parseDate(item.date);
        return d && d.getFullYear() === parseInt(filter.year, 10);
      });
    }

    if (filter.month !== "all") {
      result = result.filter((item) => {
        const d = parseDate(item.date);
        return d && d.getMonth() + 1 === parseInt(filter.month, 10);
      });
    }

    // Sort by Date descending for list view consistency
    return result.slice().sort((a, b) => {
      const da = parseDate(a.date) || new Date(0);
      const db = parseDate(b.date) || new Date(0);
      return db - da; 
    });
  }, [rawItems, filter]);

  // Modal state for details
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAssignments, setModalAssignments] = useState([]);
  const [modalSku, setModalSku] = useState("");
  
  // ✅ NEW: Restock modal state
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockItems, setRestockItems] = useState([]);
  const [restockSku, setRestockSku] = useState("");

  // Fetch equipment units for this SKU (equipmentId)
  const handleShowDetails = async (equipmentId, skuName) => {
    try {
      const res = await fetch(`${API_URL}/api/equipment/${equipmentId}/qrcodes`);
      const data = await res.json();
      if (data.success) {
        // Use equipment array (each doc = 1 unit in flat structure)
        const equipmentList = Array.isArray(data.equipment) ? data.equipment : (Array.isArray(data.assignments) ? data.assignments : []);
        setModalAssignments(equipmentList);
        setModalSku(skuName);
        setModalOpen(true);
      } else {
        Swal.fire({ icon: "error", title: "Failed to fetch details", text: data.message });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  // edit inventory
  const handleEditClick = (item) => {
    setEditModal({ open: true, item, loading: false });
  };

  // ✅ NEW: Fetch restocked equipment for a given inventory ID
  const handleShowRestockedItems = async (inventoryId, skuName) => {
    try {
      // Get auth token from localStorage or Redux
      let authToken = localStorage.getItem("token");
      if (!authToken) {
        Swal.fire({ icon: "error", title: "Authentication Error", text: "No token found" });
        return;
      }
      
      const res = await fetch(`${API_URL}/api/equipment?restockedFromInventoryId=${inventoryId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}` 
        }
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch restocked items");
      }
      
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setRestockItems(data);
        setRestockSku(skuName);
        setRestockModalOpen(true);
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: "Unexpected response format" });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  const handleSaveEdit = async (id, updatedData) => {
    setEditModal((prev) => ({ ...prev, loading: true }));
    try {
      await dispatch(updateInventory({ id, ...updatedData })).unwrap();
      Swal.fire({ icon: "success", title: "Updated!", text: "Inventory record updated successfully.", timer: 2000, showConfirmButton: false });
      
      // Refresh both views
      dispatch(fetchInventory());
     
      setEditModal({ open: false, item: null, loading: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update Failed", text: err.message || "Something went wrong." });
      setEditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
   <div className="w-full max-w-7xl mx-auto">
      {/* Header and Controls - Toggle removed as requested */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b pb-4 border-gray-100">
        <h2 className="text-3xl font-bold text-[#DC6D18]">
          Added Inventory Log
        </h2>
        
        <div className="flex items-center gap-3">
          <select
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
          >
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            name="year"
            value={filter.year}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y === "all" ? "All Years" : y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {/* ✅ Table updated to show single entries for direct editing */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Edit</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">Loading inventory data…</td>
                </tr>
              ) : reduxError ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-red-600 font-semibold">Failed to fetch inventory log: {reduxError}</td>
                  </tr>
              ) : filteredRawItems.length > 0 ? (
                /* ✅ Render log list with Edit button on each row */
                filteredRawItems.map((item) => (
                    <tr key={item._id} className="hover:bg-orange-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.isRestock ? (
                          <button
                            onClick={() => handleShowRestockedItems(item._id, item.skuName)}
                            className="text-[#DC6D18] hover:text-[#B85B14] font-semibold underline hover:underline-offset-2"
                            title="Click to view restocked items"
                          >
                            {item.skuName} ♻️
                          </button>
                        ) : (
                          item.skuName
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{item.batchNo || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isRestock ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                          {item.isRestock ? "Restock" : "New"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="px-3 py-1 text-[#DC6D18] hover:text-[#B85B14] font-semibold border border-[#DC6D18]/30 rounded hover:bg-orange-50 transition-colors flex items-center gap-1.5 mx-auto"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">No inventory additions match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && !reduxError && (
          <div className="px-6 py-3 text-sm text-gray-600 bg-orange-50/50">
              <span>Showing <span className="font-semibold">{filteredRawItems.length}</span> of <span className="font-semibold">{(rawItems || []).length}</span> Logged Addition Records</span>
          </div>
        )}
      </div>

      {/* Expanded Edit Modal properly integrated */}
      <EditInventoryModal
        isOpen={editModal.open}
        item={editModal.item}
        isLoading={editModal.loading}
        onClose={() => setEditModal({ open: false, item: null, loading: false })}
        onSave={handleSaveEdit}
      />

      {/* ✅ NEW: Restock Items Modal */}
      {restockModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-orange-50 border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#DC6D18]">
                Restocked Items - {restockSku} ♻️
              </h3>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="text-gray-600 hover:text-gray-900 font-bold text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {restockItems && restockItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {restockItems.map((item, idx) => (
                    <div key={item._id || idx} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-white to-orange-50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-semibold text-gray-600">Unit #</p>
                          <p className="text-gray-900">{idx + 1}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">Equipment ID</p>
                          <p className="text-gray-900 font-mono">{item.equipmentId}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">Serial No.</p>
                          <p className="text-gray-900 font-mono">{item.serialNumber}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-600">Status</p>
                          <p className="text-gray-900">{item.userId ? "Assigned" : "In Stock"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-semibold text-gray-600">Brand</p>
                          <p className="text-gray-900">{item.brand || "N/A"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-semibold text-gray-600">Batch No.</p>
                          <p className="text-gray-900 font-mono">{item.batchNo || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No restocked items found for this inventory.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryList;