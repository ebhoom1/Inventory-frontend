import React, { useState, useEffect, useMemo } from 'react';

// Sample data updated to include 'serviceType'
const sampleServiceHistory = [
  {
    id: 1,
    equipment: 'Hydraulic Pump Unit 42',
    serviceType: 'Repair',
    requestedBy: 'John Doe',
    description: 'Unit is making a loud grinding noise and leaking hydraulic fluid.',
    reportedDate: '2025-08-05',
    status: 'Serviced',
    serviceDate: '2025-08-06',
    nextService:'2025-09-08',
    technician: 'Alex Ray',
  },
  {
    id: 2,
    equipment: 'Air Compressor C-113',
    serviceType: 'Inspection',
    requestedBy: 'Jane Smith',
    description: 'Fails to reach target pressure. Suspected valve issue.',
    reportedDate: '2025-08-04',
    status: 'Pending',
    serviceDate: 'N/A',
    nextService:'2025-09-08',
    technician: 'N/A',
  },
  {
    id: 3,
    equipment: 'Conveyor Belt B-07',
    serviceType: 'Routine Maintenance',
    requestedBy: 'Priya Kumar',
    description: 'Request for routine annual maintenance and lubrication.',
    reportedDate: '2025-07-22',
    status: 'Denied',
    serviceDate: 'N/A',
    nextService:'2025-09-08',
    technician: 'N/A',
  },
  {
    id: 4,
    equipment: 'CNC Machine 5-Axis',
    serviceType: 'Calibration',
    requestedBy: 'John Doe',
    description: 'Spindle is vibrating excessively at high RPMs.',
    reportedDate: '2025-07-18',
    status: 'Serviced',
    serviceDate: '2025-07-20',
    nextService:'2025-09-08',
    technician: 'Chris Lee',
  },
  {
    id: 5,
    equipment: 'Industrial Generator G-9',
    serviceType: 'Repair',
    requestedBy: 'Amit Singh',
    description: 'Failing to start. Battery and ignition system check required.',
    reportedDate: '2024-12-15',
    status: 'Serviced',
    serviceDate: '2024-12-16',
    nextService:'2025-09-08',
    technician: 'Alex Ray',
  },
];

// Reusable component for rendering the status badge with appropriate colors
const StatusBadge = ({ status }) => {
  const baseClasses = "px-3 py-1 inline-block text-xs font-semibold rounded-full";
  const statusClasses = {
    Serviced: "bg-green-100 text-green-800",
    Pending: "bg-orange-100 text-orange-800",
    Denied: "bg-red-100 text-red-800",
  };
  return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

function ServiceHistory() {
  const [serviceHistory, setServiceHistory] = useState(sampleServiceHistory);
  const [filteredHistory, setFilteredHistory] = useState(sampleServiceHistory);
  const [filter, setFilter] = useState({ month: 'all', year: 'all' });

  const availableYears = useMemo(() => {
    const years = new Set(serviceHistory.map(r => new Date(r.reportedDate).getFullYear()));
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, [serviceHistory]);

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
  
  useEffect(() => {
    let result = serviceHistory;
    if (filter.year !== 'all') {
      result = result.filter(r => new Date(r.reportedDate).getFullYear() === parseInt(filter.year));
    }
    if (filter.month !== 'all') {
      result = result.filter(r => new Date(r.reportedDate).getMonth() + 1 === parseInt(filter.month));
    }
    setFilteredHistory(result);
  }, [filter, serviceHistory]);


  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Service History</h2>
        <div className="flex items-center gap-3">
          <select name="month" value={filter.month} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]">
            {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select name="year" value={filter.year} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]">
            {availableYears.map(y => <option key={y} value={y}>{y === 'all' ? 'All Years' : y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type of Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested by</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Service Date</th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Technician</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((req) => (
                  <tr key={req.id} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.equipment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.serviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.requestedBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-xs truncate" title={req.description}>{req.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(req.reportedDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.serviceDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.nextService}</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{req.technician}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-[#DC6D18] hover:text-[#B85B14] font-semibold">View</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-500">No records match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ServiceHistory;