import React, { useState, useEffect, useMemo } from 'react';

// Sample data. Note the 'nextServiceDate' which is key for this component.
const sampleServiceDueData = [
  {
    id: 1,
    equipment: 'Hydraulic Pump Unit 42',
    serviceType: 'Annual Maintenance',
    lastServiceDate: '2024-08-06',
    nextServiceDate: '2025-08-06', // Due this month
  },
  {
    id: 2,
    equipment: 'Air Compressor C-113',
    serviceType: 'Filter Replacement',
    lastServiceDate: '2025-02-15',
    nextServiceDate: '2025-08-15', // Due this month
  },
  {
    id: 3,
    equipment: 'CNC Machine 5-Axis',
    serviceType: 'Calibration',
    lastServiceDate: '2025-07-20',
    nextServiceDate: '2025-07-20', // Overdue
  },
  {
    id: 4,
    equipment: 'Conveyor Belt B-07',
    serviceType: 'Inspection',
    lastServiceDate: '2025-03-01',
    nextServiceDate: '2025-09-01', // Due next month
  },
  {
    id: 5,
    equipment: 'Industrial Generator G-9',
    serviceType: 'Oil Change',
    lastServiceDate: '2025-08-01',
    nextServiceDate: '2026-02-01', // Due next year
  },
];

// Helper function to style the due date based on how close it is
const DueDate = ({ dateString }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date
  const dueDate = new Date(dateString);

  let textColor = 'text-gray-600';
  if (dueDate < today) {
    textColor = 'text-red-600 font-bold'; // Overdue
  } else if (dueDate.getTime() <= today.getTime() + 7 * 24 * 60 * 60 * 1000) {
    textColor = 'text-orange-600 font-semibold'; // Due within 7 days
  }

  return <span className={textColor}>{dueDate.toLocaleDateString()}</span>;
};


function ServiceDue() {
  const [serviceDueList, setServiceDueList] = useState(sampleServiceDueData);

  // --- FEATURE: Default filter is set to the current month and year ---
  const today = new Date();
  const [filter, setFilter] = useState({
    month: today.getMonth() + 1, // Get current month (1-12)
    year: today.getFullYear(),      // Get current year
  });

  const [filteredServiceList, setFilteredServiceList] = useState([]);

  const availableYears = useMemo(() => {
    const years = new Set(serviceDueList.map(r => new Date(r.nextServiceDate).getFullYear()));
    return ['all', ...Array.from(years).sort((a, b) => b - a)];
  }, [serviceDueList]);

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
  
  // Effect to apply filters based on the 'nextServiceDate'
  useEffect(() => {
    let result = serviceDueList;
    if (filter.year !== 'all') {
      result = result.filter(r => new Date(r.nextServiceDate).getFullYear() === parseInt(filter.year));
    }
    if (filter.month !== 'all') {
      result = result.filter(r => new Date(r.nextServiceDate).getMonth() + 1 === parseInt(filter.month));
    }
    setFilteredServiceList(result);
  }, [filter, serviceDueList]);

  const handleSendMail = (equipmentName) => {
    alert(`Reminder mail simulation for: ${equipmentName}`);
    // In a real app, you would trigger an API call here to send an email.
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Upcoming Service Due</h2>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Service</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Service Due</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServiceList.length > 0 ? (
                filteredServiceList.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.equipment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.serviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.lastServiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"><DueDate dateString={item.nextServiceDate} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <button 
                        onClick={() => handleSendMail(item.equipment)}
                        className="px-4 py-2 bg-[#DC6D18] text-white text-xs font-semibold rounded-lg shadow-md hover:bg-[#B85B14] transition-colors"
                      >
                        Send Mail
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">No services due for the selected period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ServiceDue;