// import React, { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchReportsByEquipment } from "../../redux/features/report/reportSlice";

// const ORANGE = "#DC6D18";

// function fmtDateTime(d) {
//   if (!d) return "-";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return "-";
//   return dt.toLocaleString();
// }
// function fmtDate(d) {
//   if (!d) return "-";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return "-";
//   return dt.toLocaleDateString();
// }

// export default function ReportListModal({ open, onClose, item }) {
//   const dispatch = useDispatch();
//   const { list, listLoading } = useSelector((s) => s.report);

//   useEffect(() => {
//     if (open && item) {
//       dispatch(fetchReportsByEquipment({ equipmentId: item._id || item.equipmentId }));
//     }
//   }, [open, item, dispatch]);

//   const rows = useMemo(() => {
//     // Normalize rows to match Excel column order
//     return (list || []).map((r) => ({
//       Date: fmtDateTime(r.createdAt),
//       "Branch/Location": r.branchLocation || "-",
//       Address: r.address || "-",
//       Location: r.location || "-",
//       "Pincode/Area": r.pincode || "-",
//       Brand: r.brand || "-",
//       Type: r.type || "-",
//       Capacity: r.capacity || "-",
//       "Instalation Date": fmtDate(r.installationDate),
//       "Can Serial Number.": r.canSerialNumber || "-",
//       "Refilling Due": fmtDate(r.refillingDue),
//       Product: r.product || "-",
//       Others: r.others || "-",
//       Tag: r.tag || "-",
//       "Safety pin": r.safetyPin || "-",
//       "Pressure Guage": r.pressureGuage || "-",
//       "Valve support": r.valveSupport || "-",
//       Corrossion: r.corrossion || "-",
//       "Base Cap": r.baseCap || "-",
//       "Powder Flow": r.powderFlow || "-",
//       Remarks: r.remarks || "-",
//       _id: r._id, // keep id for react key
//     }));
//   }, [list]);

//   const headers = [
//     "Date",
//     "Branch/Location",
//     "Address",
//     "Location",
//     "Pincode/Area",
//     "Brand",
//     "Type",
//     "Capacity",
//     "Instalation Date",
//     "Can Serial Number.",
//     "Refilling Due",
//     "Product",
//     "Others",
//     "Tag",
//     "Safety pin",
//     "Pressure Guage",
//     "Valve support",
//     "Corrossion",
//     "Base Cap",
//     "Powder Flow",
//     "Remarks",
//   ];

//   const exportCSV = () => {
//     const escapeCSV = (v) => {
//       const s = (v ?? "").toString();
//       if (s.includes(",") || s.includes("\n") || s.includes('"')) {
//         return `"${s.replace(/"/g, '""')}"`;
//       }
//       return s;
//     };
//     const heading = headers.map(escapeCSV).join(",");
//     const lines = rows.map((row) =>
//       headers.map((h) => escapeCSV(row[h])).join(",")
//     );
//     const csv = [heading, ...lines].join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     const name =
//       (item?.equipmentName ? item.equipmentName + "-" : "") + "reports.csv";
//     a.download = name.replace(/\s+/g, "_");
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6">
//       {/* Backdrop */}
//       <div className="fixed inset-0 bg-black/40" onClick={onClose} />

//       {/* Card */}
//       <div className="relative w-[95vw] max-w-[1200px] bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
//         {/* Header */}
//         <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
//           <div>
//             <h3 className="text-xl font-bold text-gray-900">Reports</h3>
//             <p className="text-sm text-gray-500">
//               {item?.equipmentName} {item?.modelSeries ? `• ${item.modelSeries}` : ""}
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={exportCSV}
//               className="px-3 py-1.5 rounded-lg border-2"
//               style={{ borderColor: ORANGE, color: ORANGE }}
//               title="Export CSV"
//             >
//               Export CSV
//             </button>
//             <button
//               onClick={onClose}
//               className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100"
//             >
//               ✕
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="flex-1 overflow-auto px-6 py-4">
//           {listLoading ? (
//             <div className="text-sm text-gray-600">Loading…</div>
//           ) : rows.length === 0 ? (
//             <div className="text-sm text-gray-600">No reports yet.</div>
//           ) : (
//             <div className="overflow-x-auto rounded-xl border border-gray-200">
//               <table className="min-w-full text-sm">
//                 <thead
//                   className="sticky top-0 z-10 text-left"
//                   style={{ backgroundColor: "#FFF7F2" /* light orange tint */ }}
//                 >
//                   <tr>
//                     {headers.map((h) => (
//                       <th
//                         key={h}
//                         className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap border-b"
//                         style={{ borderColor: "#F3E8E1" }}
//                       >
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {rows.map((row) => (
//                     <tr key={row._id} className="hover:bg-orange-50/40">
//                       {headers.map((h) => (
//                         <td
//                           key={h}
//                           className="px-4 py-3 text-gray-800 align-top border-b"
//                           style={{ borderColor: "#F3E8E1", whiteSpace: "nowrap" }}
//                         >
//                           {row[h]}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="sticky bottom-0 px-6 py-3 border-t bg-white rounded-b-2xl flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 rounded-lg border-2 text-[15px] font-medium"
//             style={{ borderColor: ORANGE, color: ORANGE }}
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReportsByEquipment } from "../../redux/features/report/reportSlice";

const ORANGE = "#DC6D18";

const fmtDateTime = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleString();
};
const fmtDate = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString();
};

