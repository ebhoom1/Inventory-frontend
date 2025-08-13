import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar'; // Adjust path as needed
import Header from '../Header/Header';   // Adjust path as needed

// --- ICONS (Heroicons) ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const AddIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>;

// --- MOCK DATA ---
const sampleData = [
    { id: 1, dateAdded: '2025-07-22', timeAdded: '10:30 AM', adminUserId: 'ADM001', adminName: 'John Doe', dateCalibration: '2025-07-22', userId: 'USR123', modelName: 'X-Flow Meter', before: '49.8', after: '50.1', technician: 'Jane Smith', notes: 'Routine check complete.', },
    { id: 2, dateAdded: '2025-07-21', timeAdded: '11:00 AM', adminUserId: 'ADM002', adminName: 'Alice Brown', dateCalibration: '2025-07-20', userId: 'USR456', modelName: 'Y-pH Sensor', before: '6.9', after: '7.0', technician: 'Bob Lee', notes: 'Recalibrated sensor.', },
    { id: 3, dateAdded: '2025-07-20', timeAdded: '02:15 PM', adminUserId: 'ADM001', adminName: 'John Doe', dateCalibration: '2025-07-18', userId: 'USR789', modelName: 'Z-Turbidity', before: '4.5', after: '4.2', technician: 'Jane Smith', notes: 'Cleaned lens.', },
  ];

const ViewCalibration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(sampleData);

  const handleSortChange = (e) => {
    const value = e.target.value;
    let sorted = [...data];
    if (value === 'date') {
        sorted.sort((a, b) => new Date(b.dateCalibration) - new Date(a.dateCalibration));
    } else if (value === 'adminName') {
        sorted.sort((a, b) => a.adminName.localeCompare(b.adminName));
    }
    setData(sorted);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this calibration record?")) {
        setData(data.filter(item => item.id !== id));
    }
  }

  return (
    <div className="flex min-h-screen bg-[#236a80]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col rounded-tl-[50px] bg-main-content-bg min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-white to-[#f0f7fa]">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
              <h1 className="text-2xl font-bold text-[#236a80]">Calibration Log</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-gray-600 font-semibold text-sm">Sort by:</label>
                  <select id="sort" onChange={handleSortChange} className="rounded-md border-gray-300 shadow-sm py-2 px-3 text-sm focus:ring-[#236a80] focus:border-[#236a80]">
                    <option value="date">Calibration Date</option>
                    <option value="adminName">Admin Name</option>
                  </select>
                </div>
              
              </div>
            </div>

            {/* Table Container */}
            <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#236a80] text-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Model Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Calibration Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Before</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">After</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Technician</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Notes</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-[#f0f7fa] transition-colors even:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-800">{row.modelName}</div>
                            <div className="text-xs text-gray-500">User ID: {row.userId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold">{row.dateCalibration}</div>
                            <div className="text-xs text-gray-500">Added by {row.adminName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-800">{row.before}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-800">{row.after}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.technician}</td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">{row.notes}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"><EditIcon /></button>
                            <button onClick={() => handleDelete(row.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"><DeleteIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ViewCalibration;