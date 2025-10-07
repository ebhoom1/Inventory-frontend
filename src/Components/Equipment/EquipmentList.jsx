// src/pages/EquipmentList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEquipments } from "../../redux/features/equipment/equipmentSlice";
import { getAllUsers } from "../../redux/features/users/userSlice"; // Assuming path to your user slice
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
  const { userInfo, allUsers: usersList, loading: usersLoading } = useSelector((s) => s.users || {});

  const roleRaw = (userInfo?.userType || "").toString().toLowerCase();
  const isSuperAdmin = roleRaw === "super admin";
  const isAdmin = roleRaw === "admin";
  const isTechnician = roleRaw === "technician";
  const shouldShowFilter = isSuperAdmin || isAdmin || isTechnician;

  useEffect(() => {
    dispatch(getEquipments());
  }, [dispatch]);

  useEffect(() => {
    if (shouldShowFilter) {
      dispatch(getAllUsers());
    }
  }, [dispatch, shouldShowFilter]);

  // Build a map of userId -> user for quick lookup
  const userMap = useMemo(() => {
    return new Map(usersList.map((u) => [u.userId, u]));
  }, [usersList]);

  // Base filtered list: Only equipments assigned to users with userType === "User"
  const baseList = useMemo(() => {
    if (!usersList.length || usersLoading) return list || [];
    return (list || []).filter((item) => {
      const assignedUser = userMap.get(item.userId || item.username);
      return assignedUser && assignedUser.userType === "User";
    });
  }, [list, usersList, usersLoading, userMap]);

  // Build user options: Only users with userType === "User" (for dropdown)
  const userOptions = useMemo(() => {
    if (!shouldShowFilter || usersLoading) return [];
    const userUsers = usersList.filter((u) => u.userType === "User");
    const options = userUsers.map((u) => ({
      value: u.userId, // Use custom userId for matching with equipment.userId
      label: u.firstName ? `${u.firstName} (${u.userId})` : u.userId,
    }));
    options.sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: "", label: "All users" }, ...options];
  }, [usersList, shouldShowFilter, usersLoading]);

  const [selectedUserId, setSelectedUserId] = useState("");

  // Final filtered list: Apply user selection on top of baseList
  const filteredList = useMemo(() => {
    if (!selectedUserId) return baseList;
    // Match by custom userId (assuming equipment stores item.userId as custom userId string)
    return baseList.filter((item) => 
      (item.userId || item.username) === selectedUserId
    );
  }, [baseList, selectedUserId]);

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

      {shouldShowFilter && (
        <div className="relative w-full md:w-1/3 mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by user {usersLoading && "(Loading users...)"}
          </label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={usersLoading}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#DC6D18] focus:border-[#DC6D18] disabled:opacity-50"
          >
            {userOptions.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
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
          {!loading && !usersLoading && baseList.length === 0 && (
            <div className="p-3 text-sm text-gray-600">No equipments found for users.</div>
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
              {filteredList.length > 0 ? (
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
