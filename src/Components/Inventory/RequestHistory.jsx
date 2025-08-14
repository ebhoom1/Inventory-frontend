// src/components/Inventory/RequestHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { API_URL } from "../../../utils/apiConfig";
import 'sweetalert2/dist/sweetalert2.min.css';


/** ---------- Config: update these if your backend differs ---------- */
const REQUESTS_BASE = `${API_URL}/api/requests`; // GET list, POST create (elsewhere), PATCH status
const INVENTORY_BASE = `${API_URL}/api/inventory`; // only used to show SKU name fallback if needed
/** ------------------------------------------------------------------ */

const getAuthHeader = (userInfo) => {
  const token =
    userInfo?.token || userInfo?.accessToken || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const StatusBadge = ({ status }) => {
  const base = "px-3 py-1 inline-block text-xs font-semibold rounded-full";
  const map = {
    Approved: "bg-green-100 text-green-800",
    Pending: "bg-orange-100 text-orange-800",
    Denied: "bg-red-100 text-red-800",
  };
  return (
    <span className={`${base} ${map[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
};

function RequestHistory() {
  const { userInfo } = useSelector((s) => s.users || {});
  const isAdmin = userInfo?.userType === "Admin";
const [rowBusy, setRowBusy] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ month: "all", year: "all" });
  const [error, setError] = useState("");

  // ---------- Fetch: Requests ----------
  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(REQUESTS_BASE, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(userInfo),
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to load requests");
      }
      const data = await res.json();
      // normalize a bit: ensure dates + status defaults
      const normalized = (Array.isArray(data) ? data : data?.items || []).map(
        (r) => ({
          ...r,
          status: r.status || "Pending",
          requestedAt: r.requestedAt || r.date || r.createdAt || r.updatedAt,
        })
      );
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

  // ---------- Filters ----------
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
        (r) =>
          new Date(r.requestedAt || r.date || r.createdAt).getFullYear() ===
          parseInt(filter.year, 10)
      );
    }
    if (filter.month !== "all") {
      result = result.filter(
        (r) =>
          new Date(r.requestedAt || r.date || r.createdAt).getMonth() + 1 ===
          parseInt(filter.month, 10)
      );
    }
    return result;
  }, [filter, requests]);

  // ---------- Admin: Approve / Deny ----------
//   const handleDecision = async (req, nextStatus) => {
//   const niceName =
//     req.userName ||
//     req.requestorName ||
//     (req.user && (req.user.name || req.user.userName)) ||
//     (req.userId && typeof req.userId === "object" && (req.userId.name || req.userId.userName)) ||
//     (typeof req.userId === "string" ? req.userId : "-");

//   const verb = nextStatus === "Approved" ? "Approve" : "Deny";
//   console.log("[Swal] opening confirm for:", { id: req._id, nextStatus, niceName });

//   const confirm = await Swal.fire({
//     title: `${verb} this request?`,
//     html: `SKU: <b>${req.skuName || req.sku || "-"}</b> • Qty: <b>${req.quantity ?? req.requiredQuantity ?? "-"}</b><br/>User: <b>${niceName}</b>`,
//     icon: nextStatus === "Approved" ? "success" : "warning",
//     showConfirmButton: true,
//     showCancelButton: true,
//     confirmButtonText: verb,
//     confirmButtonColor: nextStatus === "Approved" ? "#16a34a" : "#dc2626",
//     cancelButtonText: "Cancel",
//     allowOutsideClick: true,
//     allowEscapeKey: true,
//     heightAuto: false, // avoids layout issues inside some containers
//     didOpen: (el) => {
//       const actions = el.querySelector(".swal2-actions");
//       if (actions) {
//         const disp = getComputedStyle(actions).display;
//         console.log("[Swal] actions display:", disp);
//         if (disp === "none") actions.style.display = "flex";
//       }
//     },
//   });

//   console.log("[Swal] result:", confirm);
//   if (!confirm.isConfirmed) return;

//   const url = `${REQUESTS_BASE}/${req._id}`;
//   const payload = { status: nextStatus };

//   console.log("[PATCH] url:", url, "payload:", payload);

//   try {
//     const res = await fetch(url, {
//       method: "PATCH",              // keep; also add a PUT route on server if needed
//       headers: {
//         "Content-Type": "application/json",
//         ...getAuthHeader(userInfo),
//       },
//       body: JSON.stringify(payload),
//     });

//     const text = await res.text();
//     console.log("[PATCH] status:", res.status, "body:", text);

//     if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

//     Swal.fire({ icon: "success", title: `Request ${nextStatus}`, timer: 1200, showConfirmButton: false });
//     setRequests((prev) => prev.map((r) => (r._id === req._id ? { ...r, status: nextStatus } : r)));
//   } catch (e) {
//     console.error("[PATCH] failed:", e);
//     Swal.fire({ icon: "error", title: "Update failed", text: e.message });
//   }
// };

const updateStatusNow = async (req, nextStatus) => {
  const id = req._id;
  if (!id) return;

  // mark row busy + optimistic UI
  setRowBusy((m) => ({ ...m, [id]: true }));
  const prev = req.status;
  setRequests((prevArr) => prevArr.map(r => r._id === id ? ({ ...r, status: nextStatus }) : r));

  try {
    const res = await fetch(`${REQUESTS_BASE}/${id}`, {
      method: "PATCH",                // keep; you can add a PUT route server-side too
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(userInfo),
      },
      body: JSON.stringify({ status: nextStatus }),
    });

    const text = await res.text();
    if (!res.ok) {
      // rollback on failure
      setRequests((prevArr) => prevArr.map(r => r._id === id ? ({ ...r, status: prev }) : r));
      throw new Error(text || `HTTP ${res.status}`);
    }

    // optional: tiny success toast (non-blocking)
    Swal.fire({ icon: "success", title: `Request ${nextStatus}`, timer: 1000, showConfirmButton: false });
  } catch (e) {
    console.error("[PATCH] failed:", e);
    Swal.fire({ icon: "error", title: "Update failed", text: e.message });
  } finally {
    setRowBusy((m) => ({ ...m, [id]: false }));
  }
};


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
                {isAdmin && (
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#DC6D18] border-t-transparent" />
                      Loading requests...
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr
                    key={req._id}
                    className="hover:bg-orange-50/50 transition-colors duration-150"
                  >
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
                        ? new Date(
                            req.requestedAt || req.date || req.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td
                      className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-xs truncate"
                      title={req.reason || ""}
                    >
                      {req.reason || "-"}
                    </td>

                  {isAdmin && (
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
                  <td
                    colSpan={isAdmin ? 7 : 6}
                    className="text-center py-10 text-gray-500"
                  >
                    No records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* (Optional) tiny helper to show SKU catalog size */}
      <FooterInventoryCount userInfo={userInfo} />
    </div>
  );
}

/** Small helper to show inventory count (good smoke test for /api/inventory) */
function FooterInventoryCount({ userInfo }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(INVENTORY_BASE, {
          headers: { ...getAuthHeader(userInfo) },
        });
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
