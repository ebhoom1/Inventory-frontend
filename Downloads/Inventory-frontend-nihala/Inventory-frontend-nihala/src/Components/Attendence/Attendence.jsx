import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';

// Sample data for today's attendance. In a real app, this would be fetched from an API.
const attendanceData = [
  {
    id: 1,
    name: 'Priya Kumar',
    photoUrl: 'https://placehold.co/40x40/DC6D18/FFF?text=PK',
    checkIn: '09:02 AM',
    checkOut: '05:30 PM',
    hours: '8h 28m',
    method: 'Face Recognition',
  },
  {
    id: 2,
    name: 'Amit Singh',
    photoUrl: 'https://placehold.co/40x40/236a80/FFF?text=AS',
    checkIn: '09:15 AM',
    checkOut: 'In Office', // Indicates the user is currently checked in
    hours: '8h 18m',
    method: 'Mobile App',
  },
  {
    id: 3,
    name: 'Jane Smith',
    photoUrl: 'https://placehold.co/40x40/1d5566/FFF?text=JS',
    checkIn: '08:58 AM',
    checkOut: '05:33 PM',
    hours: '8h 35m',
    method: 'Biometric',
  },
  {
    id: 4,
    name: 'John Doe',
    photoUrl: 'https://placehold.co/40x40/B85B14/FFF?text=JD',
    checkIn: '09:30 AM',
    checkOut: 'In Office', // Indicates the user is currently checked in
    hours: '8h 3m',
    method: 'Face Recognition',
  },
];

const Attendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Get and format today's date for the title
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePreviousAttendance = () => {
   
    navigate('/previous-attendence')
    // TODO: Implement navigation to the previous attendance page
  };

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen(true)} />
        
        <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-white to-[#FFF7ED]">
          <div className="w-full max-w-7xl mx-auto">

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Attendance</h1>
                <p className="text-sm md:text-base text-gray-500">{today}</p>
              </div>
              <button 
                onClick={handlePreviousAttendance}
                className="w-full md:w-auto px-5 py-2.5 bg-[#DC6D18] text-white font-semibold rounded-lg shadow-md hover:bg-[#B85B14] transition-colors"
              >
                Show Previous Attendance
              </button>
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
                    {attendanceData.map((record) => (
                      <tr key={record.id} className="hover:bg-orange-50/50 transition-colors">
                        {/* Employee Cell with Photo */}
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
                        {/* Check-In Cell */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.checkIn}</td>
                        {/* Check-Out Cell */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {record.checkOut === 'In Office' ? (
                            <span className="flex items-center gap-2 text-green-600 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                              {record.checkOut}
                            </span>
                          ) : (
                            <span className="text-gray-700">{record.checkOut}</span>
                          )}
                        </td>
                        {/* Hours Cell */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.hours}</td>
                        {/* Method Cell */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.method}</td>
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

export default Attendance;