import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const sampleEquipmentData = [
  {
    id: 'EQP-FE-001',
    equipmentName: 'Fire Extinguisher ABC',
    username: 'John Doe',
    modelSeries: 'ABC Powder Type',
    capacity: '6 kg',
    rateLoaded: '15 bar',
    installationDate: '2025-01-15',
    grossWeight: '9.5 kg',
    content: 'Dry Powder',
    fireRating: '4A:55B',
    batchNo: 'BT-2025-01',
    serialNumber: 'SN-12345678',
    mfgMonth: '2025-01',
    refDue: '2026-01-15',
  },
  {
    id: 'EQP-HP-042',
    equipmentName: 'Hydraulic Pump Unit 42',
    username: 'Jane Smith',
    modelSeries: 'Rexroth A10VSO',
    capacity: '100 GPM',
    rateLoaded: '3000 PSI',
    installationDate: '2024-11-20',
    grossWeight: '150 kg',
    content: 'Hydraulic Oil ISO 46',
    fireRating: 'N/A',
    batchNo: 'BT-2024-11',
    serialNumber: 'SN-87654321',
    mfgMonth: '2024-10',
    refDue: '2025-11-20',
  },
];

// This sub-component renders each item and its collapsible details.
const EquipmentDetailsRow = ({ item, onDownloadQR, onAddReport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const qrCodeData = JSON.stringify({
    equipmentId: item.id,
    equipmentName: item.equipmentName,
    username: item.username,
  });

  return (
    <>
      {/* Main visible row */}
      <tr className="hover:bg-orange-50/50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-gray-900">{item.equipmentName}</div>
          <div className="text-sm text-gray-500">{item.modelSeries}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{item.username}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.installationDate).toLocaleDateString()}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[#DC6D18] hover:text-[#B85B14] font-semibold"
          >
            {isOpen ? 'Hide' : 'View'}
          </button>
        </td>
        {/* --- "Add Report" button moved to the main row for quick access --- */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <button
            onClick={() => onAddReport(item.equipmentName)}
            className="px-4 py-2 bg-[#DC6D18] text-white text-xs font-semibold rounded-lg shadow-md hover:bg-[#B85B14] transition-colors"
          >
            Add Report
          </button>
        </td>
      </tr>
      
      {/* Collapsible details row */}
      {isOpen && (
        <tr className="bg-orange-50/20">
          {/* --- Colspan updated to 5 to match the new table structure --- */}
          <td colSpan="5" className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
              {/* Column 1: Technical Specs */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-gray-700">Specifications</h4>
                <p className="text-sm text-gray-600"><strong>Capacity:</strong> {item.capacity}</p>
                <p className="text-sm text-gray-600"><strong>Rate Loaded:</strong> {item.rateLoaded}</p>
                <p className="text-sm text-gray-600"><strong>Gross Weight:</strong> {item.grossWeight}</p>
                <p className="text-sm text-gray-600"><strong>Content:</strong> {item.content}</p>
                <p className="text-sm text-gray-600"><strong>Fire Rating:</strong> {item.fireRating}</p>
              </div>

              {/* Column 2: Manufacturing Details */}
              <div className="space-y-2">
                <h4 className="font-bold text-sm text-gray-700">Manufacturing Info</h4>
                <p className="text-sm text-gray-600"><strong>Batch No:</strong> {item.batchNo}</p>
                <p className="text-sm text-gray-600"><strong>Serial No:</strong> {item.serialNumber}</p>
                <p className="text-sm text-gray-600"><strong>MFG Month:</strong> {item.mfgMonth}</p>
                <p className="text-sm text-gray-600"><strong>REF Due:</strong> {new Date(item.refDue).toLocaleDateString()}</p>
              </div>

              {/* Column 3: QR Code and Download Action */}
              <div className="space-y-3 flex flex-col items-center justify-center p-4 rounded-lg bg-white/50 md:col-span-2 lg:col-span-1 lg:mt-0">
                <QRCodeCanvas
                  id={`qr-canvas-${item.id}`}
                  value={qrCodeData}
                  size={100}
                  level={"H"}
                />
                <button onClick={() => onDownloadQR(item.id, item.equipmentName)} className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-300">
                  Download QR
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};


function EquipmentList() {
  const [equipmentList, setEquipmentList] = useState(sampleEquipmentData);
  const [filteredList, setFilteredList] = useState(sampleEquipmentData);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const results = equipmentList.filter(item =>
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(results);
  }, [searchTerm, equipmentList]);

  const handleDownloadQR = (equipmentId, equipmentName) => {
    const canvas = document.getElementById(`qr-canvas-${equipmentId}`);
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${equipmentName}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleAddReport = (equipmentName) => {
    alert(`'Add Report' clicked for ${equipmentName}.`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Equipment List</h2>
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by Equipment or User..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
          />
           <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipment Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Added By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Installation Date</th>
                {/* --- Renamed and Added new Actions Column --- */}
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <EquipmentDetailsRow 
                    key={item.id}
                    item={item}
                    onDownloadQR={handleDownloadQR}
                    onAddReport={handleAddReport}
                  />
                ))
              ) : (
                <tr>
                  {/* --- Updated Colspan --- */}
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    No equipment found for "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EquipmentList;