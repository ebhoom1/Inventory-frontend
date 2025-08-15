// src/pages/ServiceHistory.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listAllServiceRequests,
  listServiceRequestsByUserId,
  updateServiceRequestStatus,
  resetServiceRequestState,
} from "../../redux/features/serviceRequests/serviceRequestSlice";

/* ----------------------------- UI Subcomponents ---------------------------- */
const StatusBadge = ({ status }) => {
  const base = "px-3 py-1 inline-block text-xs font-semibold rounded-full";
  const map = {
    Serviced: "bg-green-100 text-green-800",
    Pending: "bg-orange-100 text-orange-800",
    Denied: "bg-red-100 text-red-800",
  };
  return <span className={`${base} ${map[status] || "bg-gray-100 text-gray-800"}`}>{status}</span>;
};

const Modal = ({ open, onClose, children, title }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

/* ---------------------------------- Page ---------------------------------- */
export default function ServiceHistory() {
  const dispatch = useDispatch();

  // You said your users slice stores userInfo here:
  const { userInfo } = useSelector((s) => s.users || {});
const adminRoles = ['Admin', 'Super Admin'];
const isAdmin = adminRoles.includes(userInfo?.userType);  
const [rowBusy, setRowBusy] = useState({});
  // serviceRequests state from the slice
  const { loading, error, all, byUser, successMessage } = useSelector((s) => s.serviceRequests);

  // Filters + paging
  const now = new Date();
  const currentYear = now.getFullYear();
  const [filter, setFilter] = useState({ month: "all", year: "all" });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Update modal state (admin only)
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null); // current request object
  const [editForm, setEditForm] = useState({
    status: "Pending",
    serviceDate: "",
    nextServiceDate: "",
    technicianName: "",
  });

  // Derive the dataset to render based on role
  const data = isAdmin ? all : byUser;
  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Available years for dropdown: current → current-4
  const availableYears = useMemo(() => {
    const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];
    return ["all", ...years];
  }, [currentYear]);

  const availableMonths = [
    { value: "all", label: "All Months" }, { value: 1, label: "January" },
    { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" },
    { value: 6, label: "June" }, { value: 7, label: "July" },
    { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Helpers
  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");
  const getActiveUserId = () =>
    userInfo?.userId || userInfo?._id || userInfo?.id || userInfo?.username || "UNKNOWN";

  const buildQuery = () => {
    const q = {};
    if (filter.month !== "all") q.month = filter.month;
    if (filter.year !== "all") q.year = filter.year;
    q.page = page;
    q.limit = limit;
    q.sort = "-reportedDate,-createdAt";
    return q;
  };

  // Fetch on mount + whenever filters/page change
  useEffect(() => {
    const query = buildQuery();
    if (isAdmin) {
      dispatch(listAllServiceRequests(query));
    } else {
      const userId = getActiveUserId();
      dispatch(listServiceRequestsByUserId({ userId, ...query }));
    }
  }, [dispatch, isAdmin, filter.month, filter.year, page, limit]);

  // Close modal on success
  useEffect(() => {
    if (successMessage && editOpen) {
      setEditOpen(false);
      setEditing(null);
      dispatch(resetServiceRequestState());
      // Refetch current page to reflect any backend changes fully
      const query = buildQuery();
      if (isAdmin) dispatch(listAllServiceRequests(query));
      else dispatch(listServiceRequestsByUserId({ userId: getActiveUserId(), ...query }));
    }
  }, [successMessage, editOpen, dispatch, isAdmin]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((p) => ({ ...p, [name]: value }));
    setPage(1); // reset page on filter change
  };

  const openEdit = (req) => {
    setEditing(req);
    setEditForm({
      status: req.status || "Pending",
      serviceDate: req.serviceDate ? req.serviceDate.substring(0, 10) : "",
      nextServiceDate: req.nextServiceDate ? req.nextServiceDate.substring(0, 10) : "",
      technicianName: req.technicianName || "",
    });
    setEditOpen(true);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editing?._id) return;

    // When status is "Serviced", backend requires serviceDate and technicianName
    if (editForm.status === "Serviced" && (!editForm.serviceDate || !editForm.technicianName)) {
      alert("When status is Serviced, Service Date and Technician Name are required.");
      return;
    }

    const updates = {
      status: editForm.status,
      updatedBy: getActiveUserId(),
    };

    if (editForm.serviceDate) updates.serviceDate = editForm.serviceDate;
    if (editForm.nextServiceDate) updates.nextServiceDate = editForm.nextServiceDate;
    if (editForm.technicianName) updates.technicianName = editForm.technicianName;

    dispatch(updateServiceRequestStatus({ id: editing._id, updates }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header + filters */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          {isAdmin ? "All Service Requests" : "My Service Requests"}
        </h2>

        <div className="flex items-center gap-3">
          <select
            name="month"
            value={filter.month}
            onChange={onFilterChange}
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
            onChange={onFilterChange}
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

      {/* Status bar */}
      {loading && <div className="mb-3 text-sm text-gray-600">Loading requests…</div>}
      {error && <div className="mb-3 text-sm text-red-600">Error: {error}</div>}

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type of Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Service Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{isAdmin ? "Actions" : "Details"}</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {items.length > 0 ? (
                items.map((req) => (
                  <tr key={req._id || req.id} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {req.equipmentName || req.equipment || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.serviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.userId || req.requestedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={req.faultDescription || req.description}>
                      {req.faultDescription || req.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fmt(req.reportedDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fmt(req.serviceDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{fmt(req.nextServiceDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {req.technicianName || req.technician || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isAdmin ? (
                        <button
                          onClick={() => openEdit(req)}
                          className="px-3 py-1 bg-[#DC6D18] text-white text-xs font-semibold rounded-md shadow-md hover:bg-[#B85B14]"
                        >
                          Update
                        </button>
                      ) : (
                        <button className="text-[#DC6D18] hover:text-[#B85B14] font-semibold">View</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-10 text-gray-500">
                    No records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-600">
            {total > 0 ? (
              <>
                Showing{" "}
                <span className="font-semibold">
                  {(page - 1) * limit + 1}–{Math.min(page * limit, total)}
                </span>{" "}
                of <span className="font-semibold">{total}</span>
              </>
            ) : (
              "No results"
            )}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`px-3 py-1 rounded-md border ${
                page <= 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Prev
            </button>
            <span className="px-2 py-1 text-gray-600">Page {page} / {Math.max(totalPages, 1)}</span>
            <button
              disabled={page >= Math.max(totalPages, 1)}
              onClick={() => setPage((p) => p + 1)}
              className={`px-3 py-1 rounded-md border ${
                page >= Math.max(totalPages, 1)
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Update Modal (Admin only) */}
      <Modal
        open={isAdmin && editOpen}
        onClose={() => setEditOpen(false)}
        title={`Update Status — ${editing?.equipmentName || ""}`}
      >
        <form onSubmit={submitEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Serviced">Serviced</option>
              <option value="Denied">Denied</option>
            </select>
          </div>

          {editForm.status === "Serviced" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
                <input
                  type="date"
                  value={editForm.serviceDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, serviceDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
                <input
                  type="text"
                  value={editForm.technicianName}
                  onChange={(e) => setEditForm((p) => ({ ...p, technicianName: e.target.value }))}
                  placeholder="e.g., Alex Ray"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date (optional)</label>
                <input
                  type="date"
                  value={editForm.nextServiceDate}
                  onChange={(e) => setEditForm((p) => ({ ...p, nextServiceDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>
            </>
          )}

          {editForm.status !== "Serviced" && (
            <div className="text-xs text-gray-500">
              When status = <b>Serviced</b>, you must specify <b>Service Date</b> and <b>Technician Name</b>.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#DC6D18] text-white font-semibold hover:bg-[#B85B14]"
            >
              Update
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
