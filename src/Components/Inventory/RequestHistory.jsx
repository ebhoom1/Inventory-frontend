import React, { useState, useEffect, useMemo } from 'react';

// Sample data to populate the table. In a real app, this would come from an API.
const sampleRequests = [
  {
    sku: 'HELMET-RD-01',
    username: 'John Doe',
    quantity: 10,
    status: 'Approved',
    date: '2025-08-05',
    reason: 'New construction site requirement.',
  },
  {
    sku: 'GLOVES-HV-15',
    username: 'Jane Smith',
    quantity: 50,
    status: 'Pending',
    date: '2025-08-02',
    reason: 'Restocking for the main warehouse.',
  },
  {
    sku: 'BOOTS-STL-42',
    username: 'Priya Kumar',
    quantity: 25,
    status: 'Denied',
    date: '2025-07-28',
    reason: 'Duplicate request. Original approved.',
  },
  {
    sku: 'GOGGLES-CL-05',
    username: 'John Doe',
    quantity: 100,
    status: 'Approved',
    date: '2025-07-15',
    reason: 'Quarterly safety gear refresh.',
  },
  {
    sku: 'VEST-RF-LG',
    username: 'Amit Singh',
    quantity: 30,
    status: 'Approved',
    date: '2024-12-10',
    reason: 'Night shift team expansion.',
  },
  {
    sku: 'MASK-N95-BX',
    username: 'Jane Smith',
    quantity: 200,
    status: 'Pending',
    date: '2025-08-06',
    reason: 'Health and safety compliance update.',
  },
];

// Helper function to render the status badge with appropriate colors
const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 inline-block text-xs font-semibold rounded-full";
  const statusClasses = {
    Approved: "bg-green-100 text-green-800",
    Pending: "bg-orange-100 text-orange-800",
    Denied: "bg-red-100 text-red-800",
  };
  return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};


function RequestHistory() {
  const [requests, setRequests] = useState(sampleRequests);
  const [filteredRequests, setFilteredRequests] = useState(sampleRequests);
  const [filter, setFilter] = useState({ month: 'all', year: 'all' });

  // Memoize the years and months to prevent recalculation on every render
  const availableYears = useMemo(() => {
    const years = new Set(requests.map(r => new Date(r.date).getFullYear()));
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, [requests]);

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
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  // Effect to apply filters when the filter state or original data changes
  useEffect(() => {
    let result = requests;

    if (filter.year !== 'all') {
      result = result.filter(r => new Date(r.date).getFullYear() === parseInt(filter.year));
    }
    if (filter.month !== 'all') {
      result = result.filter(r => new Date(r.date).getMonth() + 1 === parseInt(filter.month));
    }

    setFilteredRequests(result);
  }, [filter, requests]);


  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Filters and Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-[#DC6D18] ">Request History</h2>
        <div className="flex items-center gap-3">
          <select name="month" value={filter.month} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]">
            {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select name="year" value={filter.year} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]">
            {availableYears.map(y => <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>)}
          </select>
        </div>
      </div>

      {/* Table Container with shadow and rounded corners */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req, index) => (
                  <tr key={index} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">No records match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default RequestHistory;