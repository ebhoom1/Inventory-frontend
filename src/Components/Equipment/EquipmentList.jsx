import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEquipments } from "../../redux/features/equipment/equipmentSlice";
import ReportModal from "./ReportModal";

const EquipmentDetailsRow = ({ item, onDownloadQR, onAddReport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  return (
    <>
      {/* Main visible row */}
      <tr className="hover:bg-orange-50/50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-gray-900">{item.equipmentName}</div>
          <div className="text-sm text-gray-500">{item.modelSeries}</div>
        </td>

        {/* Added By (userId) */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
          {item.userId || item.username || "-"}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {safeDate(item.installationDate)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="text-[#DC6D18] hover:text-[#B85B14] font-semibold"
          >
            {isOpen ? "Hide" : "View"}
          </button>
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <button
  onClick={() => onAddReport(item)}
  className="px-4 py-2 bg-[#DC6D18] text-white text-xs font-semibold rounded-lg shadow-md hover:bg-[#B85B14] transition-colors"
>
  Add Report
</button>
        </td>
      </tr>

      {/* Collapsible details row */}
      {isOpen && (
        <tr className="bg-orange-50/20">
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
                <p className="text-sm text-gray-600">
                  <strong>REF Due:</strong> {safeDate(item.refDue)}
                </p>
              </div>

              {/* Column 3: QR Code and Download Action */}
              <div className="space-y-3 flex flex-col items-center justify-center p-4 rounded-lg bg-white/50 md:col-span-2 lg:col-span-1 lg:mt-0">
                {/* Use backend-generated QR (base64 data URL) */}
                {item.qrImage ? (
                  <img
                    id={`qr-img-${item._id || item.equipmentId}`}
                    src={item.qrImage}
                    alt="Equipment QR"
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="text-xs text-gray-500">QR not available</div>
                )}

                {item.qrImage && (
                  <button
                    onClick={() => onDownloadQR(item)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-300"
                  >
                    Download QR
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function EquipmentList() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((s) => s.equipment);
  const [searchTerm, setSearchTerm] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    dispatch(getEquipments());
  }, [dispatch]);

  const filteredList = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return list;
    return list.filter((item) => {
      const name = (item.equipmentName || "").toLowerCase();
      const user = (item.userId || item.username || "").toLowerCase();
      return name.includes(term) || user.includes(term);
    });
  }, [searchTerm, list]);

  const handleDownloadQR = (item) => {
    // item.qrImage is data:image/png;base64,...
    const link = document.createElement("a");
    link.href = item.qrImage;
    link.download = `${item.equipmentName || "equipment"}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddReport = (item) => {
    setSelectedItem(item);
    setReportOpen(true);
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
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {/* Status bar */}
          {loading && (
            <div className="p-3 text-sm text-gray-600">Loading equipments…</div>
          )}
          {error && (
            <div className="p-3 text-sm text-red-600">Error: {error}</div>
          )}

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Equipment Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Installation Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList && filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <EquipmentDetailsRow
                    key={item._id || item.equipmentId}
                    item={item}
                    onDownloadQR={handleDownloadQR}
                    onAddReport={handleAddReport}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    {loading ? "Loading…" : `No equipment found${searchTerm ? ` for "${searchTerm}"` : ""}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
       <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        item={selectedItem}
        // onSubmitted={handleReportSaved}
      />
    </div>
  );
}
