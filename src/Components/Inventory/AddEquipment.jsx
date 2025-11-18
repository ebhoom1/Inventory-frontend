// AddEquipment.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  createEquipment,
  resetEquipmentState,
} from "../../redux/features/equipment/equipmentSlice";

// Define the initial state structure for easy reset
const getInitialFormState = () => ({
  equipmentName: "",
  modelSeries: "",
  capacity: "",
  brand: "",
  installationDate: "",
  grossWeight: "",
  content: "",
  batchNo: "",
  serialNumber: "", // For "New"
  spNumber: "", // For "Existing"
  mfgMonth: "",
  refDue: "",
  expiryDate: "",
  notes: "",
  equipmentLocations: [""], // CHANGED: Dynamic equipment locations array with one empty field
  quantity: " ", // NEW: Quantity field with default value
  equipmentType: "new", // 'new' or 'existing'
});

function AddEquipment() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.equipment);
  const { userInfo } = useSelector((s) => s.users);

  const [formData, setFormData] = useState(getInitialFormState());
  const [availableLocations, setAvailableLocations] = useState([]); // NEW: Store fetched locations
  const [locationsLoading, setLocationsLoading] = useState(false); // NEW: Loading state for locations
  const [locationsError, setLocationsError] = useState(null); // NEW: Error state for locations

  // Fetch available locations on component mount
  useEffect(() => {
    const fetchAvailableLocations = async () => {
      try {
        setLocationsLoading(true);
        setLocationsError(null);
        const token = localStorage.getItem("token");
        const response = await fetch("/api/equipment/locations/all", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (response.ok) {
          setAvailableLocations(Array.isArray(data) ? data : []);
        } else {
          setLocationsError(data?.message || "Failed to fetch locations");
        }
      } catch (err) {
        setLocationsError(err.message || "Failed to fetch locations");
      } finally {
        setLocationsLoading(false);
      }
    };
    
    fetchAvailableLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // CHANGED: Handle equipment location field changes
  const handleEquipmentLocationChange = (index, value) => {
    const updatedLocations = [...formData.equipmentLocations];
    updatedLocations[index] = value;
    setFormData((prev) => ({ ...prev, equipmentLocations: updatedLocations }));
  };

  // CHANGED: Add a new blank equipment location field
  const handleAddEquipmentLocation = () => {
    setFormData((prev) => ({
      ...prev,
      equipmentLocations: [...prev.equipmentLocations, ""],
    }));
  };

  // CHANGED: Remove an equipment location field
  const handleRemoveEquipmentLocation = (index) => {
    setFormData((prev) => ({
      ...prev,
      equipmentLocations: prev.equipmentLocations.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate user is logged in
    if (!userInfo || !userInfo._id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not authenticated. Please login again.",
      });
      return;
    }

    // --- Start Validation ---
    if (!formData.equipmentName?.trim()) {
      Swal.fire({ icon: "warning", title: "Equipment name required" });
      return;
    }
    
    if (!formData.modelSeries?.trim()) {
      Swal.fire({ icon: "warning", title: "Model/Series required" });
      return;
    }

    if (!formData.capacity?.trim()) {
      Swal.fire({ icon: "warning", title: "Capacity required" });
      return;
    }

    if (!formData.brand?.trim()) {
      Swal.fire({ icon: "warning", title: "Brand required" });
      return;
    }

    if (!formData.installationDate?.trim()) {
      Swal.fire({ icon: "warning", title: "Installation Date required" });
      return;
    }

    if (!formData.grossWeight?.trim()) {
      Swal.fire({ icon: "warning", title: "Gross Weight required" });
      return;
    }

    if (!formData.content?.trim()) {
      Swal.fire({ icon: "warning", title: "Content required" });
      return;
    }

    if (!formData.batchNo?.trim()) {
      Swal.fire({ icon: "warning", title: "Batch Number required" });
      return;
    }

    if (!formData.mfgMonth?.trim()) {
      Swal.fire({ icon: "warning", title: "MFG Month required" });
      return;
    }

    if (!formData.expiryDate?.trim()) {
      Swal.fire({ icon: "warning", title: "Expiry Date required" });
      return;
    }

    if (!formData.refDue?.trim()) {
      Swal.fire({ icon: "warning", title: "REF Due required" });
      return;
    }
    
    // Validate quantity
    if (!formData.quantity || formData.quantity < 1) {
      Swal.fire({ icon: "warning", title: "Quantity must be at least 1" });
      return;
    }

    // Validate at least one equipment location
    const validLocations = (formData.equipmentLocations || []).filter(Boolean);
    if (validLocations.length === 0) {
      Swal.fire({ icon: "warning", title: "At least one equipment location is required" });
      return;
    }

    // Create a copy to manipulate for submission
    const payload = { ...formData };

    // Add userId from Redux (CRITICAL FIX)
    payload.userId = userInfo._id;

    // Filter out empty strings from equipmentLocations and map to 'locations' for backend
    payload.locations = validLocations;
    
    // Set primary location as first location
    payload.location = payload.locations[0];
    
    // Remove equipmentLocations since backend uses 'locations' and 'location'
    delete payload.equipmentLocations;

    // --- Conditional Validation and Payload Cleanup ---
    if (payload.equipmentType === "new") {
      if (!payload.serialNumber?.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Serial Number required for new equipment",
        });
        return;
      }
      // Remove the unused field
      delete payload.spNumber;
    } else {
      // 'existing'
      if (!payload.spNumber?.trim()) {
        Swal.fire({
          icon: "warning",
          title: "SP Number required for existing equipment",
        });
        return;
      }
      // Remove the unused field
      delete payload.serialNumber;
    }

    // Remove the helper field before sending to backend
    delete payload.equipmentType;
    // --- End Validation ---

    console.log("Submitting equipment payload:", payload);
    dispatch(createEquipment(payload));
  };

  useEffect(() => {
    if (successMessage) {
      Swal.fire({
        title: "Equipment Added",
        text: successMessage,
        icon: "success",
        timer: 1600,
        timerProgressBar: true,
        backdrop: true,
      });
      // Reset form to its initial state
      setFormData(getInitialFormState());
      dispatch(resetEquipmentState());
    }
    if (error) {
      Swal.fire({
        title: "Failed to Add",
        text: error,
        icon: "error",
        confirmButtonText: "Okay",
      });
      dispatch(resetEquipmentState());
    }
  }, [successMessage, error, dispatch]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-[#DC6D18] mb-8 md:mb-10">
        Add New Equipment
      </h2>

      <form className="space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 md:gap-y-10">
          {/* Equipment Name */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Equipment Name
            </span>
            <input
              type="text"
              name="equipmentName"
              value={formData.equipmentName}
              onChange={handleChange}
              placeholder="e.g., Fire Extinguisher"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required // Keep basic HTML required for this
            />
          </div>

          {/* Quantity */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Quantity
            </span>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 5"
              min="1"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
              required
            />
          </div>

          {/* --- NEW: Equipment Type Selector --- */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Equipment Type
            </span>
            <select
              name="equipmentType"
              value={formData.equipmentType}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            >
              <option value="new">New</option>
              <option value="existing">Existing</option>
            </select>
          </div>

          {/* --- CONDITIONAL: Serial Number (for New) --- */}
          {formData.equipmentType === "new" && (
            <div className="relative">
              <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
                Serial Number
              </span>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g., SN-12345678"
                className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                // 'required' prop removed, validation is in handleSubmit
              />
            </div>
          )}

          {/* --- CONDITIONAL: SP Number (for Existing) --- */}
          {formData.equipmentType === "existing" && (
            <div className="relative">
              <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
                SP Number
              </span>
              <input
                type="text"
                name="spNumber"
                value={formData.spNumber}
                onChange={handleChange}
                placeholder="e.g., SP-12345"
                className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                // 'required' prop removed, validation is in handleSubmit
              />
            </div>
          )}

          {/* Model / Series */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Model / Series
            </span>
            <input
              type="text"
              name="modelSeries"
              value={formData.modelSeries}
              onChange={handleChange}
              placeholder="e.g., ABC Powder Type"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Capacity */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Capacity
            </span>
            <input
              type="text"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 6 kg"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Equipment Locations - Dynamic Fields */}
          <div className="relative md:col-span-2">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Equipment Locations
            </span>
            <div className="space-y-2 mt-3">
              {(formData.equipmentLocations || ['']).map((loc, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    name={`equipmentLocation-${idx}`}
                    value={loc}
                    onChange={(e) => handleEquipmentLocationChange(idx, e.target.value)}
                    placeholder={`e.g., Ground Floor, Plant Room - Location ${idx + 1}`}
                    className="flex-1 border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveEquipmentLocation(idx)} 
                    title="Remove location"
                    className="text-red-500 hover:text-red-700 px-3 font-bold transition-colors"
                  >
                    <i className="fa-solid fa-minus" />
                  </button>
                  {idx === (formData.equipmentLocations || []).length - 1 && (
                    <button 
                      type="button" 
                      onClick={handleAddEquipmentLocation} 
                      title="Add location"
                      className="text-green-600 hover:text-green-700 px-3 font-bold transition-colors"
                    >
                      <i className="fa-solid fa-plus" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Brand
            </span>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Ceasefire"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Installation Date */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Installation Date
            </span>
            <input
              type="date"
              name="installationDate"
              value={formData.installationDate}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Gross Weight */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Gross Weight
            </span>
            <input
              type="text"
              name="grossWeight"
              value={formData.grossWeight}
              onChange={handleChange}
              placeholder="e.g., 9.5 kg"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Content */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Content
            </span>
            <input
              type="text"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="e.g., Dry Powder"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D1Ass]"
            />
          </div>

          {/* Batch No */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Batch No.
            </span>
            <input
              type="text"
              name="batchNo"
              value={formData.batchNo}
              onChange={handleChange}
              placeholder="e.g., BT-2025-08"
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>
          {/* --- expiry date- */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Expiry Date
            </span>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* MFG Month */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              MFG Month
            </span>
            <input
              type="month"
              name="mfgMonth"
              value={formData.mfgMonth}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* REF Due */}
          <div className="relative">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              REF Due
            </span>
            <input
              type="date"
              name="refDue"
              value={formData.refDue}
              onChange={handleChange}
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            />
          </div>

          {/* Notes */}
          <div className="relative md:col-span-2">
            <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
              Optional Notes
            </span>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              placeholder="e.g., Additional details about the equipment."
              className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 text-base md:text-lg bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] shadow-md focus:outline-none focus:ring-2 focus:ring-[#DC6D18]"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 ease-in-out ${
              loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#DC6D18] text-[#FFF7ED] hover:bg-[#B85B14]"
            }`}
          >
            {loading ? "Adding..." : "Add Equipment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEquipment;