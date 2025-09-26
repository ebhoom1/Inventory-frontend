// // // src/pages/RequestService.jsx
// // import React, { useState, useEffect } from "react";
// // import { Html5Qrcode } from "html5-qrcode";
// // import { useDispatch, useSelector } from "react-redux";
// // import {
// //   createServiceRequest,
// //   resetServiceRequestState,
// // } from "../../redux/features/serviceRequests/serviceRequestSlice";
// // // import {
// // //   createReport,
// // //   resetServiceRequestState,
// // // } from "../../redux/features/serviceRequests/serviceRequestSlice";
// // import Swal from "sweetalert2";
// // import { API_URL } from "../../../utils/apiConfig";

// // const qrConfig = { fps: 10, qrbox: 400 };
// // const isMongoId = (s) => typeof s === "string" && /^[a-f0-9]{24}$/i.test(s);

// // function RequestService() {
// //   const dispatch = useDispatch();
// //   const { loading, error, successMessage } = useSelector(
// //     (s) => s.serviceRequests
// //   );

// //   //user has access to qr scanning and report history
// //   // --- User Role Checks ---
// //   const userTypeRaw = useSelector(
// //     (s) =>
// //       s.user?.userData?.validUserOne?.adminType ||
// //       s.user?.userData?.role ||
// //       s.user?.userData?.userType ||
// //       "user"
// //   );
// //   const userType = String(userTypeRaw).toLowerCase();
// //   const isStaff = ["admin", "superadmin", "megaadmin"].includes(userType);
// //   const historyOnly = !isStaff; // true if regular user

// //   const [formData, setFormData] = useState({
// //     equipmentId: "",
// //     equipmentName: "",
// //     userId: "",
// //     serviceType: "",
// //     date: "",
// //     faultDescription: "",
// //     branchLocation: "",
// //     address: "",
// //     location: "",
// //     pincode: "",
// //     brand: "",
// //     type: "",
// //     capacity: "",
// //     installationDate: "",
// //     canSerialNumber: "",
// //     refillingDue: "",
// //     product: "",
// //     others: "",
// //     tag: "",
// //     safetyPin: "",
// //     pressureGauge: "",
// //     valveSupport: "",
// //     corrosion: "",
// //     baseCap: "",
// //     powderFlow: "",
// //     remarks: "",
// //   });

// //   const [isScannerVisible, setScannerVisible] = useState(false);
// //   const [scannerInstance, setScannerInstance] = useState(null);
// //   const [reportHistory, setReportHistory] = useState([]);

// //   const [selectedReport, setSelectedReport] = useState(null);
// //   const [showReportModal, setShowReportModal] = useState(false);

// //   const openReportModal = (rep) => {
// //     setSelectedReport(rep);
// //     setShowReportModal(true);
// //   };
// //   const closeReportModal = () => {
// //     setSelectedReport(null);
// //     setShowReportModal(false);
// //   };

// //   const triggerDownload = (url, filename = "report") => {
// //     const a = document.createElement("a");
// //     a.href = url;
// //     a.setAttribute("download", filename);
// //     a.target = "_blank";
// //     document.body.appendChild(a);
// //     a.click();
// //     a.remove();
// //   };

// //   const REPORT_FIELDS = [
// //     ["Equipment ID", "equipmentId"],
// //     ["Equipment Name", "equipmentName"],
// //     ["Service Type", "serviceType"],
// //     ["Date", "date"],
// //     ["Branch/Location", "branchLocation"],
// //     ["Address", "address"],
// //     ["Location", "location"],
// //     ["Pincode", "pincode"],
// //     ["Brand", "brand"],
// //     ["Type", "type"],
// //     ["Capacity", "capacity"],
// //     ["Installation Date", "installationDate"],
// //     ["Can Serial Number", "canSerialNumber"],
// //     ["Refilling Due", "refillingDue"],
// //     ["Product", "product"],
// //     ["Others", "others"],
// //     ["Tag", "tag"],
// //     ["Safety Pin", "safetyPin"],
// //     ["Pressure Gauge", "pressureGauge"],
// //     ["Valve Support", "valveSupport"],
// //     ["Corrosion", "corrosion"],
// //     ["Base Cap", "baseCap"],
// //     ["Powder Flow", "powderFlow"],
// //     ["Remarks", "remarks"],
// //     ["Fault Description", "faultDescription"],
// //   ];

// //   // --- QR scan + DB fetch ---
// //   useEffect(() => {
// //     if (isScannerVisible) {
// //       const scanner = new Html5Qrcode("qr-reader");
// //       setScannerInstance(scanner);

// //       const qrCodeSuccessCallback = async (decodedText) => {
// //         let scanned = {};
// //         try {
// //           scanned = JSON.parse(decodedText);
// //         } catch {
// //           scanned = { equipmentId: decodedText };
// //         }

// //         const maybeId = scanned.equipmentId || scanned._id || decodedText;
// //         let url;

// //         if (isMongoId(maybeId)) {
// //           url = `${API_URL}/api/equipment/${encodeURIComponent(maybeId)}`;
// //         } else {
// //           url = `${API_URL}/api/equipment/by-eid/${encodeURIComponent(
// //             maybeId
// //           )}`;
// //         }

// //         try {
// //           const res = await fetch(url);
// //           const data = await res.json();

