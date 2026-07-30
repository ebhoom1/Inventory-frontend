// RequestService.jsx
import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useDispatch, useSelector } from "react-redux";
import {
  createServiceRequest,
  resetServiceRequestState,
} from "../../redux/features/serviceRequests/serviceRequestSlice";
import Swal from "sweetalert2";
import { API_URL } from "../../../utils/apiConfig";
import StyledSelect from "../common/StyledSelect";

const qrConfig = {
  fps: 20,
  qrbox: (viewfinderWidth, viewfinderHeight) => {
    const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
    const boxSize = Math.floor(minEdge * 0.7);
    return { width: boxSize, height: boxSize };
  },
  aspectRatio: 1.0,
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: false, // ✅ Disabled for iOS compatibility
  },
  disableFlip: false,
};
const isMongoId = (s) => typeof s === "string" && /^[a-f0-9]{24}$/i.test(s);

// --- IST date helpers ---
const IST_TZ = "Asia/Kolkata";

function formatISTDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return String(value);
  return d.toLocaleDateString("en-IN", {
    timeZone: IST_TZ,
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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

const DATE_ONLY_FIELDS = new Set([
  "installationDate",
  "refillingDue",
  "nextServiceDate",
]);

const DATE_TIME_FIELDS = new Set(["date", "createdAt", "updatedAt"]);

// ✅ Helper function to request camera permissions explicitly (iOS requirement)
const requestCameraPermission = async () => {
  try {
    // Check if the browser supports the Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      const permission = await navigator.permissions.query({ name: "camera" });
      if (permission.state === "denied") {
        return false;
      }
    }

    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    // Stop the stream immediately (we just needed permission)
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (err) {
    console.error("Camera permission error:", err);
    return false;
  }
};

function RequestService() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (s) => s.serviceRequests,
  );

  // ----- Role detection (supports both user & users slices) -----
  const userRoleRaw =
    useSelector(
      (s) =>
        s.user?.userData?.validUserOne?.adminType ||
        s.user?.userData?.role ||
        s.user?.userData?.userType,
    ) ||
    useSelector((s) => s.users?.userInfo?.userType) ||
    "user";

  const role = String(userRoleRaw).toLowerCase().replace(/\s+/g, "");
  const isAdmin = ["admin", "superadmin", "megaadmin"].includes(role);
  const isTechnician = ["technician"].includes(role);
  const isSuperAdmin = role === "superadmin";
  const isUser = role === "user";

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

  // ----- State -----
  const [formData, setFormData] = useState({
    equipmentId: "",
    equipmentName: "",
    userId: "",
    serviceType: "",
    date: "",
    faultDescription: "",
    branchLocation: "",
    placeOfInstallation: "",
    address: "",
    location: "",
    floor: "",
    pincode: "",
    brand: "",
    type: "",
    capacity: "",
    installationDate: "",
    canSerialNumber: "",
    refillingDue: "",
    nextServiceDate: "",
    product: "",
    content: "", // ✅ add so it’s controlled (you render "content" input)
    others: "",
    tag: "",
    safetyPin: "",
    pressureGauge: "",
    valveSupport: "",
    corrosion: "",
    baseCap: "",
    powderFlow: "",
    remarks: "",
    syncEquipmentMaster: true,
  });

  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("user");
  const [reportHistory, setReportHistory] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userReports, setUserReports] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  useEffect(() => {
    if (!(isSuperAdmin || isAdmin || isTechnician)) return;

    let abort = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/reports/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!abort) {
          if (res.ok && data?.success !== false) {
            setUserList(data.users || []);
          } else {
            setUserError("Failed to load users");
          }
        }
      } catch (e) {
        if (!abort) setUserError("Failed to load users");
      }
    })();

    return () => {
      abort = true;
    };
  }, [isSuperAdmin, isAdmin, isTechnician, token]);

  // ----- Modal -----
  const openReportModal = (rep) => {
    // Fallback so older reports (stored under branchLocation) still display
    setSelectedReport({
      ...rep,
      placeOfInstallation: rep.placeOfInstallation || rep.branchLocation || "",
    });
    setShowReportModal(true);
  };
  const closeReportModal = () => {
    setSelectedReport(null);
    setShowReportModal(false);
  };

  const openInNewTab = (url) => {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  async function downloadLatestReportsCsv({ apiBase, token, userId }) {
    try {
      const url = userId
        ? `${apiBase}/api/reports/export/latest?userId=${encodeURIComponent(
            userId,
          )}`
        : `${apiBase}/api/reports/export/latest`;

      const resp = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!resp.ok) throw new Error(`Export failed: ${resp.status}`);
      const blob = await resp.blob();

      const cd = resp.headers.get("Content-Disposition");
      const filename =
        (cd && cd.match(/filename="(.+)"/)?.[1]) ||
        `latest_reports_${userId || "me"}.csv`;

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Latest CSV export failed:", e);
      alert("Failed to export CSV. Check console for details.");
    }
  }

  const fetchReportsForUser = async (uid) => {
    if (!uid) {
      setUserReports([]);
      return;
    }
    setUserLoading(true);
    setUserError("");

    try {
      const cacheBuster = Date.now();
      const res = await fetch(
        `${API_URL}/api/reports/latest?userId=${encodeURIComponent(uid)}&t=${cacheBuster}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      const items = Array.isArray(data) ? data : data.items || [];
      setUserReports(items);
    } catch (e) {
      setUserError("Failed to load reports");
    } finally {
      setUserLoading(false);
    }
  };

  const REPORT_FIELDS = [
    ["Equipment ID", "equipmentId"],
    ["Equipment Name", "equipmentName"],
    ["Added By (User ID)", "userId"],
    ["Service Type", "serviceType"],
    ["Date", "date"],
    ["Place of Installation", "placeOfInstallation"],
    ["Address", "address"],
    ["Location", "location"],
    ["Floor / Building", "floor"],
    ["Pincode", "pincode"],
    ["Brand", "brand"],
    ["Type", "type"],
    ["Model / Series", "type"],
    ["Capacity", "capacity"],
    ["Installation Date", "installationDate"],
    ["Can Serial Number", "canSerialNumber"],
    ["Refilling Due", "refillingDue"],

    ["Next Service Date", "nextServiceDate"],
    ["Product", "product"],
    ["Others", "others"],
    ["Tag", "tag"],
    ["Safety Pin", "safetyPin"],
    ["Pressure Gauge", "pressureGauge"],
    ["Valve Support", "valveSupport"],
    ["Corrosion", "corrosion"],
    ["Base Cap", "baseCap"],
    ["Powder Flow", "powderFlow"],
    ["Remarks", "remarks"],
    ["Fault Description", "faultDescription"],
  ];

  // ----- QR scanner + fetch -----
  useEffect(() => {
    if (!isScannerVisible) return;

    // Inject scanning animations CSS
    if (!document.getElementById("qr-scan-styles")) {
      const style = document.createElement("style");
      style.id = "qr-scan-styles";
      style.innerHTML = `
        @keyframes scanLineMove {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px #DC6D18, inset 0 0 15px rgba(220, 109, 24, 0.3); }
          50% { box-shadow: 0 0 30px #DC6D18, inset 0 0 25px rgba(220, 109, 24, 0.5); }
        }
        @keyframes corner-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .qr-scan-line {
          animation: scanLineMove 2s linear infinite;
        }
        .qr-focus-box {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .qr-corner {
          animation: corner-pulse 1.5s ease-in-out infinite;
        }
        #qr-reader video {
          border-radius: 8px;
        }
      `;
      document.head.appendChild(style);
    }

    const scanner = new Html5Qrcode("qr-reader");

    const onSuccess = async (decodedText) => {
      const raw = (decodedText || "").trim();
      const looksJson = raw.startsWith("{") && raw.endsWith("}");
      let scanned = looksJson ? JSON.parse(raw) : { equipmentId: raw };

      // ✅ Map short QR keys -> your internal keys
      const mappedData = {
        equipmentId: scanned.eid || scanned.equipmentId || "",
        userId: scanned.uid || scanned.userId || "",
        location: scanned.loc || scanned.location || "",
        // canSerialNumber: scanned.sn || scanned.serialNumber || prev.canSerialNumber,
        serial:
          scanned.sn ||
          scanned.serialNumber ||
          scanned.serial ||
          scanned.canSerialNumber ||
          "",
        installDate: scanned.ins || scanned.installationDate || "",
        expiryDate: scanned.exp || scanned.expiryDate || "",
        capacity: scanned.cap || scanned.capacity || "",
        brand: scanned.brd || scanned.brand || "",
        serviceDue: scanned.ref || scanned.refillingDue || "",
      };

      // Prefill from QR immediately (fast UI)
      setFormData((prev) => ({
        ...prev,
        equipmentId: mappedData.equipmentId || prev.equipmentId,
        userId: mappedData.userId || prev.userId,
        location: mappedData.location || prev.location,
        canSerialNumber: mappedData.serial || prev.canSerialNumber,
        installationDate: mappedData.installDate
          ? String(mappedData.installDate).slice(0, 10)
          : prev.installationDate,
        refillingDue: mappedData.serviceDue
          ? String(mappedData.serviceDue).slice(0, 10)
          : prev.refillingDue,
        brand: mappedData.brand || prev.brand,
        capacity: mappedData.capacity || prev.capacity,
      }));

      // ✅ CRITICAL FIX:
      // Always use QR eid/equipmentId for lookup, NEVER the whole JSON string
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

        // If primary fetch failed, attempt fallback by serial number
        if (!res.ok || data?.success === false || !data) {
          const serial = mappedData.serial || (!looksJson ? raw : "");
          if (serial) {
            try {
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
            } catch (e) {
              console.error("Serial lookup failed", e);
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

        // If API returned matchedAssignments (serial lookup), prefer it
        let preferredAssignment = null;
        if (
          data.matchedAssignments &&
          Array.isArray(data.matchedAssignments) &&
          data.matchedAssignments.length > 0
        ) {
          preferredAssignment = data.matchedAssignments[0];
        }

        // Populate service form with authoritative equipment details from backend
        setFormData((prev) => ({
          ...prev,
          equipmentId: eq.equipmentId || prev.equipmentId,
          equipmentName: eq.equipmentName || prev.equipmentName,

          // Place of Installation: Equipment > Previous
          placeOfInstallation:
            eq.placeOfInstallation || prev.placeOfInstallation,

          // UserId: Assignment > Equipment > QR > Previous
          userId:
            (preferredAssignment && preferredAssignment.userId) ||
            eq.userId ||
            mappedData.userId ||
            prev.userId,

          // Location: Assignment > Equipment > QR > Previous
          location:
            (preferredAssignment && preferredAssignment.location) ||
            eq.location ||
            mappedData.location ||
            prev.location,

          // Floor / Building: Assignment > Equipment > QR > Previous
          floor:
            (preferredAssignment && preferredAssignment.floor) ||
            eq.floor ||
            mappedData.floor ||
            prev.floor,

          brand: eq.brand || prev.brand,
          capacity: eq.capacity || prev.capacity,
          type: eq.modelSeries || prev.type,
          product: eq.content || prev.product,
          content: eq.content || prev.content,

          installationDate: eq.installationDate
            ? String(eq.installationDate).slice(0, 10)
            : prev.installationDate,
          refillingDue: eq.refDue
            ? String(eq.refDue).slice(0, 10)
            : prev.refillingDue,

          // ✅ Serial: QR sn > assignment.serialNumber > previous
          canSerialNumber:
            mappedData.serial ||
            preferredAssignment?.serialNumber ||
            eq.serialNumber ||
            prev.canSerialNumber,
        }));

        Swal.fire({
          title: "Scanned!",
          text: eq.equipmentName || eq.equipmentId || "QR read",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });

        // Fetch report history for this equipment (✅ add auth header)
        if (eq.equipmentId) {
          const repRes = await fetch(
            `${API_URL}/api/reports?equipmentId=${encodeURIComponent(
              eq.equipmentId,
            )}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          const repData = await repRes.json();

          let reports = [];
          if (Array.isArray(repData)) reports = repData;
          else if (repData && Array.isArray(repData.items))
            reports = repData.items;

          if (repRes.ok && reports.length > 0) {
            const sorted = [...reports].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
            setReportHistory(sorted);

            if (isAdmin || isTechnician) {
              const last = sorted[0];
              setFormData((prev) => ({
                ...prev,
                placeOfInstallation:
                  last.placeOfInstallation ??
                  last.branchLocation ??
                  prev.placeOfInstallation,
                address: last.address ?? prev.address,
                location: last.location ?? prev.location,
                floor: last.floor ?? prev.floor,
                pincode: last.pincode ?? prev.pincode,
                brand: last.brand ?? prev.brand,
                type: last.type ?? prev.type,
                capacity: last.capacity ?? prev.capacity,
                installationDate: last.installationDate
                  ? last.installationDate.slice(0, 10)
                  : prev.installationDate,
                canSerialNumber: last.canSerialNumber ?? prev.canSerialNumber,
                refillingDue: last.refillingDue
                  ? last.refillingDue.slice(0, 10)
                  : prev.refillingDue,
                nextServiceDate: last.nextServiceDate,
                product: last.product ?? prev.product,
                content: last.content ?? prev.content,
                others: last.others ?? prev.others,
                tag: last.tag ?? prev.tag,
                safetyPin: last.safetyPin ?? prev.safetyPin,
                pressureGauge: last.pressureGauge ?? prev.pressureGauge,
                valveSupport: last.valveSupport ?? prev.valveSupport,
                corrosion: last.corrosion ?? prev.corrosion,
                baseCap: last.baseCap ?? prev.baseCap,
                powderFlow: last.powderFlow ?? prev.powderFlow,
                remarks: last.remarks ?? prev.remarks,
                faultDescription:
                  last.faultDescription ?? prev.faultDescription,
                serviceType: last.serviceType ?? prev.serviceType,
              }));
            }
          } else {
            setReportHistory([]);
          }
        }
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
      .start(
        {
          facingMode: cameraFacing,
        },
        qrConfig,
        onSuccess,
      )
      .catch((err) => {
        console.error("Scanner start error:", err);

        // Provide detailed error handling for different scenarios
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
        } else if (err.message?.includes("AbortError")) {
          errorMessage = "Camera access was aborted.";
        }

        Swal.fire({
          title: "Camera Error",
          text: errorMessage,
          icon: "error",
        });
        setScannerVisible(false);
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [isScannerVisible, isAdmin, isTechnician, cameraFacing, token]);

  // ----- Submission feedback -----
  useEffect(() => {
    if (successMessage) {
      Swal.fire({
        title: "Submitted",
        text: successMessage,
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });
      setFormData((prev) => ({
        ...prev,
        serviceType: "",
        date: "",
        faultDescription: "",
        remarks: "",
      }));
      dispatch(resetServiceRequestState());
    }
    if (selectedUserId) {
      fetchReportsForUser(selectedUserId);
    }

    if (error) {
      Swal.fire({ title: "Failed", text: error, icon: "error" });
      dispatch(resetServiceRequestState());
    }
  }, [successMessage, error, selectedUserId, dispatch]);

  // ----- Handlers -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(isAdmin || isTechnician)) return;

    const payload = {
      ...formData,
      date: formData?.date || new Date().toISOString(),
      nextServiceDate:
        formData?.nextServiceDate || formData?.refillingDue || null,
    };
    dispatch(createServiceRequest(payload));
  };

  const inputClass =
    "w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg " +
    "bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        {isAdmin || isTechnician
          ? "Equipment Service Report"
          : "Service Report History"}
      </h2>

      {(isSuperAdmin || isAdmin || isTechnician) && (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Filter by User
          </label>

          <div className="flex gap-3 items-center">
            <StyledSelect
              triggerClassName={`${inputClass} text-left flex items-center justify-between gap-2`}
              value={selectedUserId}
              onChange={(e) => {
                const uid = e.target.value;
                setSelectedUserId(uid);
                fetchReportsForUser(uid);
              }}
              options={[
                { value: "", label: "— Select a user —" },
                ...userList.map((u) => ({ value: u.userId, label: u.name || u.userId })),
              ]}
            />

            <button
              onClick={() => {
                downloadLatestReportsCsv({
                  apiBase: API_URL,
                  token,
                  userId: selectedUserId,
                });
              }}
              className="bg-[#DC6D18] text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-[#c55e12] transition"
            >
              Download Latest Reports CSV
            </button>
          </div>

          <div className="mt-4">
            {userLoading && (
              <div className="text-sm text-gray-600">Loading…</div>
            )}
            {userError && (
              <div className="text-sm text-red-600">{userError}</div>
            )}

            {!userLoading && !userError && selectedUserId && (
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
                        Service Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {userReports.length === 0 ? (
                      <tr>
                        <td
                          className="px-4 py-4 text-sm text-gray-600"
                          colSpan={4}
                        >
                          No reports found for this user.
                        </td>
                      </tr>
                    ) : (
                      userReports.map((rep) => {
                        const pdfUrl =
                          rep.pdfUrl || `${API_URL}/api/reports/${rep._id}/pdf`;
                        const csvUrl =
                          rep.csvUrl || `${API_URL}/api/reports/${rep._id}/csv`;

                        return (
                          <tr key={rep._id}>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {formatISTDateTime(rep.createdAt || rep.date)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {rep.equipmentName || rep.equipmentId || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {rep.serviceType || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => openReportModal(rep)}
                                  className="px-3 py-1 rounded-md bg-[#DC6D18] text-white hover:bg-[#B85B14]"
                                >
                                  View Report
                                </button>
                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 inline-block"
                                >
                                  Download PDF
                                </a>
                                <a
                                  href={csvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 inline-block"
                                >
                                  Download CSV
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {isUser && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-[#DC6D18] text-white hover:bg-[#B85B14] shadow-sm"
            onClick={() =>
              downloadLatestReportsCsv({
                apiBase: API_URL,
                token,
                userId: currentUserId,
              })
            }
            title="Download my reports"
          >
            Download Latest Reports
          </button>
        </div>
      )}

      <form
        className="space-y-6"
        onSubmit={
          isAdmin || isTechnician ? handleSubmit : (e) => e.preventDefault()
        }
      >
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
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                if (!isScannerVisible) {
                  // ✅ Request camera permission on iOS before opening scanner
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
            {/* Status indicator */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-lg border border-[#DC6D18]/50 backdrop-blur">
              <div className="w-2 h-2 bg-[#DC6D18] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#DC6D18] font-semibold">
                SCANNING
              </span>
            </div>

            <div id="qr-reader" className="w-full"></div>

            {/* ✅ FOCUS OVERLAY WITH ANIMATIONS */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[280px] h-[280px] border-2 border-[#DC6D18]/40 qr-focus-box">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#DC6D18] qr-corner"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#DC6D18] qr-corner"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#DC6D18] qr-corner"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#DC6D18] qr-corner"></div>

                {/* Animated scan line */}
                <div className="w-full h-1 bg-gradient-to-b from-[#DC6D18] to-transparent absolute top-0 qr-scan-line shadow-[0_0_15px_#DC6D18]"></div>

                {/* Side scan effects */}
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-r from-[#DC6D18] to-transparent opacity-30"></div>
                <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-l from-[#DC6D18] to-transparent opacity-30"></div>
              </div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-3 left-0 right-0 text-center z-10">
              <p className="text-xs text-[#DC6D18] font-semibold px-3">
                📱 Position QR Code Inside Box
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 pt-4">
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
              Equipment Name
            </span>
            <input
              type="text"
              value={formData.equipmentName}
              readOnly
              placeholder="Prefilled after scan"
              className={inputClass}
            />
          </div>
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
              User ID
            </span>
            <input
              type="text"
              value={formData.userId}
              readOnly
              placeholder="Prefilled after scan"
              className={inputClass}
            />
          </div>

          {(isAdmin || isTechnician) && (
            <>
              {[
                ["placeOfInstallation", "Place of installation"],
                ["address", "Address"],
                ["location", "Location"],
                ["floor", "Floor / Building"],
                ["pincode", "Pincode/Area"],
                ["brand", "Brand"],
                ["content", "Content"],
                ["type", "Type"],
                ["capacity", "Capacity"],
                ["canSerialNumber", "Can Serial Number"],
                ["product", "Product"],
                ["others", "Others"],
              ].map(([name, label]) => (
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

              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Installation Date
                </span>
                <input
                  type="date"
                  name="installationDate"
                  value={formData.installationDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Refilling Due
                </span>
                <input
                  type="date"
                  name="refillingDue"
                  value={formData.refillingDue}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Next Service Date
                </span>
                <input
                  type="date"
                  name="nextServiceDate"
                  value={formData.nextServiceDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {[
                ["tag", "Tag", ["yes", "no", "na"]],
                ["safetyPin", "Safety Pin", ["Green", "Red", "na"]],
                ["pressureGauge", "Pressure Gauge", ["Yes", "No", "na"]],
                ["valveSupport", "Valve Support", ["yes", "no", "na"]],
                [
                  "corrosion",
                  "Corrosion",
                  ["Fine", "Moderate", "Severe", "na"],
                ],
                ["baseCap", "Base Cap", ["Ok", "Damaged", "Missing", "na"]],
                [
                  "powderFlow",
                  "Powder Flow",
                  ["good", "average", "poor", "na"],
                ],
              ].map(([name, label, options]) => (
                <div className="relative" key={name}>
                  <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                    {label}
                  </span>
                  <StyledSelect
                    name={name}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    triggerClassName={`${inputClass} text-left flex items-center justify-between gap-2`}
                    options={[{ value: "", label: "Select" }, ...options]}
                  />
                </div>
              ))}

              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Type of Service
                </span>
                <StyledSelect
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  triggerClassName={`${inputClass} text-left flex items-center justify-between gap-2`}
                  required
                  options={[
                    { value: "", label: "Select a service type" },
                    "Routine Maintenance",
                    "Repair",
                    "Inspection",
                    "Calibration",
                  ]}
                />
              </div>

              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Date
                </span>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div className="relative md:col-span-2">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Remarks
                </span>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="2"
                  className={inputClass}
                />
              </div>

              <div className="relative md:col-span-2">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Fault Description
                </span>
                <textarea
                  name="faultDescription"
                  value={formData.faultDescription}
                  onChange={handleChange}
                  rows="4"
                  className={inputClass}
                  required
                />
              </div>
            </>
          )}
        </div>

        {(isAdmin || isTechnician) && (
          <div className="flex flex-col items-center justify-center pt-4 gap-3">
            <div className="w-full">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
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
           </div>
            <button
            
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-lg font-semibold shadow-md ${
                loading
                  ? "bg-gray-300 text-gray-600"
                  : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
              }`}
            >
              {loading ? "Submitting..." : "Request Service"}
            </button>
          </div>
        )}
      </form>

      {reportHistory.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold text-[#DC6D18] mb-4">
            Previous Reports
          </h3>
          <div className="space-y-4">
            {reportHistory.map((rep, idx) => (
              <div
                key={rep._id || idx}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <div className="bg-orange-50 px-4 py-3 flex flex-wrap gap-3 justify-between items-center">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {rep.title || `Report - ${formatISTDate(rep.createdAt)}`}
                    </div>
                    {rep.createdAt && (
                      <div className="text-sm text-gray-600">
                        {formatISTDateTime(rep.createdAt)}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openReportModal(rep);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#DC6D18] text-white hover:bg-[#B85B14] shadow-sm"
                    >
                      View report
                    </button>

                    {rep.pdfUrl && (
                      <a
                        href={rep.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-black shadow-sm inline-block"
                        title="Download PDF"
                      >
                        Download PDF
                      </a>
                    )}
                    {rep.csvUrl && (
                      <a
                        href={rep.csvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm inline-block"
                        title="Download CSV"
                      >
                        Download CSV
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeReportModal}
            aria-label="X"
          />
          <div className="relative bg-white w-[95vw] max-w-3xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky bg-white">
              <h4 className="text-lg font-semibold text-[#DC6D18]">
                Report Details
              </h4>
              <button
                onClick={closeReportModal}
                className="text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3">
              {REPORT_FIELDS.map(([label, key]) => (
                <div key={key} className="flex justify-between border-b pb-1">
                  <span className="font-medium text-gray-700">{label}:</span>
                  <span className="text-gray-900 text-right">
                    {DATE_TIME_FIELDS.has(key)
                      ? formatISTDateTime(selectedReport[key])
                      : DATE_ONLY_FIELDS.has(key)
                        ? formatISTDate(selectedReport[key])
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

export default RequestService;
