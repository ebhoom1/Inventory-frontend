import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { API_URL } from '../../../utils/apiConfig';

function AssignedUsers() {
  const { userInfo } = useSelector((s) => s.users || {});
  const token = userInfo?.token || localStorage.getItem('token');

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchAssigned = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/inventory/assigned-users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load assigned users');
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchAssigned();
  }, [token]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-[#DC6D18] mb-6">Assigned Users</h2>

      {loading && <p className="text-center">Loading…</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="assigned-filter" className="text-sm font-medium text-gray-700">Filter</label>
              <input
                id="assigned-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search username, company, SKU or location"
                className="border rounded px-3 py-1 text-sm w-64"
              />
              <button
                onClick={() => setFilter('')}
                className="text-sm text-gray-500 hover:text-gray-700"
                type="button"
              >
                Clear
              </button>
            </div>
            <div className="text-sm text-gray-600">Showing {rows.filter(r => {
              const q = filter.trim().toLowerCase();
              if (!q) return true;
              return (
                (r.username || '').toString().toLowerCase().includes(q) ||
                (r.companyName || '').toString().toLowerCase().includes(q) ||
                (r.skuName || '').toString().toLowerCase().includes(q) ||
                (r.location || '').toString().toLowerCase().includes(q)
              );
            }).length} results</div>
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
              {(() => {
                const q = filter.trim().toLowerCase();
                const filtered = rows.filter(r => {
                  if (!q) return true;
                  return (
                    (r.username || '').toString().toLowerCase().includes(q) ||
                    (r.companyName || '').toString().toLowerCase().includes(q) ||
                    (r.skuName || '').toString().toLowerCase().includes(q) ||
                    (r.location || '').toString().toLowerCase().includes(q)
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">No assigned inventory found.</td>
                    </tr>
                  );
                }

                return filtered.map((r, idx) => (
                  <tr key={`${r.userId}-${r.skuName}-${r.location || 'nil'}-${idx}`}>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.username || r.userId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.companyName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.skuName}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-right">{r.totalUsed}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleString() : '-'}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AssignedUsers;
