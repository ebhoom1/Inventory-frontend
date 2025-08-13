import React, { useState } from 'react';
import Sidebar from '../Sidebar/Sidebar'; // Assuming the path to your Sidebar component
import Header from '../Header/Header';   // Assuming the path to your Header component

// --- Mock Data ---
const mockReportDetails = {
  companyName: 'Seafood Park Lmt',
  industryType: 'Seafood Processing',
  fromDate: '2025-07-01',
  toDate: '2025-07-22',
  stackName: 'STP-01 - Effluent'
};

const initialExceedenceData = [
  {
    id: 1,
    userId: 'USER_015',
    stationName: 'STP-01 - Effluent',
    exceededParameter: 'BOD',
    value: '35.2 mg/l',
    date: '2025-07-22',
    time: '10:15 AM',
    userRemark: 'Spike observed during batch change.',
    adminRemark: 'Acknowledge. Monitor next batch.',
  },
  {
    id: 2,
    userId: 'USER_012',
    stationName: 'STP-02 - Inlet',
    exceededParameter: 'pH',
    value: '9.1',
    date: '2025-07-22',
    time: '02:40 PM',
    userRemark: 'Sensor calibration might be due.',
    adminRemark: 'Schedule calibration for tomorrow.',
  },
];

// --- Reusable Parameter Exceedence Log Component ---
const ParameterExceedenceLog = () => {
  const [data, setData] = useState(initialExceedenceData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentComment, setCurrentComment] = useState('');

  const handleEditClick = (item) => {
    setEditingItem(item);
    setCurrentComment(item.adminRemark);
    setIsModalOpen(true);
  };

  const handleSaveComment = () => {
    setData(data.map(item =>
      item.id === editingItem.id ? { ...item, adminRemark: currentComment } : item
    ));
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <>
      <div className="w-full overflow-x-auto bg-white rounded-xl shadow-lg mt-8">
        <h2 className="text-lg font-bold text-[#1a5a70] p-4 border-b">Parameter Exceedence Log</h2>
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-[#236a80] uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">SI.No</th>
              <th scope="col" className="px-6 py-3">User ID</th>
              <th scope="col" className="px-6 py-3">Station Name</th>
              <th scope="col" className="px-6 py-3">Parameter</th>
              <th scope="col" className="px-6 py-3">Value</th>
              <th scope="col" className="px-6 py-3">Date & Time</th>
              <th scope="col" className="px-6 py-3">User Remark</th>
              <th scope="col" className="px-6 py-3">Admin Remark</th>
              <th scope="col" className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                <td className="px-6 py-4">{item.userId}</td>
                <td className="px-6 py-4">{item.stationName}</td>
                <td className="px-6 py-4 font-semibold text-red-600">{item.exceededParameter}</td>
                <td className="px-6 py-4 font-semibold text-red-600">{item.value}</td>
                <td className="px-6 py-4">{item.date} <br/> <span className="text-gray-500">{item.time}</span></td>
                <td className="px-6 py-4 max-w-xs">{item.userRemark}</td>
                <td className="px-6 py-4 max-w-xs">{item.adminRemark}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="font-medium text-white bg-[#236a80] hover:bg-[#1d596a] px-3 py-1.5 rounded-md shadow-sm transition-colors"
                  >
                    Edit Comment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-bold text-[#236a80] mb-4">Edit Admin Remark</h3>
            <textarea
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-semibold bg-gray-100 rounded-md">Cancel</button>
              <button onClick={handleSaveComment} className="px-4 py-2 text-sm font-semibold text-white bg-[#236a80] rounded-md">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// --- Main CheckAndValidate Component ---
const CheckAndValidate = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [validationData, setValidationData] = useState({
    fromDate: '',
    toDate: '',
    company: mockReportDetails.companyName,
    industryType: mockReportDetails.industryType,
    userName: '',
    engineerName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValidationData(prev => ({ ...prev, [name]: value }));
  };

  const handleApprove = () => {
    console.log("Report Approved with data:", validationData);
    alert("Report Approved!");
  };

  const handleDeny = () => {
    console.log("Report Denied with data:", validationData);
    alert("Report Denied!");
  };

  return (
    <div className="flex min-h-screen bg-[#236a80]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col bg-main-content-bg rounded-tl-[50px] min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gradient-to-br from-white to-[#f0f7fa] rounded-tl-[50px]">
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-xl sm:text-2xl font-bold text-center text-[#236a80] mb-6">
              CHECK & VALIDATE REPORT
            </h1>

            {/* Display Report Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-[#1a5a70] mb-4 border-b pb-2">Report Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-500">Company Name:</p>
                  <p className="font-bold text-gray-800">{mockReportDetails.companyName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Industry Type:</p>
                  <p className="font-bold text-gray-800">{mockReportDetails.industryType}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Stack Name:</p>
                  <p className="font-bold text-gray-800">{mockReportDetails.stackName}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">From Date:</p>
                  <p className="font-bold text-gray-800">{mockReportDetails.fromDate}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">To Date:</p>
                  <p className="font-bold text-gray-800">{mockReportDetails.toDate}</p>
                </div>
              </div>
            </div>

            {/* --- PARAMETER EXCEEDENCE LOG EMBEDDED HERE --- */}
            <ParameterExceedenceLog />

            {/* Validation Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-8 border border-gray-200">
              <h2 className="text-lg font-bold text-[#1a5a70] mb-6 border-b pb-2">Validation Action</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="relative">
                    <label htmlFor="fromDate" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">From Date</label>
                    <input type="date" name="fromDate" value={validationData.fromDate} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent"/>
                  </div>

                  <div className="relative">
                    <label htmlFor="toDate" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">To Date</label>
                    <input type="date" name="toDate" value={validationData.toDate} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent"/>
                  </div>

                  <div className="relative">
                    <label htmlFor="userName" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">User Name</label>
                    <input type="text" placeholder="Enter validating user's name" name="userName" value={validationData.userName} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent"/>
                  </div>

                  <div className="relative">
                    <label htmlFor="engineerName" className="absolute -top-3 left-4 bg-white px-1 text-sm font-semibold text-[#236a80]">Engineer Name</label>
                    <input type="text" placeholder="Enter engineer's name" name="engineerName" value={validationData.engineerName} onChange={handleInputChange} className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 bg-transparent"/>
                  </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-center mt-10">
              <button onClick={handleDeny} className="px-8 sm:px-10 py-3 text-base font-semibold text-white bg-red-600 rounded-xl shadow-lg hover:bg-red-700">
                Deny
              </button>
              <button onClick={handleApprove} className="px-8 sm:px-10 py-3 text-base font-semibold text-white bg-green-600 rounded-xl shadow-lg hover:bg-green-700">
                Approve
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CheckAndValidate;