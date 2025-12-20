import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { API_URL } from '../../../utils/apiConfig';

function AssignedUsers() {
  const { userInfo } = useSelector((s) => s.users || {});
  const token = userInfo?.token || localStorage.getItem('token');

  // --- Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ skuName: '', username: '', serials: [] });
  const [modalLoading, setModalLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchAssigned = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/inventory/assigned-users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load assigned users');
      // sort newest first by createdAt, fallback lastUsedAt
      const arr = Array.isArray(data) ? data.slice() : [];
      const timeOf = (r) => {
        const t = r?.createdAt || r?.lastUsedAt || r?.updatedAt || null;
        const v = t ? new Date(t).getTime() : 0;
        return Number.isFinite(v) ? v : 0;
      };
      arr.sort((a, b) => timeOf(b) - timeOf(a));
      setRows(arr);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  // optimistic events: add temporary row, rollback, or refresh on confirm
  useEffect(() => {
    const onOptimisticAdd = (e) => {
      const item = e.detail;
      if (!item) return;
      setRows((prev) => [item, ...prev]);
    };
    const onConfirmAdd = () => {
      // refresh list from server
      fetchAssigned();
    };

    const onRollbackAdd = (e) => {
      const { tempId } = e.detail || {};
      if (!tempId) return;
      setRows((prev) => prev.filter((r) => r._tempId !== tempId));
    };
    window.addEventListener('inventory:optimisticAdd', onOptimisticAdd);
    window.addEventListener('inventory:confirmAdd', onConfirmAdd);
    window.addEventListener('inventory:rollbackAdd', onRollbackAdd);
    return () => {
      window.removeEventListener('inventory:optimisticAdd', onOptimisticAdd);
      window.removeEventListener('inventory:confirmAdd', onConfirmAdd);
      window.removeEventListener('inventory:rollbackAdd', onRollbackAdd);
    };
  }, [fetchAssigned]);

  // --- Handle Click on SKU to view Serials ---
  const handleSkuClick = async (row) => {
    // Open Modal immediately
    setModalData({ 
        skuName: row.skuName, 
        username: row.username, 
        serials: [] // clear previous data
    });
    setModalOpen(true);
    setModalLoading(true);

    try {
      // 1. Fetch all equipment matching the name
      // We use the existing /api/equipment endpoint
      const res = await fetch(`${API_URL}/api/equipment`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      if (!res.ok) throw new Error("Failed to fetch equipment details");
      
      const allEq = await res.json();
      
      // 2. Filter: Match SKU Name AND Assigned User
      const relevantSerials = [];
      
      if (Array.isArray(allEq)) {
          allEq.forEach(eq => {
              // Match the Equipment Name (SKU)
              if (eq.equipmentName === row.skuName) {
                  // Check assignments inside this equipment batch
                  if (eq.assignments && Array.isArray(eq.assignments)) {
                      eq.assignments.forEach(a => {
                          // Check if this specific unit is assigned to the clicked user
                          if (String(a.userId) === String(row.userId)) {
                              relevantSerials.push(a.serialNumber);
                          }
                      });
                  }
              }
          });
      }

      setModalData(prev => ({ ...prev, serials: relevantSerials }));

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not fetch serial numbers.", "error");
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  return (
   <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-6">Assigned Users</h2>

      {loading && <p className="text-center">Loading…</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
          <div className="mb-4 flex items-center justify-between">
             {/* Filter Section */}
             <div className="flex items-center gap-2">
              <label htmlFor="assigned-filter" className="text-sm font-medium text-gray-700">Filter</label>
              <input
                id="assigned-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search..."
                className="border rounded px-3 py-1 text-sm w-64"
              />
              <button onClick={() => setFilter('')} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
            </div>
            
            {/* Count Display */}
            <div className="text-sm text-gray-600">
                Showing {rows.filter(r => {
                  const q = filter.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    (r.username || '').toLowerCase().includes(q) ||
                    (r.companyName || '').toLowerCase().includes(q) ||
                    (r.skuName || '').toLowerCase().includes(q)
                  );
                }).length} results
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Username</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Company</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Inventory (SKU)</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Location</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Quantity</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Last Used</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows
                .filter(r => {
                  const q = filter.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    (r.username || '').toLowerCase().includes(q) ||
                    (r.companyName || '').toLowerCase().includes(q) ||
                    (r.skuName || '').toLowerCase().includes(q)
                  );
                })
                .map((r, idx) => (
                  <tr key={`${r.userId}-${r.skuName}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{r.username || r.userId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.companyName || '-'}</td>
                    
                    {/* CLICKABLE SKU NAME */}
                    <td className="px-4 py-3 text-sm">
                        <button 
                            onClick={() => handleSkuClick(r)}
                            className="text-[#DC6D18] font-bold hover:underline hover:text-[#B85B14] flex items-center gap-1"
                            title="Click to view serial numbers"
                        >
                            {r.skuName}
                            <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full">View</span>
                        </button>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">{r.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">{r.totalUsed}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/*  SERIAL NUMBERS MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-[#DC6D18] px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Assigned Serials</h3>
                <button onClick={() => setModalOpen(false)} className="text-white/80 hover:text-white text-2xl">&times;</button>
            </div>
            
            <div className="p-6">
                <div className="mb-4 text-sm text-gray-600">
                    <p><strong>User:</strong> {modalData.username}</p>
                    <p><strong>Item:</strong> {modalData.skuName}</p>
                </div>

                {modalLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#DC6D18]"></div>
                    </div>
                ) : (
                    <div className="max-h-60 overflow-y-auto bg-gray-50 border border-gray-100 rounded-lg p-3">
                        {modalData.serials.length > 0 ? (
                            <ul className="grid grid-cols-2 gap-2">
                                {modalData.serials.map((sn, i) => (
                                    <li key={i} className="bg-white border border-gray-200 px-3 py-1.5 rounded text-sm font-mono text-gray-700 shadow-sm flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                        {sn}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 italic py-4">No serial numbers found.</p>
                        )}
                    </div>
                )}
                
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AssignedUsers;