import React, { useState } from 'react';

// Mock data for the table
const initialData = [
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
  {
    id: 3,
    userId: 'USER_015',
    stationName: 'STP-01 - Effluent',
    exceededParameter: 'TSS',
    value: '112.5 mg/l',
    date: '2025-07-21',
    time: '11:00 AM',
    userRemark: 'High turbidity after rainfall.',
    adminRemark: '',
  },
];

function ParameterExceedence() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentComment, setCurrentComment] = useState('');

  // Function to open the modal
  const handleEditClick = (item) => {
    setEditingItem(item);
    setCurrentComment(item.adminRemark);
    setIsModalOpen(true);
  };

  // Function to save the edited comment
  const handleSaveComment = () => {
    setData(data.map(item =>
      item.id === editingItem.id ? { ...item, adminRemark: currentComment } : item
    ));
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Function to close the modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white to-[#f0f7fa] p-4 sm:p-6 md:p-8">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-[#236a80] mb-6 sm:mb-8">
          PARAMETER EXCEEDENCE LOG
        </h1>

        {/* Table Container */}
        <div className="w-full  mx-auto overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-[#236a80] uppercase bg-gray-50 border-b">
              <tr>
                <th scope="col" className="px-6 py-3">SI.No</th>
                <th scope="col" className="px-6 py-3">User ID</th>
                <th scope="col" className="px-6 py-3">Station Name</th>
                <th scope="col" className="px-6 py-3">Parameter</th>
                <th scope="col" className="px-6 py-3">Value</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Time</th>
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
                  <td className="px-6 py-4">{item.date}</td>
                  <td className="px-6 py-4">{item.time}</td>
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
      </div>

      {/* Edit Comment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 transform transition-all">
            <h3 className="text-lg font-bold text-[#236a80] mb-4">Edit Admin Remark</h3>
            <textarea
              value={currentComment}
              onChange={(e) => setCurrentComment(e.target.value)}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#236a80]"
              placeholder="Enter admin remark..."
            ></textarea>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveComment}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#236a80] rounded-md hover:bg-[#1d596a]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ParameterExceedence;