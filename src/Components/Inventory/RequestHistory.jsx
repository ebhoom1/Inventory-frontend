import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { API_URL } from "../../../utils/apiConfig";
import "sweetalert2/dist/sweetalert2.min.css";

const REQUESTS_BASE = `${API_URL}/api/requests`;
const INVENTORY_BASE = `${API_URL}/api/inventory`;

const getAuthHeader = (userInfo) => {
  const token = userInfo?.token || userInfo?.accessToken || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const StatusBadge = ({ status }) => {
  const base = "px-3 py-1 inline-block text-xs font-semibold rounded-full";
  const map = {
    Approved: "bg-green-100 text-green-800",
    Pending: "bg-orange-100 text-orange-800",
    Denied: "bg-red-100 text-red-800",
  };
  return <span className={`${base} ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
};

function RequestHistory() {
  const { userInfo } = useSelector((s) => s.users || {});
  const role = (userInfo?.userType || "").toString().trim().toLowerCase();

  const isSuperAdmin = role === "super admin";
  const isAdmin = role === "admin";
  const isTechnician = role === 'technician';
  const canView = isSuperAdmin || isAdmin || isTechnician; // allow Tech to view
  const canModerate = isSuperAdmin;        // only super admin can approve/deny

  const [rowBusy, setRowBusy] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ month: "all", year: "all" });
  const [error, setError] = useState("");

  // Block users
  // if (!canView) {
  //   return (
  //     <div className="w-full max-w-3xl mx-auto mt-16 bg-white rounded-xl shadow p-8 text-center">
  //       <h2 className="text-2xl font-bold text-gray-800 mb-2">Access denied</h2>
  //       <p className="text-gray-600">You don&apos;t have permission to view Inventory Request History.</p>
  //     </div>
  //   );
  // }

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(REQUESTS_BASE, {
        headers: { "Content-Type": "application/json", ...getAuthHeader(userInfo) },
      });
      if (!res.ok) throw new Error((await res.text()) || "Failed to load requests");
      const data = await res.json();

      // Server already filtered by role. Just normalize + show it.
      const normalized = (Array.isArray(data) ? data : data?.items || []).map((r) => ({
        ...r,
        status: r.status || "Pending",
        requestedAt: r.requestedAt || r.date || r.createdAt || r.updatedAt,
      }));

      setRequests(normalized);
    } catch (e) {
      setError(e.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filters
  const availableYears = useMemo(() => {
    const years = new Set(
      requests
        .map((r) => new Date(r.requestedAt || r.date || r.createdAt))
        .filter((d) => !isNaN(d))
        .map((d) => d.getFullYear())
    );
    return ["all", ...Array.from(years).sort((a, b) => b - a)];
  }, [requests]);

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

  const filteredRequests = useMemo(() => {
    let result = [...requests];
    if (filter.year !== "all") {
      result = result.filter(
        (r) => new Date(r.requestedAt || r.date || r.createdAt).getFullYear() === parseInt(filter.year, 10)
      );
    }
    if (filter.month !== "all") {
      result = result.filter(
        (r) => new Date(r.requestedAt || r.date || r.createdAt).getMonth() + 1 === parseInt(filter.month, 10)
      );
    }
    return result;
  }, [filter, requests]);

  // Approve / Deny (super admin only)
  const updateStatusNow = async (req, nextStatus) => {
    if (!canModerate) return;
    const id = req._id;
    if (!id) return;

    setRowBusy((m) => ({ ...m, [id]: true }));
    const prev = req.status;
    setRequests((prevArr) => prevArr.map((r) => (r._id === id ? { ...r, status: nextStatus } : r)));

    try {
      const res = await fetch(`${REQUESTS_BASE}/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(userInfo),
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const text = await res.text();
      if (!res.ok) {
        // rollback on failure
        setRequests((prevArr) => prevArr.map((r) => (r._id === id ? { ...r, status: prev } : r)));
        throw new Error(text || `HTTP ${res.status}`);
      }

      Swal.fire({ icon: "success", title: `Request ${nextStatus}`, timer: 1000, showConfirmButton: false });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Update failed", text: e.message });
    } finally {
      setRowBusy((m) => ({ ...m, [id]: false }));
    }
  };

  const totalCols = canModerate ? 7 : 6;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header / Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[#DC6D18]">Request History</h2>
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

      {/* Error bar */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error.includes("Cannot GET")
            ? "Endpoint /api/requests not found on server. Either create the route or update REQUESTS_BASE in this file."
            : error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                {canModerate && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={totalCols} className="px-6 py-8">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#DC6D18] border-t-transparent" />
                      Loading requests...
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.skuName || req.sku || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {req.requestorName || req.userName || req.userId || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {req.quantity ?? req.requiredQuantity ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {req.requestedAt || req.date || req.createdAt
                        ? new Date(req.requestedAt || req.date || req.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-xs truncate" title={req.reason || ""}>
                      {req.reason || "-"}
                    </td>

                    {canModerate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatusNow(req, "Approved")}
                            disabled={rowBusy[req._id] || req.status === "Approved"}
                            className="px-3 py-1 rounded-md bg-green-600 text-white disabled:opacity-40"
                          >
                            {rowBusy[req._id] ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => updateStatusNow(req, "Denied")}
                            disabled={rowBusy[req._id] || req.status === "Denied"}
                            className="px-3 py-1 rounded-md bg-red-600 text-white disabled:opacity-40"
                          >
                            {rowBusy[req._id] ? "..." : "Deny"}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={totalCols} className="text-center py-10 text-gray-500">
                    No records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FooterInventoryCount userInfo={userInfo} />
    </div>
  );
}

function FooterInventoryCount({ userInfo }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(INVENTORY_BASE, { headers: { ...getAuthHeader(userInfo) } });
        if (!res.ok) return;
        const data = await res.json();
        const items = Array.isArray(data) ? data : data?.items || [];
        setCount(items.length);
      } catch {}
    })();
  }, [userInfo]);
  if (count == null) return null;
  return (
    <div className="text-xs text-gray-500 mt-3">
      Inventory items available: <b>{count}</b>
    </div>
  );
}

export default RequestHistory;
