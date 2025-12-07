import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEquipments,
  updateEquipment,
} from "../../redux/features/equipment/equipmentSlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import QRCode from "qrcode";
import EditEquipmentModal from "./EditEquipmentModal";
import logo from '../../assets/safetik.png';
import { API_URL } from "../../../utils/apiConfig";

/**
 * EquipmentDetailsRow Component
 */
const EquipmentDetailsRow = ({
  item,
  assignedUserId = null,
  assignedCount = 0,
  onEdit,
  canEdit,
  onShowUnits,
  numCols,
  userMap = {},
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

  // Calculate count to display — prefer assignedCount passed from parent (split rows).
  // Fallback to computing from item.assignments if needed.
  const unitCount = typeof assignedCount === 'number' ? assignedCount : (
    item.assignments && Array.isArray(item.assignments)
      ? item.assignments.filter((a) => a && a.userId && (assignedUserId ? a.userId === assignedUserId : a.userId)).length
      : 0
  );

  // ✅ Get user display name from userMap
const getUserDisplay = () => {
    // Prefer the assignedUserId provided by the parent (split-row)
    let assignedUser = assignedUserId || item.userId;
    // If still empty, try from first assignment
    if (!assignedUser && item.assignments && item.assignments.length > 0) {
      assignedUser = item.assignments[0].userId;
    }
    
    if (!assignedUser) {
      return <span className="text-gray-400 italic">Unassigned</span>;
    }
    const user = userMap[assignedUser];
    if (user) {
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-gray-800">{user.userId}</span>
          <span className="text-xs text-gray-500">{user.companyName || "-"}</span>
        </div>
      );
    }
    // fallback
    return <span className="text-gray-700 font-medium">{assignedUserId}</span>; assignedUserId;
  };
  

  return (
    <>
      <tr className="hover:bg-orange-50/50 transition-colors duration-150 group">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col">
              <button
              onClick={() => onShowUnits(item, assignedUserId)}
              className="text-left text-sm font-bold text-[#DC6D18] hover:text-[#B85B14] hover:underline decoration-dotted underline-offset-2 flex items-center gap-2"
              title="Click to view individual QR codes"
            >
              {item.equipmentName}
              <span className="bg-orange-100 text-orange-800 text-[10px] px-2 py-0.5 rounded-full">
                {unitCount} Assigned
              </span>
            </button>
            <span className="text-xs text-gray-500 mt-0.5">{item.modelSeries}</span>
          </div>
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
          {getUserDisplay()}
        </td>
        
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          {safeDate(item.installationDate)}
        </td>

        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
          <button
            onClick={() => setIsOpen((v) => !v)}
            className="text-gray-600 hover:text-[#DC6D18] font-medium text-xs border border-gray-300 px-3 py-1 rounded hover:border-[#DC6D18]"
          >
            {isOpen ? "Hide Info" : "View Info"}
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

      {isOpen && (
        <tr className="bg-orange-50/30">
          <td colSpan={numCols} className="px-6 py-4 border-t border-orange-100 shadow-inner">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-bold text-orange-800 text-xs uppercase opacity-70 mb-1">Specs</h4>
                <div className="flex justify-between border-b border-orange-200/50 pb-1">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium">{item.capacity || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-orange-200/50 pb-1">
                    <span className="text-gray-500">Gross Weight</span>
                    <span className="font-medium">{item.grossWeight || "-"}</span>
                </div>
                 <div className="flex justify-between border-b border-orange-200/50 pb-1">
                    <span className="text-gray-500">Content</span>
                    <span className="font-medium">{item.content || "-"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-orange-800 text-xs uppercase opacity-70 mb-1">Manufacturing</h4>
                 <div className="flex justify-between border-b border-orange-200/50 pb-1">
                    <span className="text-gray-500">Batch No</span>
                    <span className="font-medium">{item.batchNo || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-orange-200/50 pb-1">
                    <span className="text-gray-500">Mfg Month</span>
                    <span className="font-medium">{safeMonth(item.mfgMonth)}</span>
                </div>
                <div className="flex justify-between border-b border-orange-200/50 pb-1">
                    <span className="text-gray-500">Expiry</span>
                    <span className="font-medium">{safeDate(item.expiryDate)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-orange-800 text-xs uppercase opacity-70 mb-1">Location & Notes</h4>
                <div className="block bg-white/50 p-2 rounded border border-orange-100 h-full">
                    <p className="text-xs text-gray-500">Location: <span className="text-gray-800">{item.location || "N/A"}</span></p>
                    <p className="text-xs text-gray-500 mt-1">Notes: <span className="text-gray-800 italic">{item.notes || "No notes"}</span></p>
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
  const { list, loading, error, loadingUpdate } = useSelector((s) => s.equipment);
  const { userInfo, allUsers = [] } = useSelector((s) => s.users || {});

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [assignments, setAssignments] = useState([]); 
  const [selectedEquipment, setSelectedEquipment] = useState(null); 
  const [viewingEquipment, setViewingEquipment] = useState(null); 
  const [fetchingQRs, setFetchingQRs] = useState(false);

  // Determine whether current user may edit equipment
  const roleStr = (userInfo?.userType || "").toLowerCase().replace(/\s+/g, "");
  const isEditAllowed = roleStr && (roleStr.includes("admin") || roleStr.includes("super") || roleStr.includes("technician"));
  const numCols = isEditAllowed ? 5 : 4;

  useEffect(() => {
    dispatch(getEquipments());
    dispatch(getAllUsers());
  }, [dispatch]);

  // ✅ Create user lookup map for quick access
  const userMap = useMemo(() => {
    const map = {};
    (allUsers || []).forEach((user) => {
      map[user.userId] = user;
    });
    return map;
  }, [allUsers]);

  const handleShowUnits = async (equipment, assignedUserId = null) => {
    setViewingEquipment(equipment);
    setAssignModalOpen(true);
    setFetchingQRs(true);
    setAssignments([]); 

    try {
      const token = userInfo?.token || localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/equipment/${equipment.equipmentId}/qrcodes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        return;
      }

      const data = await res.json();
      
      if (data.success && Array.isArray(data.assignments)) {
        // Only show units that are assigned (have a userId). If an assignedUserId
        // is provided (we are looking at a specific user row), narrow to that user.
        let assignedOnly = data.assignments.filter((u) => u && u.userId);
        if (assignedUserId) {
          assignedOnly = assignedOnly.filter((u) => u.userId === assignedUserId);
        }
        setAssignments(assignedOnly);
      } else {
        setAssignments([]);
      }
    } catch (e) {
      console.error("Error fetching units", e);
      setAssignments([]);
    } finally {
      setFetchingQRs(false);
    }
  };

  const handleDownloadUnitQR = async (unit, equipment) => {
    if (!unit.qrImage) return;
    try {
      const formatDate = (d) => {
        if (!d) return "";
        const dateObj = new Date(d);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}.${month}.${year}`;
      };

      const canvasWidth = 1200;
      const canvasHeight = 800;
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      const colorBlack = "#1A1A1A";
      const colorRed = "#C1272D";
      const colorOrange = "#F15A24";

      // Background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Border
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

      // Corner design
      const cornerX = startX + contentW;
      const cornerY = startY;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(startX, startY, contentW, contentH, borderRadius);
      ctx.clip();

      ctx.beginPath();
      ctx.moveTo(cornerX - 200, cornerY);
      ctx.lineTo(cornerX, cornerY);
      ctx.lineTo(cornerX, cornerY + 60);
      ctx.lineTo(cornerX - 160, cornerY + 60);
      ctx.closePath();
      ctx.fillStyle = colorRed;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cornerX - 160, cornerY + 60);
      ctx.lineTo(cornerX, cornerY + 60);
      ctx.lineTo(cornerX, cornerY + 90);
      ctx.lineTo(cornerX - 120, cornerY + 90);
      ctx.closePath();
      ctx.fillStyle = colorOrange;
      ctx.fill();
      ctx.restore();

      // Header
      const headerY = startY + 50;
      const leftMargin = startX + 40;

      const loadImg = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = src;
      });

      try {
        const logoImg = await loadImg(logo);
        const lHeight = 90;
        const lWidth = (logoImg.width / logoImg.height) * lHeight;
        ctx.drawImage(logoImg, leftMargin, headerY - 10, lWidth, lHeight);

        const textOffsetX = leftMargin + lWidth + 20;
        ctx.fillStyle = colorBlack;
        ctx.font = "bold 55px Arial, sans-serif";
        ctx.fillText("Safetik", textOffsetX, headerY + 30);

        ctx.font = "bold 20px Arial, sans-serif";
        ctx.fillText("Safety Solutions Pvt.Ltd.", textOffsetX, headerY + 60);

        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText("1st floor Aiswarya bldg, S.A. Road, Valanjambalam, Cochin 16.", leftMargin, headerY + 100);

        const rightAlignX = startX + contentW - 50;
        ctx.textAlign = "right";

        ctx.font = "bold 24px Arial, sans-serif";
        ctx.fillText("0484 4117109 | 9846196537", rightAlignX, headerY + 40);
        ctx.fillText("9895039921", rightAlignX, headerY + 75);

        ctx.font = "bold 18px Arial, sans-serif";
        ctx.fillText("info@safetik.in | www.safetik.in", rightAlignX, headerY + 100);
        ctx.textAlign = "left";
      } catch (e) {
        console.warn("Logo load failed", e);
      }

      // Draw dotted line helper
      const drawDottedLine = (x1, y1, x2) => {
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#333";
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.stroke();
        ctx.restore();
      };

      // Draw field helper
      const drawField = (label, value, x, y, width) => {
        ctx.fillStyle = colorBlack;
        ctx.font = "36px Arial, sans-serif";
        ctx.fillText(label, x, y);

        const lineY = y + 10;
        const lineStartX = x + ctx.measureText(label).width + 10;
        const lineEndX = x + width;

        if (value) {
          ctx.font = "bold 34px Courier New, monospace";
          ctx.fillStyle = "#000";
          ctx.fillText(value, lineStartX + 10, y);
        }
        drawDottedLine(lineStartX, lineY, lineEndX);
      };

      // Equipment fields
      let currentY = startY + 220;
      const rowHeight = 90;
      const fullLineW = contentW - 80;

      drawField("Type", equipment.equipmentName || "", leftMargin, currentY, fullLineW);

      currentY += rowHeight;
      drawField("Capacity", equipment.capacity || "", leftMargin, currentY, fullLineW);

      currentY += rowHeight;
      const halfWidth = (fullLineW / 2) - 20;

      drawField("Refilled on", "", leftMargin, currentY, halfWidth);
      const rightColStart = leftMargin + halfWidth + 40;
      drawField("Exp. on", formatDate(equipment.expiryDate), rightColStart, currentY, halfWidth);

      currentY += rowHeight;

      drawField("H.P.Tested on", "", leftMargin, currentY, halfWidth);
      drawField("Next due", formatDate(equipment.refDue), rightColStart, currentY, halfWidth);

      // QR Code
      const qrSize = 180;
      const qrX = startX + contentW - qrSize - 25;
      const qrY = startY + contentH - qrSize - 25;

      const loadQRImg = (src) => new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });

      try {
        const qrImg = await loadQRImg(unit.qrImage);
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      } catch (e) {
        console.warn("QR image load failed", e);
      }

      ctx.font = "12px Arial";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText(equipment.equipmentId || "", qrX + (qrSize / 2), qrY + qrSize + 15);

      // Export
      const finalDataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = finalDataUrl;
      link.download = `Label-${equipment.equipmentName}-${unit.serialNumber}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate QR label:", err);
      alert("Could not generate QR label. Please try again.");
    }
  };

  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    setIsEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleSaveUpdate = async (formData) => {
    if (!selectedEquipment) return;
    const id = selectedEquipment._id || selectedEquipment.equipmentId;
    const { _id, equipmentId, assignments, ...updatePayload } = formData;

    // Ensure we don't send heavy QR images or the full assignments array in the update
    // The frontend edit form only allows editing top-level equipment fields.
    // Assignments (per-unit QR images) are managed separately and should not be sent here.
    try {
      await dispatch(updateEquipment({ id, updates: updatePayload })).unwrap();
      handleCloseEdit();
    } catch (err) {
      console.error("Failed to update equipment:", err);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Equipment & Inventory List</h2>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          {loading && <div className="p-8 text-center text-gray-500 animate-pulse">Loading inventory data...</div>}
          
          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Installed</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                  {isEditAllowed && (
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Edit</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {(() => {
                  // Build rows by splitting each equipment doc into one row per assigned user
                  const rows = [];
                  (list || []).forEach((it) => {
                    // gather unique userIds from top-level and assignments
                    const uSet = new Set();
                    if (it.userId) uSet.add(it.userId);
                    if (it.assignments && Array.isArray(it.assignments)) {
                      it.assignments.forEach((a) => { if (a && a.userId) uSet.add(a.userId); });
                    }

                    // for each user create a row with assignedCount
                    if (uSet.size > 0) {
                      uSet.forEach((uid) => {
                        const count = (it.assignments && Array.isArray(it.assignments)) ? it.assignments.filter(a => a && a.userId === uid).length : (it.userId === uid ? 1 : 0);
                        // push a copy of item with helper props
                        rows.push({ ...it, assignedUserId: uid, assignedCount: count });
                      });
                    }
                  });

                  return rows.length > 0 ? (
                    rows.map((item) => (
                        <EquipmentDetailsRow
                        key={`${item.equipmentId}::${item.assignedUserId}`}
                        item={item}
                        assignedUserId={item.assignedUserId}
                        assignedCount={item.assignedCount}
                        onShowUnits={handleShowUnits}
                        onEdit={handleEdit}
                        canEdit={isEditAllowed}
                        numCols={numCols}
                        userMap={userMap}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={numCols} className="text-center py-10 text-gray-400">No assigned equipment found</td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- INDIVIDUAL UNIT QR MODAL --- */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{viewingEquipment?.equipmentName}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                  Batch: <span className="font-mono text-gray-700">{viewingEquipment?.batchNo}</span> | 
                  Assigned Units: <span className="font-bold text-[#DC6D18]">{assignments.length}</span>
                </p>
              </div>
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="p-2 bg-white rounded-full hover:bg-gray-200 transition-colors shadow-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {fetchingQRs ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#DC6D18] border-t-transparent"></div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p>No individual unit assignments found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {assignments.map((unit, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
                      
                      <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Unit #{idx + 1}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${unit.userId ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                           {unit.userId ? "Assigned" : "In Stock"}
                        </span>
                      </div>

                      <div className="p-4 flex flex-col items-center bg-white flex-1 relative">
                        {/* 🟢 UPDATED SECTION: DISPLAY USER & COMPANY DETAILS */}
                         {unit.userId && (
                            <div className="w-full mb-3 text-center space-y-1 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Assigned To</p>
                                <p className="text-sm font-bold text-gray-800 truncate" title={unit.userId}>{unit.userId}</p>
                                {unit.companyName && (
                                  <p className="text-xs text-gray-600 truncate font-medium border-t border-orange-200 pt-1 mt-1">
                                    {unit.companyName}
                                  </p>
                                )}
                                {unit.location && (
                                  <p className="text-[10px] text-gray-500 truncate">📍 {unit.location}</p>
                                )}
                            </div>
                         )}

                        {unit.qrImage ? (
                          <img 
                            src={unit.qrImage} 
                            alt="QR" 
                            className="w-32 h-32 object-contain mb-3"
                          />
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center bg-gray-50 text-gray-300 text-xs mb-3">No QR</div>
                        )}
                        
                        <div className="w-full text-center">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Serial</p>
                          <p className="font-mono text-xs font-bold text-gray-700 truncate" title={unit.serialNumber}>
                            {unit.serialNumber}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <button
                          onClick={() => handleDownloadUnitQR(unit, viewingEquipment)}
                          disabled={!unit.qrImage}
                          className="w-full py-2 bg-[#DC6D18] hover:bg-[#B85B14] text-white text-xs font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          ⬇ Download Label
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-white flex justify-end">
              <button 
                onClick={() => setAssignModalOpen(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <EditEquipmentModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEdit}
          equipment={selectedEquipment}
          onSave={handleSaveUpdate}
          isLoading={loadingUpdate}
        />
      )}
    </div>
  );
}