// //           if (!res.ok || data?.success === false) {
// //             Swal.fire({
// //               title: "Not Found",
// //               text: "Equipment not found",
// //               icon: "error",
// //             });
// //             setScannerVisible(false);
// //             return;
// //           }

// //           const eq = data.equipment || data;

// //           setFormData((prev) => ({
// //             ...prev,
// //             equipmentId: eq.equipmentId || prev.equipmentId,
// //             equipmentName: eq.equipmentName || prev.equipmentName,
// //             userId: eq.userId || prev.userId,
// //           }));

// //           Swal.fire({
// //             title: "Scanned!",
// //             text: eq.equipmentName || eq.equipmentId || "QR read",
// //             icon: "success",
// //             timer: 1200,
// //             showConfirmButton: false,
// //           });

// //           // ✅ FIXED FETCH BLOCK
// //           if (eq.equipmentId) {
// //             const repRes = await fetch(
// //               `${API_URL}/api/reports?equipmentId=${encodeURIComponent(
// //                 eq.equipmentId
// //               )}`
// //             );
// //             const reportsData = await repRes.json();

// //             let reports = [];
// //             if (Array.isArray(reportsData)) {
// //               reports = reportsData;
// //             } else if (reportsData && Array.isArray(reportsData.items)) {
// //               reports = reportsData.items;
// //             } else {
// //               console.warn("⚠️ Unexpected reports API response:", reportsData);
// //             }

// //             console.log("✅ Fetched reports:", reports);

// //             if (repRes.ok && reports.length > 0) {
// //               const sorted = [...reports].sort(
// //                 (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
// //               );
// //               setReportHistory(sorted);

// //               const lastReport = sorted[0];
// //               setFormData((prev) => ({
// //                 ...prev,
// //                 equipmentId: eq.equipmentId || prev.equipmentId,
// //                 equipmentName: eq.equipmentName || prev.equipmentName,
// //                 userId: eq.userId || prev.userId,
// //                 branchLocation:
// //                   lastReport.branchLocation ?? prev.branchLocation,
// //                 address: lastReport.address ?? prev.address,
// //                 location: lastReport.location ?? prev.location,
// //                 pincode: lastReport.pincode ?? prev.pincode,
// //                 brand: lastReport.brand ?? prev.brand,
// //                 type: lastReport.type ?? prev.type,
// //                 capacity: lastReport.capacity ?? prev.capacity,
// //                 installationDate: lastReport.installationDate
// //                   ? lastReport.installationDate.slice(0, 10)
// //                   : prev.installationDate,
// //                 canSerialNumber:
// //                   lastReport.canSerialNumber ?? prev.canSerialNumber,
// //                 refillingDue: lastReport.refillingDue
// //                   ? lastReport.refillingDue.slice(0, 10)
// //                   : prev.refillingDue,
// //                 product: lastReport.product ?? prev.product,
// //                 others: lastReport.others ?? prev.others,
// //                 tag: lastReport.tag ?? prev.tag,
// //                 safetyPin: lastReport.safetyPin ?? prev.safetyPin,
// //                 pressureGauge: lastReport.pressureGauge ?? prev.pressureGauge,
// //                 valveSupport: lastReport.valveSupport ?? prev.valveSupport,
// //                 corrosion: lastReport.corrosion ?? prev.corrosion,
// //                 baseCap: lastReport.baseCap ?? prev.baseCap,
// //                 powderFlow: lastReport.powderFlow ?? prev.powderFlow,
// //                 remarks: lastReport.remarks ?? prev.remarks,
// //                 faultDescription:
// //                   lastReport.faultDescription ?? prev.faultDescription,
// //                 serviceType: lastReport.serviceType ?? prev.serviceType,
// //               }));
// //             } else {
// //               setReportHistory([]);
// //             }
// //           }
// //         } catch (err) {
// //           console.error("QR fetch error:", err);
// //           Swal.fire({
// //             title: "Error",
// //             text: "Could not fetch equipment info",
// //             icon: "error",
// //           });
// //         }

// //         setScannerVisible(false);
// //       };

// //       scanner
// //         .start({ facingMode: "user" }, qrConfig, qrCodeSuccessCallback)
// //         .catch(() => {
// //           Swal.fire({
// //             title: "Camera Error",
// //             text: "Grant camera permission.",
// //             icon: "error",
// //           });
// //           setScannerVisible(false);
// //         });
// //     } else if (scannerInstance?.isScanning) {
// //       scannerInstance.stop();
// //     }

// //     return () => {
// //       if (scannerInstance?.isScanning) scannerInstance.stop();
// //     };
// //   }, [isScannerVisible]);

