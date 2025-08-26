// // src/pages/InventoryList/InventoryList.jsx
// import React, { useEffect, useMemo, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import Swal from 'sweetalert2';
// import { fetchInventorySummary } from '../../redux/features/inventory/inventorySlice';
// import { API_URL } from "../../../utils/apiConfig";

// function InventoryList() {
// const dispatch = useDispatch();

//   // Redux (admin path)
//   const { summary: reduxSummary = [], loading: reduxLoading, error: reduxError } =
//     useSelector((s) => s.inventory || {});

//   // Auth
//   const { userInfo } = useSelector((state) => state.users || {});
//   const isAdmin = userInfo?.userType === 'Admin' || 'Super Admin';
//   const userId = userInfo?.userId;
//   const token =
//     userInfo?.token ||
//     localStorage.getItem('token');

//   // Local state (user path)
//   const [userSummary, setUserSummary] = useState([]);
//   const [userLoading, setUserLoading] = useState(false);
//   const [userError, setUserError] = useState(null);

//   // Filters
//   const [filter, setFilter] = useState({ month: 'all', year: 'all' });

//   // --------- Data fetching ----------
//   useEffect(() => {
//     if (!userInfo) return;

//     if (isAdmin) {
//       // Admin: existing redux flow (global summary)
//       dispatch(fetchInventorySummary());
//     } else if (userId) {
//       // User: hit /api/inventory/summary/:userId directly
//       const ac = new AbortController();
//       (async () => {
//         try {
//           setUserLoading(true);
//           setUserError(null);
//           const res = await fetch(
//             `${API_URL}/api/inventory/summary/${encodeURIComponent(userId)}`,
//             {
//               headers: token ? { Authorization: `Bearer ${token}` } : {},
//               signal: ac.signal,
//             }
//           );
//           const data = await res.json();
//           if (!res.ok) throw new Error(data?.message || 'Failed to load summary');
//           setUserSummary(Array.isArray(data) ? data : []);
//         } catch (e) {
//           if (e.name !== 'AbortError') setUserError(e.message || 'Failed to load summary');
//         } finally {
//           setUserLoading(false);
//         }
//       })();
//       return () => ac.abort();
//     }
//   }, [dispatch, isAdmin, userId, userInfo, token]);

//   // Error handling alerts
//   useEffect(() => {
//     const msg = isAdmin ? reduxError : userError;
//     if (msg) Swal.fire({ icon: 'error', title: 'Failed to load inventory', text: msg });
//   }, [reduxError, userError, isAdmin]);

//   // Pick correct data source
//   const summary = isAdmin ? reduxSummary : userSummary;
//   const loading = isAdmin ? reduxLoading : userLoading;

//   // --------- Helpers & derived data ----------
//   const parseDate = (d) => {
//     if (!d) return null;
//     const dt = new Date(d);
//     return Number.isNaN(dt.getTime()) ? null : dt;
//   };

//   // Years from both lastAddDate & lastUseDate
//   const availableYears = useMemo(() => {
//     const years = new Set(
//       (summary || []).flatMap((r) => {
//         const a = parseDate(r.lastAddDate);
//         const u = parseDate(r.lastUseDate);
//         return [a?.getFullYear(), u?.getFullYear()].filter(Boolean);
//       })
//     );
//     return ['all', ...Array.from(years).sort((a, b) => b - a)];
//   }, [summary]);

//   const availableMonths = [
//     { value: 'all', label: 'All Months' }, { value: 1, label: 'January' },
//     { value: 2, label: 'February' }, { value: 3, label: 'March' },
//     { value: 4, label: 'April' }, { value: 5, label: 'May' },
//     { value: 6, label: 'June' }, { value: 7, label: 'July' },
//     { value: 8, label: 'August' }, { value: 9, label: 'September' },
//     { value: 10, label: 'October' }, { value: 11, label: 'November' },
//     { value: 12, label: 'December' },
//   ];

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilter((prev) => ({ ...prev, [name]: value }));
//   };

//   // Most recent activity date
//   const filteredSummary = useMemo(() => {
//     const base = Array.isArray(summary) ? summary : [];
//     let result = base;

//     if (filter.year !== 'all') {
//       result = result.filter((r) => {
//         const d = parseDate(r.lastUseDate) || parseDate(r.lastAddDate);
//         return d && d.getFullYear() === parseInt(filter.year, 10);
//       });
//     }
//     if (filter.month !== 'all') {
//       result = result.filter((r) => {
//         const d = parseDate(r.lastUseDate) || parseDate(r.lastAddDate);
//         return d && d.getMonth() + 1 === parseInt(filter.month, 10);
//       });
//     }

//     return result.slice().sort((a, b) => {
//       const da = parseDate(a.lastUseDate) || parseDate(a.lastAddDate) || new Date(0);
//       const db = parseDate(b.lastUseDate) || parseDate(b.lastAddDate) || new Date(0);
//       return db - da;
//     });
//   }, [summary, filter]);

