// AddEquipment.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  createEquipment,
  resetEquipmentState,
  getEquipments,
} from "../../redux/features/equipment/equipmentSlice";
import { fetchInventory } from "../../redux/features/inventory/inventorySlice";

// Define the initial state structure for easy reset
const getInitialFormState = () => ({
  equipmentName: "",
  modelSeries: "",
  equipmentType: "new",
  capacity: "",
  brand: "",
  grossWeight: "",
  content: "",
  batchNo: "",
  billNo: "",
  spNumber: "", // For "Existing"
  mfgMonth: "",
  // moved installationDate, expiryDate, refDue to assignment flow
  notes: "",
  quantity: "", // Start blank (user must enter quantity)
  isRestock: false,
  restockedFromInventoryId: null,
});

function AddEquipment() {
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((s) => s.equipment);
  const { userInfo } = useSelector((s) => s.users);
  const equipmentList = useSelector((s) => s.equipment?.list || []);
  const inventoryList = useSelector((s) => s.inventory?.items || []);

  const [formData, setFormData] = useState(getInitialFormState());
  const [inventoryLoadingState, setInventoryLoadingState] = useState(false);
  // equipmentLocations removed: locations are not collected on add form

const [serialNumbers, setSerialNumbers] = useState([""]);
const uniqueInventoryNames = [...new Set(equipmentList.map(it => it.equipmentName))].sort();
// ✅ Update serial number array when quantity changes
  useEffect(() => {
    const qty = Number(formData.quantity) || 1;
    setSerialNumbers((prev) => {
      const newArr = [...prev];
      if (qty > prev.length) {
        // Add empty strings for new slots
        for (let i = prev.length; i < qty; i++) newArr.push("");
      } else if (qty < prev.length) {
        // Trim array if quantity reduced
        return newArr.slice(0, qty);
      }
      return newArr;
    });
  }, [formData.quantity]);

  // Ensure we have latest equipments to validate serial uniqueness
  useEffect(() => {
    try {
      dispatch(getEquipments());
      // ✅ NEW: Also fetch inventory list for restock feature
      dispatch(fetchInventory());
    } catch (e) {
      // ignore
    }
  }, [dispatch]);

  // Errors for each serial input ('' or error message)
  const [serialErrors, setSerialErrors] = useState([""]);

  const normalize = (s) => (s || "").toString().trim().toLowerCase();

  const checkExistingConflict = (serial) => {
    if (!serial || !formData.equipmentName) return null;
    const n = normalize(serial);
    for (const eq of equipmentList || []) {
      if (!eq) continue;
      // only consider same equipment type/name
      if ((eq.equipmentName || "") !== (formData.equipmentName || "")) continue;
      // In flat structure, each document is a single unit with direct serialNumber field
      if (eq.serialNumber && normalize(eq.serialNumber) === n) {
        return { equipment: eq, assignment: null };
      }
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: name === "quantity" ? value : value,
      };
      
      // ✅ When equipment type changes to restock, enable restock mode
      if (name === "equipmentType" && value === "restock") {
        updated.isRestock = true;
      } else if (name === "equipmentType" && value !== "restock") {
        updated.isRestock = false;
        updated.restockedFromInventoryId = null;
        updated.equipmentName = "";
      }
      
      return updated;
    });
  };