// //   // --- Submission feedback ---
// //   useEffect(() => {
// //     if (successMessage) {
// //       Swal.fire({
// //         title: "Submitted",
// //         text: successMessage,
// //         icon: "success",
// //         timer: 1500,
// //         showConfirmButton: false,
// //       });
// //       setFormData({
// //         equipmentId: "",
// //         equipmentName: "",
// //         userId: "",
// //         serviceType: "",
// //         date: "",
// //         faultDescription: "",
// //         branchLocation: "",
// //         address: "",
// //         location: "",
// //         pincode: "",
// //         brand: "",
// //         type: "",
// //         capacity: "",
// //         installationDate: "",
// //         canSerialNumber: "",
// //         refillingDue: "",
// //         product: "",
// //         others: "",
// //         tag: "",
// //         safetyPin: "",
// //         pressureGauge: "",
// //         valveSupport: "",
// //         corrosion: "",
// //         baseCap: "",
// //         powderFlow: "",
// //         remarks: "",
// //       });
// //       setReportHistory([]);
// //       dispatch(resetServiceRequestState());
// //     }
// //     if (error) {
// //       Swal.fire({ title: "Failed", text: error, icon: "error" });
// //       dispatch(resetServiceRequestState());
// //     }
// //   }, [successMessage, error, dispatch]);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((p) => ({ ...p, [name]: value }));
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     dispatch(createServiceRequest(formData));
// //     // dispatch(createReport(formData));
// //   };

// //   const inputClass =
// //     "w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg " +
// //     "bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]";

// //   return (
// //     <div className="w-full max-w-5xl mx-auto">
// //       {/* <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
// //         Request Equipment Service
// //       </h2> */}
// //       <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
// //         {historyOnly ? "Service History" : "Request Equipment Service"}
// //       </h2>

// //       {/* <form className="space-y-6" onSubmit={handleSubmit}> */}
// //       <form
// //         className="space-y-6"
// //         onSubmit={historyOnly ? (e) => e.preventDefault() : handleSubmit}
// //       >
// //         {/* Equipment ID + QR Scanner */}
// //         <div className="flex items-end gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
// //           <div className="flex-1">
// //             <label className="text-sm font-semibold text-gray-600 mb-1 block">
// //               Equipment ID
// //             </label>
// //             <input
// //               type="text"
// //               name="equipmentId"
// //               readOnly
// //               placeholder="Prefilled after scan"
// //               value={formData.equipmentId}
// //               onChange={handleChange}
// //               className={inputClass}
// //               required
// //             />
// //           </div>
// //           <button
// //             type="button"
// //             onClick={() => setScannerVisible(!isScannerVisible)}
// //             className={`h-[52px] px-6 rounded-lg font-semibold shadow-md whitespace-nowrap 
// //               ${
// //                 isScannerVisible
// //                   ? "bg-red-600 text-white hover:bg-red-700"
// //                   : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
// //               }`}
// //           >
// //             {isScannerVisible ? "Close Scanner" : "Scan QR Code"}
// //           </button>
// //         </div>

// //         {isScannerVisible && (
// //           <div id="qr-reader" className="p-4 bg-gray-100 rounded-xl"></div>
// //         )}

// //         {/* Fields Grid */}
// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 pt-4">
// //           {/* Prefilled fields */}
// //           <div className="relative">
// //             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //               Equipment Name
// //             </span>
// //             <input
// //               type="text"
// //               value={formData.equipmentName}
// //               readOnly
// //               placeholder="Prefilled after scan"
// //               className={inputClass}
// //             />
// //           </div>
// //           <div className="relative">
// //             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //               User ID
// //             </span>
// //             <input
// //               type="text"
// //               value={formData.userId}
// //               readOnly
// //               placeholder="Prefilled after scan"
// //               className={inputClass}
// //             />
// //           </div>
          

// //           {!historyOnly && (
// //             <div>
// //               {/* everything else from here down to the submit button */}

// //               {/* Text Inputs */}
// //               {[
// //                 ["branchLocation", "Branch/Location"],
// //                 ["address", "Address"],
// //                 ["location", "Location"],
// //                 ["pincode", "Pincode/Area"],
// //                 ["brand", "Brand"],
// //                 ["type", "Type"],
// //                 ["capacity", "Capacity"],
// //                 ["canSerialNumber", "Can Serial Number"],
// //                 ["product", "Product"],
// //                 ["others", "Others"],
// //               ].map(([name, label]) => (
// //                 <div className="relative" key={name}>
// //                   <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                     {label}
// //                   </span>
// //                   <input
// //                     name={name}
// //                     value={formData[name]}
// //                     onChange={handleChange}
// //                     className={inputClass}
// //                   />
// //                 </div>
// //               ))}

// //               {/* Dates */}
// //               <div className="relative">
// //                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                   Installation Date
// //                 </span>
// //                 <input
// //                   type="date"
// //                   name="installationDate"
// //                   value={formData.installationDate}
// //                   onChange={handleChange}
// //                   className={inputClass}
// //                 />
// //               </div>
// //               <div className="relative">
// //                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                   Refilling Due
// //                 </span>
// //                 <input
// //                   type="date"
// //                   name="refillingDue"
// //                   value={formData.refillingDue}
// //                   onChange={handleChange}
// //                   className={inputClass}
// //                 />
// //               </div>

// //               {/* Dropdowns */}
// //               {[
// //                 ["tag", "Tag", ["yes", "no"]],
// //                 ["safetyPin", "Safety Pin", ["yes", "no"]],
// //                 ["pressureGauge", "Pressure Gauge", ["Green", "Red"]],
// //                 ["valveSupport", "Valve Support", ["yes", "no"]],
// //                 ["corrosion", "Corrosion", ["Fine", "Rust"]],
// //                 ["baseCap", "Base Cap", ["Ok", "Damaged"]],
// //                 ["powderFlow", "Powder Flow", ["good", "bad"]],
// //               ].map(([name, label, options]) => (
// //                 <div className="relative" key={name}>
// //                   <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                     {label}
// //                   </span>
// //                   <select
// //                     name={name}
// //                     value={formData[name]}
// //                     onChange={handleChange}
// //                     className={inputClass}
// //                   >
// //                     <option value="">Select</option>
// //                     {options.map((opt) => (
// //                       <option key={opt} value={opt}>
// //                         {opt}
// //                       </option>
// //                     ))}
// //                   </select>
// //                 </div>
// //               ))}