//   return (
//     <div className="w-full max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//         <h2 className="text-3xl font-bold text-[#DC6D18]">
//           {isAdmin ? 'Current Inventory (All Users)' : 'My Inventory'}
//         </h2>
//         <div className="flex items-center gap-3">
//           <select
//             name="month"
//             value={filter.month}
//             onChange={handleFilterChange}
//             className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
//           >
//             {availableMonths.map((m) => (
//               <option key={m.value} value={m.value}>{m.label}</option>
//             ))}
//           </select>
//           <select
//             name="year"
//             value={filter.year}
//             onChange={handleFilterChange}
//             className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
//           >
//             {availableYears.map((y) => (
//               <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="bg-white shadow-lg rounded-xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-orange-50">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated By</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Added</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Used</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Left Quantity</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Update Date</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {loading ? (
//                 <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading…</td></tr>
//               ) : filteredSummary.length > 0 ? (
//                 filteredSummary.map((row) => {
//                   const lastDate = parseDate(row.lastUseDate) || parseDate(row.lastAddDate);
//                   return (
//                     <tr key={row.skuName} className="hover:bg-orange-50/50 transition-colors duration-150">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.skuName}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.lastUsedBy || '-'}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalAdded ?? 0}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalUsed ?? 0}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{row.left ?? 0}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lastDate ? lastDate.toLocaleDateString() : '-'}</td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr><td colSpan="6" className="text-center py-10 text-gray-500">No inventory records match the selected filters.</td></tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         {!loading && (
//           <div className="px-6 py-3 text-sm text-gray-600 bg-orange-50/50">
//             Showing <span className="font-semibold">{filteredSummary.length}</span>{' '}
//             of <span className="font-semibold">{(summary || []).length}</span> SKUs
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default InventoryList;


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

  // Correct admin check
  const isAdmin = userInfo?.userType === 'Admin' || userInfo?.userType === 'Super Admin';
  const userId = userInfo?.userId;
  const token = userInfo?.token || localStorage.getItem('token');

  // Non-admin (self) summary
  const [userSummary, setUserSummary] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  // Admin: selected user filter
  const [selectedUserId, setSelectedUserId] = useState('all');

  // Admin: per-user summary (when a specific user is chosen)
  const [adminUserSummary, setAdminUserSummary] = useState([]);
  const [adminUserLoading, setAdminUserLoading] = useState(false);
  const [adminUserError, setAdminUserError] = useState(null);

  // Filters
  const [filter, setFilter] = useState({ month: 'all', year: 'all' });

  // ---------- Data fetching ----------
  useEffect(() => {
    if (!userInfo) return;

    if (isAdmin) {
      // All users (global) summary from Redux
      dispatch(fetchInventorySummary());
      // Users list for dropdown
      if (!allUsers || allUsers.length === 0) {
        dispatch(getAllUsers());
      }
    } else if (userId) {
      // Non-admin: fetch own summary from backend
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

  // Admin: fetch per-user summary when a specific user is selected
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

  // Error toasts
  const hardError = isAdmin
    ? (selectedUserId === 'all' ? reduxError : adminUserError) || usersError
    : userError;

  useEffect(() => {
    if (hardError) {
      Swal.fire({ icon: 'error', title: 'Failed to load inventory', text: hardError });
    }
  }, [hardError]);

  // Decide dataset & loading
  const summary = isAdmin
    ? (selectedUserId === 'all' ? reduxSummary : adminUserSummary)
    : userSummary;

  const loading = isAdmin
    ? (selectedUserId === 'all' ? reduxLoading : adminUserLoading)
    : userLoading;

  // ---------- Helpers & derived data ----------
  const parseDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return Number.isNaN(dt.getTime()) ? null : dt;
  };

  // Admin: build user dropdown (only User role)
  const userOptions = useMemo(() => {
    if (!isAdmin) return [];
    const arr = Array.isArray(allUsers) ? allUsers : [];
    return arr
      .filter((u) => u.userType === 'User')
      .sort((a, b) => (a.userId || '').localeCompare(b.userId || ''));
  }, [isAdmin, allUsers]);

  // Years from both lastAddDate & lastUseDate
  const availableYears = useMemo(() => {
    const years = new Set(
      (summary || []).flatMap((r) => {
        const a = parseDate(r.lastAddDate);
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

  // Apply month/year filters + sort by most recent activity
  const filteredSummary = useMemo(() => {
    const base = Array.isArray(summary) ? summary : [];
    let result = base;

    if (filter.year !== 'all') {
      result = result.filter((r) => {
        const d = parseDate(r.lastUseDate) || parseDate(r.lastAddDate);
        return d && d.getFullYear() === parseInt(filter.year, 10);
      });
    }

    if (filter.month !== 'all') {
      result = result.filter((r) => {
        const d = parseDate(r.lastUseDate) || parseDate(r.lastAddDate);
        return d && (d.getMonth() + 1) === parseInt(filter.month, 10);
      });
    }

    return result.slice().sort((a, b) => {
      const da = parseDate(a.lastUseDate) || parseDate(a.lastAddDate) || new Date(0);
      const db = parseDate(b.lastUseDate) || parseDate(b.lastAddDate) || new Date(0);
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
          {/* Admin-only User filter */}
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
              {userOptions.map((u) => (
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
{/*               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated By</th>
 */}                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Added</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Used</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Left Quantity</th>
{/*                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Update Date</th>
 */}              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : filteredSummary.length > 0 ? (
                filteredSummary.map((row) => {
                  const lastDate = parseDate(row.lastUseDate) || parseDate(row.lastAddDate);
                  return (
                    <tr
                      key={`${row.skuName}-${row.lastUsedBy || ''}-${row.lastAddDate || ''}`}
                      className="hover:bg-orange-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.skuName}</td>
{/*                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.lastUsedBy || '-'}</td>
 */}                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalAdded ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalUsed ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{row.left ?? 0}</td>
{/*                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lastDate ? lastDate.toLocaleDateString() : '-'}</td>
 */}                    </tr>
                  );
                })
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
