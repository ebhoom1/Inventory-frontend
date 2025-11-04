// src/pages/EquipmentList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEquipments,
  updateEquipment, // <-- Import your update thunk
} from "../../redux/features/equipment/equipmentSlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import QRCode from "qrcode";
import EditEquipmentModal from "./EditEquipmentModal"; // <-- Make sure this path is correct
import logo from '../../assets/safetik.png'

/**
 * Updated EquipmentDetailsRow
 * - Contains the main row with the Edit button
 * - Contains the NEW redesigned expanded details section
 */
const EquipmentDetailsRow = ({
  item,
  onDownloadQR,
  onEdit,
  canEdit,
  numCols,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  //   const safeDate = (d) => {
  //   if (!d) return "-";
  //   try {
  //     const date = new Date(d);
  //     if (isNaN(date.getTime())) return "-";
  //     return date.toLocaleDateString();
  //   } catch (error) {
  //     return "-";
  //   }
  // };

  const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  // Helper to format month-year string
const safeMonth = (m) => {
    if (!m) return "-";
    try {
      // Handles "YYYY-MM" format or full dates
      return new Date(m).toLocaleString("default", {
        month: "long",
        year: "numeric",
        timeZone: "UTC", // Add timezone to prevent off-by-one day issues
      });
    } catch (e) {
      return m; // Fallback to the original string if it's not a parseable date
    }
  };

  return (
    <>
      {/* Main Row (Includes Edit Button) */}
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
        {/* --- Edit Button Column --- */}
        {canEdit && (
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
            <button
              onClick={() => onEdit(item)}
              className="text-orange-600 hover:text-blue-800 font-semibold"
            >
              Edit
            </button>
          </td>
        )}
      </tr>

      {/* --- REDESIGNED Expanded Details --- */}
      {isOpen && (
        <tr className="bg-orange-50/30">
          <td
            colSpan={numCols} // <-- Uses dynamic numCols
            className="px-6 py-1 border-t border-orange-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {/* Column 1: Specifications */}
              <div className="space-y-4 pb-4 border-b border-dotted border-orange-200 md:border-b-0 md:border-r md:border-dotted md:pr-6">
                <h4 className="text-xs font-semibold text-orange-800/80 uppercase tracking-wider">
                  Specifications
                </h4>
                <div className="space-y-3">
                  <div>
  <div className="text-xs font-medium text-gray-500">Brand</div>
  <div className="text-sm text-gray-800">{item.brand || "-"}</div>
</div>

                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Capacity
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.capacity || "-"}
                    </div>
                  </div>
                  {/* <div>
                    <div className="text-xs font-medium text-gray-500">
                      Rate Loaded
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.rateLoaded || "-"}
                    </div>
                  </div> */}
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Gross Weight
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.grossWeight || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Content
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.content || "-"}
                    </div>
                  </div>
                  {/* <div>
                    <div className="text-xs font-medium text-gray-500">
                      Fire Rating
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.fireRating || "-"}
                    </div>
                  </div> */}
                </div>
              </div>

              {/* Column 2: Manufacturing Info */}
              <div className="space-y-4 pb-4 border-b border-dotted border-orange-200 md:border-b-0 md:border-r md:border-dotted md:px-6">
                <h4 className="text-xs font-semibold text-orange-800/80 uppercase tracking-wider">
                  Manufacturing Info
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Batch No
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.batchNo || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Serial No
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.serialNumber || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      MFG Month
                    </div>
                    <div className="text-sm text-gray-800">
                      {safeMonth(item.mfgMonth)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      REF Due
                    </div>
                    <div className="text-sm text-gray-800">
                      {safeDate(item.refDue)}
                    </div>
                  </div>
                      {/* --- ADDED EXPIRY DATE --- */}
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Expiry Date
                    </div>
                    <div className="text-sm text-gray-800">
                      {safeDate(item.expiryDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Other Details */}
              <div className="space-y-4 md:pl-6">
                <h4 className="text-xs font-semibold text-orange-800/80 uppercase tracking-wider">
                  Other Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Location
                    </div>
                    <div className="text-sm text-gray-800">
                      {item.location || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">
                      Notes
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                      {item.notes || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
      {/* --- END of Redesign --- */}
    </>
  );
};

export default function EquipmentList() {
  const dispatch = useDispatch();
  const {
    list,
    loading,
    error,
    loadingUpdate, // <-- Assuming your slice has this
  } = useSelector((s) => s.equipment);
  const {
    userInfo,
    allUsers: usersList,
    loading: usersLoading,
  } = useSelector((s) => s.users || {});

  // --- Added Modal State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const roleRaw = (userInfo?.userType || "").toString().toLowerCase();
  const isSuperAdmin = roleRaw === "super admin";
  const isAdmin = roleRaw === "admin";
  const isTechnician = roleRaw === "technician";
  const shouldShowFilter = isSuperAdmin || isAdmin || isTechnician; // Same logic for filtering and editing

  // --- Added Dynamic Column Count ---
  const numCols = 5 + (shouldShowFilter ? 1 : 0);

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
    return baseList.filter(
      (item) => (item.userId || item.username) === selectedUserId
    );
  }, [baseList, selectedUserId]);

  // --- UPDATED QR DOWNLOAD HANDLER ---
  const handleDownloadQR = async (item) => {
 // Include all required fields in the QR code payload
    const payload = JSON.stringify({
      equipmentId: item.equipmentId,
      installationDate: item.installationDate,
      expiryDate: item.expiryDate,
      capacity: item.capacity
    });
  
    const equipmentName = item.equipmentName || "Equipment";

    // --- Get and Format Installation Date ---
    // (Helper function duplicated from EquipmentDetailsRow for use here)
    const safeDateForQR = (d) => (d ? new Date(d).toLocaleDateString() : "-");
    const installationDate = safeDateForQR(item.installationDate);
    const expiryDate = safeDateForQR(item.expiryDate);
    const dateText = `Installed: ${installationDate} | Expires: ${expiryDate}`;
    const capacityText = `Capacity: ${item.capacity || '-'}`;

    // --- 1. Define Layout Constants ---
    const padding = 20;
    const logoHeight = 40;
    
    const nameFont = "16px Arial";
    const nameLineHeight = 20; // Approx height for the font
    
    const dateFont = "14px Arial";
    const dateLineHeight = 16; // Approx height for this font

    const logoMarginBottom = 10;
    const nameMarginBottom = 8; // Margin between name and date
    const dateMarginBottom = 15; // Margin between date and QR
    
    const qrSize = 250; // Fixed size for the QR code itself

    try {
      // --- 2. Generate QR Code Data URL ---
      const qrDataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: "H",
        margin: 1,
        width: qrSize,
      });

      // --- 3. Load Images (QR and Logo) ---
      const loadImg = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (err) => reject(new Error(`Failed to load image: ${src}`));
          img.src = src;
        });
      };

      // Load both images
      const [qrImg, logoImg] = await Promise.all([
        loadImg(qrDataUrl),
        loadImg(logo), // 'logo' is the imported image from assets
      ]);

      // --- 4. Calculate Canvas Dimensions ---

      // Calculate logo dimensions (maintain aspect ratio)
      const logoAspectRatio = logoImg.width / logoImg.height;
      const finalLogoWidth = logoHeight * logoAspectRatio;
      const finalLogoHeight = logoHeight;

      // Calculate text widths (using a temp canvas)
      const canvasTemp = document.createElement("canvas");
      const ctxTemp = canvasTemp.getContext("2d");
      
      ctxTemp.font = nameFont;
      const nameMetrics = ctxTemp.measureText(equipmentName);
      const nameWidth = nameMetrics.width;

      ctxTemp.font = dateFont;
      const dateMetrics = ctxTemp.measureText(dateText);
      const dateWidth = dateMetrics.width;

      // Determine final canvas size
      const canvasWidth = Math.max(qrSize, finalLogoWidth, nameWidth, dateWidth) + padding * 2;
      
      // Calculate Y positions for each element
      const logoY = padding;
      const nameY = logoY + finalLogoHeight + logoMarginBottom;
      const dateY = nameY + nameLineHeight + nameMarginBottom;
      const qrY = dateY + dateLineHeight + dateMarginBottom;
      
      // Calculate final canvas height
      const canvasHeight = qrY + qrSize + padding;

      // --- 5. Create and Draw on Canvas ---
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      // Fill background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Set common text alignment
      ctx.textAlign = "center";
      ctx.textBaseline = "top"; // Align text from its top edge
      const textX = canvasWidth / 2; // Common X for all centered items


      // Draw Logo (Top-Center)
      const logoX = (canvasWidth - finalLogoWidth) / 2;
      ctx.drawImage(logoImg, logoX, logoY, finalLogoWidth, finalLogoHeight);

      // Draw Equipment Name (Center)
      ctx.fillStyle = "black";
      ctx.font = nameFont;
      ctx.fillText(equipmentName, textX, nameY);
      

    // Draw Installation/Expiry Date (Center)
    ctx.fillStyle = "#555"; // Slightly lighter color for the date
    ctx.font = dateFont;
    ctx.fillText(dateText, textX, dateY);

    // Draw Capacity (Center, below date)
    const capacityY = dateY + dateLineHeight + 4;
    ctx.fillStyle = "#333";
    ctx.font = dateFont;
    ctx.fillText(capacityText, textX, capacityY);

    // Draw QR Code (Center, below capacity)
    const qrX = (canvasWidth - qrSize) / 2;
    const qrYWithCapacity = capacityY + dateLineHeight + 10;
    ctx.drawImage(qrImg, qrX, qrYWithCapacity, qrSize, qrSize);

      // --- 6. Trigger Download ---
      const finalDataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = finalDataUrl;
      link.download = `${equipmentName}-qr.png`;
      link.click();

    } catch (err) {
      console.error("Failed to generate custom QR code:", err);
      // Fallback: Just download the plain QR if canvas fails
      try {
          const qrDataUrl = await QRCode.toDataURL(payload, {
              errorCorrectionLevel: "H",
              margin: 1,
              scale: 10,
          });
          const link = document.createElement("a");
          link.href = qrDataUrl;
          link.download = `${equipmentName}-qr.png`;
          link.click();
      } catch (fallbackErr) {
          console.error("Failed to generate fallback QR code:", fallbackErr);
          alert("Could not generate QR code.");
      }
    }
  };
  // --- END OF UPDATED HANDLER ---


  // --- Added Modal Handlers ---
  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleSaveUpdate = async (formData) => {
    if (!selectedEquipment) return;

    // Get the ID for the API call (use _id if available, fallback to equipmentId)
    const id = selectedEquipment._id || selectedEquipment.equipmentId;

    // Prepare the update payload
    // We remove internal IDs from the payload, just sending the changed data
    const { _id, equipmentId, ...updatePayload } = formData;

    try {
      // Dispatch the thunk with { id, updates }
      await dispatch(updateEquipment({ id, updates: updatePayload })).unwrap();
      handleCloseModal();
      // Note: Your slice should handle updating the `list` state,
      // which will cause the table to re-render.
    } catch (err) {
      console.error("Failed to update equipment:", err);
      // You could pass an error message back to the modal to display
    }
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
            <div className="p-3 text-sm text-gray-600">
              No equipments found for users.
            </div>
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
                {/* --- Added Edit Header --- */}
                {shouldShowFilter && (
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Edit
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <EquipmentDetailsRow
                    key={item._id || item.equipmentId}
                    item={item}
                    onDownloadQR={handleDownloadQR}
                    onEdit={handleEdit} // <-- Pass handler
                    canEdit={shouldShowFilter} // <-- Pass permission
                    numCols={numCols} // <-- Pass col count
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={numCols} // <-- Use dynamic col count
                    className="text-center py-10 text-gray-500"
                  >
                    {loading || usersLoading
                      ? "Loading…"
                      : "No equipment found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Render Modal --- */}
      {isEditModalOpen && (
        <EditEquipmentModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          equipment={selectedEquipment}
          onSave={handleSaveUpdate}
          isLoading={loadingUpdate} // <-- Pass loading state to modal
        />
      )}
    </div>
  );
}