// //               {/* Service Type + Date */}
// //               <div className="relative">
// //                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                   Type of Service
// //                 </span>
// //                 <select
// //                   name="serviceType"
// //                   value={formData.serviceType}
// //                   onChange={handleChange}
// //                   className={inputClass}
// //                   required
// //                 >
// //                   <option value="">Select a service type</option>
// //                   <option value="Routine Maintenance">
// //                     Routine Maintenance
// //                   </option>
// //                   <option value="Repair">Repair</option>
// //                   <option value="Inspection">Inspection</option>
// //                   <option value="Calibration">Calibration</option>
// //                 </select>
// //               </div>
// //               <div className="relative">
// //                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                   Date
// //                 </span>
// //                 <input
// //                   type="date"
// //                   name="date"
// //                   value={formData.date}
// //                   onChange={handleChange}
// //                   className={inputClass}
// //                   required
// //                 />
// //               </div>

// //               {/* Textareas */}
// //               <div className="relative md:col-span-2">
// //                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                   Remarks
// //                 </span>
// //                 <textarea
// //                   name="remarks"
// //                   value={formData.remarks}
// //                   onChange={handleChange}
// //                   rows="2"
// //                   className={inputClass}
// //                 ></textarea>
// //               </div>
// //               <div className="relative md:col-span-2">
// //                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
// //                   Fault Description
// //                 </span>
// //                 <textarea
// //                   name="faultDescription"
// //                   value={formData.faultDescription}
// //                   onChange={handleChange}
// //                   rows="4"
// //                   className={inputClass}
// //                   required
// //                 ></textarea>
// //               </div>
// //             </div>
// //           )}
// //         </div>

// //         {/* Submit */}
// //         {/* <div className="flex justify-center pt-4">
// //           <button
// //             type="submit"
// //             disabled={loading}
// //             className={`px-8 py-3 rounded-lg font-semibold shadow-md ${
// //               loading
// //                 ? "bg-gray-300 text-gray-600"
// //                 : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
// //             }`}
// //           >
// //             {loading ? "Submitting..." : "Request Service"}
// //           </button>
// //         </div> */}
// //         {!historyOnly && (
// //           <div className="flex justify-center pt-4">
// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className={`px-8 py-3 rounded-lg font-semibold shadow-md ${
// //                 loading
// //                   ? "bg-gray-300 text-gray-600"
// //                   : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
// //               }`}
// //             >
// //               {loading ? "Submitting..." : "Request Service"}
// //             </button>
// //           </div>
// //         )}
// //       </form>

// //       {/* Report History Section */}
// //           {reportHistory.length > 0 && (
// //             <div className="mt-8 border-t pt-6">
// //               <h3 className="text-xl font-semibold text-[#DC6D18] mb-4">
// //                 Previous Reports
// //               </h3>
// //               <div className="space-y-4">
// //                 {reportHistory.map((rep, idx) => (
// //                   <div
// //                     key={rep._id || idx}
// //                     className="border rounded-lg overflow-hidden shadow-sm"
// //                   >
// //                     <div className="bg-orange-50 px-4 py-3 flex flex-wrap gap-3 justify-between items-center">
// //                       <div className="min-w-0">
// //                         <div className="font-semibold truncate">
// //                           {rep.title ||
// //                             `Report - ${new Date(
// //                               rep.createdAt
// //                             ).toLocaleDateString()}`}
// //                         </div>
// //                         {rep.createdAt && (
// //                           <div className="text-sm text-gray-600">
// //                             {new Date(rep.createdAt).toLocaleString()}
// //                           </div>
// //                         )}
// //                       </div>
// //                       <div className="flex gap-2">
// //                         <button
// //                           type="button"
// //                           onClick={() => openReportModal(rep)}
// //                           className="px-4 py-2 rounded-lg bg-[#DC6D18] text-white hover:bg-[#B85B14] shadow-sm"
// //                         >
// //                           View report
// //                         </button>

// //                         {rep.pdfUrl && (
// //                           <button
// //                             type="button"
// //                             onClick={() =>
// //                               triggerDownload(
// //                                 rep.pdfUrl,
// //                                 `report-${rep.equipmentId}.pdf`
// //                               )
// //                             }
// //                             className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-black shadow-sm"
// //                             title="Download PDF"
// //                           >
// //                             Download PDF
// //                           </button>
// //                         )}
// //                         {rep.csvUrl && (
// //                           <button
// //                             type="button"
// //                             onClick={() =>
// //                               triggerDownload(
// //                                 rep.csvUrl,
// //                                 `report-${rep.equipmentId}.csv`
// //                               )
// //                             }
// //                             className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
// //                             title="Download CSV"
// //                           >
// //                             Download CSV
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}

