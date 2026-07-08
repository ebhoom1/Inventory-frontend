// InstallationReport.jsx
// Installation Report page — scan an equipment QR code to prefill equipment
// details, capture the place of installation, then submit. Also lists submitted
// installation reports (with a user filter for super admin / admin / technician)
// and supports CSV export matching the equipment-list columns.
import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import { API_URL } from "../../../utils/apiConfig";

const qrConfig = {
  fps: 20,
  qrbox: (viewfinderWidth, viewfinderHeight) => {
    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
    const boxSize = Math.floor(minEdge * 0.7);
    return { width: boxSize, height: boxSize };
  },
  aspectRatio: 1.0,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: false, // iOS compatibility
  },
  disableFlip: false,
};

const isMongoId = (s) => typeof s === "string" && /^[a-f0-9]{24}$/i.test(s);

// --- IST date helpers ---
const IST_TZ = "Asia/Kolkata";

function formatISTDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  return d.toLocaleString("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// --- CSV helpers (mirror EquipmentList export) ---
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

// Columns = equipment-list CSV columns + "Place of Installation"
const CSV_COLUMNS = [
  ["Equipment ID", (r) => r.equipmentId],
  ["Serial Number", (r) => r.serialNumber],
  ["Equipment Name", (r) => r.equipmentName],
  ["Assigned User ID", (r) => r.userId],
  ["Company Name", (r) => r.companyName],
  ["Place of Installation", (r) => r.placeOfInstallation],
  ["Location", (r) => r.location],
  ["Floor / Building", (r) => r.floor],
  ["Batch No", (r) => r.batchNo],
  ["Model/Series", (r) => r.modelSeries],
  ["Capacity", (r) => r.capacity],
  ["Brand", (r) => r.brand],
  ["Content", (r) => r.content],
  ["Gross Weight", (r) => r.grossWeight],
  ["Installation Date", (r) => formatCSVDate(r.installationDate)],
  ["Expiry Date", (r) => formatCSVDate(r.expiryDate)],
  ["Ref Due", (r) => formatCSVDate(r.refDue)],
  ["HP Tested Date", (r) => formatCSVDate(r.hpTestedDate)],
  ["MFG Month", (r) => r.mfgMonth],
  ["SP Number", (r) => r.spNumber],
  ["Notes", (r) => r.notes],
];

// Fields shown in the "View report" modal
const VIEW_FIELDS = [
  ["Equipment ID", "equipmentId"],
  ["Serial Number", "serialNumber"],
  ["Equipment Name", "equipmentName"],
  ["Assigned User ID", "userId"],
  ["Company Name", "companyName"],
  ["Place of Installation", "placeOfInstallation"],
  ["Location", "location"],
  ["Floor / Building", "floor"],
  ["Batch No", "batchNo"],
  ["Model/Series", "modelSeries"],
  ["Capacity", "capacity"],
  ["Brand", "brand"],
  ["Content", "content"],
  ["Gross Weight", "grossWeight"],
  ["Installation Date", "installationDate"],
  ["Expiry Date", "expiryDate"],
  ["Ref Due", "refDue"],
  ["HP Tested Date", "hpTestedDate"],
  ["MFG Month", "mfgMonth"],
  ["SP Number", "spNumber"],
  ["Notes", "notes"],
];

const DATE_FIELDS = new Set([
  "installationDate",
  "expiryDate",
  "refDue",
  "hpTestedDate",
]);

// Request camera permission explicitly (iOS requirement)
const requestCameraPermission = async () => {
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const permission = await navigator.permissions.query({ name: "camera" });
      if (permission.state === "denied") return false;
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    console.error("Camera permission error:", err);
    return false;
  }
};

const EMPTY_FORM = {
  equipmentId: "",
  serialNumber: "",
  equipmentName: "",
  userId: "",
  companyName: "",
  placeOfInstallation: "",
  location: "",
  floor: "",
  batchNo: "",
  modelSeries: "",
  capacity: "",
  brand: "",
  content: "",
  grossWeight: "",
  spNumber: "",
  mfgMonth: "",
  notes: "",
  installationDate: "",
  expiryDate: "",
  refDue: "",
  hpTestedDate: "",
  syncEquipmentMaster: true,
};

