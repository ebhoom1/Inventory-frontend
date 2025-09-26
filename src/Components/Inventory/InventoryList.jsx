// src/pages/InventoryList/InventoryList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { fetchInventorySummary } from '../../redux/features/inventory/inventorySlice';
import { getAllUsers } from '../../redux/features/users/userSlice';
import { API_URL } from "../../../utils/apiConfig";

function InventoryList() {
  const dispatch = useDispatch();

  // Redux (global aggregated summary for Admin view)
  const {
    summary: reduxSummary = [],
    loading: reduxLoading,
    error: reduxError,
  } = useSelector((s) => s.inventory || {});

  // Auth / Users
  const {
    userInfo,
    allUsers = [],
    loading: usersLoading,
    error: usersError,
  } = useSelector((s) => s.users || {});

  const isAdmin = userInfo?.userType === 'Admin' || userInfo?.userType === 'Super Admin';
  const userId = userInfo?.userId;
  const token = userInfo?.token || localStorage.getItem('token');

  const [userSummary, setUserSummary] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  const [selectedUserId, setSelectedUserId] = useState('all');
  const [adminUserSummary, setAdminUserSummary] = useState([]);
  const [adminUserLoading, setAdminUserLoading] = useState(false);
  const [adminUserError, setAdminUserError] = useState(null);

  const [filter, setFilter] = useState({ month: 'all', year: 'all' });

  // 🔹 raw inventory data
  const [allInventories, setAllInventories] = useState([]);

  // ---------- Data fetching ----------
  useEffect(() => {
    if (!userInfo) return;

    if (isAdmin) {
      dispatch(fetchInventorySummary());
      if (!allUsers || allUsers.length === 0) {
        dispatch(getAllUsers());
      }
    } else if (userId) {
      const ac = new AbortController();
      (async () => {
        try {
          setUserLoading(true);
          setUserError(null);
          const res = await fetch(
            `${API_URL}/api/inventory/summary/${encodeURIComponent(userId)}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: ac.signal }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || 'Failed to load summary');
          setUserSummary(Array.isArray(data) ? data : []);
        } catch (e) {
          if (e.name !== 'AbortError') setUserError(e.message || 'Failed to load summary');
        } finally {
          setUserLoading(false);
        }
      })();
      return () => ac.abort();
    }
  }, [dispatch, isAdmin, userId, userInfo, token, allUsers?.length]);

  useEffect(() => {
    if (!isAdmin) return;
    if (selectedUserId === 'all') {
      setAdminUserSummary([]);
      setAdminUserError(null);
      setAdminUserLoading(false);
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        setAdminUserLoading(true);
        setAdminUserError(null);
        const res = await fetch(
          `${API_URL}/api/inventory/summary/${encodeURIComponent(selectedUserId)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {}, signal: ac.signal }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load user summary');
        setAdminUserSummary(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== 'AbortError') setAdminUserError(e.message || 'Failed to load user summary');
      } finally {
        setAdminUserLoading(false);
      }
    })();
    return () => ac.abort();
  }, [isAdmin, selectedUserId, token]);

  // 🔹 fetch raw inventories for Added By info
  useEffect(() => {
    if (!userInfo) return;
    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/inventory`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: ac.signal,
        });
        const data = await res.json();
        if (res.ok) {
          setAllInventories(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to fetch inventories", e);
      }
    })();

    return () => ac.abort();
  }, [userInfo, token]);

  const hardError = isAdmin
    ? (selectedUserId === 'all' ? reduxError : adminUserError) || usersError
    : userError;

  useEffect(() => {
    if (hardError) {
      Swal.fire({ icon: 'error', title: 'Failed to load inventory', text: hardError });
    }
  }, [hardError]);

  const summary = isAdmin
    ? (selectedUserId === 'all' ? reduxSummary : adminUserSummary)
    : userSummary;

  const loading = isAdmin
    ? (selectedUserId === 'all' ? reduxLoading : adminUserLoading)
    : userLoading;

  const parseDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  // 🔹 resolve Added By from raw inventories
  const resolveAddedBy = (skuName) => {
    const entries = allInventories.filter(
      (inv) => inv.skuName?.toLowerCase() === skuName?.toLowerCase()
    );
    if (!entries.length) return "-";
    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latest = entries[0];
    return latest.userName || latest.userId || "-";
  };

  const availableYears = useMemo(() => {
    const years = new Set(
      (summary || []).flatMap((r) => {
        const a = parseDate(r.lastAddDate || r.date);
        const u = parseDate(r.lastUseDate);
        return [a?.getFullYear(), u?.getFullYear()].filter(Boolean);
      })
    );
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, [summary]);

  const availableMonths = [
    { value: 'all', label: 'All Months' }, { value: 1, label: 'January' },
    { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' },
    { value: 6, label: 'June' }, { value: 7, label: 'July' },
    { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const filteredSummary = useMemo(() => {
    const base = Array.isArray(summary) ? summary : [];
    let result = base;

    if (filter.year !== 'all') {
      result = result.filter((r) => {
        const d = parseDate(r.lastUseDate) || parseDate(r.lastAddDate) || parseDate(r.date);
        return d && d.getFullYear() === parseInt(filter.year, 10);
      });
    }

    if (filter.month !== 'all') {
      result = result.filter((r) => {
        const d = parseDate(r.lastUseDate) || parseDate(r.lastAddDate) || parseDate(r.date);
        return d && (d.getMonth() + 1) === parseInt(filter.month, 10);
      });
    }

    return result.slice().sort((a, b) => {
      const da = parseDate(a.lastUseDate) || parseDate(a.lastAddDate) || parseDate(a.date) || new Date(0);
      const db = parseDate(b.lastUseDate) || parseDate(b.lastAddDate) || parseDate(b.date) || new Date(0);
      return db - da;
    });
  }, [summary, filter]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[#DC6D18]">
          {isAdmin ? 'Current Inventory (All Users)' : 'My Inventory'}
        </h2>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <select
              name="user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={usersLoading}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
              title="Filter by user"
            >
              <option value="all">{usersLoading ? 'Loading users…' : 'All Users'}</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u.userId}>
                  {u.userId} - {u.companyName}
                </option>
              ))}
            </select>
          )}

          <select
            name="month"
            value={filter.month}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
          >
            {availableMonths.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            name="year"
            value={filter.year}
            onChange={handleFilterChange}
            className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Added</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Used</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Left Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : filteredSummary.length > 0 ? (
                filteredSummary.map((row) => (
                  <tr key={row._id || row.skuName} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.skuName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{resolveAddedBy(row.skuName)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalAdded ?? row.quantity ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalUsed ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {row.left ?? ((row.totalAdded ?? row.quantity ?? 0) - (row.totalUsed ?? 0))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">No inventory records match the selected filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {!loading && (
          <div className="px-6 py-3 text-sm text-gray-600 bg-orange-50/50">
            Showing <span className="font-semibold">{filteredSummary.length}</span>{' '}
            of <span className="font-semibold">{(summary || []).length}</span> SKUs
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryList;