// //       {/* Report Modal */}
// //       {showReportModal && selectedReport && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center">
// //           <div
// //             className="absolute inset-0 bg-black/50"
// //             onClick={closeReportModal}
// //             aria-label="X"
// //           />
// //           <div className="relative bg-white w-[95vw] max-w-3xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
// //             <div className="flex items-center justify-between mb-4 sticky bg-white">
// //               <h4 className="text-lg font-semibold">
// //                 {selectedReport.title ||
// //                   `Report - ${new Date(
// //                     selectedReport.createdAt
// //                   ).toLocaleDateString()}`}
// //               </h4>
// //               <button
// //                 onClick={closeReportModal}
// //                 className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
// //               >
// //                 Close
// //               </button>
// //             </div>

// //             {/* Data Table */}
// //             <div className="overflow-x-auto border rounded-lg">
// //               <table className="min-w-full text-sm">
// //                 <thead className="bg-gray-100">
// //                   <tr>
// //                     <th className="text-left px-3 py-2 font-semibold w-48">
// //                       Field
// //                     </th>
// //                     <th className="text-left px-3 py-2 font-semibold">Value</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {REPORT_FIELDS.map(([label, key]) => {
// //                     let val = selectedReport[key];
// //                     if (!val) return null;
// //                     if (
// //                       [
// //                         "date",
// //                         "installationDate",
// //                         "refillingDue",
// //                         "createdAt",
// //                         "updatedAt",
// //                       ].includes(key)
// //                     ) {
// //                       try {
// //                         val = new Date(val).toLocaleString();
// //                       } catch {}
// //                     }
// //                     return (
// //                       <tr key={key} className="border-t">
// //                         <td className="px-3 py-2 font-medium text-gray-700">
// //                           {label}
// //                         </td>
// //                         <td className="px-3 py-2 break-words">{String(val)}</td>
// //                       </tr>
// //                     );
// //                   })}
// //                 </tbody>
// //               </table>
// //             </div>

// //             {/* Download Buttons */}
// //             <div className="mt-4 flex gap-3">
// //               <button
// //                 type="button"
// //                 disabled={!selectedReport.pdfUrl}
// //                 onClick={() =>
// //                   selectedReport.pdfUrl &&
// //                   triggerDownload(
// //                     selectedReport.pdfUrl,
// //                     `report-${selectedReport.equipmentId}.pdf`
// //                   )
// //                 }
// //                 className={`px-4 py-2 rounded-lg shadow-sm ${
// //                   selectedReport.pdfUrl
// //                     ? "bg-gray-800 text-white hover:bg-black"
// //                     : "bg-gray-300 text-gray-500 cursor-not-allowed"
// //                 }`}
// //               >
// //                 Download PDF
// //               </button>

// //               <button
// //                 type="button"
// //                 disabled={!selectedReport.csvUrl}
// //                 onClick={() =>
// //                   selectedReport.csvUrl &&
// //                   triggerDownload(
// //                     selectedReport.csvUrl,
// //                     `report-${selectedReport.equipmentId}.csv`
// //                   )
// //                 }
// //                 className={`px-4 py-2 rounded-lg shadow-sm ${
// //                   selectedReport.csvUrl
// //                     ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
// //                     : "bg-gray-300 text-gray-500 cursor-not-allowed"
// //                 }`}
// //               >
// //                 Download CSV
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default RequestService;



// import React, { useState, useEffect } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   createServiceRequest,
//   resetServiceRequestState,
// } from "../../redux/features/serviceRequests/serviceRequestSlice";
// import Swal from "sweetalert2";
// import { API_URL } from "../../../utils/apiConfig";

// const qrConfig = { fps: 10, qrbox: 400 };
// const isMongoId = (s) => typeof s === "string" && /^[a-f0-9]{24}$/i.test(s);

// function RequestService() {
//   const dispatch = useDispatch();
//   const { loading, error, successMessage } = useSelector(
//     (s) => s.serviceRequests
//   );

//   // --- User Role Checks ---
//   const userTypeRaw = useSelector(
//     (s) =>
//       s.user?.userData?.validUserOne?.adminType ||
//       s.user?.userData?.role ||
//       s.user?.userData?.userType ||
//       "user"
//   );
//   const userType = String(userTypeRaw).toLowerCase().replace(/\s+/g, "");
//   const isStaff = ["admin", "superadmin", "megaadmin"].includes(userType);
//   const historyOnly = !isStaff;

//   const [formData, setFormData] = useState({
//     equipmentId: "",
//     equipmentName: "",
//     userId: "",
//     serviceType: "",
//     date: "",
//     faultDescription: "",
//     branchLocation: "",
//     address: "",
//     location: "",
//     pincode: "",
//     brand: "",
//     type: "",
//     capacity: "",
//     installationDate: "",
//     canSerialNumber: "",
//     refillingDue: "",
//     product: "",
//     others: "",
//     tag: "",
//     safetyPin: "",
//     pressureGauge: "",
//     valveSupport: "",
//     corrosion: "",
//     baseCap: "",
//     powderFlow: "",
//     remarks: "",
//   });

//   const [isScannerVisible, setScannerVisible] = useState(false);
//   const [scannerInstance, setScannerInstance] = useState(null);
//   const [reportHistory, setReportHistory] = useState([]);

//   const [selectedReport, setSelectedReport] = useState(null);
//   const [showReportModal, setShowReportModal] = useState(false);

