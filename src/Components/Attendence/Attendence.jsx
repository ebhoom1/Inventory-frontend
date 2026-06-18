import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_URL } from '../../../utils/apiConfig'; // Adjust the import path as needed

const Attendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.users);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo?.token}`,
        },
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }
      };

      const { data } = await axios.get(`${API_URL}/api/auth/attendance`, config);
      setAttendanceRecords(data);
      setError(null);
    } catch (err) {
      console.error("Attendance fetch error:", err);
      setError(err.response?.data?.message || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      fetchAttendance();
    }
  }, [userInfo, startDate, endDate]);

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const handlePreviousAttendance = () => {
    navigate('/previous-attendence');
  };

  // Get and format today's date for the title
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
              {/* <button
                onClick={handlePreviousAttendance}
                className="w-full md:w-auto px-5 py-2.5 bg-[#DC6D18] text-white font-semibold rounded-lg shadow-md hover:bg-[#B85B14] transition-colors"
              >
                Show Previous Attendance
              </button> */}
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap items-end gap-4 border border-orange-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                />
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Clear Filters
              </button>
            </div>

            {/* Attendance Table */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#DC6D18] border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-500">
                  <i className="fa-solid fa-circle-exclamation text-3xl mb-2"></i>
                  <p>{error}</p>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <i className="fa-solid fa-clipboard-list text-4xl mb-3 text-gray-300"></i>
                  <p className="text-lg">No attendance records found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Technician Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Photo</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Site Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Site Location</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceRecords.map((record) => (
                        <tr key={record._id} className="hover:bg-orange-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-[#DC6D18] font-bold text-lg border border-orange-200">
                                {record.technicianId?.firstName?.charAt(0) || record.technicianId?.userId?.charAt(0) || 'T'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {record.technicianId?.firstName || record.technicianId?.userId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {record.photoUrl ? (
                              <a href={record.photoUrl} target="_blank" rel="noopener noreferrer">
                                <img src={record.photoUrl} alt="Attendance" className="h-10 w-10 rounded object-cover border border-gray-200 hover:scale-[2.5] hover:z-10 relative transition-transform cursor-pointer" />
                              </a>
                            ) : (
                              <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                <i className="fa-solid fa-image"></i>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {record.siteName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {record.siteLocation}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {new Date(record.checkIn).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.status === 'active' ? (
                              <span className="flex items-center gap-2 text-green-600 font-semibold">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                Active
                              </span>
                            ) : (
                              <span className="text-gray-700">
                                {record.checkOut ? new Date(record.checkOut).toLocaleString('en-IN') : '-'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {record.duration != null ? `${record.duration} mins` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {record.status === 'active' ? 'Active' : 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Attendance;