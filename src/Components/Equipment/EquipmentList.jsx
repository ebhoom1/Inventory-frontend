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

  const unitCount = typeof assignedCount === 'number' ? assignedCount : 1;

  const getUserDisplay = () => {
    let assignedUser = assignedUserId || item.userId;
    
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
    return <span className="text-gray-700 font-medium">{assignedUserId}</span>;
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
          {item && item.spNumber ? (
            <span className="text-gray-400 italic">-</span>
          ) : (
            safeDate(item.installationDate)
          )}
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
                <h4 className="font-bold text-orange-800 text-xs uppercase opacity-70 mb-1">Notes</h4>
                <div className="block bg-white/50 p-2 rounded border border-orange-100 h-full">
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

  const roleStr = (userInfo?.userType || "").toLowerCase().replace(/\s+/g, "");
  const isEditAllowed = roleStr && (roleStr.includes("admin") || roleStr.includes("super") || roleStr.includes("technician"));
  const numCols = isEditAllowed ? 5 : 4;

  useEffect(() => {
    dispatch(getEquipments());
    dispatch(getAllUsers());
  }, [dispatch]);

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
      
      if (data.success) {
        // For flat structure, data.equipment is an array where each doc = 1 unit
        const equipmentList = Array.isArray(data.equipment) ? data.equipment : (Array.isArray(data.assignments) ? data.assignments : []);
        let assignedOnly = equipmentList.filter((u) => u && u.userId);
        if (assignedUserId) {
          assignedOnly = assignedOnly.filter((u) => String(u.userId) === String(assignedUserId));
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

   const handlePrintUnitQR = async (unit, equipment) => {
      
    try {
      const isExisting = Boolean(equipment.spNumber);

      // Prefer unit (assignment) level dates; fall back to equipment-level values
      const unitInstall = unit.installationDate || unit.assignedAt || equipment.installationDate || null;
      const unitExpiry = unit.expiryDate || equipment.expiryDate || null;
      const unitRefDue = unit.refDue || equipment.refDue || null;

      // Configure Dynamic Labels and Values
      let labelRow3, valueRow3, labelRow4, valueRow4;

      if (isExisting) {
        labelRow3 = "Exp. on";
        valueRow3 = unitExpiry;
        labelRow4 = "Next due";
        valueRow4 = unitRefDue;
      } else {
        labelRow3 = "Installed";
        valueRow3 = unitInstall;
        labelRow4 = "Expiry Date";
        valueRow4 = unitExpiry;
      }

      const formatDate = (d) => {
        if (!d) return "";
        const dateObj = new Date(d);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day}.${month}.${year}`;
      };
      
      // always print using the equipment's batch id
      const uniqueUnitId = unit.equipmentId;

      const qrPayload = JSON.stringify({
        eid: uniqueUnitId,   
        en: equipment.equipmentName || unit.equipmentName || "",
        uid: unit.userId || "",      
        loc: unit.location || "",     // location -> loc
        ins: unitInstall ? new Date(unitInstall).toISOString().split('T')[0] : "", // installationDate -> ins
        cap: equipment.capacity,        // capacity -> cap
        brd: equipment.brand,           // brand -> brd
        sn: unit.serialNumber,          // serialNumber -> sn
        ref: unitRefDue ? new Date(unitRefDue).toISOString().split('T')[0] : "", // refillingDue -> ref
        typ: isExisting ? "E" : "N",    // type -> typ (E/N for Existing/New)
        exp: unitExpiry ? new Date(unitExpiry).toISOString().split('T')[0] : ""  // expiryDate -> exp
      });

      const generatedQRUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "L",    
        margin: 2,      
        width: 1200,    
        color: { 
          dark: "#000000", 
          light: "#FFFFFF" 
        }
      });

      // Canvas proportions: 2400x1600px for optimal resolution
      const canvasWidth = 2400; 
      const canvasHeight = 1600;
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      // Set background and draw border
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "black";
      ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60);

      // Load logo and QR code images
      const logoImg = new Image();
      logoImg.src = logo;
      const qrImg = new Image();
      qrImg.src = generatedQRUrl;

      await Promise.all([
        new Promise((resolve) => (logoImg.onload = resolve)),
        new Promise((resolve) => (qrImg.onload = resolve)),
      ]);

      // --- HEADER SECTION ---
      // Logo - positioned at top left
      const logoSize = 120;
      ctx.drawImage(logoImg, 80, 60, logoSize, logoSize);
      
      // Company name "Safetik" next to logo
      ctx.fillStyle = "black";
      ctx.font = "bold 90px Arial, sans-serif";
      ctx.fillText("Safetik", 220, 140);

      // Address lines below company name
      ctx.font = "48px Arial, sans-serif";
      ctx.fillText("1st Fl, Aiswarya Bldg., S.A.Rd,", 80, 240);
      ctx.fillText("Valanjambalam, Kochi-16", 80, 310);

      // Yellow highlighted contact numbers
      ctx.fillStyle = "#FFD700";
      ctx.beginPath(); 
      ctx.roundRect(80, 340, 900, 140, 30);
      ctx.fill();
      
      ctx.fillStyle = "black";
      ctx.font = "bold 60px Courier New, monospace";
      ctx.fillText("0484 4117109 | 9846196537", 120, 410);
      ctx.font = "bold 55px Courier New, monospace";
      ctx.fillText("9895039921", 120, 480);

      // Email and website
      ctx.font = "45px Arial, sans-serif";
      ctx.fillStyle = "black";
      ctx.fillText("info@safetik.in | www.safetik.in", 80, 580);

      // --- VERTICAL SEPARATOR LINE ---
      ctx.lineWidth = 3;
      ctx.strokeStyle = "black";
      ctx.beginPath();
      ctx.moveTo(1200, 60);
      ctx.lineTo(1200, 1500);
      ctx.stroke();

      // --- LEFT SECTION: DATA FIELDS ---
      const fieldX = 100;
      let fieldY = 700;
      const fieldLineSpacing = 145;
      const labelWidth = 450;
      const dotStartX = fieldX + labelWidth;
      const dotEndX = 1100;

      const drawDataField = (label, value) => {
        // Label and colon - Made bold for clarity
        ctx.fillStyle = "black";
        ctx.font = "bold 55px Arial, sans-serif";
        ctx.fillText(label, fieldX, fieldY);
        ctx.fillText(":", fieldX + labelWidth - 50, fieldY);

        // Dotted line - Moved down so it acts as an underline instead of a strike-through
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3; // slightly thicker underline
        ctx.beginPath();
        ctx.setLineDash([15, 15]);
        ctx.moveTo(dotStartX, fieldY + 10); 
        ctx.lineTo(dotEndX, fieldY + 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Value if provided - BOLD, LARGER ARIAL font for clear reading
        if (value) {
          ctx.fillStyle = "black";
          ctx.font = "bold 60px Arial, sans-serif";
          ctx.fillText(value, dotStartX + 30, fieldY - 2); // Positioned nicely above the dotted line
        }
        
        fieldY += fieldLineSpacing;
      };

      // Draw the dynamic fields
      drawDataField("Type", equipment.equipmentName || "");
      drawDataField("Cap", equipment.capacity);
      drawDataField("H.P. Tested", "");
      drawDataField("Installed on", formatDate(unitInstall));
      drawDataField("Exp.", formatDate(unitExpiry));
      drawDataField("Refilled", "");

      // --- RIGHT SECTION: QR CODE ---
      const qrSize = 750;
      const qrX = 1450;
      const qrY = 480;
      
      // Draw QR code
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      // Equipment ID below QR
      ctx.font = "bold 48px Courier New, monospace";
      ctx.fillStyle = "#666";
      ctx.textAlign = "center";
      ctx.fillText(uniqueUnitId, qrX + qrSize / 2, qrY + qrSize + 80);
      ctx.textAlign = "left";

      // --- FOOTER SECTION ---
      // Red accent rectangle at top right
      ctx.fillStyle = "#C1272D";
      ctx.fillRect(canvasWidth - 280, 30, 250, 140);

      // Serial Number at bottom
      ctx.font = "bold 60px Arial, sans-serif";
      ctx.fillStyle = "#DC6D18";
      ctx.fillText("SERIAL NO:", 100, canvasHeight - 80);
      
      ctx.fillStyle = "black";
      ctx.font = "bold 65px Courier New, monospace";
      ctx.fillText(unit.serialNumber, 550, canvasHeight - 80);

      // --- PRINTING ---
      const finalDataUrl = canvas.toDataURL();
      const printWindow = window.open("", "_blank");
      
      // Write HTML content to the new window
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Label - ${unit.serialNumber}</title>
            <style>
              /* OPTIMIZED: Print settings for 90mm × 60mm label */
              @page {
                size: 90mm 60mm;   
                margin: 0;
              }
              
              html, body {
                margin: 0;
                padding: 0;
                width: 90mm;
                height: 60mm;        
              }
              
              body {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: white;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              
              img {
                width: 90mm;
                height: 60mm;         
                object-fit: contain;
                image-rendering: -webkit-optimize-contrast;
                image-rendering: crisp-edges;
                image-rendering: pixelated;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              @media print {
                body {
                  visibility: visible;
                  background: white !important;
                }
                img {
                  display: block;
                  margin: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <img src="${finalDataUrl}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
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
    
    const { _id, equipmentId, ...updatePayload } = formData;
    
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
                  // ✅ GROUP by batchNo and userId to avoid duplicates
                  const grouped = {};
                  
                  (list || []).forEach((it) => {
                    if (it.userId) {
                      // Create unique key for this equipment batch + user combination
                      const key = `${it.batchNo || it.equipmentId}::${it.userId}`;
                      
                      if (!grouped[key]) {
                        grouped[key] = {
                          ...it,
                          assignedUserId: it.userId,
                          assignedCount: 0,
                          units: []
                        };
                      }
                      
                      // Increment count and track units for this group
                      grouped[key].assignedCount += 1;
                      grouped[key].units.push(it);
                    }
                  });

                  const rows = Object.values(grouped);

                  return rows.length > 0 ? (
                    rows.map((item) => (
                        <EquipmentDetailsRow
                        key={`${item.batchNo || item.equipmentId}::${item.assignedUserId}`}
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
                           <p className="font-mono text-xs font-bold text-[#DC6D18]">
                           {unit.equipmentId}
      </p>
                        </span>
                      </div>

                      <div className="p-4 flex flex-col items-center bg-white flex-1 relative">
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
    onClick={() => handlePrintUnitQR(unit, viewingEquipment)}
    disabled={!unit.qrImage}
    className="w-full py-2 bg-[#DC6D18] hover:bg-[#B85B14] text-white text-xs font-bold rounded shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
  >
    {/* Updated Label and Icon */}
    🖨️ Print Label
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