//   const openReportModal = (rep) => {
//     setSelectedReport(rep);
//     setShowReportModal(true);
//   };
//   const closeReportModal = () => {
//     setSelectedReport(null);
//     setShowReportModal(false);
//   };

//   const triggerDownload = (url, filename = "report") => {
//     const a = document.createElement("a");
//     a.href = url;
//     a.setAttribute("download", filename);
//     a.target = "_blank";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   };

//   const REPORT_FIELDS = [
//     ["Equipment ID", "equipmentId"],
//     ["Equipment Name", "equipmentName"],
//     ["Service Type", "serviceType"],
//     ["Date", "date"],
//     ["Branch/Location", "branchLocation"],
//     ["Address", "address"],
//     ["Location", "location"],
//     ["Pincode", "pincode"],
//     ["Brand", "brand"],
//     ["Type", "type"],
//     ["Capacity", "capacity"],
//     ["Installation Date", "installationDate"],
//     ["Can Serial Number", "canSerialNumber"],
//     ["Refilling Due", "refillingDue"],
//     ["Product", "product"],
//     ["Others", "others"],
//     ["Tag", "tag"],
//     ["Safety Pin", "safetyPin"],
//     ["Pressure Gauge", "pressureGauge"],
//     ["Valve Support", "valveSupport"],
//     ["Corrosion", "corrosion"],
//     ["Base Cap", "baseCap"],
//     ["Powder Flow", "powderFlow"],
//     ["Remarks", "remarks"],
//     ["Fault Description", "faultDescription"],
//   ];

//   // --- Submission Feedback ---
//   useEffect(() => {
//     if (successMessage) {
//       Swal.fire({
//         title: "Submitted",
//         text: successMessage,
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//       });
//       setFormData({
//         equipmentId: "",
//         equipmentName: "",
//         userId: "",
//         serviceType: "",
//         date: "",
//         faultDescription: "",
//         branchLocation: "",
//         address: "",
//         location: "",
//         pincode: "",
//         brand: "",
//         type: "",
//         capacity: "",
//         installationDate: "",
//         canSerialNumber: "",
//         refillingDue: "",
//         product: "",
//         others: "",
//         tag: "",
//         safetyPin: "",
//         pressureGauge: "",
//         valveSupport: "",
//         corrosion: "",
//         baseCap: "",
//         powderFlow: "",
//         remarks: "",
//       });
//       setReportHistory([]);
//       dispatch(resetServiceRequestState());
//     }
//     if (error) {
//       Swal.fire({ title: "Failed", text: error, icon: "error" });
//       dispatch(resetServiceRequestState());
//     }
//   }, [successMessage, error, dispatch]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((p) => ({ ...p, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     dispatch(createServiceRequest(formData));
//   };

//   const inputClass =
//     "w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg " +
//     "bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]";

//   return (
//     <div className="w-full max-w-5xl mx-auto">
//       <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
//         {historyOnly ? "Service History" : "Request Equipment Service"}
//       </h2>

//       <form
//         className="space-y-6"
//         onSubmit={historyOnly ? (e) => e.preventDefault() : handleSubmit}
//       >
//         {/* QR Scanner & Equipment ID */}
//         <div className="flex items-end gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
//           <div className="flex-1">
//             <label className="text-sm font-semibold text-gray-600 mb-1 block">
//               Equipment ID
//             </label>
//             <input
//               type="text"
//               name="equipmentId"
//               readOnly
//               placeholder="Prefilled after scan"
//               value={formData.equipmentId}
//               onChange={handleChange}
//               className={inputClass}
//               required
//             />
//           </div>
//           <button
//             type="button"
//             onClick={() => setScannerVisible(!isScannerVisible)}
//             className={`h-[52px] px-6 rounded-lg font-semibold shadow-md whitespace-nowrap 
//               ${
//                 isScannerVisible
//                   ? "bg-red-600 text-white hover:bg-red-700"
//                   : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
//               }`}
//           >
//             {isScannerVisible ? "Close Scanner" : "Scan QR Code"}
//           </button>
//         </div>

//         {isScannerVisible && (
//           <div id="qr-reader" className="p-4 bg-gray-100 rounded-xl"></div>
//         )}

//         {/* Fields Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 pt-4">
//           {/* Prefilled fields */}
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//               Equipment Name
//             </span>
//             <input
//               type="text"
//               value={formData.equipmentName}
//               readOnly
//               placeholder="Prefilled after scan"
//               className={inputClass}
//             />
//           </div>
//           <div className="relative">
//             <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//               User ID
//             </span>
//             <input
//               type="text"
//               value={formData.userId}
//               readOnly
//               placeholder="Prefilled after scan"
//               className={inputClass}
//             />
//           </div>

//           {!historyOnly && (
//             <>
//               {/* Admin-only inputs */}
//               {[
//                 ["branchLocation", "Branch/Location"],
//                 ["address", "Address"],
//                 ["location", "Location"],
//                 ["pincode", "Pincode/Area"],
//                 ["brand", "Brand"],
//                 ["type", "Type"],
//                 ["capacity", "Capacity"],
//                 ["canSerialNumber", "Can Serial Number"],
//                 ["product", "Product"],
//                 ["others", "Others"],
//               ].map(([name, label]) => (
//                 <div className="relative" key={name}>
//                   <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                     {label}
//                   </span>
//                   <input
//                     name={name}
//                     value={formData[name]}
//                     onChange={handleChange}
//                     className={inputClass}
//                   />
//                 </div>
//               ))}