const handleSerialChange = (index, value) => {
    const updated = [...serialNumbers];
    updated[index] = value;
    setSerialNumbers(updated);
    // validate this serial immediately
    setSerialErrors((prev) => {
      const errs = [...(prev || [])];
      // ensure length
      while (errs.length < updated.length) errs.push("");
      const val = value?.trim() || "";
      // check empty
      if (!val) {
        errs[index] = "Serial required";
        return errs;
      }
      // check duplicates within batch
      const norm = normalize(val);
      const duplicates = updated.filter(s => normalize(s) === norm);
      if (duplicates.length > 1) {
        errs[index] = "Duplicate in this batch";
        return errs;
      }
      // check existing equipment conflict for same equipmentName
      const conflict = checkExistingConflict(val);
      if (conflict) {
        errs[index] = `Serial already exists for this equipment (${conflict.equipment.batchNo || conflict.equipment.equipmentId || ''})`;
        return errs;
      }
      errs[index] = "";
      return errs;
    });
  };

  // restock autopopulate
 const handleRestockSelection = (e) => {
  const selectedName = e.target.value;
  setFormData(prev => ({ ...prev, equipmentName: selectedName }));

  if (selectedName) {
    // Find a matching record in the current list to copy specs
    const existing = equipmentList.find(eq => eq.equipmentName === selectedName);
    if (existing) {
      setFormData(prev => ({
        ...prev,
        modelSeries: existing.modelSeries || "",
        capacity: existing.capacity || "",
        brand: existing.brand || "",
        grossWeight: existing.grossWeight || "",
        content: existing.content || "",
      }));
    }
    
    // ✅ Also find the inventory record to get its ID for tracking
    const inventoryRecord = inventoryList.find(inv => inv.skuName === selectedName);
    if (inventoryRecord) {
      setFormData(prev => ({
        ...prev,
        isRestock: true,
        restockedFromInventoryId: inventoryRecord._id,
      }));
    }
  }
};
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate user is logged in (accept either Mongo _id or username userId)
    if (!userInfo || (!userInfo._id && !userInfo.userId)) {
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

    
    
    // Validate quantity
    const qtyNum = Number(formData.quantity);
    if (!formData.quantity || Number.isNaN(qtyNum) || qtyNum < 1) {
      Swal.fire({ icon: "warning", title: "Quantity must be at least 1" });
      return;
    }

    if (formData.equipmentType === "new") {
      const emptyIndex = serialNumbers.findIndex(s => !s.trim());
      if (emptyIndex !== -1) {
        Swal.fire({ 
          icon: "warning", 
          title: "Missing Serial Number", 
          text: `Please enter Serial Number for Unit #${emptyIndex + 1}` 
        });
        return;
      }

      // Check for duplicates in the current batch
      const unique = new Set(serialNumbers.map(s => normalize(s)));
      if (unique.size !== serialNumbers.length) {
        Swal.fire({ icon: "warning", title: "Duplicate Serial Numbers", text: "Serial numbers in this batch must be unique." });
        return;
      }

      // Check for conflicts with existing equipments of the same type
      for (let i = 0; i < serialNumbers.length; i++) {
        const s = serialNumbers[i];
        const conflict = checkExistingConflict(s);
        if (conflict) {
          Swal.fire({ icon: "warning", title: "Serial Conflict", text: `Serial '${s}' already exists for equipment '${conflict.equipment.equipmentName || ''}'.` });
          return;
        }
      }
    }

    // Create a copy to manipulate for submission
    const payload = { ...formData };
    // Ensure quantity is numeric when sending to backend
    payload.quantity = Number(formData.quantity);

    // By default, create equipment as unassigned so it appears in 'Assign Inventory' SKU list
    // If you want to assign on creation in future, add a field to the form to set `userId`.
    payload.userId = null;

    // Location is no longer collected on add form; backend accepts missing/empty location
    payload.skuName = formData.equipmentName;
    // --- Conditional Validation and Payload Cleanup ---
   // ✅ Attach the manual serials to payload
    if (payload.equipmentType === "new" || payload.equipmentType === "restock") {
        payload.serialNumbers = serialNumbers; // Send array
        delete payload.spNumber;
    } else {
        delete payload.serialNumbers; 
    }
    
    // ✅ Add restock tracking fields
    if (formData.isRestock) {
      payload.isRestock = true;
      payload.restockedFromInventoryId = formData.restockedFromInventoryId;
    } else {
      payload.isRestock = false;
      payload.restockedFromInventoryId = null;
    }
    
    delete payload.equipmentType;
        

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
      setSerialNumbers([""]);
      dispatch(getEquipments());
      dispatch(fetchInventory());
      // Refresh equipment list so admin dropdowns reflect newly added equipment
      try {
        dispatch(getEquipments());
      } catch (e) {
        console.warn('Failed to refresh equipments after create', e);
      }
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
              <option value="restock">Restock</option>
            </select>
          </div>

          {/* Bill Number Input */}
<div className="relative">
  <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
    Bill Number
  </span>
  <input
    type="text"
    name="billNo"
    value={formData.billNo}
    onChange={handleChange}
    placeholder="e.g., BILL-9988"
    className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 bg-orange-50"
  />
</div>

{/* Conditional Equipment Name Field */}
<div className="relative">
  <span className="absolute -top-3 left-5 bg-white px-2 text-sm font-semibold text-[#DC6D18] z-10">
    Equipment Name
  </span>
  {formData.equipmentType === "restock" ? (
    <select
      name="equipmentName"
      value={formData.equipmentName}
      onChange={handleRestockSelection}
      className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 bg-orange-50"
    >
      <option value="">Select Existing Equipment to Restock</option>
      {inventoryList && inventoryList.length > 0 && inventoryList
        .filter(inv => inv.skuName && !inv.isRestock) // Filter out already restocked items
        .map(inv => (
          <option key={inv._id} value={inv.skuName}>
            {inv.skuName} (Qty: {inv.quantity})
          </option>
        ))}
      {(!inventoryList || inventoryList.length === 0) && (
        <option disabled>No inventory available to restock</option>
      )}
    </select>
  ) : (
    <input
      type="text"
      name="equipmentName"
      value={formData.equipmentName}
      onChange={handleChange}
      placeholder={formData.equipmentType === "existing" ? "Enter equipment name" : "e.g., Fire Extinguisher"}
      className="w-full border-2 border-dotted border-[#DC6D18] rounded-xl py-3 px-4 bg-orange-50"
    />
  )}
</div>

       {/*  NEW: Manual Serial Numbers Section (Placed Correctly) */}
        {(formData.equipmentType === "new" || formData.equipmentType === "restock") && (
          <div className="w-full p-4 border-2 border-dashed border-[#DC6D18] rounded-xl bg-gradient-to-r from-white to-[#FFF7ED] mt-6 md:col-span-2">
            <h3 className="text-lg font-bold text-[#DC6D18] mb-3">
              {formData.equipmentType === "restock" ? "Enter Serial Numbers for Restocked Units" : "Enter Serial Numbers"}
            </h3>
            
            {/* Scrollable Container if > 5 items */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${serialNumbers.length > 5 ? 'max-h-60 overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
              {serialNumbers.map((sn, index) => (
                <div key={index} className="relative">
                  <span className="absolute -top-3 left-5 bg-gradient-to-r from-[#FFF] to-[#FFF7ED] px-2 text-sm font-semibold text-[#DC6D18] z-10">
                    Unit #{index + 1}
                  </span>
                  <input
                    type="text"
                    value={sn}
                    onChange={(e) => handleSerialChange(index, e.target.value)}
                    placeholder={`Serial No. for Unit ${index + 1}`}
                    className={`w-full rounded-xl py-3 px-4 text-base bg-gradient-to-r from-[#FFF7ED] to-[#FFEFE1] focus:outline-none ${serialErrors[index] ? 'border-2 border-red-500' : 'border-2 border-dotted border-[#DC6D18]'} `}
                    required
                  />
                  {serialErrors[index] && (
                    <p className="text-xs text-red-600 mt-1">{serialErrors[index]}</p>
                  )}
                </div>
              ))}
            </div>
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

          {/* Equipment Locations field removed from Add Equipment form */}

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