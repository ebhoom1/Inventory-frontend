// src/pages/InventoryList/InventoryList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { fetchInventorySummary } from '../../redux/features/inventory/inventorySlice';

function InventoryList() {
  const dispatch = useDispatch();
  const { summary = [], loading, error } = useSelector((s) => s.inventory);
 const { userInfo } = useSelector((state) => state.users);
  const [filter, setFilter] = useState({ month: 'all', year: 'all' });
console.log('userifo',userInfo);

  useEffect(() => {
    dispatch(fetchInventorySummary());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Swal.fire({ icon: 'error', title: 'Failed to load inventory', text: error });
    }
  }, [error]);

  const parseDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  // Build years from both lastAddDate & lastUseDate
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

  // Filter by the most recent activity date (max of add/use)
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
        return d && d.getMonth() + 1 === parseInt(filter.month, 10);
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
        <h2 className="text-3xl font-bold text-[#DC6D18]">Current Inventory</h2>
        <div className="flex items-center gap-3">
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Added</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity Used</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Left Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Update Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading…</td></tr>
              ) : filteredSummary.length > 0 ? (
                filteredSummary.map((row) => {
                  const lastDate = parseDate(row.lastUseDate) || parseDate(row.lastAddDate);
                  return (
                    <tr key={row.skuName} className="hover:bg-orange-50/50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.skuName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{row.lastUsedBy || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalAdded ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{row.totalUsed ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{row.left ?? 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lastDate ? lastDate.toLocaleDateString() : '-'}</td>
                    </tr>
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
            of <span className="font-semibold">{summary.length}</span> SKUs
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryList;
