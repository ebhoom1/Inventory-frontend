import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { API_URL } from '../../../utils/apiConfig'; // Adjust the import path as needed
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const Attendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [loggingOutId, setLoggingOutId] = useState(null);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.users || {});

  const handleForceLogout = async (targetUser) => {
    if (!targetUser || !targetUser._id) return;

    const confirmResult = await Swal.fire({
      title: "Force Logout?",
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 20px;">🚪</div>
          <p style="font-size: 18px; color: #374151; margin-bottom: 15px; font-weight: 600;">
            Are you sure you want to log out technician <strong style="color: #DC6D18;">"${
              targetUser.firstName || targetUser.userId || "this technician"
            }"</strong>?
          </p>
          <p style="font-size: 16px; color: #6b7280; line-height: 1.5;">
            This will invalidate their current session and check out their active attendance record.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-2xl border border-orange-100 shadow-xl font-sans bg-white",
        confirmButton: "px-6 py-2.5 font-semibold text-white rounded-lg bg-[#DC6D18] hover:bg-[#B85B14] transition-colors outline-none mx-2",
        cancelButton: "px-6 py-2.5 font-semibold text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition-colors outline-none mx-2",
        actions: "mt-4 flex justify-center gap-2",
      },
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setLoggingOutId(targetUser._id);

      Swal.fire({
        title: "Logging out...",
        html: "Please wait while we force logout the technician.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.token}`,
        },
      };

      await axios.post(`${API_URL}/api/auth/force-logout/${targetUser._id}`, {}, config);

      await Swal.fire({
        icon: "success",
        title: "✅ Logged Out Successfully!",
        text: "Technician has been forced logged out.",
        confirmButtonColor: "#059669",
        confirmButtonText: "OK",
        timer: 2000,
        timerProgressBar: true,
      });

      // Refresh attendance records
      fetchAttendance();
    } catch (err) {
      console.error("Error forcing logout:", err);
      Swal.fire({
        icon: "error",
        title: "❌ Logout Failed",
        text:
          err?.response?.data?.message ||
          "Failed to logout technician. Please try again.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "OK",
        allowOutsideClick: true,
      });
    } finally {
      setLoggingOutId(null);
    }
  };

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
    setSearchTerm('');
    setSelectedTechnician(null);
  };

  const handlePreviousAttendance = () => {
    navigate('/previous-attendence');
  };

  // Standard Shift Time is 8 hours 30 minutes (510 minutes)
  // Overtime triggers if duration exceeds standard time by more than 60 minutes (> 570 minutes total)
  const calculateNormalAndOvertime = (durationMinutes) => {
    if (durationMinutes == null || isNaN(durationMinutes)) {
      return { normal: 0, overtime: 0 };
    }
    const totalMinutes = Number(durationMinutes);
    const standardMinutes = 510; // 8 hours 30 minutes

    if (totalMinutes <= standardMinutes) {
      return { normal: totalMinutes, overtime: 0 };
    } else {
      const extraMinutes = totalMinutes - standardMinutes;
      if (extraMinutes > 60) {
        return { normal: standardMinutes, overtime: extraMinutes };
      } else {
        return { normal: standardMinutes, overtime: 0 };
      }
    }
  };

  const getNormalAndOvertimeDisplay = (record) => {
    if (record.status === 'active' || record.duration == null) {
      return { normal: '-', overtime: '-' };
    }
    const { normal, overtime } = calculateNormalAndOvertime(record.duration);
    return {
      normal: formatDuration(normal),
      overtime: formatDuration(overtime),
    };
  };

  // Filter records locally by technician's name
  const filteredRecords = React.useMemo(() => {
    return attendanceRecords.filter((record) => {
      if (!searchTerm.trim()) return true;
      const firstName = record.technicianId?.firstName || '';
      const userId = record.technicianId?.userId || '';
      const fullName = `${firstName} ${userId}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase().trim());
    });
  }, [attendanceRecords, searchTerm]);

  // Calculate statistics across filtered records
  const summary = React.useMemo(() => {
    let totalNormal = 0;
    let totalOvertime = 0;
    let totalDuration = 0;
    let activeCount = 0;
    let completedCount = 0;

    // If a technician is selected, calculate totals only for that technician's records
    const targetRecords = selectedTechnician
      ? filteredRecords.filter((r) => r.technicianId?._id === selectedTechnician._id)
      : filteredRecords;

    targetRecords.forEach((record) => {
      if (record.status === 'active') {
        activeCount++;
      } else {
        completedCount++;
        if (record.duration != null && !isNaN(record.duration)) {
          totalDuration += record.duration;
          const { normal, overtime } = calculateNormalAndOvertime(record.duration);
          totalNormal += normal;
          totalOvertime += overtime;
        }
      }
    });

    return {
      totalNormal,
      totalOvertime,
      totalDuration,
      activeCount,
      completedCount,
      totalCount: targetRecords.length
    };
  }, [filteredRecords, selectedTechnician]);

  // Export filtered records (or selected technician's records) to Excel sheet with Summary
  const handleExportToExcel = () => {
    const targetRecords = selectedTechnician
      ? filteredRecords.filter((r) => r.technicianId?._id === selectedTechnician._id)
      : filteredRecords;

    if (targetRecords.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const exportData = targetRecords.map((record) => {
      const checkInDate = new Date(record.checkIn);
      const formattedDate = checkInDate.toLocaleDateString('en-IN');
      const checkInTime = checkInDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const checkOutTime = record.checkOut
        ? new Date(record.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : 'Active';

      const { normal, overtime } = calculateNormalAndOvertime(record.duration || 0);
      const normalDisplay = record.status === 'active' ? '-' : formatDuration(normal);
      const overtimeDisplay = record.status === 'active' ? '-' : formatDuration(overtime);
      const totalDurationDisplay = record.status === 'active' ? '-' : formatDuration(record.duration);

      return {
        "Date": formattedDate,
        "Technician Name": record.technicianId?.firstName || record.technicianId?.userId || 'N/A',
        "Site Name": record.siteName || 'N/A',
        "Site Location": record.siteLocation || 'N/A',
        "Check In": checkInTime,
        "Check Out": checkOutTime,
        "Total Duration": totalDurationDisplay,
        "Normal Time": normalDisplay,
        "Overtime": overtimeDisplay,
        "Status": record.status === 'active' ? 'Active' : 'Completed'
      };
    });

    // Append totals row
    exportData.push({
      "Date": "Total Summary",
      "Technician Name": "",
      "Site Name": "",
      "Site Location": "",
      "Check In": "",
      "Check Out": "",
      "Total Duration": formatDuration(summary.totalDuration),
      "Normal Time": formatDuration(summary.totalNormal),
      "Overtime": formatDuration(summary.totalOvertime),
      "Status": ""
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    // Auto-fit column widths dynamically based on content length
    const colWidths = Object.keys(exportData[0] || {}).map((key) => {
      const maxLength = exportData.reduce((acc, row) => {
        const val = row[key] ? row[key].toString() : '';
        return Math.max(acc, val.length);
      }, key.length);
      return { wch: maxLength + 3 }; // 3 characters padding for clean spacing
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

    const techName = selectedTechnician 
      ? (selectedTechnician.firstName || selectedTechnician.userId || 'Technician').replace(/\s+/g, '_')
      : (searchTerm.trim() ? searchTerm.trim().replace(/\s+/g, '_') : "All_Technicians");
    const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : '';
    const filename = `Attendance_${techName}${dateRange}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  // Format duration from minutes to hours and minutes if it exceeds 60 minutes
  const formatDuration = (minutes) => {
    if (minutes == null) return '-';
    const totalMinutes = Number(minutes);
    if (isNaN(totalMinutes)) return '-';

    if (totalMinutes < 60) {
      return `${totalMinutes} mins`;
    }
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (mins === 0) {
      return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'}`;
    }
    return `${hrs} ${hrs === 1 ? 'hr' : 'hrs'} ${mins} mins`;
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Technician</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (selectedTechnician) {
                        setSelectedTechnician(null);
                      }
                    }}
                    placeholder="Type technician name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18] min-w-[200px]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedTechnician(null);
                      }}
                      className="absolute right-2.5 text-gray-400 hover:text-gray-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Clear Filters
              </button>
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium flex items-center gap-2"
              >
                <i className="fa-solid fa-file-excel"></i>
                Export to Excel
              </button>
            </div>

            {/* Summary Cards */}
            {(startDate || endDate || searchTerm.trim() || selectedTechnician) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Attendance Summary */}
                <div className="bg-gradient-to-br from-white to-orange-50/30 p-5 rounded-xl border border-orange-100 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Attendance Summary</p>
                    <h3 className="text-3xl font-extrabold text-gray-800 mt-1">
                      {summary.totalCount} <span className="text-sm font-medium text-gray-500">records</span>
                    </h3>
                    <div className="flex gap-3 mt-2 text-xs font-semibold">
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        {summary.activeCount} Active
                      </span>
                      <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {summary.completedCount} Completed
                      </span>
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-orange-100 text-[#DC6D18] flex items-center justify-center text-xl">
                    <i className="fa-solid fa-users"></i>
                  </div>
                </div>

                {/* Total Normal Time (only show when a specific technician is selected) */}
                {selectedTechnician && (
                  <div className="bg-gradient-to-br from-white to-green-50/20 p-5 rounded-xl border border-green-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Normal Time</p>
                      <h3 className="text-3xl font-extrabold text-green-700 mt-1">{formatDuration(summary.totalNormal)}</h3>
                      <p className="text-xs text-gray-400 mt-1">Capped at 8h 30m standard shift per day</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-green-100 text-green-700 flex items-center justify-center text-xl">
                      <i className="fa-solid fa-clock"></i>
                    </div>
                  </div>
                )}

                {/* Total Overtime (only show when a specific technician is selected) */}
                {selectedTechnician && (
                  <div className="bg-gradient-to-br from-white to-amber-50/20 p-5 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Overtime</p>
                      <h3 className="text-3xl font-extrabold text-amber-700 mt-1">{formatDuration(summary.totalOvertime)}</h3>
                      <p className="text-xs text-gray-400 mt-1">Calculated when exceeding standard by &gt; 60 mins</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                      <i className="fa-solid fa-business-time"></i>
                    </div>
                  </div>
                )}
              </div>
            )}

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
              ) : filteredRecords.length === 0 ? (
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
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Duration</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Normal Time</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Overtime</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecords.map((record) => {
                        const isSelected = selectedTechnician?._id === record.technicianId?._id;
                        return (
                          <tr
                            key={record._id}
                            onClick={() => {
                              if (record.technicianId) {
                                setSelectedTechnician(isSelected ? null : record.technicianId);
                              }
                            }}
                            className={`cursor-pointer transition-all duration-200 select-none ${
                              isSelected
                                ? 'bg-orange-50/80 hover:bg-orange-100/60 font-semibold border-l-4 border-[#DC6D18]'
                                : 'hover:bg-orange-50/30'
                            }`}
                          >
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
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-2 text-green-600 font-semibold">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Active
                                  </span>
                                  {(userInfo?.userType === 'Admin' || userInfo?.userType === 'Super Admin') && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleForceLogout(record.technicianId);
                                      }}
                                      disabled={loggingOutId === record.technicianId?._id}
                                      className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full hover:bg-red-200 transition-colors font-semibold disabled:opacity-50"
                                      title="Force Logout technician"
                                    >
                                      {loggingOutId === record.technicianId?._id ? "Logging out..." : "Force Logout"}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-700">
                                  {record.checkOut ? new Date(record.checkOut).toLocaleString('en-IN') : '-'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                              {formatDuration(record.duration)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold bg-green-50/20">
                              {getNormalAndOvertimeDisplay(record).normal}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700 font-semibold bg-amber-50/20">
                              {getNormalAndOvertimeDisplay(record).overtime}
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
                        );
                      })}
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