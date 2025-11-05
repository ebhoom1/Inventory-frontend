import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useDispatch, useSelector } from "react-redux";
import {
  createServiceRequest,
  resetServiceRequestState,
} from "../../redux/features/serviceRequests/serviceRequestSlice";
import Swal from "sweetalert2";
import { API_URL } from "../../../utils/apiConfig";

const qrConfig = { fps: 10, qrbox: 400 };
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
  "expiryDate",
  "refillingDue",
  "nextServiceDate",
]);

const DATE_TIME_FIELDS = new Set(["date", "createdAt", "updatedAt"]);

function RequestService() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector(
    (s) => s.serviceRequests
  );

  // ----- Role detection (supports both user & users slices) -----
  const userRoleRaw =
    useSelector(
      (s) =>
        s.user?.userData?.validUserOne?.adminType ||
        s.user?.userData?.role ||
        s.user?.userData?.userType
    ) ||
    useSelector((s) => s.users?.userInfo?.userType) ||
    "user";

  const role = String(userRoleRaw).toLowerCase().replace(/\s+/g, "");
  const isAdmin = ["admin", "superadmin", "megaadmin"].includes(role);
  const isTechnician = ["technician"].includes(role);
  // ADD THIS:
  const isSuperAdmin = role === "superadmin";

  const isUser = role === "user";

  // Who am I (for filename "reports_<username>_YYYYMMDD.csv")
  const currentUserId = useSelector(
    (s) =>
      s.users?.userInfo?.userId ||
      s.user?.userData?.userId || // if your other slice stores it here
      s.user?.userData?.validUserOne?.userId || // legacy shapes
      "me"
  );

  // Try Redux first, then localStorage fallbacks
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

  // pull token (adjust if your Redux stores it elsewhere)
  // const reduxToken = useSelector((s) => s.users?.token || s.user?.token);
  // const token = reduxToken || localStorage.getItem("token") || "";

  // ----- State -----
  const [formData, setFormData] = useState({
    equipmentId: "",
    equipmentName: "",
    modelSeries: "",
    userId: "",
    serviceType: "",
    date: "",
    faultDescription: "",
    branchLocation: "",
    address: "",
    location: "",
    pincode: "",
    brand: "",
    type: "",
    capacity: "",
    installationDate: "",
    canSerialNumber: "",
    refillingDue: "",
    nextServiceDate: "",
    product: "",
    others: "",
    tag: "",
    safetyPin: "",
    pressureGauge: "",
    valveSupport: "",
    corrosion: "",
    baseCap: "",
    powderFlow: "",
    remarks: "",
  });

  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);
  const [reportHistory, setReportHistory] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // ADD THESE STATES (near other useState calls):
  const [userList, setUserList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userReports, setUserReports] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");

  // useEffect(() => {
  //   if (!isSuperAdmin) return;

  //   let abort = false;
  //   (async () => {
  //     try {
  //       const res = await fetch(`${API_URL}/api/reports/users`);
  //       const data = await res.json();
  //       if (!abort) {
  //         if (res.ok && data?.success !== false) {
  //           setUserList(data.users || []);
  //         } else {
  //           setUserError("Failed to load users");
  //         }
  //       }
  //     } catch (e) {
  //       if (!abort) setUserError("Failed to load users");
  //     }
  //   })();

  //   return () => {
  //     abort = true;
  //   };
  // }, [isSuperAdmin]);

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
  }, [isSuperAdmin, isAdmin, isTechnician]);

  // ----- Modal -----
  const openReportModal = (rep) => {
    setSelectedReport(rep);
    setShowReportModal(true);
  };
  const closeReportModal = () => {
    setSelectedReport(null);
    setShowReportModal(false);
  };

  // // ----- Download helper -----
  // const triggerDownload = (url, filename = "report") => {
  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.setAttribute("download", filename);
  //   a.target = "_blank";
  //   document.body.appendChild(a);
  //   a.click();
  //   a.remove();
  // };

  // Open a URL in a new tab. Works for both PDF (inline) and CSV (attachment)
  const openInNewTab = (url) => {
    // Try window.open first
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      // Fallback if popup blocked: simulate a click on an anchor
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
            userId
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

  // --- ONE-CLICK CSV EXPORT for currently selected user (or "me" when role=user)
  // async function downloadReportsCsvForUser({
  //   apiBase,
  //   token,
  //   userId,
  //   displayName,
  // }) {
  //   try {
  //     if (!token) {
  //       alert("You are not logged in. Please log in again.");
  //       return;
  //     }

  //     const url = userId
  //       ? `${apiBase}/api/reports/export/user?userId=${encodeURIComponent(
  //           userId
  //         )}`
  //       : `${apiBase}/api/reports/export/user`;

  //     const resp = await fetch(url, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (!resp.ok) {
  //       // Read any JSON/text error for better debugging
  //       const text = await resp.text();
  //       throw new Error(text || `HTTP ${resp.status}`);
  //     }

  //     const blob = await resp.blob();

  //     const cd = resp.headers.get("Content-Disposition") || "";
  //     const match = /filename="([^"]+)"/i.exec(cd);
  //     const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  //     const safe = (displayName || userId || "me").replace(
  //       /[^A-Za-z0-9_-]+/g,
  //       "_"
  //     );
  //     const fallback = `reports_${safe}_${ymd}.csv`;
  //     const filename = match?.[1] || fallback;

  //     const a = document.createElement("a");
  //     a.href = URL.createObjectURL(blob);
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(a.href);
  //   } catch (e) {
  //     console.error("CSV export failed:", e);
  //     alert("CSV export failed. See console for details.");
  //   }
  // }

  const fetchReportsForUser = async (uid) => {
    if (!uid) {
      setUserReports([]);
      return;
    }
    setUserLoading(true);
    setUserError("");

    try {
      const res = await fetch(
        `${API_URL}/api/reports/latest?userId=${encodeURIComponent(uid)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      // API may return either an array or a {items: []} envelope
      const items = Array.isArray(data) ? data : data.items || [];
      setUserReports(items);
    } catch (e) {
      setUserError("Failed to load reports");
    } finally {
      setUserLoading(false);
    }
  };

  // list of fields to show in modal
  const REPORT_FIELDS = [
    ["Equipment ID", "equipmentId"],
    ["Equipment Name", "equipmentName"],
    ["Model / Series", "modelSeries"], // ✅ Add this line
    ["Added By (User ID)", "userId"],
    ["Service Type", "serviceType"],
    ["Date", "date"],
    ["Branch/Location", "branchLocation"],
    ["Address", "address"],
    ["Location", "location"],
    ["Pincode", "pincode"],
    ["Brand", "brand"],
    ["Type", "type"],
    ["Capacity", "capacity"],
    ["Installation Date", "installationDate"],
    ["Expiry Date", "expiryDate"],
    ["Can Serial Number", "canSerialNumber"],
    ["Next Service Date", "nextServiceDate"],

    ["Refilling Due", "refillingDue"],
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

    const scanner = new Html5Qrcode("qr-reader");
    setScannerInstance(scanner);

    const onSuccess = async (decodedText) => {
      let scanned = {};
      try {
        scanned = JSON.parse(decodedText);
      } catch {
        scanned = { equipmentId: decodedText };
      }
      const maybeId = scanned.equipmentId || scanned._id || decodedText;

      const url = isMongoId(maybeId)
        ? `${API_URL}/api/equipment/${encodeURIComponent(maybeId)}`
        : `${API_URL}/api/equipment/by-eid/${encodeURIComponent(maybeId)}`;

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || data?.success === false) {
          Swal.fire({
            title: "Not Found",
            text: "Equipment not found",
            icon: "error",
          });
          setScannerVisible(false);
          return;
        }

        const eq = data.equipment || data;

        // Format dates for input fields (YYYY-MM-DD format)
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.error("Date formatting error:", error);
            return "";
          }
        };

           setFormData((prev) => ({
          ...prev,
          equipmentId: eq.equipmentId || prev.equipmentId,
          equipmentName: eq.equipmentName || prev.equipmentName,
          modelSeries: eq.modelSeries || prev.modelSeries,
          userId: eq.userId || prev.userId,
          location: eq.location || prev.location,
          // Add the new fields from QR code with proper date formatting
          installationDate: formatDateForInput(scanned.installationDate) || 
                          formatDateForInput(eq.installationDate) || 
                          prev.installationDate,
          expiryDate: formatDateForInput(scanned.expiryDate) || 
                     formatDateForInput(eq.expiryDate) || 
                     prev.expiryDate,
          capacity: scanned.capacity || eq.capacity || prev.capacity,
        }));
        Swal.fire({
          title: "Scanned!",
          text: eq.equipmentName || eq.equipmentId || "QR read",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });

        // Fetch report history for this equipment
        if (eq.equipmentId) {
          const repRes = await fetch(
            `${API_URL}/api/reports?equipmentId=${encodeURIComponent(
              eq.equipmentId
            )}`
          );
          const repData = await repRes.json();

          let reports = [];
          if (Array.isArray(repData)) reports = repData;
          else if (repData && Array.isArray(repData.items))
            reports = repData.items;

          if (repRes.ok && reports.length > 0) {
            const sorted = [...reports].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setReportHistory(sorted);

            // For admins, prefill latest report to speed up form filling
            if (isAdmin || isTechnician) {
              const last = sorted[0];
              setFormData((prev) => ({
                ...prev,
                branchLocation: last.branchLocation ?? prev.branchLocation,
                address: last.address ?? prev.address,
                location: last.location ?? prev.location,
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

    scanner.start({ facingMode: "user" }, qrConfig, onSuccess).catch(() => {
      Swal.fire({
        title: "Camera Error",
        text: "Grant camera permission.",
        icon: "error",
      });
      setScannerVisible(false);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [isScannerVisible, isAdmin, isTechnician]);

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
    if (error) {
      Swal.fire({ title: "Failed", text: error, icon: "error" });
      dispatch(resetServiceRequestState());
    }
  }, [successMessage, error, dispatch]);

  // ----- Handlers -----
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(isAdmin || isTechnician)) return; // safety
    // dispatch(createServiceRequest(formData));

    //date
    //    const payload = {
    //   ...formData,
    //    // If user didn't pick a date, use now (ISO). If your backend expects yyyy-mm-dd, slice(0,10)
    //    date: formData?.date || new Date().toISOString(),
    //    // Map your existing "Refilling/Service Due" -> nextServiceDate
    //    nextServiceDate: formData?.nextServiceDate || formData?.refillingDue
    //  };
    //  dispatch(createServiceRequest(payload));
    const payload = {
      ...formData,
      date: formData?.date || new Date().toISOString(),
      nextServiceDate: formData?.nextServiceDate || null,
    };
    dispatch(createServiceRequest(payload));
  };

  const inputClass =
    "w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg " +
    "bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]";

  // Uniform action buttons: same width on all screens
  const actionBtnBase =
    "w-40 text-center whitespace-nowrap px-3 py-2 rounded-md"; // w-40 ≈ 10rem
  const actionBtnPrimary = `${actionBtnBase} bg-[#DC6D18] text-white hover:bg-[#B85B14]`;
  const actionBtnOutline = `${actionBtnBase} border border-gray-300 hover:bg-gray-50`;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        {isAdmin || isTechnician
          ? "Equipment Service Report"
          : "Service Report History"}
      </h2>

      {/* ===== Manager filter (Super Admin / Admin / Technician) ===== */}
      {(isSuperAdmin || isAdmin || isTechnician) && (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Filter by User
          </label>

          <div className="flex gap-3 items-center">
            <select
              className={inputClass}
              value={selectedUserId}
              onChange={(e) => {
                const uid = e.target.value;
                setSelectedUserId(uid);
                fetchReportsForUser(uid);
              }}
            >
              <option value="">— Select a user —</option>
              {userList.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.name || u.userId}
                </option>
              ))}
            </select>

            {/* Download button, right side */}
            <button
              onClick={() => {
                // For admin/superadmin, the target user is the one from the dropdown
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
          {/* Results */}
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
                                  onClick={() => {
                                    openReportModal(rep);
                                  }}
                                  className={actionBtnPrimary}
                                >
                                  View Report
                                </button>
                                {/* <button
                            type="button"
                            onClick={() => openInNewTab(pdfUrl)}
                            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => openInNewTab(csvUrl)}
                            className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            CSV
                          </button> */}
                                {/* PDF — open in new tab once */}
                                <a
                                  href={pdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={actionBtnOutline}
                                >
                                  Download PDF
                                </a>

                                {/* CSV — force download, single fire */}
                                <a
                                  href={csvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  onClick={(e) => e.stopPropagation()}
                                  className={actionBtnOutline}
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

      {/* ===== User role: only a single "Download My Reports" button ===== */}
      {isUser && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-[#DC6D18] text-white hover:bg-[#B85B14] shadow-sm"
            onClick={() =>
              downloadLatestReportsCsv({
                apiBase: API_URL,
                token,
                userId: currentUserId, // server infers "me"
                displayName: currentUserId, // use hoisted value
              })
            }
            title="Download my reports"
          >
            Download My Reports
          </button>
        </div>
      )}

      {/* {isUser && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-[#DC6D18] text-white hover:bg-[#B85B14] shadow-sm"
            onClick={() =>
              downloadReportsCsvForUser({
                apiBase: API_URL,
                token,
                userId: null, // server infers "me" from token
                displayName:
                  useSelector((s) => s.users?.userInfo?.userId) || "me",
              })
            }
            title="Download my reports"
          >
            Download My Reports
          </button>
        </div>
      )} */}

      <form
        className="space-y-6"
        onSubmit={
          isAdmin || isTechnician ? handleSubmit : (e) => e.preventDefault()
        }
      >
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
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <button
            type="button"
            onClick={() => setScannerVisible(!isScannerVisible)}
            className={`h-[52px] px-6 rounded-lg font-semibold shadow-md whitespace-nowrap 
              ${
                isScannerVisible
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
              }`}
          >
            {isScannerVisible ? "Close Scanner" : "Scan QR Code"}
          </button>
        </div>

        {isScannerVisible && (
          <div id="qr-reader" className="p-4 bg-gray-100 rounded-xl"></div>
        )}

        {/* Prefilled Fields (always) */}
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

          {/* Admin-only form fields */}
          {(isAdmin || isTechnician) && (
            <>
              {[
                ["branchLocation", "Branch/Location"],
                ["address", "Address"],
                ["location", "Location"],
                ["pincode", "Pincode/Area"],
                ["brand", "Brand"],
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
                    value={formData[name]}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              ))}

              {/* Dates */}
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
                  Expiry Date
                </span>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate || ''}
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
                  // required
                />
              </div>

              {/* Dropdowns */}
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
                  <select
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Service Type + Date */}
              <div className="relative">
                <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
                  Type of Service
                </span>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select a service type</option>
                  <option value="Routine Maintenance">
                    Routine Maintenance
                  </option>
                  <option value="Repair">Repair</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Calibration">Calibration</option>
                </select>
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

              {/* Textareas */}
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

        {/* Submit only for Admins and technicians*/}
        {(isAdmin || isTechnician) && (
          <div className="flex justify-center pt-4">
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

      {/* Report History (always visible) */}
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
                      className={actionBtnPrimary}
                    >
                      View report
                    </button>

                    {/* {rep.pdfUrl && (
                      <button
                        type="button"
                        // onClick={() =>
                        //   triggerDownload(rep.pdfUrl, `report-${rep.equipmentId}.pdf`)
                        // }
                        onClick={() => openInNewTab(rep.pdfUrl)}
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-black shadow-sm"
                        title="Download PDF"
                      >
                        Download PDF
                      </button>
                    )}
                    {rep.csvUrl && (
                      <button
                        type="button"
                        // onClick={() =>
                        //   triggerDownload(rep.csvUrl, `report-${rep.equipmentId}.csv`)
                        // }
                        onClick={() => openInNewTab(rep.csvUrl)}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                        title="Download CSV"
                      >
                        Download CSV
                      </button>
                    )} */}

                    {rep.pdfUrl && (
                      <a
                        href={rep.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`${actionBtnBase} bg-gray-800 text-white hover:bg-black`}
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
                        className={`${actionBtnBase} bg-gray-200 text-gray-800 hover:bg-gray-300`}
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

      {/* Report Modal */}
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
                    {/* {selectedReport[key] || "â€”"} */}
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
