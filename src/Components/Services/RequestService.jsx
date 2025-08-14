// RequestService.jsx
import React, { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useDispatch, useSelector } from "react-redux";
import { createServiceRequest, resetServiceRequestState } from "../../redux/features/serviceRequests/serviceRequestSlice";
import Swal from "sweetalert2"; // optional; or use alert()

const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

function RequestService() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.serviceRequests);

  const [formData, setFormData] = useState({
    equipmentId: "",
    equipmentName: "",
    userId: "",
    serviceType: "",
    date: "",
    faultDescription: "",
  });

  const [isScannerVisible, setScannerVisible] = useState(false);
  const [scannerInstance, setScannerInstance] = useState(null);

  useEffect(() => {
    if (isScannerVisible) {
      const scanner = new Html5Qrcode("qr-reader");
      setScannerInstance(scanner);

      const qrCodeSuccessCallback = (decodedText) => {
        try {
          const scanned = JSON.parse(decodedText);
          // Map possible QR payloads: { equipmentId, equipmentName, userId } OR { equipmentId, equipmentName, username }
          setFormData((prev) => ({
            ...prev,
            equipmentId: scanned.equipmentId || prev.equipmentId,
            equipmentName: scanned.equipmentName || prev.equipmentName,
            userId: scanned.userId || scanned.userId || prev.userId,
          }));
          Swal.fire({ title: "Scanned!", text: scanned.equipmentName || "QR read", icon: "success", timer: 1200, showConfirmButton: false });
        } catch (error) {
          console.error("Failed to parse QR code data.", error);
          Swal.fire({ title: "Invalid QR", text: "Please try again.", icon: "error" });
        }
        setScannerVisible(false);
      };

      scanner
        .start({ facingMode: "environment" }, qrConfig, qrCodeSuccessCallback)
        .catch((err) => {
          console.error("Unable to start QR scanner", err);
          Swal.fire({ title: "Camera Error", text: "Grant camera permission.", icon: "error" });
          setScannerVisible(false);
        });
    } else if (scannerInstance?.isScanning) {
      scannerInstance
        .stop()
        .then(() => console.log("QR Code scanning stopped."))
        .catch((err) => console.error("Failed to stop QR scanner.", err));
    }

    return () => {
      if (scannerInstance?.isScanning) scannerInstance.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScannerVisible]);

  useEffect(() => {
    if (successMessage) {
      Swal.fire({ title: "Submitted", text: successMessage, icon: "success", timer: 1500, showConfirmButton: false });
      setFormData({ equipmentId: "", equipmentName: "", userId: "", serviceType: "", date: "", faultDescription: "" });
      dispatch(resetServiceRequestState());
    }
    if (error) {
      Swal.fire({ title: "Failed", text: error, icon: "error" });
      dispatch(resetServiceRequestState());
    }
  }, [successMessage, error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload as expected by backend
    const payload = {
      equipmentId: formData.equipmentId,
      equipmentName: formData.equipmentName,
      userId: formData.userId,
      serviceType: formData.serviceType,
      date: formData.date, // backend uses "date" to set reportedDate (as per controller)
      faultDescription: formData.faultDescription,
    };

    dispatch(createServiceRequest(payload));
  };

  // ... keep your JSX below, just wire handleSubmit and toggle button disabled when loading
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        Request Equipment Service
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Scanner block (unchanged styles) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
          <div className="w-full">
            <label htmlFor="equipmentId" className="text-sm font-semibold text-gray-600 mb-1 block">
              Enter Equipment ID
            </label>
            <input
              type="text"
              id="equipmentId"
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              placeholder="e.g., EQP-123"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>
          <div className="text-sm font-bold text-gray-500 my-2 sm:my-0">OR</div>
          <button
            type="button"
            onClick={() => setScannerVisible(!isScannerVisible)}
            className={`w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ${
              isScannerVisible ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#DC6D18] hover:bg-[#B85B14] text-[#FFF7ED]"
            }`}
          >
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h-1m-1-6v1m-1-1H7m11 0h1M5 12H4m1 6v-1m1-1h11m0 0h1m-1 1v-1m-1 1H7m0 0H6m1-1v-1M6 7h1m1 0h11m0 0h1M7 6v1m0 0H6" />
            </svg>
            {isScannerVisible ? "Close Scanner" : "Scan QR Code"}
          </button>
        </div>

        {isScannerVisible && (
          <div className="p-4 bg-gray-100 rounded-xl">
            <div id="qr-reader" className="w-full"></div>
          </div>
        )}

        {/* Prefilled fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-y-10 pt-4">
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Equipment Name
            </span>
            <input
              type="text"
              value={formData.equipmentName}
              readOnly
              placeholder="Prefilled after scan"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              userId
            </span>
            <input
              type="text"
              value={formData.userId}
              readOnly
              placeholder="Prefilled after scan"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Type of Service
            </span>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]"
              required
            >
              <option value="" disabled>
                Select a service type
              </option>
              <option value="Routine Maintenance">Routine Maintenance</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
              <option value="Calibration">Calibration</option>
            </select>
          </div>

          <div className="relative flex items-center">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Date
            </span>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          <div className="relative md:col-span-2">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Fault Description
            </span>
            <textarea
              name="faultDescription"
              value={formData.faultDescription}
              onChange={handleChange}
              rows="4"
              placeholder="Describe the issue in detail..."
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:border-solid focus:ring-2 focus:ring-[#DC6D18]"
              required
            ></textarea>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ${
              loading ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
            }`}
          >
            {loading ? "Submitting..." : "Request Service"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RequestService;
