// src/pages/EquipmentList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEquipments } from "../../redux/features/equipment/equipmentSlice";
import QRCode from "qrcode";



const EquipmentDetailsRow = ({ item, onDownloadQR }) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  return (
    <>
      {/* Main Row */}
      <tr className="hover:bg-orange-50/50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-bold text-gray-900">
            {item.equipmentName}
          </div>
          <div className="text-sm text-gray-500">{item.modelSeries}</div>
        </td>
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
            onClick={() => onDownloadQR(item)}
            className="px-4 py-2 bg-[#DC6D18] text-white text-xs font-semibold rounded-lg shadow-md hover:bg-[#B85B14]"
          >
            Download QR
          </button>
        </td>
      </tr>

      {/* Expanded Details */}
      {isOpen && (
        <tr className="bg-orange-50/20">
          <td colSpan="5" className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Column 1 */}
              <div className="space-y-1 pb-2 border-b md:border-b-0 md:border-r md:pr-4">
                <h4 className="text-base font-bold text-gray-800 mb-2">
                  Specifications
                </h4>
                <p>
                  <span className="font-medium text-gray-700">Capacity:</span>{" "}
                  <span className="text-gray-600">{item.capacity}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Rate Loaded:
                  </span>{" "}
                  <span className="text-gray-600">{item.rateLoaded}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Gross Weight:
                  </span>{" "}
                  <span className="text-gray-600">{item.grossWeight}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">Content:</span>{" "}
                  <span className="text-gray-600">{item.content}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Fire Rating:
                  </span>{" "}
                  <span className="text-gray-600">{item.fireRating}</span>
                </p>
              </div>

              {/* Column 2 */}
              <div className="space-y-1 py-2 border-b md:border-b-0 md:border-r md:px-4">
                <h4 className="text-base font-bold text-gray-800 mb-2">
                  Manufacturing Info
                </h4>
                <p>
                  <span className="font-medium text-gray-700">Batch No:</span>{" "}
                  <span className="text-gray-600">{item.batchNo}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">Serial No:</span>{" "}
                  <span className="text-gray-600">{item.serialNumber}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">MFG Month:</span>{" "}
                  <span className="text-gray-600">{item.mfgMonth}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">REF Due:</span>{" "}
                  <span className="text-gray-600">{safeDate(item.refDue)}</span>
                </p>
              </div>

              {/* Column 3 */}
              <div className="space-y-1 pt-2 md:pl-4">
                <h4 className="text-base font-bold text-gray-800 mb-2">
                  Other Details
                </h4>
                <p>
                  <span className="font-medium text-gray-700">Location:</span>{" "}
                  <span className="text-gray-600">{item.location || "-"}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-700">Notes:</span>{" "}
                  <span className="text-gray-600">{item.notes || "-"}</span>
                </p>
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

  // read role from your Redux (same shape as in EquipmentLayout)
const { userInfo } = useSelector((s) => s.users || {});
const roleRaw = (userInfo?.userType || "").toString();
const isSuperAdmin = roleRaw.toLowerCase() === "admin";


  useEffect(() => {
    dispatch(getEquipments());
  }, [dispatch]);

// //search bar
//   const [searchTerm, setSearchTerm] = useState("");

//   const filteredList = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase();
//     if (!term) return list;
//     return list.filter((item) => {
//       const name = (item.equipmentName || "").toLowerCase();
//       const user = (item.userId || item.username || "").toLowerCase();
//       return name.includes(term) || user.includes(term);
//     });
//   }, [searchTerm, list]);

// Build unique user list from the equipment array
// const userOptions = useMemo(() => {
//   const map = new Map();
//   (list || []).forEach((it) => {
//     const label = (it.username || it.userId || "").trim();
//     if (label) {
//       const key = label.toLowerCase();
//       if (!map.has(key)) map.set(key, label);
//     }
//   });
//   return ["All users", ...Array.from(map.values())];
// }, [list]);

// Build dropdown of users from the equipments visible to this Admin
const userOptions = useMemo(() => {
  const map = new Map();
  (list || []).forEach((it) => {
    const label = (it.username || it.userId || "").trim();
    if (label) {
      const key = label.toLowerCase();
      if (!map.has(key)) map.set(key, label);
    }
  });
  return ["All users", ...Array.from(map.values())];
}, [list]);


const [selectedUser, setSelectedUser] = useState("All users");

// Final filtered list (only filter when super admin & admin has selected a specific user)
const filteredList = useMemo(() => {
  if (selectedUser === "All users") return list;
  const target = selectedUser.toLowerCase();
  return (list || []).filter(
    (it) => (it.username || it.userId || "").toLowerCase() === target
  );
}, [list, selectedUser]);

// const filteredList = useMemo(() => {
//   if (!isSuperAdmin || selectedUser === "All users") return list;
//   const target = selectedUser.toLowerCase();
//   return (list || []).filter(
//     (it) => (it.username || it.userId || "").toLowerCase() === target
//   );
// }, [list, selectedUser, isSuperAdmin]);


  const handleDownloadQR = async (item) => {
    const payload = JSON.stringify({ equipmentId: item.equipmentId });
    const qrDataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "H",
      margin: 1,
      scale: 10,
    });

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `${item.equipmentName || "equipment"}-qr.png`;
    link.click();
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Equipment List</h2>

      {/* <div className="relative w-full md:w-1/3 mb-4">
        <input
          type="text"
          placeholder="Search by Equipment or User..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
        />
      </div> */}

      {(isSuperAdmin || roleRaw.toLowerCase() === "admin") && (
  <div className="relative w-full md:w-1/3 mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Filter by user
    </label>
    <select
      value={selectedUser}
      onChange={(e) => setSelectedUser(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18]"
    >
      {userOptions.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  </div>
)}


      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
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
                  User Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Installation Date
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  QR
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
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">
                    {loading ? "Loading…" : "No equipment found"}
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