//               {/* Dates */}
//               <div className="relative">
//                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                   Installation Date
//                 </span>
//                 <input
//                   type="date"
//                   name="installationDate"
//                   value={formData.installationDate}
//                   onChange={handleChange}
//                   className={inputClass}
//                 />
//               </div>
//               <div className="relative">
//                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                   Refilling Due
//                 </span>
//                 <input
//                   type="date"
//                   name="refillingDue"
//                   value={formData.refillingDue}
//                   onChange={handleChange}
//                   className={inputClass}
//                 />
//               </div>

//               {/* Dropdowns */}
//               {[
//                 ["tag", "Tag", ["yes", "no"]],
//                 ["safetyPin", "Safety Pin", ["yes", "no"]],
//                 ["pressureGauge", "Pressure Gauge", ["Green", "Red"]],
//                 ["valveSupport", "Valve Support", ["yes", "no"]],
//                 ["corrosion", "Corrosion", ["Fine", "Rust"]],
//                 ["baseCap", "Base Cap", ["Ok", "Damaged"]],
//                 ["powderFlow", "Powder Flow", ["good", "bad"]],
//               ].map(([name, label, options]) => (
//                 <div className="relative" key={name}>
//                   <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                     {label}
//                   </span>
//                   <select
//                     name={name}
//                     value={formData[name]}
//                     onChange={handleChange}
//                     className={inputClass}
//                   >
//                     <option value="">Select</option>
//                     {options.map((opt) => (
//                       <option key={opt} value={opt}>
//                         {opt}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               ))}

//               {/* Service Type + Date */}
//               <div className="relative">
//                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                   Type of Service
//                 </span>
//                 <select
//                   name="serviceType"
//                   value={formData.serviceType}
//                   onChange={handleChange}
//                   className={inputClass}
//                   required
//                 >
//                   <option value="">Select a service type</option>
//                   <option value="Routine Maintenance">Routine Maintenance</option>
//                   <option value="Repair">Repair</option>
//                   <option value="Inspection">Inspection</option>
//                   <option value="Calibration">Calibration</option>
//                 </select>
//               </div>
//               <div className="relative">
//                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                   Date
//                 </span>
//                 <input
//                   type="date"
//                   name="date"
//                   value={formData.date}
//                   onChange={handleChange}
//                   className={inputClass}
//                   required
//                 />
//               </div>

//               {/* Textareas */}
//               <div className="relative md:col-span-2">
//                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                   Remarks
//                 </span>
//                 <textarea
//                   name="remarks"
//                   value={formData.remarks}
//                   onChange={handleChange}
//                   rows="2"
//                   className={inputClass}
//                 ></textarea>
//               </div>
//               <div className="relative md:col-span-2">
//                 <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18]">
//                   Fault Description
//                 </span>
//                 <textarea
//                   name="faultDescription"
//                   value={formData.faultDescription}
//                   onChange={handleChange}
//                   rows="4"
//                   className={inputClass}
//                   required
//                 ></textarea>
//               </div>
//             </>
//           )}
//         </div>

//         {!historyOnly && (
//           <div className="flex justify-center pt-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className={`px-8 py-3 rounded-lg font-semibold shadow-md ${
//                 loading
//                   ? "bg-gray-300 text-gray-600"
//                   : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
//               }`}
//             >
//               {loading ? "Submitting..." : "Request Service"}
//             </button>
//           </div>
//         )}
//       </form>

//       {/* Report History Section */}
//       {reportHistory.length > 0 && (
//         <div className="mt-8 border-t pt-6">
//           <h3 className="text-xl font-semibold text-[#DC6D18] mb-4">
//             Previous Reports
//           </h3>
//           <div className="space-y-4">
//             {reportHistory.map((rep, idx) => (
//               <div
//                 key={rep._id || idx}
//                 className="border rounded-lg overflow-hidden shadow-sm"
//               >
//                 <div className="bg-orange-50 px-4 py-3 flex flex-wrap gap-3 justify-between items-center">
//                   <div className="min-w-0">
//                     <div className="font-semibold truncate">
//                       {rep.title ||
//                         `Report - ${new Date(
//                           rep.createdAt
//                         ).toLocaleDateString()}`}
//                     </div>
//                     {rep.createdAt && (
//                       <div className="text-sm text-gray-600">
//                         {new Date(rep.createdAt).toLocaleString()}
//                       </div>
//                     )}
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => openReportModal(rep)}
//                       className="px-4 py-2 rounded-lg bg-[#DC6D18] text-white hover:bg-[#B85B14] shadow-sm"
//                     >
//                       View report
//                     </button>

