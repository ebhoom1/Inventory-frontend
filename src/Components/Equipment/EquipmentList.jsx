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
import logo from "../../assets/safetik.png";
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

  const unitCount = typeof assignedCount === "number" ? assignedCount : 1;

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
          <span className="text-xs text-gray-500">
            {user.companyName || "-"}
          </span>
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
            <span className="text-xs text-gray-500 mt-0.5">
              {item.modelSeries}
            </span>
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
          <td
            colSpan={numCols}
            className="px-6 py-4 border-t border-orange-100 shadow-inner"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-bold text-orange-800 text-xs uppercase opacity-70 mb-1">
                  Specs
                </h4>
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
                <h4 className="font-bold text-orange-800 text-xs uppercase opacity-70 mb-1">
                  Manufacturing
                </h4>
                <div className="flex justify-between border-b border-orange-200/50 pb-1">
                  <span className="text-gray-500">Batch No</span>
                  <span className="font-medium">{item.batchNo || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-orange-200/50 pb-1">
                  <span className="text-gray-500">Mfg Month</span>
                  <span className="font-medium">
                    {safeMonth(item.mfgMonth)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-orange-200/50 pb-1">
                  <span className="text-gray-500">Expiry</span>
                  <span className="font-medium">
                    {safeDate(item.expiryDate)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-orange-800 text-xs uppercase opacity-70 mb-1">
                  Notes
                </h4>
                <div className="block bg-white/50 p-2 rounded border border-orange-100 h-full">
                  <p className="text-xs text-gray-500 mt-1">
                    Notes:{" "}
                    <span className="text-gray-800 italic">
                      {item.notes || "No notes"}
                    </span>
                  </p>
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
  const { list, loading, error, loadingUpdate } = useSelector(
    (s) => s.equipment,
  );
  const { userInfo, allUsers = [] } = useSelector((s) => s.users || {});

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [viewingEquipment, setViewingEquipment] = useState(null);
  const [fetchingQRs, setFetchingQRs] = useState(false);
  const [assignedUserFilter, setAssignedUserFilter] = useState("all");
  const [qrPdfLoading, setQrPdfLoading] = useState(false);
  const [qrPreviewMap, setQrPreviewMap] = useState({});
  const [showWelcome, setShowWelcome] = useState(false);

  // Show a one-time "Welcome back" greeting right after login, then auto-dismiss.
  useEffect(() => {
    if (sessionStorage.getItem("justLoggedIn") === "true") {
      sessionStorage.removeItem("justLoggedIn"); // consume → won't show on re-navigation/refresh
      setShowWelcome(true);
      const t = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  const roleStr = (userInfo?.userType || "").toLowerCase().replace(/\s+/g, "");
  const isEditAllowed =
    roleStr &&
    (roleStr.includes("admin") ||
      roleStr.includes("super") ||
      roleStr.includes("technician"));
  const numCols = isEditAllowed ? 5 : 4;

  useEffect(() => {
    dispatch(getEquipments());

    const role = (userInfo?.userType || "").toLowerCase();

    const canFetchUsers =
      role.includes("admin") ||
      role.includes("super") ||
      role.includes("technician");

    if (canFetchUsers) {
      dispatch(getAllUsers());
    }
  }, [dispatch, userInfo?.userType]);

  const userMap = useMemo(() => {
    const map = {};
    (allUsers || []).forEach((user) => {
      map[user.userId] = user;
    });
    return map;
  }, [allUsers]);

  const normalize = (value) => String(value ?? "").trim();

  const loggedUserId = userInfo?.userId || userInfo?.id || userInfo?._id || "";

  const isNormalUser = (userInfo?.userType || "").toLowerCase() === "user";

  const formatCSVDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? String(value)
      : d.toLocaleDateString("en-IN");
  };

  const csvEscape = (value) => {
    const str = String(value ?? "");
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const assignedEquipmentUnits = useMemo(() => {
    const base = Array.isArray(list) ? list : [];

    return base
      .filter((it) => {
        if (!it?.userId) return false;

        if (isNormalUser) {
          return normalize(it.userId) === normalize(loggedUserId);
        }

        if (assignedUserFilter !== "all") {
          return normalize(it.userId) === normalize(assignedUserFilter);
        }

        return true;
      })
      .sort((a, b) => {
        const userCompare = normalize(a.userId).localeCompare(
          normalize(b.userId),
        );
        if (userCompare !== 0) return userCompare;
        return normalize(a.equipmentName).localeCompare(
          normalize(b.equipmentName),
        );
      });
  }, [list, assignedUserFilter, isNormalUser, loggedUserId]);

  const assignedUserOptions = useMemo(() => {
    const ids = new Set();

    (list || []).forEach((it) => {
      if (!it?.userId) return;

      if (isNormalUser && normalize(it.userId) !== normalize(loggedUserId)) {
        return;
      }

      ids.add(normalize(it.userId));
    });

    return Array.from(ids)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((userId) => {
        const user = userMap[userId];
        return {
          userId,
          label: user?.companyName ? `${userId} - ${user.companyName}` : userId,
        };
      });
  }, [list, userMap, isNormalUser, loggedUserId]);

  const groupedEquipmentRows = useMemo(() => {
    const grouped = {};

    assignedEquipmentUnits.forEach((it) => {
      const assignedUser = it.userId;
      const key = `${it.batchNo || it.equipmentId}::${assignedUser}`;

      if (!grouped[key]) {
        grouped[key] = {
          ...it,
          assignedUserId: assignedUser,
          assignedCount: 0,
          units: [],
        };
      }

      grouped[key].assignedCount += 1;
      grouped[key].units.push(it);
    });

    return Object.values(grouped);
  }, [assignedEquipmentUnits]);

  const handleDownloadAssignedCSV = () => {
    if (!assignedEquipmentUnits.length) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "No assigned equipment found for the selected user.",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    const headers = [
      "Equipment ID",
      "Serial Number",
      "Equipment Name",
      "Assigned User ID",
      "Company Name",
      "Location",
      "Batch No",
      "Model/Series",
      "Capacity",
      "Brand",
      "Content",
      "Gross Weight",
      "Installation Date",
      "Expiry Date",
      "Ref Due",
      "HP Tested Date",
      "MFG Month",
      "SP Number",
      "Notes",
    ];

    const rows = assignedEquipmentUnits.map((it) => [
      it.equipmentId,
      it.serialNumber,
      it.equipmentName,
      it.userId,
      it.companyName || userMap[it.userId]?.companyName || "",
      it.location,
      it.batchNo,
      it.modelSeries,
      it.capacity,
      it.brand,
      it.content,
      it.grossWeight,
      formatCSVDate(it.installationDate),
      formatCSVDate(it.expiryDate),
      formatCSVDate(it.refDue),
      formatCSVDate(it.hpTestedDate),
      it.mfgMonth,
      it.spNumber,
      it.notes,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

    const selectedName = isNormalUser
      ? loggedUserId
      : assignedUserFilter === "all"
        ? "all-assigned-users"
        : assignedUserFilter;

    const safeFileName = normalize(selectedName).replace(/[^a-z0-9-_]/gi, "_");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `assigned-equipments-${safeFileName}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getQrTextOnlyEquipmentId = (unit) => {
    return String(unit?.equipmentId || "").trim();
  };

  const getQrRenderWidth = (isSmall) => {
    return isSmall ? 1000 : 1200;
  };

  useEffect(() => {
    let cancelled = false;

    const generateQrPreviews = async () => {
      if (!assignments || assignments.length === 0) {
        setQrPreviewMap({});
        return;
      }

      try {
        const entries = await Promise.all(
          assignments.map(async (unit, idx) => {
            const key = unit._id || unit.equipmentId || idx;
            const qrText = getQrTextOnlyEquipmentId(unit);

            if (!qrText) {
              return [key, ""];
            }

            const qrImage = await QRCode.toDataURL(qrText, {
              errorCorrectionLevel: "H",
              margin: 2,
              width: 600,
            });

            return [key, qrImage];
          }),
        );

        if (!cancelled) {
          setQrPreviewMap(Object.fromEntries(entries));
        }
      } catch (err) {
        console.error("Failed to generate QR previews:", err);

        if (!cancelled) {
          setQrPreviewMap({});
        }
      }
    };

    generateQrPreviews();

    return () => {
      cancelled = true;
    };
  }, [assignments]);

  const truncateText = (value, maxLength = 24) => {
    const text = String(value || "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
  };

  // ✅ SMALL (4cm) LABEL — stacked layout: each field shows a small accent
  // label line with a large value beneath it (full left-column width), so the
  // text is readable. QR stays in the right half. Used by both single print
  // and A4 bulk so they render identically.
  const drawSmallQrLabel = ({
    ctx,
    labelConfig,
    qrImg,
    unit,
    equipment,
    uniqueUnitId,
    unitInstall,
    unitExpiry,
    unitRefDue,
    unitHpTested,
    formatDate,
  }) => {
    const source = equipment || unit;

    const drawWrapped = (text, x, y, maxWidth, lineHeight) => {
      const words = String(text || "").split(" ");
      let line = "";
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY;
    };

    // Vertical divider (left details | right QR)
    ctx.lineWidth = labelConfig.borderWidth;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(labelConfig.verticalDividerX, labelConfig.borderPadding);
    ctx.lineTo(
      labelConfig.verticalDividerX,
      labelConfig.canvasHeight - labelConfig.borderPadding,
    );
    ctx.stroke();

    // Red accent box (top-right, same theme as big label)
    ctx.fillStyle = "#C1272D";
    ctx.fillRect(
      labelConfig.redBoxX,
      labelConfig.redBoxY,
      labelConfig.redBoxW,
      labelConfig.redBoxH,
    );

    // Stacked detail fields (left column)
    ctx.textAlign = "left";
    const valueMaxW =
      labelConfig.verticalDividerX - labelConfig.columnX1 - 48;
    const dividerX2 = labelConfig.verticalDividerX - 48;

    const detailFields = [
      ["TYPE", source.equipmentName || unit.equipmentName || "-"],
      ["CAPACITY", source.capacity || unit.capacity || "-"],
      ["INSTALLED", formatDate(unitInstall)],
      ["EXPIRY", formatDate(unitExpiry)],
      ["HP TESTED", formatDate(unitHpTested)],
      ["DUE ON", formatDate(unitRefDue)],
    ];

    let y = labelConfig.fieldStartY;
    for (const [label, value] of detailFields) {
      // Field accent label
      ctx.fillStyle = labelConfig.labelColor || "#DC6D18";
      ctx.font = `bold ${labelConfig.labelFontSize}px Arial`;
      ctx.fillText(label, labelConfig.columnX1, y);

      // Value beneath
      ctx.fillStyle = "black";
      ctx.font = `bold ${labelConfig.valueFontSize}px Arial`;
      const bottom = drawWrapped(
        String(value || "-"),
        labelConfig.columnX1,
        y + labelConfig.stackValueGap,
        valueMaxW,
        labelConfig.valueLineHeight,
      );

      // Thin divider line under each field+value pair (Option A)
      const sepY = bottom + labelConfig.fieldGap * 0.5;
      ctx.beginPath();
      ctx.strokeStyle = labelConfig.dividerColor || "#D9D9D9";
      ctx.lineWidth = labelConfig.dividerWidth || 2;
      ctx.moveTo(labelConfig.columnX1, sepY);
      ctx.lineTo(dividerX2, sepY);
      ctx.stroke();
      ctx.strokeStyle = "black";

      y = sepY + labelConfig.fieldGap;
    }

    // Serial number — pinned to BOTTOM-LEFT (like the big label)
    const serialLabelY =
      labelConfig.canvasHeight -
      labelConfig.borderPadding -
      labelConfig.serialValueFontSize -
      30;

    ctx.fillStyle = labelConfig.labelColor || "#DC6D18";
    ctx.font = `bold ${labelConfig.serialLabelFontSize}px Arial`;
    ctx.fillText("SERIAL NO", labelConfig.columnX1, serialLabelY);

    ctx.fillStyle = "black";
    ctx.font = `bold ${labelConfig.serialValueFontSize}px Courier New`;
    drawWrapped(
      String(unit.serialNumber || "-"),
      labelConfig.columnX1,
      serialLabelY + labelConfig.stackValueGap,
      valueMaxW,
      labelConfig.valueLineHeight,
    );

    // Large QR (right section)
    ctx.drawImage(
      qrImg,
      labelConfig.qrX,
      labelConfig.qrY,
      labelConfig.qrSize,
      labelConfig.qrSize,
    );

    // Equipment ID below QR — bigger, bolder, pure black
    ctx.font = `bold ${labelConfig.qrTextFont}px Courier New`;
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(
      uniqueUnitId,
      labelConfig.qrX + labelConfig.qrSize / 2,
      labelConfig.qrTextY,
    );
    ctx.textAlign = "left";
  };

  const drawEquipmentQrLabelContent = ({
    ctx,
    labelConfig,
    qrImg,
    unit,
    equipment,
    uniqueUnitId,
    unitInstall,
    unitExpiry,
    unitRefDue,
    unitHpTested,
    formatDate,
  }) => {
    const source = equipment || unit;

    const drawWrappedText = (text, x, y, maxWidth, lineHeight) => {
      const words = String(text || "").split(" ");
      let line = "";
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }

      ctx.fillText(line, x, currentY);
      return currentY;
    };

    if (labelConfig.smallLayout) {
      drawSmallQrLabel({
        ctx,
        labelConfig,
        qrImg,
        unit,
        equipment,
        uniqueUnitId,
        unitInstall,
        unitExpiry,
        unitRefDue,
        unitHpTested,
        formatDate,
      });
      return;
    }

    // ✅ STANDARD 90mm × 50mm LAYOUT

    ctx.lineWidth = labelConfig.borderWidth;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(labelConfig.verticalDividerX, labelConfig.borderPadding);
    ctx.lineTo(
      labelConfig.verticalDividerX,
      labelConfig.canvasHeight - labelConfig.borderPadding,
    );
    ctx.stroke();

    ctx.fillStyle = "#C1272D";
    ctx.fillRect(
      labelConfig.redBoxX,
      labelConfig.redBoxY,
      labelConfig.redBoxW,
      labelConfig.redBoxH,
    );

    let fieldY = labelConfig.fieldStartY;

    const drawDataField = (
      label,
      value,
      columnIndex = 0,
      isMultiline = false,
    ) => {
      const fieldX =
        columnIndex === 0 ? labelConfig.columnX1 : labelConfig.columnX2;

      const dotStart = fieldX + labelConfig.labelWidth;

      const dotEnd =
        columnIndex === 0
          ? labelConfig.verticalDividerX - 20
          : labelConfig.canvasWidth - 35;

      ctx.fillStyle = "black";
      ctx.font = `bold ${labelConfig.fontSize}px Arial`;
      ctx.fillText(label, fieldX, fieldY);
      ctx.fillText(
        ":",
        fieldX + labelConfig.labelWidth - labelConfig.fontSize * 0.3,
        fieldY,
      );

      if (isMultiline) {
        ctx.font = `bold ${labelConfig.fontSize}px Arial`;
        return drawWrappedText(
          value || "",
          dotStart,
          fieldY,
          dotEnd - dotStart,
          labelConfig.dotLineHeight,
        );
      } else {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = labelConfig.dotColor || "black";
        ctx.lineWidth = labelConfig.dotWidth || labelConfig.borderWidth;
        ctx.moveTo(dotStart, fieldY + labelConfig.fontSize * 0.15);
        ctx.lineTo(dotEnd, fieldY + labelConfig.fontSize * 0.15);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "black";
        ctx.lineWidth = labelConfig.borderWidth;

        if (value) {
          ctx.font = `bold ${labelConfig.fontSize}px Arial`;
          ctx.fillText(
            value,
            dotStart + 5,
            fieldY - labelConfig.fontSize * 0.1,
          );
        }
      }
    };

    ctx.fillStyle = "black";
    ctx.font = `bold ${labelConfig.fontSize}px Arial`;

    const typeBottomY = drawDataField(
      "Type",
      source.equipmentName || unit.equipmentName || "",
      0,
      true,
    );
    // Advance below the LAST wrapped line so capacity never overlaps the name.
    fieldY = (typeBottomY || fieldY) + labelConfig.fieldLineSpacing;

    drawDataField("Cap", source.capacity || unit.capacity || "", 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Installed", formatDate(unitInstall), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Exp.", formatDate(unitExpiry), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("HP Test.", formatDate(unitHpTested), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Due On", formatDate(unitRefDue), 0);

    ctx.drawImage(
      qrImg,
      labelConfig.qrX,
      labelConfig.qrY,
      labelConfig.qrSize,
      labelConfig.qrSize,
    );

    ctx.font = `bold ${labelConfig.qrTextFont}px Courier New`;
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText(
      uniqueUnitId,
      labelConfig.qrX + labelConfig.qrSize / 2,
      labelConfig.qrTextY,
    );
    ctx.textAlign = "left";

    ctx.fillStyle = "#DC6D18";
    ctx.font = `bold ${labelConfig.serialLabelFontSize}px Arial`;
    ctx.fillText("SERIAL NO:", labelConfig.columnX1, labelConfig.serialStartY);

    ctx.fillStyle = "black";
    ctx.font = `bold ${labelConfig.serialValueFontSize}px Courier New`;
    ctx.fillText(
      unit.serialNumber || "",
      labelConfig.serialValueX,
      labelConfig.serialStartY,
    );
  };

  const handleShowUnits = async (equipment, assignedUserId = null) => {
    setViewingEquipment(equipment);
    setAssignModalOpen(true);
    setFetchingQRs(true);
    setAssignments([]);

    try {
      const token = userInfo?.token || localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/equipment/${equipment.equipmentId}/qrcodes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        return;
      }

      const data = await res.json();

      if (data.success) {
        // For flat structure, data.equipment is an array where each doc = 1 unit
        const equipmentList = Array.isArray(data.equipment)
          ? data.equipment
          : Array.isArray(data.assignments)
            ? data.assignments
            : [];
        let assignedOnly = equipmentList.filter((u) => u && u.userId);
        if (assignedUserId) {
          assignedOnly = assignedOnly.filter(
            (u) => String(u.userId) === String(assignedUserId),
          );
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
      const unitInstall =
        unit.installationDate ||
        unit.assignedAt ||
        equipment.installationDate ||
        null;
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
            // SMALL LABEL: 4cm × 4cm
            // Same theme as big label, but QR enlarged
            canvasWidth: 600,
            canvasHeight: 600,
            printWidth: "4cm",
            printHeight: "4cm",

            // Border
            borderPadding: 8,
            borderWidth: 2,

            // Same big-label style: left details + right QR
            verticalDividerX: 300,

            // ✅ Stacked readable layout (label line + big value line)
            smallLayout: true,
            columnX1: 15,
            fieldStartY: 50,
            labelColor: "#DC6D18",
            labelFontSize: 13,
            valueFontSize: 26,
            valueLineHeight: 30,
            stackValueGap: 28,
            fieldGap: 12,

            // Divider line between field+value pairs (Option A)
            dividerColor: "#D9D9D9",
            dividerWidth: 1,

            // Bigger QR in right section
            qrSize: 270,
            qrX: 320,
            qrY: 105,
            qrTextY: 410,
            qrTextFont: 30,

            // Red box, same theme as big label
            redBoxX: 525,
            redBoxY: 8,
            redBoxW: 67,
            redBoxH: 35,

            // Serial section, same theme as big label
            serialLabelFontSize: 16,
            serialValueFontSize: 26,
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
            qrTextFont: 64,
            // Red box (original)
            redBoxX: 2120,
            redBoxY: 30,
            redBoxW: 280,
            redBoxH: 140,
            // Serial section
            serialStartY: 1283,
            serialLabelFontSize: 60,
            serialValueFontSize: 68,
            serialValueX: 550,
          };

      const formatDate = (d) => {
        if (!d) return "";
        const dateObj = new Date(d);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        return `${day}.${month}.${year}`;
      };

      const uniqueUnitId = unit.equipmentId;

      const qrPayload = getQrTextOnlyEquipmentId(unit);

      const qrWidth = getQrRenderWidth(isSmallCapacity);

      const generatedQRUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: qrWidth,
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
        labelConfig.canvasWidth - labelConfig.borderPadding * 2,
        labelConfig.canvasHeight - labelConfig.borderPadding * 2,
      );

      const qrImg = new Image();
      qrImg.src = generatedQRUrl;

      await new Promise((resolve) => (qrImg.onload = resolve));

      drawEquipmentQrLabelContent({
        ctx,
        labelConfig,
        qrImg,
        unit,
        equipment,
        uniqueUnitId,
        unitInstall,
        unitExpiry,
        unitRefDue,
        unitHpTested,
        formatDate,
      });

      // ✅ GENERATE AND PRINT - Label Only (iOS/Android/Desktop Compatible)
      const pageSize = `size: ${labelConfig.printWidth} ${labelConfig.printHeight}`;
      const imgSize = `width: ${labelConfig.printWidth}; height: ${labelConfig.printHeight}`;

      // Convert canvas to blob for better performance
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert("Could not generate QR label. Please try again.");
            return;
          }

          const blobUrl = URL.createObjectURL(blob);

          // Create print window with ONLY the label (no fullscreen, no extra content)
          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            alert(
              "Could not open print window. Please enable pop-ups in browser settings.",
            );
            URL.revokeObjectURL(blobUrl);
            return;
          }

          // Minimal HTML - ONLY the label image, centered
          printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              @page {
                ${pageSize}
                margin: 0;
                padding: 0;
              }
              
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #ffffff;
              }
              
              .label-container {
                display: flex;
                justify-content: center;
                align-items: center;
                ${pageSize}
              }
              
              img {
                ${imgSize}
                display: block;
                object-fit: contain;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  min-height: auto;
                  background: white;
                }
                .label-container {
                  page-break-after: avoid;
                  break-inside: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="label-container">
              <img src="${blobUrl}" onload="window.focus(); setTimeout(() => window.print(), 300);" onerror="alert('Failed to load label image'); window.close();" alt="Equipment Label" />
            </div>
          </body>
        </html>
      `);
          printWindow.document.close();

          // Clean up blob URL after printing
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 8000);
        },
        "image/png",
        0.95,
      );
    } catch (err) {
      console.error("Failed to generate QR label:", err);
      alert("Could not generate QR label. Please try again.");
    }
  };

  const getBulkQrLabelConfig = (equipment) => {
    const parseCapacity = (capStr) => {
      if (!capStr) return Infinity;
      const num = parseFloat(String(capStr).match(/[\d.]+/)?.[0] || 0);
      return num;
    };

    const capacityValue = parseCapacity(equipment?.capacity);
    const isSmallCapacity = capacityValue > 0 && capacityValue < 3;

    return isSmallCapacity
      ? {
          // SMALL LABEL: 40mm × 40mm
          // Same theme as big label, but QR enlarged
          type: "small",
          canvasWidth: 600,
          canvasHeight: 600,
          printWidthMm: 40,
          printHeightMm: 40,

          // Border
          borderPadding: 8,
          borderWidth: 2,

          // Same big-label style: left details + right QR
          verticalDividerX: 300,

          // ✅ Stacked readable layout (label line + big value line)
          smallLayout: true,
          columnX1: 15,
          fieldStartY: 50,
          labelColor: "#DC6D18",
          labelFontSize: 13,
          valueFontSize: 26,
          valueLineHeight: 30,
          stackValueGap: 28,
          fieldGap: 12,

          // Divider line between field+value pairs (Option A)
          dividerColor: "#D9D9D9",
          dividerWidth: 1,

          // Bigger QR in right section
          qrSize: 270,
          qrX: 320,
          qrY: 105,
          qrTextY: 410,
          qrTextFont: 30,

          // Red box, same theme as big label
          redBoxX: 525,
          redBoxY: 8,
          redBoxW: 67,
          redBoxH: 35,

          // Serial section, same theme as big label
          serialLabelFontSize: 16,
          serialValueFontSize: 26,
        }
      : {
          type: "standard",
          canvasWidth: 2400,
          canvasHeight: 1333,
          printWidthMm: 90,
          printHeightMm: 50,
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
          qrTextFont: 64,
          redBoxX: 2120,
          redBoxY: 30,
          redBoxW: 280,
          redBoxH: 140,
          serialStartY: 1283,
          serialLabelFontSize: 60,
          serialValueFontSize: 68,
          serialValueX: 550,
        };
  };

  const buildBulkQrLabelCanvas = async (unit) => {
    const equipment = unit;
    const labelConfig = getBulkQrLabelConfig(equipment);

    const isExisting = Boolean(equipment.spNumber);
    const unitInstall = unit.installationDate || unit.assignedAt || null;
    const unitExpiry = unit.expiryDate || null;
    const unitRefDue = unit.refDue || null;
    const unitHpTested = unit.hpTestedDate || null;

    const formatDate = (d) => {
      if (!d) return "";
      const dateObj = new Date(d);
      if (Number.isNaN(dateObj.getTime())) return "";
      const day = String(dateObj.getDate()).padStart(2, "0");
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}.${month}.${year}`;
    };

    const uniqueUnitId = unit.equipmentId;

    const qrPayload = getQrTextOnlyEquipmentId(unit);

    const qrWidth = getQrRenderWidth(labelConfig.type === "small");

    const generatedQRUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: qrWidth,
    });

    const canvas = document.createElement("canvas");
    canvas.width = labelConfig.canvasWidth;
    canvas.height = labelConfig.canvasHeight;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, labelConfig.canvasWidth, labelConfig.canvasHeight);

    ctx.lineWidth = labelConfig.borderWidth;
    ctx.strokeStyle = "black";
    ctx.strokeRect(
      labelConfig.borderPadding,
      labelConfig.borderPadding,
      labelConfig.canvasWidth - labelConfig.borderPadding * 2,
      labelConfig.canvasHeight - labelConfig.borderPadding * 2,
    );

    const qrImg = new Image();
    qrImg.src = generatedQRUrl;

    await new Promise((resolve, reject) => {
      qrImg.onload = resolve;
      qrImg.onerror = reject;
    });

    if (labelConfig.smallLayout) {
      drawSmallQrLabel({
        ctx,
        labelConfig,
        qrImg,
        unit,
        equipment,
        uniqueUnitId,
        unitInstall,
        unitExpiry,
        unitRefDue,
        unitHpTested,
        formatDate,
      });
    } else {
    ctx.lineWidth = labelConfig.borderWidth;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(labelConfig.verticalDividerX, labelConfig.borderPadding);
    ctx.lineTo(
      labelConfig.verticalDividerX,
      labelConfig.canvasHeight - labelConfig.borderPadding,
    );
    ctx.stroke();

    ctx.fillStyle = "#C1272D";
    ctx.fillRect(
      labelConfig.redBoxX,
      labelConfig.redBoxY,
      labelConfig.redBoxW,
      labelConfig.redBoxH,
    );

    const drawWrappedText = (text, x, y, maxWidth, lineHeight) => {
      const words = String(text || "").split(" ");
      let line = "";
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }

      ctx.fillText(line, x, currentY);
      return currentY;
    };

    let fieldY = labelConfig.fieldStartY;

    const drawDataField = (
      label,
      value,
      columnIndex = 0,
      isMultiline = false,
    ) => {
      const fieldX =
        columnIndex === 0 ? labelConfig.columnX1 : labelConfig.columnX2;

      const dotStart = fieldX + labelConfig.labelWidth;

      const dotEnd =
        columnIndex === 0
          ? labelConfig.verticalDividerX - 20
          : labelConfig.canvasWidth - 35;

      ctx.fillStyle = "black";
      ctx.font = `bold ${labelConfig.fontSize}px Arial`;
      ctx.fillText(label, fieldX, fieldY);
      ctx.fillText(
        ":",
        fieldX + labelConfig.labelWidth - labelConfig.fontSize * 0.3,
        fieldY,
      );

      if (isMultiline) {
        ctx.font = `bold ${labelConfig.fontSize}px Arial`;
        return drawWrappedText(
          value || "",
          dotStart,
          fieldY,
          dotEnd - dotStart,
          labelConfig.dotLineHeight,
        );
      } else {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = labelConfig.dotColor || "black";
        ctx.lineWidth = labelConfig.dotWidth || labelConfig.borderWidth;
        ctx.moveTo(dotStart, fieldY + labelConfig.fontSize * 0.15);
        ctx.lineTo(dotEnd, fieldY + labelConfig.fontSize * 0.15);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "black";
        ctx.lineWidth = labelConfig.borderWidth;

        if (value) {
          ctx.font = `bold ${labelConfig.fontSize}px Arial`;
          ctx.fillText(
            value,
            dotStart + 5,
            fieldY - labelConfig.fontSize * 0.1,
          );
        }
      }
    };

    const typeBottomY = drawDataField(
      "Type",
      equipment.equipmentName || "",
      0,
      true,
    );
    // Advance below the LAST wrapped line so capacity never overlaps the name.
    fieldY = (typeBottomY || fieldY) + labelConfig.fieldLineSpacing;

    drawDataField("Cap", equipment.capacity || "", 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Installed", formatDate(unitInstall), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Exp.", formatDate(unitExpiry), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("HP Test.", formatDate(unitHpTested), 0);
    fieldY += labelConfig.fieldLineSpacing;

    drawDataField("Due On", formatDate(unitRefDue), 0);

    ctx.drawImage(
      qrImg,
      labelConfig.qrX,
      labelConfig.qrY,
      labelConfig.qrSize,
      labelConfig.qrSize,
    );

    ctx.font = `bold ${labelConfig.qrTextFont}px Courier New`;
    ctx.fillStyle = "#666";
    ctx.textAlign = "center";
    ctx.fillText(
      uniqueUnitId,
      labelConfig.qrX + labelConfig.qrSize / 2,
      labelConfig.qrTextY,
    );
    ctx.textAlign = "left";

    ctx.fillStyle = "#DC6D18";
    ctx.font = `bold ${labelConfig.serialLabelFontSize}px Arial`;
    ctx.fillText("SERIAL NO:", labelConfig.columnX1, labelConfig.serialStartY);

    ctx.fillStyle = "black";
    ctx.font = `bold ${labelConfig.serialValueFontSize}px Courier New`;
    ctx.fillText(
      unit.serialNumber || "",
      labelConfig.serialValueX,
      labelConfig.serialStartY,
    );
    }

    return {
      imageData: canvas.toDataURL("image/png", 0.95),
      labelType: labelConfig.type,
      widthMm: labelConfig.printWidthMm,
      heightMm: labelConfig.printHeightMm,
    };
  };

  const buildA4PrintPagesHtml = ({ labels, labelType }) => {
    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 5;

    const isSmall = labelType === "small";

    const labelWidth = isSmall ? 40 : 90;
    const labelHeight = isSmall ? 40 : 50;

    const columns = isSmall ? 7 : 3;
    const rows = isSmall ? 5 : 4;

    const labelsPerPage = columns * rows;

    const usableWidth = pageWidth - margin * 2;
    const usableHeight = pageHeight - margin * 2;

    const gapX =
      columns > 1 ? (usableWidth - columns * labelWidth) / (columns - 1) : 0;

    const gapY =
      rows > 1 ? (usableHeight - rows * labelHeight) / (rows - 1) : 0;

    let html = "";

    labels.forEach((label, index) => {
      const pageIndex = index % labelsPerPage;

      if (pageIndex === 0) {
        html += `<div class="a4-sheet">`;
      }

      const row = Math.floor(pageIndex / columns);
      const col = pageIndex % columns;

      const x = margin + col * (labelWidth + gapX);
      const y = margin + row * (labelHeight + gapY);

      html += `
      <img
        class="qr-label"
        src="${label.imageData}"
        style="
          left:${x}mm;
          top:${y}mm;
          width:${labelWidth}mm;
          height:${labelHeight}mm;
        "
      />
    `;

      const isLastOnPage = pageIndex === labelsPerPage - 1;
      const isLastLabel = index === labels.length - 1;

      if (isLastOnPage || isLastLabel) {
        html += `</div>`;
      }
    });

    return html;
  };

  const handlePrintA4QrLabels = async () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      Swal.fire({
        icon: "error",
        title: "Pop-up blocked",
        text: "Please allow pop-ups to print QR labels.",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    try {
      if (!assignedEquipmentUnits.length) {
        printWindow.close();

        Swal.fire({
          icon: "info",
          title: "No assigned equipment",
          text: "No assigned equipment found for the selected user.",
          confirmButtonColor: "#DC6D18",
        });
        return;
      }

      setQrPdfLoading(true);

      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preparing QR Labels...</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              color: #333;
            }
          </style>
        </head>
        <body>
          <h3>Preparing QR labels for printing...</h3>
        </body>
      </html>
    `);

      printWindow.document.close();

      const standardUnits = assignedEquipmentUnits.filter(
        (unit) => getBulkQrLabelConfig(unit).type === "standard",
      );

      const smallUnits = assignedEquipmentUnits.filter(
        (unit) => getBulkQrLabelConfig(unit).type === "small",
      );

      const standardLabels = [];
      const smallLabels = [];

      for (const unit of standardUnits) {
        const label = await buildBulkQrLabelCanvas(unit);
        standardLabels.push(label);
      }

      for (const unit of smallUnits) {
        const label = await buildBulkQrLabelCanvas(unit);
        smallLabels.push(label);
      }

      const standardPagesHtml = buildA4PrintPagesHtml({
        labels: standardLabels,
        labelType: "standard",
      });

      const smallPagesHtml = buildA4PrintPagesHtml({
        labels: smallLabels,
        labelType: "small",
      });

      const selectedName = isNormalUser
        ? loggedUserId
        : assignedUserFilter === "all"
          ? "All Assigned Users"
          : assignedUserFilter;

      printWindow.document.open();

      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Labels - ${selectedName}</title>
          <meta charset="UTF-8" />
          <style>
            * {
              box-sizing: border-box;
            }

            @page {
              size: A4 landscape;
              margin: 0;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, sans-serif;
            }

            .screen-note {
              padding: 14px;
              background: #fff7ed;
              border-bottom: 1px solid #fed7aa;
              font-size: 13px;
              color: #9a3412;
            }

            .a4-sheet {
              position: relative;
              width: 297mm;
              height: 210mm;
              page-break-after: always;
              break-after: page;
              background: white;
              overflow: hidden;
            }

            .a4-sheet:last-child {
              page-break-after: auto;
              break-after: auto;
            }

            .qr-label {
              position: absolute;
              display: block;
              object-fit: contain;
            }

            @media print {
              .screen-note {
                display: none;
              }

              html,
              body {
                width: 297mm;
                margin: 0;
                padding: 0;
              }

              .a4-sheet {
                margin: 0;
                box-shadow: none;
              }
            }

            @media screen {
              body {
                background: #e5e7eb;
              }

              .a4-sheet {
                margin: 16px auto;
                box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
              }
            }
          </style>
        </head>

        <body>
          <div class="screen-note">
            Print settings: choose A4, Landscape, Scale 100% / Actual Size. Do not use "Fit to page".
          </div>

          ${standardPagesHtml}
          ${smallPagesHtml}

          <script>
            const triggerPrint = () => {
              window.focus();
              setTimeout(() => {
                window.print();
              }, 500);
            };

            const imgs = Array.from(document.images);

            if (!imgs.length) {
              triggerPrint();
            } else {
              let loaded = 0;

              const done = () => {
                loaded += 1;
                if (loaded >= imgs.length) {
                  triggerPrint();
                }
              };

              imgs.forEach((img) => {
                if (img.complete) {
                  done();
                } else {
                  img.onload = done;
                  img.onerror = done;
                }
              });
            }
          </script>
        </body>
      </html>
    `);

      printWindow.document.close();
    } catch (err) {
      console.error("Failed to prepare QR print labels:", err);

      printWindow.document.open();
      printWindow.document.write(`
      <html>
        <body style="font-family: Arial; padding: 24px;">
          <h3>Failed to prepare QR labels</h3>
          <p>${err.message || "Could not generate QR print labels."}</p>
        </body>
      </html>
    `);
      printWindow.document.close();

      Swal.fire({
        icon: "error",
        title: "Print preparation failed",
        text: err.message || "Could not generate QR print labels.",
        confirmButtonColor: "#DC6D18",
      });
    } finally {
      setQrPdfLoading(false);
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
      if (
        formData.units &&
        Array.isArray(formData.units) &&
        formData.units.length > 0
      ) {
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
                  `Duplicate Serial: "${unit.serialNumber}" already used by equipment ${errData.existingEquipmentId} (${errData.existingEquipmentName}). Change the serial number or contact admin.`,
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

        await dispatch(
          updateEquipment({ id, updates: updatePayload }),
        ).unwrap();
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
      {showWelcome && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#F5D2B6] bg-[#FFF7ED] px-4 py-3 text-[#B85B14] shadow-sm transition-opacity duration-500">
          <span className="text-lg">👋</span>
          <span className="font-semibold">
            Welcome back,{" "}
            {userInfo?.firstName ||
              userInfo?.userId ||
              userInfo?.email ||
              "there"}
            !
          </span>
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Equipment & Inventory List
      </h2>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex flex-col gap-1 w-full md:w-96">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Filter by User
            </label>

            <select
              value={isNormalUser ? loggedUserId : assignedUserFilter}
              onChange={(e) => setAssignedUserFilter(e.target.value)}
              disabled={isNormalUser}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            >
              {!isNormalUser && <option value="all">All Assigned Users</option>}

              {assignedUserOptions.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.label}
                </option>
              ))}
            </select>

            <p className="text-xs text-gray-500">
              {assignedEquipmentUnits.length} assigned unit(s) found
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDownloadAssignedCSV}
                disabled={!assignedEquipmentUnits.length}
                className="px-4 py-2 bg-[#DC6D18] hover:bg-[#B85B14] text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download CSV
              </button>

              <button
                onClick={handlePrintA4QrLabels}
                disabled={!assignedEquipmentUnits.length || qrPdfLoading}
                className="px-4 py-2 bg-gray-800 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {qrPdfLoading ? "Preparing Print..." : "Print A4 QR Labels"}
              </button>
            </div>

            {/* <button
              onClick={handleDownloadA4QrPdf}
              disabled={!assignedEquipmentUnits.length || qrPdfLoading}
              className="px-4 py-2 bg-gray-800 hover:bg-black text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {qrPdfLoading ? "Generating PDF..." : "Download A4 QR PDF"}
            </button> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && (
            <div className="p-8 text-center text-gray-500 animate-pulse">
              Loading inventory data...
            </div>
          )}

          {!loading && !error && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Installed
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  {isEditAllowed && (
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Edit
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {groupedEquipmentRows.length > 0 ? (
                  groupedEquipmentRows.map((item) => (
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
                    <td
                      colSpan={numCols}
                      className="text-center py-10 text-gray-400"
                    >
                      No assigned equipment found
                    </td>
                  </tr>
                )}
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
                <h3 className="text-2xl font-bold text-gray-800">
                  {viewingEquipment?.equipmentName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Batch:{" "}
                  <span className="font-mono text-gray-700">
                    {viewingEquipment?.batchNo}
                  </span>{" "}
                  | Assigned Units:{" "}
                  <span className="font-bold text-[#DC6D18]">
                    {assignments.length}
                  </span>
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
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                    >
                      <div className="p-3 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Unit #{idx + 1}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${unit.userId ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                        >
                          {unit.userId ? "Assigned" : "In Stock"}
                          <p className="font-mono text-xs font-bold text-[#DC6D18]">
                            {unit.equipmentId}
                          </p>
                        </span>
                      </div>

                      <div className="p-4 flex flex-col items-center bg-white flex-1 relative">
                        {unit.userId && (
                          <div className="w-full mb-3 text-center space-y-1 bg-orange-50 p-2 rounded-lg border border-orange-100">
                            <p className="text-xs text-gray-500 uppercase font-semibold">
                              Assigned To
                            </p>
                            <p
                              className="text-sm font-bold text-gray-800 truncate"
                              title={unit.userId}
                            >
                              {unit.userId}
                            </p>
                            {unit.companyName && (
                              <p className="text-xs text-gray-600 truncate font-medium border-t border-orange-200 pt-1 mt-1">
                                {unit.companyName}
                              </p>
                            )}
                            {unit.location && (
                              <p className="text-[10px] text-gray-500 truncate">
                                📍 {unit.location}
                              </p>
                            )}
                          </div>
                        )}

                        {qrPreviewMap[unit._id || unit.equipmentId || idx] ? (
                          <img
                            src={
                              qrPreviewMap[unit._id || unit.equipmentId || idx]
                            }
                            alt="Generated Equipment QR"
                            className="w-32 h-32 object-contain mb-3"
                          />
                        ) : unit.equipmentId ? (
                          <div className="w-32 h-32 flex items-center justify-center bg-gray-50 text-gray-400 text-xs mb-3">
                            Generating QR...
                          </div>
                        ) : (
                          <div className="w-32 h-32 flex items-center justify-center bg-gray-50 text-gray-300 text-xs mb-3">
                            No Equipment ID
                          </div>
                        )}

                        <div className="w-full text-center">
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                            Serial
                          </p>
                          <p
                            className="font-mono text-xs font-bold text-gray-700 truncate"
                            title={unit.serialNumber}
                          >
                            {unit.serialNumber}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 border-t border-gray-100">
                        <button
                          onClick={() =>
                            handlePrintUnitQR(unit, viewingEquipment)
                          }
                          disabled={!unit.equipmentId}
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

