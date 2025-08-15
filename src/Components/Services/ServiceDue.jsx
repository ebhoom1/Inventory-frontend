// src/pages/ServiceDue.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listServiceDue } from "../../redux/features/serviceRequests/serviceRequestSlice";

/* -------------------------- Small helper for dates ------------------------- */
const DueDate = ({ value }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = value ? new Date(value) : null;

  if (!dueDate) return <span className="text-gray-400">N/A</span>;

  let cls = "text-gray-600";
  if (dueDate < today) cls = "text-red-600 font-bold";                           // Overdue
  else if (dueDate - today <= 7 * 24 * 60 * 60 * 1000) cls = "text-orange-600 font-semibold"; // Due in 7 days

  return <span className={cls}>{dueDate.toLocaleDateString()}</span>;
};

export default function ServiceDue() {
  const dispatch = useDispatch();

  // Who's logged in?
  const { userInfo } = useSelector((s) => s.users || {});
const adminRoles = ['Admin', 'Super Admin'];
const isAdmin = adminRoles.includes(userInfo?.userType);    const getActiveUserId = () =>
    userInfo?.userId || userInfo?._id || userInfo?.id || userInfo?.username || "";

  // From Redux slice
  const { due, loading, error } = useSelector((s) => s.serviceRequests);

  // Default filter → current month/year
  const now = new Date();
  const [filter, setFilter] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    includeOverdue: true,
  });

  // Fetch on mount and whenever filters/role change
  useEffect(() => {
    const q = {};
    if (filter.month !== "all") q.month = filter.month;
    if (filter.year !== "all") q.year = filter.year;
    if (filter.includeOverdue) q.includeOverdue = true;
    if (!isAdmin) {
      const uid = getActiveUserId();
      if (uid) q.userId = uid;
    }
    dispatch(listServiceDue(q));
  }, [dispatch, isAdmin, filter.month, filter.year, filter.includeOverdue]);

  // Month/Year dropdowns
  const availableMonths = [
    { value: "all", label: "All Months" }, { value: 1, label: "January" },
    { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" },
    { value: 6, label: "June" }, { value: 7, label: "July" },
    { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Prefer years from data; fallback to last 5 years
  const availableYears = useMemo(() => {
    const years = new Set(
      (due || [])
        .map((r) => r?.nextServiceDate && new Date(r.nextServiceDate).getFullYear())
        .filter(Boolean)
    );
    if (years.size === 0) {
      const y = now.getFullYear();
      return ["all", y, y - 1, y - 2, y - 3, y - 4];
    }
    return ["all", ...Array.from(years).sort((a, b) => b - a)];
  }, [due]);

  const onFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilter((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "N/A");

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">
          {isAdmin ? "Upcoming Service Due (All)" : "My Upcoming Service Due"}
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="includeOverdue"
              checked={!!filter.includeOverdue}
              onChange={onFilterChange}
              className="rounded border-gray-300 text-[#DC6D18] focus:ring-[#DC6D18]"
            />
            Include overdue
          </label>
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

      {loading && <div className="mb-3 text-sm text-gray-600">Loading due items…</div>}
      {error && <div className="mb-3 text-sm text-red-600">Error: {error}</div>}

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Service Due</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(due) && due.length > 0 ? (
                due.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.equipmentName || item.equipment || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.serviceType || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {fmt(item.serviceDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <DueDate value={item.nextServiceDate} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    No services due for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