export default function ReportListModal({ open, onClose, item }) {
  const dispatch = useDispatch();
  const { list = [], listLoading } = useSelector((s) => s.report);

  useEffect(() => {
    if (open && item) {
      dispatch(
        fetchReportsByEquipment({ equipmentId: item._id || item.equipmentId })
      );
    }
  }, [open, item, dispatch]);

  // ✅ sanitize list before use
  const safeList = useMemo(
    () =>
      Array.isArray(list) ? list.filter((x) => x && typeof x === "object") : [],
    [list]
  );

  const headers = [
    "Date",
    "Branch/Location",
    "Address",
    "Location",
    "Pincode/Area",
    "Brand",
    "Type",
    "Capacity",
    "Instalation Date",
    "Can Serial Number.",
    "Refilling Due",
    "Product",
    "Others",
    "Tag",
    "Safety pin",
    "Pressure Guage",
    "Valve support",
    "Corrossion",
    "Base Cap",
    "Powder Flow",
    "Remarks",
  ];

  const rows = useMemo(
    () =>
      safeList.map((r) => ({
        _id: r?._id,
        Date: fmtDateTime(r?.createdAt || r?.report?.createdAt),
        "Branch/Location": r?.branchLocation || "-",
        Address: r?.address || "-",
        Location: r?.location || "-",
        "Pincode/Area": r?.pincode || "-",
        Brand: r?.brand || "-",
        Type: r?.type || "-",
        Capacity: r?.capacity || "-",
        "Instalation Date": fmtDate(r?.installationDate),
        "Can Serial Number.": r?.canSerialNumber || "-",
        "Refilling Due": fmtDate(r?.refillingDue),
        Product: r?.product || "-",
        Others: r?.others || "-",
        Tag: r?.tag || "-",
        "Safety pin": r?.safetyPin || "-",
        "Pressure Guage": r?.pressureGuage || "-",
        "Valve support": r?.valveSupport || "-",
        Corrossion: r?.corrossion || "-",
        "Base Cap": r?.baseCap || "-",
        "Powder Flow": r?.powderFlow || "-",
        Remarks: r?.remarks || "-",
      })),
    [safeList]
  );

  // --- CSV helpers ---
  const csvEscape = (v) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  const buildCSV = () => {
    const head = headers.map(csvEscape).join(",");
    const body = rows
      .map((row) => headers.map((h) => csvEscape(row[h])).join(","))
      .join("\r\n");
    // Add UTF-8 BOM so Excel opens it correctly
    return "\uFEFF" + head + "\r\n" + body;
  };

  const handleDownloadCSV = () => {
    if (!rows.length) return;
    const csv = buildCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const eq = (item?.equipmentName || "equipment").replace(/\s+/g, "_");
    const dt = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eq}_reports_${dt}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-6">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-[95vw] max-w-[1200px] bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Reports</h3>
            <p className="text-sm text-gray-500">
              {item?.equipmentName}{" "}
              {item?.modelSeries ? `• ${item.modelSeries}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {listLoading ? (
            <div className="text-sm text-gray-600">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-600">No reports yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead
                  className="sticky top-0 z-10 text-left"
                  style={{ backgroundColor: "#FFF7F2" }}
                >
                  <tr>
                    {headers.map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap border-b"
                        style={{ borderColor: "#F3E8E1" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row._id || i} className="hover:bg-orange-50/40">
                      {headers.map((h) => (
                        <td
                          key={h}
                          className="px-4 py-3 text-gray-800 align-top border-b"
                          style={{
                            borderColor: "#F3E8E1",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 px-6 py-3 border-t bg-white rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={handleDownloadCSV}
            disabled={listLoading || rows.length === 0}
            className={`px-4 py-2 rounded-lg text-[15px] font-medium text-white ${
              listLoading || rows.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#DC6D18] hover:bg-[#B85B14]"
            }`}
            title={rows.length === 0 ? "No data to download" : "Download CSV"}
          >
            Download CSV
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-2 text-[15px] font-medium"
            style={{ borderColor: ORANGE, color: ORANGE }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
