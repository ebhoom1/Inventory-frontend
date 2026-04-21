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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.skuName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{item.batchNo || "N/A"}</td>
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
    </div>
  );
}

export default InventoryList;