function InstallationReport() {
  // ----- Role detection (mirror RequestService) -----
  const roleFromUser = useSelector(
    (s) =>
      s.user?.userData?.validUserOne?.adminType ||
      s.user?.userData?.role ||
      s.user?.userData?.userType,
  );
  const roleFromUsers = useSelector((s) => s.users?.userInfo?.userType);
  const userRoleRaw = roleFromUser || roleFromUsers || "user";

  const role = String(userRoleRaw).toLowerCase().replace(/\s+/g, "");
  const isAdmin = ["admin", "superadmin", "megaadmin"].includes(role);
  const isSuperAdmin = role === "superadmin";
  const isTechnician = role === "technician";
  const isUser = role === "user";

  const canCreateReport = isAdmin || isTechnician;

  const currentUserId = useSelector(
    (s) =>
      s.users?.userInfo?.userId ||
      s.user?.userData?.userId ||
      s.user?.userData?.validUserOne?.userId ||
      "me",
  );

  const r1 = useSelector((s) => s.users?.token);
  const r2 = useSelector((s) => s.users?.userInfo?.token);
  const r3 = useSelector((s) => s.user?.token);
  const token =
    r1 ||
    r2 ||
    r3 ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    "";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  // ----- List / filter state -----
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reports, setReports] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const canFilter = isSuperAdmin || isAdmin || isTechnician;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ----- Load user list for the filter dropdown -----
  useEffect(() => {
    if (!canFilter) return;
    let abort = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/reports/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!abort && res.ok && data?.success !== false) {
          setUserList(data.users || []);
        }
      } catch {
        // non-fatal
      }
    })();
    return () => {
      abort = true;
    };
  }, [canFilter, token]);

  // ----- Fetch latest installation reports for a user or all users -----
  const fetchReports = async (uid) => {
    setListLoading(true);
    setListError("");

    try {
      let qs = "";

      if (isUser) {
        qs = currentUserId
          ? `?userId=${encodeURIComponent(currentUserId)}`
          : "";
      } else if (uid === "all") {
        qs = "?all=true";
      } else if (uid) {
        qs = `?userId=${encodeURIComponent(uid)}`;
      } else {
        setReports([]);
        setListLoading(false);
        return;
      }

      const res = await fetch(
        `${API_URL}/api/installation-reports/latest${qs}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to load installation reports");
      }

      const items = Array.isArray(data) ? data : data.items || [];
      setReports(items);
    } catch (err) {
      console.error("Latest installation reports fetch failed:", err);
      setListError("Failed to load installation reports");
      setReports([]);
    } finally {
      setListLoading(false);
    }
  };

  // Normal user: load their own reports on mount
  useEffect(() => {
    if (isUser && currentUserId) {
      fetchReports(currentUserId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUser, currentUserId]);

  // ----- QR scanner + prefill -----
  useEffect(() => {
    if (!isScannerVisible) return;

    if (!document.getElementById("qr-scan-styles")) {
      const style = document.createElement("style");
      style.id = "qr-scan-styles";
      style.innerHTML = `
        @keyframes scanLineMove { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 15px #DC6D18, inset 0 0 15px rgba(220,109,24,.3); } 50% { box-shadow: 0 0 30px #DC6D18, inset 0 0 25px rgba(220,109,24,.5); } }
        @keyframes corner-pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
        .qr-scan-line { animation: scanLineMove 2s linear infinite; }
        .qr-focus-box { animation: pulse-glow 2s ease-in-out infinite; }
        .qr-corner { animation: corner-pulse 1.5s ease-in-out infinite; }
        #qr-reader video { border-radius: 8px; }
      `;
      document.head.appendChild(style);
    }

    const scanner = new Html5Qrcode("qr-reader");

    const onSuccess = async (decodedText) => {
      const raw = (decodedText || "").trim();
      const looksJson = raw.startsWith("{") && raw.endsWith("}");
      let scanned = looksJson ? JSON.parse(raw) : { equipmentId: raw };

      const mappedData = {
        equipmentId: scanned.eid || scanned.equipmentId || "",
        userId: scanned.uid || scanned.userId || "",
        location: scanned.loc || scanned.location || "",
        serial: scanned.sn || scanned.serialNumber || "",
      };

      // Fast prefill from QR
      setFormData((prev) => ({
        ...prev,
        equipmentId: mappedData.equipmentId || prev.equipmentId,
        userId: mappedData.userId || prev.userId,
        location: mappedData.location || prev.location,
        serialNumber: mappedData.serial || prev.serialNumber,
      }));

      const maybeId =
        mappedData.equipmentId || scanned._id || (!looksJson ? raw : "") || "";

      if (!maybeId) {
        Swal.fire({
          title: "Invalid QR",
          text: "QR does not contain equipment id",
          icon: "error",
        });
        setScannerVisible(false);
        return;
      }

      const url = isMongoId(maybeId)
        ? `${API_URL}/api/equipment/${encodeURIComponent(maybeId)}`
        : `${API_URL}/api/equipment/by-eid/${encodeURIComponent(maybeId)}`;

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let data = await res.json();

        if (!res.ok || data?.success === false || !data) {
          const serial = mappedData.serial || (!looksJson ? raw : "");
          if (serial) {
            const serialRes = await fetch(
              `${API_URL}/api/equipment/by-serial/${encodeURIComponent(serial)}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            const serialData = await serialRes.json();
            if (
              serialRes.ok &&
              serialData?.success !== false &&
              serialData.equipment
            ) {
              data = serialData;
            } else {
              Swal.fire({
                title: "Not Found",
                text: "Equipment not found",
                icon: "error",
              });
              setScannerVisible(false);
              return;
            }
          } else {
            Swal.fire({
              title: "Not Found",
              text: "Equipment not found",
              icon: "error",
            });
            setScannerVisible(false);
            return;
          }
        }

        const eq = data.equipment || data;

        let preferredAssignment = null;
        if (
          Array.isArray(data.matchedAssignments) &&
          data.matchedAssignments.length > 0
        ) {
          preferredAssignment = data.matchedAssignments[0];
        }

        // Prefill all equipment fields from the authoritative record
        setFormData((prev) => ({
          ...prev,
          equipmentId: eq.equipmentId || prev.equipmentId,
          serialNumber:
            mappedData.serial ||
            preferredAssignment?.serialNumber ||
            eq.serialNumber ||
            prev.serialNumber,
          equipmentName: eq.equipmentName || prev.equipmentName,
          userId:
            preferredAssignment?.userId ||
            eq.userId ||
            mappedData.userId ||
            prev.userId,
          companyName: eq.companyName || prev.companyName,
          location:
            preferredAssignment?.location || eq.location || prev.location,
          floor: preferredAssignment?.floor || eq.floor || prev.floor,
          placeOfInstallation:
            preferredAssignment?.placeOfInstallation ||
            eq.placeOfInstallation ||
            prev.placeOfInstallation,
          batchNo: eq.batchNo || prev.batchNo,
          modelSeries: eq.modelSeries || prev.modelSeries,
          capacity: eq.capacity || prev.capacity,
          brand: eq.brand || prev.brand,
          content: eq.content || prev.content,
          grossWeight: eq.grossWeight || prev.grossWeight,
          spNumber: eq.spNumber || prev.spNumber,
          mfgMonth: eq.mfgMonth || prev.mfgMonth,
          notes: eq.notes || prev.notes,
          installationDate: eq.installationDate
            ? String(eq.installationDate).slice(0, 10)
            : prev.installationDate,
          expiryDate: eq.expiryDate
            ? String(eq.expiryDate).slice(0, 10)
            : prev.expiryDate,
          refDue: eq.refDue ? String(eq.refDue).slice(0, 10) : prev.refDue,
          hpTestedDate: eq.hpTestedDate
            ? String(eq.hpTestedDate).slice(0, 10)
            : prev.hpTestedDate,
        }));

        Swal.fire({
          title: "Scanned!",
          text: eq.equipmentName || eq.equipmentId || "QR read",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("QR fetch error:", err);
        Swal.fire({
          title: "Error",
          text: "Could not fetch equipment info",
          icon: "error",
        });
      }

      setScannerVisible(false);
    };

    scanner
      .start({ facingMode: cameraFacing }, qrConfig, onSuccess)
      .catch((err) => {
        console.error("Scanner start error:", err);
        let errorMessage = "Could not start camera. Please check permissions.";
        if (
          err.message?.includes("NotAllowedError") ||
          err.message?.includes("Permission denied")
        ) {
          errorMessage =
            "Camera permission denied. Please allow camera access in settings.";
        } else if (
          err.message?.includes("NotFoundError") ||
          err.message?.includes("no camera")
        ) {
          errorMessage = "No camera found on this device.";
        } else if (err.message?.includes("NotSupportedError")) {
          errorMessage =
            "HTTPS connection required for camera access on this device.";
        }
        Swal.fire({ title: "Camera Error", text: errorMessage, icon: "error" });
        setScannerVisible(false);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [isScannerVisible, cameraFacing, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
     if (!canCreateReport) return;
    if (!formData.equipmentId) {
      Swal.fire({
        title: "Scan Required",
        text: "Please scan an equipment QR code first.",
        icon: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        installationDate:
          formData.installationDate || new Date().toISOString().slice(0, 10),
      };

      const res = await fetch(`${API_URL}/api/installation-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      Swal.fire({
        title: "Submitted",
        text: "Installation report saved successfully.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });

      setFormData(EMPTY_FORM);

      // Refresh the list if it's showing this user
      if (isUser) {
        fetchReports(currentUserId);
      } else if (selectedUserId) {
        fetchReports(selectedUserId);
      }
    } catch (err) {
      console.error("Installation report submit failed:", err);
      Swal.fire({
        title: "Failed",
        text: "Could not save installation report.",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!reports.length) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "No installation reports to export.",
        confirmButtonColor: "#DC6D18",
      });
      return;
    }

    const headers = CSV_COLUMNS.map(([label]) => label);
    const rows = reports.map((r) => CSV_COLUMNS.map(([, get]) => get(r)));

    const csvContent = [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

    const who = isUser
      ? currentUserId
      : selectedUserId && selectedUserId !== "all"
        ? selectedUserId
        : "all-users";
    const safe = String(who).replace(/[^a-z0-9-_]/gi, "_");
    const ymd = new Date().toISOString().slice(0, 10);

    const blob = new Blob(["﻿" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `installation_reports_${safe}_${ymd}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  };

  const inputClass =
    "w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg " +
    "bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]";

  // Read-only prefilled fields (come straight from the equipment record)
  const READONLY_FIELDS = [
    ["equipmentName", "Equipment Name"],
    ["serialNumber", "Serial Number"],
    ["userId", "User ID"],
    ["companyName", "Company Name"],
    ["batchNo", "Batch No"],
    ["modelSeries", "Model / Series"],
    ["capacity", "Capacity"],
    ["brand", "Brand"],
    ["content", "Content"],
    ["grossWeight", "Gross Weight"],
    ["mfgMonth", "MFG Month"],
    ["spNumber", "SP Number"],
  ];

  // Editable fields
  const EDITABLE_FIELDS = [
    ["placeOfInstallation", "Place of Installation"],
    ["location", "Location"],
    ["floor", "Floor / Building"],
  ];

  const DATE_INPUTS = [
    ["installationDate", "Installation Date"],
    ["expiryDate", "Expiry Date"],
    ["refDue", "Ref Due"],
    ["hpTestedDate", "HP Tested Date"],
  ];

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        <main className="p-4 sm:p-6 md:p-8 flex-1 rounded-tl-[50px] bg-gradient-to-br from-[#FFF] to-[#FFF7ED]">
          <div className="w-full max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
              Installation Report
            </h2>

            {/* ===== View Installation Reports (with download) — above scanner ===== */}
            <div className="mb-10">
              <h3 className="text-xl md:text-2xl font-bold text-[#DC6D18] mb-4">
                View Installation Reports
              </h3>

              {/* Filter + download row */}
              <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white flex flex-col sm:flex-row gap-3 sm:items-center">
                {canFilter && (
                  <select
                    className={inputClass}
                    value={selectedUserId}
                    onChange={(e) => {
                      const uid = e.target.value;
                      setSelectedUserId(uid);
                      fetchReports(uid);
                    }}
                  >
                    <option value="">— Select a user —</option>
                    <option value="all">All users</option>
                    {userList.map((u) => (
                      <option key={u.userId} value={u.userId}>
                        {u.name || u.userId}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="bg-[#DC6D18] text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-[#c55e12] transition whitespace-nowrap"
                >
                  Download CSV
                </button>
              </div>

              {/* Results */}
              {listLoading && (
                <div className="text-sm text-gray-600">Loading…</div>
              )}
              {listError && (
                <div className="text-sm text-red-600">{listError}</div>
              )}

              {!listLoading &&
                !listError &&
                (canFilter ? selectedUserId : true) && (
                  <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Equipment
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Place of Installation
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            User ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {reports.length === 0 ? (
                          <tr>
                            <td
                              className="px-4 py-4 text-sm text-gray-600"
                              colSpan={5}
                            >
                              No installation reports found.
                            </td>
                          </tr>
                        ) : (
                          reports.map((rep) => (
                            <tr key={rep._id}>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {formatISTDateTime(
                                  rep.createdAt || rep.installationDate,
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {rep.equipmentName || rep.equipmentId || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {rep.placeOfInstallation || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {rep.userId || "-"}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReport(rep)}
                                  className="px-3 py-1 rounded-md bg-[#DC6D18] text-white hover:bg-[#B85B14]"
                                >
                                  View Report
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
{canCreateReport && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Equipment ID + QR Scanner */}
              <div className="flex items-end gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="flex-1">
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">
                    Equipment ID
                  </label>
                  <input
                    type="text"
                    name="equipmentId"
                    readOnly
                    placeholder="Prefilled after scan"
                    value={formData.equipmentId}
                    className={inputClass}
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!isScannerVisible) {
                        const hasPermission = await requestCameraPermission();
                        if (!hasPermission) {
                          Swal.fire({
                            title: "Permission Required",
                            text: "Please allow camera access in your device settings to use QR scanner.",
                            icon: "warning",
                          });
                          return;
                        }
                      }
                      setScannerVisible(!isScannerVisible);
                    }}
                    className={`h-[52px] px-6 rounded-lg font-semibold shadow-md whitespace-nowrap
                      ${
                        isScannerVisible
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
                      }`}
                  >
                    {isScannerVisible ? "Close Scanner" : "Scan QR Code"}
                  </button>

                  {isScannerVisible && (
                    <button
                      type="button"
                      onClick={() =>
                        setCameraFacing((p) =>
                          p === "user" ? "environment" : "user",
                        )
                      }
                      className="h-[52px] px-4 rounded-lg font-semibold shadow-md bg-white border border-gray-200 hover:bg-gray-50"
                      title="Flip camera"
                    >
                      {cameraFacing === "user" ? "Front" : "Back"}
                    </button>
                  )}
                </div>
              </div>

              {isScannerVisible && (
                <div className="relative mb-6 rounded-xl overflow-hidden border-4 border-[#DC6D18] shadow-2xl bg-black qr-focus-box">
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-[#DC6D18]/50 backdrop-blur">
                    <div className="w-2 h-2 bg-[#DC6D18] rounded-full animate-pulse"></div>
                    <span className="text-xs text-[#DC6D18] font-semibold">
                      SCANNING
                    </span>
                  </div>

                  <div id="qr-reader" className="w-full"></div>

                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-[280px] h-[280px] border-2 border-[#DC6D18]/40 qr-focus-box">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#DC6D18] qr-corner"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#DC6D18] qr-corner"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#DC6D18] qr-corner"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#DC6D18] qr-corner"></div>
                      <div className="w-full h-1 bg-gradient-to-b from-[#DC6D18] to-transparent absolute top-0 qr-scan-line shadow-[0_0_15px_#DC6D18]"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-0 right-0 text-center z-10">
                    <p className="text-xs text-[#DC6D18] font-semibold px-3">
                      📱 Position QR Code Inside Box
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 pt-4">
                {/* Read-only prefilled (SP Number only for existing equipment) */}
                {READONLY_FIELDS.filter(
                  ([name]) => name !== "spNumber" || formData.spNumber,
                ).map(([name, label]) => (
                  <div className="relative" key={name}>
                    <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                      {label}
                    </span>
                    <input
                      type="text"
                      value={formData[name] || ""}
                      readOnly
                      placeholder="Prefilled after scan"
                      className={inputClass}
                    />
                  </div>
                ))}

                {/* Editable text fields */}
                {EDITABLE_FIELDS.map(([name, label]) => (
                  <div className="relative" key={name}>
                    <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                      {label}
                    </span>
                    <input
                      name={name}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                ))}

                {/* Dates */}
                {DATE_INPUTS.map(([name, label]) => (
                  <div className="relative" key={name}>
                    <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                      {label}
                    </span>
                    <input
                      type="date"
                      name={name}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                ))}

                {/* Notes */}
                <div className="relative md:col-span-2">
                  <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                    Notes
                  </span>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 md:col-span-2">
                <input
                  type="checkbox"
                  name="syncEquipmentMaster"
                  checked={!!formData.syncEquipmentMaster}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      syncEquipmentMaster: e.target.checked,
                    }))
                  }
                />
                Sync changed Place of Installation / Floor / Location to
                Equipment Master
              </label>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-8 py-3 rounded-lg font-semibold shadow-md ${
                    submitting
                      ? "bg-gray-300 text-gray-600"
                      : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
                  }`}
                >
                  {submitting ? "Submitting..." : "Submit Installation Report"}
                </button>
              </div>
            </form>
)}
          </div>
        </main>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedReport(null)}
          />
          <div className="relative bg-white w-[95vw] max-w-3xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky bg-white">
              <h4 className="text-lg font-semibold text-[#DC6D18]">
                Installation Report Details
              </h4>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3">
              {VIEW_FIELDS.map(([label, key]) => (
                <div
                  key={key}
                  className="flex justify-between border-b pb-1 gap-4"
                >
                  <span className="font-medium text-gray-700">{label}:</span>
                  <span className="text-gray-900 text-right break-words">
                    {DATE_FIELDS.has(key)
                      ? formatCSVDate(selectedReport[key]) || "—"
                      : selectedReport[key] || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstallationReport;