//                     {rep.pdfUrl && (
//                       <button
//                         type="button"
//                         onClick={() =>
//                           triggerDownload(
//                             rep.pdfUrl,
//                             `report-${rep.equipmentId}.pdf`
//                           )
//                         }
//                         className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-black shadow-sm"
//                         title="Download PDF"
//                       >
//                         Download PDF
//                       </button>
//                     )}
//                     {rep.csvUrl && (
//                       <button
//                         type="button"
//                         onClick={() =>
//                           triggerDownload(
//                             rep.csvUrl,
//                             `report-${rep.equipmentId}.csv`
//                           )
//                         }
//                         className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
//                         title="Download CSV"
//                       >
//                         Download CSV
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Report Modal */}
//       {showReportModal && selectedReport && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/50"
//             onClick={closeReportModal}
//             aria-label="X"
//           />
//           <div className="relative bg-white w-[95vw] max-w-3xl rounded-xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4 sticky bg-white">
//               <h4 className="text-lg font-semibold text-[#DC6D18]">
//                 Report Details
//               </h4>
//               <button
//                 onClick={closeReportModal}
//                 className="text-2xl leading-none"
//                 aria-label="Close"
//               >
//                 &times;
//               </button>
//             </div>
//             <div className="space-y-3">
//               {REPORT_FIELDS.map(([label, key]) => (
//                 <div key={key} className="flex justify-between border-b pb-1">
//                   <span className="font-medium text-gray-700">{label}:</span>
//                   <span className="text-gray-900 text-right">
//                     {selectedReport[key] || "—"}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default RequestService;

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

  // ----- State -----
  const [formData, setFormData] = useState({
    equipmentId: "",
    equipmentName: "",
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

  // ----- Modal -----
  const openReportModal = (rep) => {
    setSelectedReport(rep);
    setShowReportModal(true);
  };
  const closeReportModal = () => {
    setSelectedReport(null);
    setShowReportModal(false);
  };

  // ----- Download helper -----
  const triggerDownload = (url, filename = "report") => {
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // list of fields to show in modal
  const REPORT_FIELDS = [
    ["Equipment ID", "equipmentId"],
    ["Equipment Name", "equipmentName"],
    ["Added By (User ID)", "userId"], // ✅ NEW
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
    ["Can Serial Number", "canSerialNumber"],
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
          Swal.fire({ title: "Not Found", text: "Equipment not found", icon: "error" });
          setScannerVisible(false);
          return;
        }

        const eq = data.equipment || data;

        // Prefill IDs & name
        setFormData((prev) => ({
          ...prev,
          equipmentId: eq.equipmentId || prev.equipmentId,
          equipmentName: eq.equipmentName || prev.equipmentName,
          userId: eq.userId || prev.userId,
           location: eq.location || prev.location, // ✅ NEW
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
            `${API_URL}/api/reports?equipmentId=${encodeURIComponent(eq.equipmentId)}`
          );
          const repData = await repRes.json();

          let reports = [];
          if (Array.isArray(repData)) reports = repData;
          else if (repData && Array.isArray(repData.items)) reports = repData.items;

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
                faultDescription: last.faultDescription ?? prev.faultDescription,
                serviceType: last.serviceType ?? prev.serviceType,
              }));
            }
          } else {
            setReportHistory([]);
          }
        }
      } catch (err) {
        console.error("QR fetch error:", err);
        Swal.fire({ title: "Error", text: "Could not fetch equipment info", icon: "error" });
      }

      setScannerVisible(false);
    };

    scanner
      .start({ facingMode: "user" }, qrConfig, onSuccess)
      .catch(() => {
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
  }, [isScannerVisible, isAdmin,isTechnician]);

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
  nextServiceDate: formData?.nextServiceDate || formData?.refillingDue || null,
};
dispatch(createServiceRequest(payload));


  };

  const inputClass =
    "w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg " +
    "bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        {isAdmin||isTechnician ? "Equipment Service Report" : "Service Report History"}
      </h2>

      <form
        className="space-y-6"
        onSubmit={isAdmin||isTechnician ? handleSubmit : (e) => e.preventDefault()}
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
          {(isAdmin ||isTechnician) && (
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


              {/* Dropdowns */}
              {[
                ["tag", "Tag", ["yes", "no"]],
                ["safetyPin", "Safety Pin", ["yes", "no"]],
                ["pressureGauge", "Pressure Gauge", ["Green", "Red"]],
                ["valveSupport", "Valve Support", ["yes", "no"]],
                ["corrosion", "Corrosion", ["Fine", "Rust"]],
                ["baseCap", "Base Cap", ["Ok", "Damaged"]],
                ["powderFlow", "Powder Flow", ["good", "bad"]],
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
                  <option value="Routine Maintenance">Routine Maintenance</option>
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
        {(isAdmin||isTechnician ) && (
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
                      {rep.title ||
                        `Report - ${new Date(rep.createdAt).toLocaleDateString()}`}
                    </div>
                    {rep.createdAt && (
                      <div className="text-sm text-gray-600">
                        {new Date(rep.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openReportModal(rep)}
                      className="px-4 py-2 rounded-lg bg-[#DC6D18] text-white hover:bg-[#B85B14] shadow-sm"
                    >
                      View report
                    </button>

                    {rep.pdfUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDownload(rep.pdfUrl, `report-${rep.equipmentId}.pdf`)
                        }
                        className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-black shadow-sm"
                        title="Download PDF"
                      >
                        Download PDF
                      </button>
                    )}
                    {rep.csvUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          triggerDownload(rep.csvUrl, `report-${rep.equipmentId}.csv`)
                        }
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 shadow-sm"
                        title="Download CSV"
                      >
                        Download CSV
                      </button>
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
              <h4 className="text-lg font-semibold text-[#DC6D18]">Report Details</h4>
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
                    {selectedReport[key] || "—"}
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
