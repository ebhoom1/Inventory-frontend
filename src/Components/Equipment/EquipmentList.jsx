// src/pages/EquipmentList.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEquipments,
  updateEquipment,
} from "../../redux/features/equipment/equipmentSlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import QRCode from "qrcode";
import EditEquipmentModal from "./EditEquipmentModal";
import logo from '../../assets/safetik.png';

/**
 * EquipmentDetailsRow Component
 */
const EquipmentDetailsRow = ({
  item,
  onDownloadQR,
  onEdit,
  canEdit,
  numCols,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  const safeMonth = (m) => {
    if (!m) return "-";
    try {
      return new Date(m).toLocaleString("default", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
    } catch (e) {
      return m;
    }
  };

  return (
    <>
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

      {/* Expanded Details Section */}
      {isOpen && (
        <tr className="bg-orange-50/30">
          <td colSpan={numCols} className="px-6 py-1 border-t border-orange-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {/* Column 1: Specifications */}
              <div className="space-y-4 pb-4 border-b border-dotted border-orange-200 md:border-b-0 md:border-r md:border-dotted md:pr-6">
                <h4 className="text-xs font-semibold text-orange-800/80 uppercase tracking-wider">
                  Specifications
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500">Capacity</div>
                    <div className="text-sm text-gray-800">{item.capacity || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Rate Loaded</div>
                    <div className="text-sm text-gray-800">{item.rateLoaded || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Gross Weight</div>
                    <div className="text-sm text-gray-800">{item.grossWeight || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Content</div>
                    <div className="text-sm text-gray-800">{item.content || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Fire Rating</div>
                    <div className="text-sm text-gray-800">{item.fireRating || "-"}</div>
                  </div>
                </div>
              </div>

              {/* Column 2: Manufacturing Info */}
              <div className="space-y-4 pb-4 border-b border-dotted border-orange-200 md:border-b-0 md:border-r md:border-dotted md:px-6">
                <h4 className="text-xs font-semibold text-orange-800/80 uppercase tracking-wider">
                  Manufacturing Info
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-medium text-gray-500">Batch No</div>
                    <div className="text-sm text-gray-800">{item.batchNo || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Serial No</div>
                    <div className="text-sm text-gray-800">{item.serialNumber || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">MFG Month</div>
                    <div className="text-sm text-gray-800">{safeMonth(item.mfgMonth)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">REF Due</div>
                    <div className="text-sm text-gray-800">{safeDate(item.refDue)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Expiry Date</div>
                    <div className="text-sm text-gray-800">{safeDate(item.expiryDate)}</div>
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
                    <div className="text-xs font-medium text-gray-500">Location</div>
                    <div className="text-sm text-gray-800">{item.location || "-"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-500">Notes</div>
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
    </>
  );
};

/**
 * Main EquipmentList Component
 */
export default function EquipmentList() {
  const dispatch = useDispatch();
  const {
    list,
    loading,
    error,
    loadingUpdate,
  } = useSelector((s) => s.equipment);
  const {
    userInfo,
    allUsers: usersList,
    loading: usersLoading,
  } = useSelector((s) => s.users || {});

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState("");

  const roleRaw = (userInfo?.userType || "").toString().toLowerCase();
  const isSuperAdmin = roleRaw === "super admin";
  const isAdmin = roleRaw === "admin";
  const isTechnician = roleRaw === "technician";
  const shouldShowFilter = isSuperAdmin || isAdmin || isTechnician;
  const numCols = 5 + (shouldShowFilter ? 1 : 0);

  useEffect(() => {
    dispatch(getEquipments());
  }, [dispatch]);

  useEffect(() => {
    if (shouldShowFilter) {
      dispatch(getAllUsers());
    }
  }, [dispatch, shouldShowFilter]);

  const userMap = useMemo(() => {
    return new Map(usersList.map((u) => [u.userId, u]));
  }, [usersList]);

  const baseList = useMemo(() => {
    if (!usersList.length || usersLoading) return list || [];
    return (list || []).filter((item) => {
      const assignedUser = userMap.get(item.userId || item.username);
      return assignedUser && assignedUser.userType === "User";
    });
  }, [list, usersList, usersLoading, userMap]);

  const userOptions = useMemo(() => {
    if (!shouldShowFilter || usersLoading) return [];
    const userUsers = usersList.filter((u) => u.userType === "User");
    const options = userUsers.map((u) => ({
      value: u.userId,
      label: u.firstName ? `${u.firstName} (${u.userId})` : u.userId,
    }));
    options.sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: "", label: "All users" }, ...options];
  }, [usersList, shouldShowFilter, usersLoading]);

  const filteredList = useMemo(() => {
    if (!selectedUserId) return baseList;
    return baseList.filter(
      (item) => (item.userId || item.username) === selectedUserId
    );
  }, [baseList, selectedUserId]);


  // --- UPDATED QR DOWNLOAD HANDLER (EXACT DESIGN) ---
  const handleDownloadQR = async (item) => {
    try {
      // 1. Prepare Data
      const qrPayload = JSON.stringify({ equipmentId: item.equipmentId });
      
      const formatDate = (d) => {
        if (!d) return "";
        const dateObj = new Date(d);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}.${month}.${year}`;
      };

      // 2. Canvas Setup (Landscape, High Res for Print)
      // Aspect ratio similar to the image (approx 1.5 : 1)
      const canvasWidth = 1200; 
      const canvasHeight = 800; 
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      // 3. Fonts & Colors
      const fontBold = "bold 36px Arial, sans-serif";
      const fontRegular = "36px Arial, sans-serif";
      const fontSmall = "24px Arial, sans-serif";
      const fontSmallBold = "bold 24px Arial, sans-serif";
      
      const colorBlack = "#1A1A1A";
      const colorGrey = "#4A4A4A";
      const colorRed = "#C1272D";   // From the graphic
      const colorOrange = "#F15A24"; // From the logo/graphic
      
      // Clear Background (White)
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 4. Draw Main Border (Rounded Rectangle)
      const padding = 40;
      const borderRadius = 50;
      const contentW = canvasWidth - (padding * 2);
      const contentH = canvasHeight - (padding * 2);
      const startX = padding;
      const startY = padding;

      ctx.beginPath();
      ctx.roundRect(startX, startY, contentW, contentH, borderRadius);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      // 5. Top Right Decoration (Geometric Shape)
      // The red/orange polygon in the top right corner
      const decoSize = 250;
      const cornerX = startX + contentW; // Right edge
      const cornerY = startY; // Top edge
      
      // Draw the Orange/Red shape - carefully calculated to match image
      ctx.save();
      // Clip to the rounded border so shapes don't bleed out
      ctx.beginPath();
      ctx.roundRect(startX, startY, contentW, contentH, borderRadius);
      ctx.clip();

      // The Red Polygon
      ctx.beginPath();
      ctx.moveTo(cornerX - 200, cornerY);
      ctx.lineTo(cornerX, cornerY);
      ctx.lineTo(cornerX, cornerY + 60);
      ctx.lineTo(cornerX - 160, cornerY + 60);
      ctx.closePath();
      ctx.fillStyle = colorRed;
      ctx.fill();

      // The Orange Polygon (overlapping)
      ctx.beginPath();
      ctx.moveTo(cornerX - 160, cornerY + 60);
      ctx.lineTo(cornerX, cornerY + 60);
      ctx.lineTo(cornerX, cornerY + 90);
      ctx.lineTo(cornerX - 120, cornerY + 90); // Slant
      ctx.closePath();
      ctx.fillStyle = colorOrange;
      ctx.fill();
      ctx.restore();


      // 6. Header Section
      const headerY = startY + 50;
      const leftMargin = startX + 40;

      // Load Logo
      const loadImg = (src) => new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = src;
      });

      try {
        const logoImg = await loadImg(logo);
        // Maintain aspect ratio, height approx 90px
        const lHeight = 90;
        const lWidth = (logoImg.width / logoImg.height) * lHeight;
        ctx.drawImage(logoImg, leftMargin, headerY - 10, lWidth, lHeight);

        // "Safetik" Text
        const textOffsetX = leftMargin + lWidth + 20;
        ctx.fillStyle = colorBlack;
        ctx.font = "bold 55px Arial, sans-serif";
        ctx.fillText("Safetik", textOffsetX, headerY + 30);
        
        ctx.font = "bold 20px Arial, sans-serif";
        ctx.fillText("Safety Solutions Pvt.Ltd.", textOffsetX, headerY + 60);

        // Address Line
        ctx.font = "bold 18px Arial, sans-serif"; // Slightly bolder as in image
        ctx.fillText("1st floor Aiswarya bldg, S.A. Road, Valanjambalam, Cochin 16.", leftMargin, headerY + 100);

        // Contact Info (Right Side)
        const rightAlignX = startX + contentW - 50; // Padding from right border
        ctx.textAlign = "right";
        
        // Phone numbers
        ctx.font = "bold 24px Arial, sans-serif";
        ctx.fillText("📞 0484 4117109 | 9846196537", rightAlignX, headerY + 40);
        ctx.fillText("9895039921", rightAlignX, headerY + 75);
        
        // Email / Web
        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText("✉ info@safetik.in | 🌐 www.safetik.in", rightAlignX, headerY + 100);
        ctx.textAlign = "left"; // Reset

      } catch (e) {
        console.warn("Logo load failed", e);
      }


      // 7. Content Lines (The Form Fields)
      // Setup for drawing dotted lines
      const drawDottedLine = (x1, y1, x2) => {
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([3, 3]); // Dotted pattern
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#333";
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y1);
          ctx.stroke();
          ctx.restore();
      };

      // Helper to draw a field
      const drawField = (label, value, x, y, width) => {
          // Draw Label
          ctx.fillStyle = colorBlack;
          ctx.font = fontRegular; // "Type" looks standard weight in image, maybe slightly bold
          ctx.fillText(label, x, y);

          // Measure label width to position value if needed, 
          // but usually value sits above the line or to the right.
          // In the image, it looks like a form. We will print the value 
          // slightly above the dotted line.
          
          const lineY = y + 10; // Line is slightly below text baseline
          const lineStartX = x + ctx.measureText(label).width + 10;
          const lineEndX = x + width;

          // Draw Value (if exists)
          if (value) {
             ctx.font = "bold 34px Courier New, monospace"; // Typewriter look for filled data
             ctx.fillStyle = "#000";
             // Center value on the line roughly
             ctx.fillText(value, lineStartX + 10, y); 
          }

          // Draw Line
          drawDottedLine(lineStartX, lineY, lineEndX);
      };

      let currentY = startY + 220; // Start below header
      const rowHeight = 90;
      const fullLineW = contentW - 80;

      // --- Row 1: Type ---
      // Mapping: Type = equipmentName
      drawField("Type", item.equipmentName || "", leftMargin, currentY, fullLineW);
      
      // --- Row 2: Capacity ---
      currentY += rowHeight;
      drawField("Capacity", item.capacity || "", leftMargin, currentY, fullLineW);

      // --- Row 3: Refilled on | Exp. on ---
      currentY += rowHeight;
      const halfWidth = (fullLineW / 2) - 20;
      
      // Left: Refilled on (Leave blank or map if you have data)
      drawField("Refilled on", "", leftMargin, currentY, halfWidth);
      
      // Right: Exp. on -> Mapped to expiryDate
      const rightColStart = leftMargin + halfWidth + 40;
      drawField("Exp. on", formatDate(item.expiryDate), rightColStart, currentY, halfWidth);

      // --- Row 4: H.P.Tested on | Next due ---
      currentY += rowHeight;
      
      // Left: H.P.Tested on (Leave blank)
      drawField("H.P.Tested on", "", leftMargin, currentY, halfWidth);
      
      // Right: Next due -> Mapped to refDue
      drawField("Next due", formatDate(item.refDue), rightColStart, currentY, halfWidth);


      // 8. QR Code Generation
      // The image doesn't show a QR, but this is a digital tag. 
      // We place it in the bottom right corner, unobtrusively.
      const qrSize = 150;
      const qrX = startX + contentW - qrSize - 25;
      const qrY = startY + contentH - qrSize - 25;

      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "H",
        margin: 0,
        width: qrSize,
        color: {
            dark: "#000000",
            light: "#FFFFFF00" // Transparent bg
        }
      });

      const qrImg = await loadImg(qrDataUrl);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Optional: Add ID below QR
      ctx.font = "12px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText(item.equipmentId || "", qrX + (qrSize/2), qrY + qrSize + 15);

      // 9. Download
      const finalDataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = finalDataUrl;
      link.download = `Label-${item.equipmentName}-${item.equipmentId}.png`;
      link.click();

    } catch (err) {
      console.error("Failed to generate QR label:", err);
      alert("Could not generate QR label. Please check console.");
    }
  };
  // --- END UPDATED HANDLER ---

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
    const id = selectedEquipment._id || selectedEquipment.equipmentId;
    const { _id, equipmentId, ...updatePayload } = formData;

    try {
      await dispatch(updateEquipment({ id, updates: updatePayload })).unwrap();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to update equipment:", err);
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
                    onEdit={handleEdit}
                    canEdit={shouldShowFilter}
                    numCols={numCols}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={numCols}
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

      {isEditModalOpen && (
        <EditEquipmentModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          equipment={selectedEquipment}
          onSave={handleSaveUpdate}
          isLoading={loadingUpdate}
        />
      )}
    </div>
  );
}