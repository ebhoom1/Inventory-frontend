// src/pages/InventoryList/InventoryList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { fetchInventorySummary } from "../../redux/features/inventory/inventorySlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import { API_URL } from "../../../utils/apiConfig";

function InventoryList() {
  const dispatch = useDispatch();

  // Redux (global aggregated summary for Admin view)
  const {
    summary: reduxSummary = [],
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((s) => s.inventory || {});

  // ...existing code...
  const [filter, setFilter] = useState({ month: "all", year: "all" });

  // ---------- Data fetching ----------
  useEffect(() => {
    dispatch(fetchInventorySummary("all"));
  }, [dispatch]);

  useEffect(() => {
    // No user filtering, only fetch all summary
  }, []);

  // 🔹 fetch raw inventories for Added By info
  useEffect(() => {
    // Removed effect for fetching allInventories and userInfo
    // Effect removed as it referenced userInfo
  }, []);

  // ...existing code...

  const summary = reduxSummary;
  const loading = reduxLoading;

  const parseDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  // ...existing code...

  const availableYears = useMemo(() => {
    const years = new Set(
      (summary || []).flatMap((r) => {
        const a = parseDate(r.lastAddDate || r.date);
        const u = parseDate(r.lastUseDate);
        return [a?.getFullYear(), u?.getFullYear()].filter(Boolean);
      })
    );
    return ["all", ...Array.from(years).sort((a, b) => b - a)];
  }, [summary]);

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

  const filteredSummary = useMemo(() => {
    const base = Array.isArray(summary) ? summary : [];
    let result = base;

    if (filter.year !== "all") {
      result = result.filter((r) => {
        const d =
          parseDate(r.lastUseDate) ||
          parseDate(r.lastAddDate) ||
          parseDate(r.date);
        return d && d.getFullYear() === parseInt(filter.year, 10);
      });
    }

    if (filter.month !== "all") {
      result = result.filter((r) => {
        const d =
          parseDate(r.lastUseDate) ||
          parseDate(r.lastAddDate) ||
          parseDate(r.date);
        return d && d.getMonth() + 1 === parseInt(filter.month, 10);
      });
    }

    return result.slice().sort((a, b) => {
      const da =
        parseDate(a.lastUseDate) ||
        parseDate(a.lastAddDate) ||
        parseDate(a.date) ||
        new Date(0);
      const db =
        parseDate(b.lastUseDate) ||
        parseDate(b.lastAddDate) ||
        parseDate(b.date) ||
        new Date(0);
      return db - da;
    });
  }, [summary, filter]);

  // Modal state for details
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAssignments, setModalAssignments] = useState([]);
  const [modalSku, setModalSku] = useState("");

  // Fetch assignments for a SKU (equipmentId)
  const handleShowDetails = async (equipmentId, skuName) => {
    try {
      const res = await fetch(`${API_URL}/api/equipment/${equipmentId}/qrcodes`);
      const data = await res.json();
      if (data.success) {
        setModalAssignments(data.assignments);
        setModalSku(skuName);
        setModalOpen(true);
      } else {
        Swal.fire({ icon: "error", title: "Failed to fetch details", text: data.message });
      }
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[#DC6D18]">
          Inventory List
        </h2>
        {/* ...existing filter UI... */}
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Added</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Used</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Left Quantity</th>
              
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">Loading…</td>
                </tr>
              ) : filteredSummary.length > 0 ? (
                filteredSummary.map((row) => (
                  <tr key={row._id || row.skuName} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.skuName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalAdded ?? row.quantity ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalUsed ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{row.left ?? (row.totalAdded ?? row.quantity ?? 0) - (row.totalUsed ?? 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row._id && (
                        <button
                          className="px-3 py-1 bg-[#DC6D18] text-white rounded hover:bg-[#B85B14]"
                          onClick={() => handleShowDetails(row._id, row.skuName)}
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">No inventory records match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-6 py-3 text-sm text-gray-600 bg-orange-50/50">
            Showing <span className="font-semibold">{filteredSummary.length}</span> of <span className="font-semibold">{(summary || []).length}</span> SKUs
          </div>
        )}
      </div>
      {/* Modal for assignment and QR code details */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-3xl w-full max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-[#DC6D18]">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {modalSku}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Assignments & QR Codes</p>
              </div>
              <button
                className="text-2xl text-gray-400 hover:text-gray-600 font-bold"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            {modalAssignments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No assignments found for this inventory.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-600 mb-4">
                  Total Units: <span className="text-[#DC6D18]">{modalAssignments.length}</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {modalAssignments.map((assignment, idx) => (
                    <div
                      key={assignment.serialNumber + idx}
                      className="border border-[#DC6D18]/30 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
                    >
                      {/* Assignment Details */}
                      <div className="space-y-3 mb-4">
                        <div className="border-b border-gray-100 pb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">User ID</p>
                          <p className="text-sm font-bold text-gray-800">{assignment.userId}</p>
                        </div>
                        
                        {assignment.companyName && (
                          <div className="border-b border-gray-100 pb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</p>
                            <p className="text-sm font-medium text-gray-700">{assignment.companyName}</p>
                          </div>
                        )}

                        <div className="border-b border-gray-100 pb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Serial Number</p>
                          <p className="text-sm font-mono text-gray-800">{assignment.serialNumber}</p>
                        </div>

                        {assignment.location && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</p>
                            <p className="text-sm text-gray-700">{assignment.location}</p>
                          </div>
                        )}
                      </div>

                      {/* QR Code Display */}
                      <div className="flex flex-col items-center space-y-3 py-4 border-t border-gray-100">
                        {assignment.qrImage ? (
                          <>
                            <img
                              src={assignment.qrImage}
                              alt={`QR-${assignment.serialNumber}`}
                              className="w-32 h-32 border-2 border-[#DC6D18] rounded p-1"
                            />
                            <button
                              className="w-full px-4 py-2 bg-[#DC6D18] text-white font-semibold rounded-lg hover:bg-[#B85B14] transition-colors duration-150 flex items-center justify-center gap-2"
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = assignment.qrImage;
                                link.download = `QR-${modalSku}-${assignment.serialNumber}.png`;
                                link.click();
                              }}
                            >
                              ⬇ Download QR
                            </button>
                          </>
                        ) : (
                          <p className="text-gray-400 italic">No QR code available</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-150 font-medium"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryList;
