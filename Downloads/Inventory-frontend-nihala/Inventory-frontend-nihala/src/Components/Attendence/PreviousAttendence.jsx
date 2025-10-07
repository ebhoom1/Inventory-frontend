import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';


// A larger sample dataset representing historical records across different days.
const allAttendanceRecords = [
  // --- August 6, 2025 ---
  { id: 1, name: 'Priya Kumar', photoUrl: 'https://placehold.co/40x40/DC6D18/FFF?text=PK', date: '2025-08-06', checkIn: '09:05 AM', checkOut: '05:31 PM', hours: '8h 26m', method: 'Face Recognition' },
  { id: 2, name: 'Amit Singh', photoUrl: 'https://placehold.co/40x40/236a80/FFF?text=AS', date: '2025-08-06', checkIn: '09:12 AM', checkOut: '05:40 PM', hours: '8h 28m', method: 'Mobile App' },
  { id: 3, name: 'Jane Smith', photoUrl: 'https://placehold.co/40x40/1d5566/FFF?text=JS', date: '2025-08-06', checkIn: '08:55 AM', checkOut: '05:30 PM', hours: '8h 35m', method: 'Biometric' },
  // --- August 5, 2025 ---
  { id: 4, name: 'John Doe', photoUrl: 'https://placehold.co/40x40/B85B14/FFF?text=JD', date: '2025-08-05', checkIn: '09:00 AM', checkOut: '05:00 PM', hours: '8h 0m', method: 'Face Recognition' },
  { id: 5, name: 'Priya Kumar', photoUrl: 'https://placehold.co/40x40/DC6D18/FFF?text=PK', date: '2025-08-05', checkIn: '09:03 AM', checkOut: '05:30 PM', hours: '8h 27m', method: 'Face Recognition' },
  // --- July 20, 2025 ---
  { id: 6, name: 'Amit Singh', photoUrl: 'https://placehold.co/40x40/236a80/FFF?text=AS', date: '2025-07-20', checkIn: '09:20 AM', checkOut: '06:00 PM', hours: '8h 40m', method: 'Mobile App' },
];

// Helper to format a date object to 'YYYY-MM-DD' string for input value
const formatDateForInput = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};


const PreviousAttendence = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Set the default date to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const [selectedDate, setSelectedDate] = useState(formatDateForInput(yesterday));
  const [filteredRecords, setFilteredRecords] = useState([]);

  // Effect to filter records whenever the selectedDate changes
  useEffect(() => {
    const recordsForDate = allAttendanceRecords.filter(
      record => record.date === selectedDate
    );
    setFilteredRecords(recordsForDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen(true)} />
        
        <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-white to-[#FFF7ED]">
          <div className="w-full max-w-7xl mx-auto">

            {/* Page Header with Date Picker */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Previous Attendance</h1>
              <div className="flex items-center gap-2">
                <label htmlFor="attendance-date" className="font-semibold text-gray-600">Select Date:</label>
                <input
                  type="date"
                  id="attendance-date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
                />
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-In</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-Out</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.length > 0 ? (
                      filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-orange-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full" src={record.photoUrl} alt={`${record.name}'s photo`} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{record.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.checkIn}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.checkOut}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.hours}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.method}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-gray-500">
                          No attendance records found for {new Date(selectedDate).toLocaleDateString('en-IN')}.
                        </td>
                      </tr>
                    )}
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

export default PreviousAttendence;