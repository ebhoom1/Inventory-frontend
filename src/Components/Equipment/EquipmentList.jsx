import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getEquipments,
  updateEquipment,
} from "../../redux/features/equipment/equipmentSlice";
import { getAllUsers } from "../../redux/features/users/userSlice";
import QRCode from "qrcode";
import Swal from "sweetalert2";
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

  /**
   * ✅ ENHANCED: Capacity-Based Label Sizing with Exact Design Match
   * - If capacity < 3kg: Print smaller 4cm × 4cm label (600×600px) - PROPORTIONALLY SCALED
   * - Otherwise: Print standard 9cm × 5cm label (2400×1333px) - ORIGINAL DESIGN
   * - All colors, styling, and layout match the existing design exactly
   * - QR code and content fit perfectly within borders
   */
  const handlePrintUnitQR = async (unit, equipment) => {
  try {
    const isExisting = Boolean(equipment.spNumber);
    const unitInstall = unit.installationDate || unit.assignedAt || equipment.installationDate || null;
    const unitExpiry = unit.expiryDate || equipment.expiryDate || null;
    const unitRefDue = unit.refDue || equipment.refDue || null;
    const unitHpTested = unit.hpTestedDate || equipment.hpTestedDate || null;

    // ✅ PARSE CAPACITY & CHECK IF < 3KG
    const parseCapacity = (capStr) => {
      if (!capStr) return Infinity;
      const num = parseFloat(String(capStr).match(/[\d.]+/)?.[0] || 0);
      return num;
    };

    const capacityValue = parseCapacity(equipment.capacity);
    const isSmallCapacity = capacityValue > 0 && capacityValue < 3;

    // ✅ EXACT DESIGN WITH CAPACITY-BASED SIZING
    const labelConfig = isSmallCapacity
      ? {
          // SMALL LABEL: 4cm × 4cm (600×600px) - SCALED 25%
          canvasWidth: 600,
          canvasHeight: 600,
          printWidth: "4cm",
          printHeight: "4cm",
          borderPadding: 8,
          borderWidth: 1.5,
          verticalDividerX: 300,
          columnX1: 15,
          columnX2: 315,
          fieldStartY: 60,
          fieldLineSpacing: 30,
          labelWidth: 60,
          dotLineHeight: 15,
          fontSize: 10,
          qrSize: 120,
          qrX: 315,
          qrY: 80,
          qrTextY: 230,
          qrTextFont: 8,
          // Red box (scaled)
          redBoxX: 525,
          redBoxY: 8,
          redBoxW: 67,
          redBoxH: 35,
          // Serial section
          serialStartY: 570,
          serialLabelFontSize: 9,
          serialValueFontSize: 9,
          serialValueX: 120,
        }
      : {
          // STANDARD LABEL: 9cm × 5cm (2400×1333px) - ORIGINAL DESIGN
          canvasWidth: 2400,
          canvasHeight: 1333,
          printWidth: "90mm",
          printHeight: "50mm",
          borderPadding: 30,
          borderWidth: 6,
          verticalDividerX: 1200,
          columnX1: 100,
          columnX2: 750,
          fieldStartY: 320,
          fieldLineSpacing: 135,
          labelWidth: 350,
          dotLineHeight: 60,
          fontSize: 65,
          qrSize: 750,
          qrX: 1425,
          qrY: 240,
          qrTextY: 1030,
          qrTextFont: 50,
          // Red box (original)
          redBoxX: 2120,
          redBoxY: 30,
          redBoxW: 280,
          redBoxH: 140,
          // Serial section
          serialStartY: 1283,
          serialLabelFontSize: 50,
          serialValueFontSize: 55,
          serialValueX: 550,
        };

    const formatDate = (d) => {
      if (!d) return "";
      const dateObj = new Date(d);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const uniqueUnitId = unit.equipmentId;

    const qrPayload = JSON.stringify({
      eid: uniqueUnitId,
      en: equipment.equipmentName || unit.equipmentName || "",
      uid: unit.userId || "",
      loc: unit.location || "",
      ins: unitInstall ? new Date(unitInstall).toISOString().split('T')[0] : "",
      cap: equipment.capacity,
      brd: equipment.brand,
      sn: unit.serialNumber,
      ref: unitRefDue ? new Date(unitRefDue).toISOString().split('T')[0] : "",
      hpt: unitHpTested ? new Date(unitHpTested).toISOString().split('T')[0] : "",
      typ: isExisting ? "E" : "N",
      exp: unitExpiry ? new Date(unitExpiry).toISOString().split('T')[0] : ""
    });

    const qrWidth = isSmallCapacity ? 300 : 1200;
    const generatedQRUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "L", margin: 2, width: qrWidth
    });

    const canvas = document.createElement("canvas");
    canvas.width = labelConfig.canvasWidth;
    canvas.height = labelConfig.canvasHeight;
    const ctx = canvas.getContext("2d");

    // ✅ WHITE BACKGROUND
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, labelConfig.canvasWidth, labelConfig.canvasHeight);

    // ✅ BLACK BORDER
    ctx.lineWidth = labelConfig.borderWidth;
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      labelConfig.borderPadding,
      labelConfig.borderPadding,
      labelConfig.canvasWidth - (labelConfig.borderPadding * 2),
      labelConfig.canvasHeight - (labelConfig.borderPadding * 2)
    );

    const qrImg = new Image();
    qrImg.src = generatedQRUrl;

    await new Promise((resolve) => (qrImg.onload = resolve));

    // ✅ VERTICAL DIVIDER LINE
    ctx.lineWidth = labelConfig.borderWidth;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(labelConfig.verticalDividerX, labelConfig.borderPadding);
    ctx.lineTo(labelConfig.verticalDividerX, labelConfig.canvasHeight - labelConfig.borderPadding);
    ctx.stroke();

    // ✅ RED BOX IN TOP-RIGHT (matching original design color #C1272D)
    ctx.fillStyle = "#C1272D";
    ctx.fillRect(
      labelConfig.redBoxX,
      labelConfig.redBoxY,
      labelConfig.redBoxW,
      labelConfig.redBoxH
    );

    // ✅ HELPER: Draw wrapped text
    const drawWrappedText = (text, x, y, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY;
    };

    // ✅ HELPER: Draw data fields
    let fieldY = labelConfig.fieldStartY;
    const drawDataField = (label, value, columnIndex = 0, isMultiline = false) => {
      const fieldX = columnIndex === 0 ? labelConfig.columnX1 : labelConfig.columnX2;
      const dotStart = fieldX + labelConfig.labelWidth;
      const dotEnd = columnIndex === 0
        ? (labelConfig.verticalDividerX - 20)
        : (labelConfig.canvasWidth - 35);

      ctx.fillStyle = "black";
      ctx.font = `bold ${labelConfig.fontSize}px Arial`;
      ctx.fillText(label, fieldX, fieldY);
      ctx.fillText(":", fieldX + labelConfig.labelWidth - (labelConfig.fontSize * 0.3), fieldY);

      if (isMultiline) {
        ctx.font = `bold ${labelConfig.fontSize}px Arial`;
        drawWrappedText(value || "", dotStart, fieldY, dotEnd - dotStart, labelConfig.dotLineHeight);
      } else {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(dotStart, fieldY + (labelConfig.fontSize * 0.15));
        ctx.lineTo(dotEnd, fieldY + (labelConfig.fontSize * 0.15));
        ctx.stroke();
        ctx.setLineDash([]);

        if (value) {
          ctx.font = `bold ${labelConfig.fontSize}px Arial`;
          ctx.fillText(value, dotStart + 5, fieldY - (labelConfig.fontSize * 0.1));
        }
      }
    };

    // ✅ DRAW DATA FIELDS (LEFT COLUMN ONLY)
    ctx.fillStyle = "black";
    ctx.font = `bold ${labelConfig.fontSize}px Arial`;

    drawDataField("Type", equipment.equipmentName || "", 0, true);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Cap", equipment.capacity, 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Installed", formatDate(unitInstall), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Exp.", formatDate(unitExpiry), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("HP Test.", formatDate(unitHpTested), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Due On", formatDate(unitRefDue), 0);

    // ✅ DRAW QR CODE (RIGHT SECTION - fits within border)
    ctx.drawImage(
      qrImg,
      labelConfig.qrX,
      labelConfig.qrY,
      labelConfig.qrSize,
      labelConfig.qrSize
    );

    // ✅ DRAW EQUIPMENT ID UNDER QR (GRAY TEXT #666)
    ctx.font = `bold ${labelConfig.qrTextFont}px Courier New`;
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText(
      uniqueUnitId,
      labelConfig.qrX + (labelConfig.qrSize / 2),
      labelConfig.qrTextY
    );
    ctx.textAlign = "left";

    // ✅ DRAW SERIAL NUMBER SECTION (ORANGE #DC6D18 label + BLACK value)
    ctx.fillStyle = "#DC6D18";
    ctx.font = `bold ${labelConfig.serialLabelFontSize}px Arial`;
    ctx.fillText("SERIAL NO:", labelConfig.columnX1, labelConfig.serialStartY);

    ctx.fillStyle = "black";
    ctx.font = `bold ${labelConfig.serialValueFontSize}px Courier New`;
    ctx.fillText(unit.serialNumber, labelConfig.serialValueX, labelConfig.serialStartY);

    // ✅ GENERATE AND PRINT - Mobile/iOS Friendly
    const pageSize = `size: ${labelConfig.printWidth} ${labelConfig.printHeight}`;
    const imgSize = `width: ${labelConfig.printWidth}; height: ${labelConfig.printHeight}`;
    
    // Detect device type
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    // Convert canvas to blob for better performance & mobile compatibility
    canvas.toBlob((blob) => {
      if (!blob) {
        alert("Could not generate QR label. Please try again.");
        return;
      }

      const blobUrl = URL.createObjectURL(blob);

      if (isIOS) {
        // iOS: Create fullscreen iframe with print hint
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.top = "0";
        printFrame.style.left = "0";
        printFrame.style.width = "100vw";
        printFrame.style.height = "100vh";
        printFrame.style.border = "none";
        printFrame.style.zIndex = "9999";
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentDocument || printFrame.contentWindow.document;
        frameDoc.write(`
          <html>
            <head>
              <style>
                @page { ${pageSize}; margin: 0; }
                body { margin: 0; padding: 0; }
                img { ${imgSize}; display: block; }
                .print-hint { position: fixed; top: 10px; right: 10px; background: #DC6D18; color: white; padding: 10px 15px; border-radius: 5px; font-size: 12px; z-index: 10000; }
                @media print { .print-hint { display: none; } }
              </style>
            </head>
            <body style="margin:0; padding:0;">
              <div class="print-hint">📱 Use Share → Print</div>
              <img src="${blobUrl}" />
            </body>
          </html>
        `);
        frameDoc.close();

        // Auto-trigger print after short delay
        setTimeout(() => {
          try {
            printFrame.contentWindow.print();
          } catch (e) {
            console.log("Print auto-trigger failed, user can use Share menu");
          }
        }, 500);

        // Clean up blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      } else if (isMobile) {
        // Android/Other mobile: Open in new tab with blob URL
        const printWindow = window.open(blobUrl, "_blank");
        if (!printWindow) {
          alert("Pop-ups blocked. Please enable pop-ups in browser settings.");
          URL.revokeObjectURL(blobUrl);
          return;
        }
        setTimeout(() => {
          printWindow.print();
          URL.revokeObjectURL(blobUrl);
        }, 800);
      } else {
        // Desktop browsers
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          alert("Could not open print window. Please enable pop-ups.");
          URL.revokeObjectURL(blobUrl);
          return;
        }

        printWindow.document.write(`
          <html>
            <head>
              <style>
                @page { ${pageSize}; margin: 0; }
                img { ${imgSize}; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body style="margin:0; padding:0;">
              <img src="${blobUrl}" onload="window.print(); window.close();" onerror="alert('Failed to load image'); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
      }
    }, "image/png", 0.95);
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
    
    try {
      if (formData.units && Array.isArray(formData.units) && formData.units.length > 0) {
        const token = userInfo?.token || localStorage.getItem("token");
        
        for (const unit of formData.units) {
          if (unit._id) {
            // ✅ ENHANCED: Include ALL fields (capacity, brand, etc.) so label sizing updates dynamically
            const unitUpdate = {
              serialNumber: unit.serialNumber,
              location: unit.location,
              installationDate: formData.installationDate,
              // ✅ NEW: Include all equipment details for dynamic label sizing
              equipmentName: formData.equipmentName,
              capacity: formData.capacity, // ✅ CRITICAL: Capacity change updates label size
              brand: formData.brand,
              content: formData.content,
              grossWeight: formData.grossWeight,
              batchNo: formData.batchNo,
              modelSeries: formData.modelSeries,
              mfgMonth: formData.mfgMonth,
              expiryDate: formData.expiryDate,
              refDue: formData.refDue,
              hpTestedDate: formData.hpTestedDate,
              notes: formData.notes,
              companyName: formData.companyName,
            };

            const res = await fetch(`${API_URL}/api/equipment/${unit._id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(unitUpdate),
            });

            if (!res.ok) {
              const errData = await res.json();
              
              // ✅ NEW: Handle 409 Conflict - Duplicate Serial Number
              if (res.status === 409) {
                throw new Error(
                  `Duplicate Serial: "${unit.serialNumber}" already used by equipment ${errData.existingEquipmentId} (${errData.existingEquipmentName}). Change the serial number or contact admin.`
                );
              }
              
              throw new Error(errData?.message || "Failed to update unit");
            }
          }
        }
        
        dispatch(getEquipments());
        handleCloseEdit();
      } else {
        const id = selectedEquipment._id || selectedEquipment.equipmentId;
        const { _id, equipmentId, units, ...updatePayload } = formData;
        
        await dispatch(updateEquipment({ id, updates: updatePayload })).unwrap();
        handleCloseEdit();
      }
    } catch (err) {
      console.error("Failed to update equipment:", err);
      
      // ✅ NEW: Handle duplicate serial number error
      if (err.message && err.message.includes("Duplicate Serial")) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Serial Number",
          text: err.message,
          confirmButtonColor: "#DC6D18",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: err.message || "Failed to update equipment",
          confirmButtonColor: "#DC6D18",
        });
      }
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
                  const grouped = {};
                  
                  (list || []).forEach((it) => {
                    if (it.userId) {
                      const key = `${it.batchNo || it.equipmentId}::${it.userId}`;
                      
                      if (!grouped[key]) {
                        grouped[key] = {
                          ...it,
                          assignedUserId: it.userId,
                          assignedCount: 0,
                          units: []
                        };
                      }
                      
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